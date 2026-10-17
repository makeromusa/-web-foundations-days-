# TicketHub: System Design Document

## 1. Requirements
- **Functional:** 1. Browse/search events; 2. Real-time seat map; 3. Hold seats (10 min); 4. Pay & checkout; 5. Digital tickets with QR barcodes.
- **Non-Functional:**
  - **Correctness:** Zero double-booking; strict inventory consistency.
  - **Fairness:** FIFO queueing during surges; 10-minute hold window strictly protected.
  - **Speed:** Read queries <100 ms; seat holds <500 ms.
  - **Availability:** 99.99% uptime for browsing; DB shielded from connection exhaustion.

## 2. Estimates & Traffic Comparison
- **Registered Users:** 2,000,000.
- **Normal Day:** 50,000 visitors x 10 views = 500,000 views/day (~6 Read RPS, peak 18 RPS). 5,000 tickets sold/day (~0.06 Write RPS). 100:1 read-to-write ratio.
- **The Big Sale Peak (10 min / 600 s):** 200,000 concurrent users for 20,000 seats.
  - **Reads:** 200,000 users x 15 views = 3,000,000 requests / 600 s = **5,000 Read RPS** (833x spike).
  - **Writes:** 200,000 holds / 600 s = **333 Write RPS** (bursts to **1,667–3,333 Write RPS**, 55,000x spike). 20,000 seats sold in 600 s = 33.3 sales/s.
- **Storage:** 2M users x 500 B = 1 GB. ~2.8M tickets/yr x 1 KB = 2.8 GB/yr. Negligible storage; concurrency is the bottleneck.

## 3. REST API Specification
- `GET /api/events` - Browse & search upcoming events (`200 OK`).
- `GET /api/events/{id}/seats` - Real-time seat availability map (`200 OK`).
- `POST /api/seats/hold` - Hold seat 10 min (`{eventId, seatIds: [501]}`) -> `201 Created` / `409 Conflict`.
- `POST /api/orders` - Pay & confirm order (`{holdId, paymentMethod}`) -> `201 Created` / `410 Gone`.
- `GET /api/tickets` - View user digital tickets (`200 OK`).
- **Error Codes:** `400 Bad Request` (validation), `401 Unauthorized` (auth), `404 Not Found` (unknown ID), `409 Conflict` (seat held/sold), `410 Gone` (hold expired), `429 Too Many Requests` (queue limit).

## 4. Data Model & Concurrency Strategy
```sql
CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE, email VARCHAR(255) UNIQUE, password_hash VARCHAR(255));
CREATE TABLE events (id SERIAL PRIMARY KEY, title VARCHAR(150), venue VARCHAR(100), event_date TIMESTAMP, total_seats INT);
CREATE TABLE seats (
  id SERIAL PRIMARY KEY, event_id INT REFERENCES events(id) ON DELETE CASCADE,
  section VARCHAR(20), row_number VARCHAR(10), seat_number VARCHAR(10), price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','HELD','SOLD')),
  held_by_user_id INT REFERENCES users(id), hold_expires_at TIMESTAMP, version INT DEFAULT 1,
  CONSTRAINT unique_event_seat UNIQUE (event_id, section, row_number, seat_number),
  CONSTRAINT chk_seat_hold_expiry CHECK ((status='HELD' AND hold_expires_at IS NOT NULL) OR (status IN ('AVAILABLE','SOLD') AND hold_expires_at IS NULL))
);
CREATE INDEX idx_seats_status_hold_expires_at ON seats(status, hold_expires_at);
CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), event_id INT REFERENCES events(id), total_amount DECIMAL(10,2), status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','FAILED')), payment_ref VARCHAR(100) UNIQUE);
CREATE TABLE order_items (id SERIAL PRIMARY KEY, order_id INT REFERENCES orders(id) ON DELETE CASCADE, seat_id INT UNIQUE REFERENCES seats(id), price_paid DECIMAL(10,2), ticket_barcode VARCHAR(64) UNIQUE);
```
- **Double-Booking Prevention:**
  1. **Constraints:** `UNIQUE (seat_id)` on `order_items` physically forbids assigning a seat to multiple orders.
  2. **ACID Row Locks:** Backend runs `SELECT id FROM seats WHERE id = 501 FOR UPDATE`. This serializes concurrent requests: first transaction locks row and sets `status = 'HELD'`; concurrent attempts block, read `status = 'HELD'`, and return `409 Conflict`.
  3. **Automated Cleanups:** Worker periodically runs `UPDATE seats SET status = 'AVAILABLE', hold_expires_at = NULL WHERE status = 'HELD' AND hold_expires_at < NOW()`. The composite index `(status, hold_expires_at)` and check constraint `chk_seat_hold_expiry` guarantee direct B-tree range scans in <2 ms, eliminating full table scans.

## 5. Architecture & Surviving the Big Sale
```
Clients ──> CDN & Queue (2K/min) ──> Load Balancer ──> App Servers
                                                           │
              ┌────────────────────────────────────────────┼─────────────────────────┐
              v                                            v                         v
     Redis (5K RPS Cache/Locks)                   PostgreSQL Primary + Replica       RabbitMQ + S3
```
- **Surviving the Surge:**
  1. **Virtual Waiting Room:** Throttles 200,000 users at edge, admitting 2,000/min via signed tokens to prevent backend collapse.
  2. **Redis In-Memory Cache:** Absorbs 5,000 Read RPS serving seat maps with 2s TTL in <1 ms, shielding database.
  3. **Atomic Redis Guard:** `SET seat:501:hold NX EX 600` ensures only 1 user per seat reaches DB transaction; concurrent attempts fail in RAM with `409 Conflict`.
  4. **Async Worker Decoupling:** Offloads QR code generation and emails to RabbitMQ, keeping checkout response under 500 ms.

## 6. Architectural Trade-offs
1. **Strict Consistency (SQL) vs. Extreme Write Scaling (NoSQL):** We chose PostgreSQL with pessimistic row locking (`SELECT FOR UPDATE`) over NoSQL. We sacrifice infinite horizontal write scaling because double-booking a physical seat is a critical business failure. Correctness strictly outweighs write throughput.
2. **Virtual Waiting Room vs. Instant Open Access:** We queue users at edge during drops. We trade immediate entry for 100% uptime and bot resistance, preventing 504 gateway timeouts and database crashes.

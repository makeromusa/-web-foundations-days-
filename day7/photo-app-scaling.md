# Scaling Plan: SnapShare Photo App

## 1. Assumptions & Daily Active Users (DAU)

- **Registered Users:** 10,000,000
- **Daily Active Users (10%):** 1,000,000
- **Seconds in a day:** Rounded to 100,000 for standard engineering estimation.
- **Storage Sizes:** Original Photo = 2 MB, Thumbnail = 50 KB (Total per upload = 2.05 MB).

## 2. Load Estimates

- **Uploads (Writes):**
  - 1,000,000 DAU × 1 photo = 1,000,000 uploads/day.
  - **Average:** 10 uploads/second (1,000,000 ÷ 100,000).
  - **Peak (5×):** 50 uploads/second.
- **Feed Views (Reads):**
  - 1,000,000 DAU × 50 views = 50,000,000 views/day.
  - **Average:** 500 views/second (50,000,000 ÷ 100,000).
  - **Peak (5×):** 2,500 views/second.
- **Storage per Year:**
  - Daily storage: 1,000,000 uploads × 2.05 MB = 2,050,000 MB (2.05 TB/day).
  - Yearly storage: 2.05 TB × 365 = **~748 TB per year**.

## 3. Read-Heavy vs. Write-Heavy

SnapShare is a massively **read-heavy** system. There are 50 feed views for every 1 photo upload (a 50:1 read-to-write ratio). This means the architecture must prioritize caching and database read replicas to handle the high volume of fetch requests without collapsing the primary database.

## 4. Photo Storage Strategy

Photos **should not** be stored inside the relational database. Storing massive binary files (BLOBs) inside SQL inflates the database size unnecessarily, drastically slows down query performance, and makes backups expensive and slow. Instead, the actual image files should be saved in dedicated **Object Storage** (like AWS S3), while the SQL database only stores a lightweight text URL pointing to where that file lives.

## 5. Architecture Diagram

                         ┌─────────┐
          ┌─────────────>│   DNS   │
          │              └─────────┘
    ┌─────┴─────┐      ┌──────────────────────┐
    │  Mobile   │─────>│ CDN (Photos/Static)  │
    │  Client   │      └──────────────────────┘
    └─────┬─────┘
          │ (API JSON requests)
          v
    ┌───────────────┐
    │ Load Balancer │
    └──────┬────────┘
           │
           v
    ┌───────────────┐     ┌──────────────┐
    │ App Servers   │────>│ Cache (Redis)│
    │ (Stateless)   │     └──────────────┘
    └─┬──┬──┬───────┘
      │  │  │
      │  │  └─────────────────┐
      │  │ (Save 2MB file)    │ (Add Job)
      │  v                    v
      │ ┌───────────────┐   ┌─────────┐   ┌─────────┐
      │ │ Object Storage│   │  Queue  │──>│ Worker  │ (Creates 50KB thumb)
      │ └───────────────┘   └─────────┘   └────┬────┘
      │                                        │ (Updates DB with thumb URL)
      │ (Writes metadata)                      │
      v                                        v
    ┌─────────────┐                      ┌─────────────┐
    │ Primary DB  │ ────(Replicates)────>│ Read Replica│
    └─────────────┘                      └─────────────┘

## 6. Component Explanations

- **CDN:** Serves heavy static files (like the downloaded photos) from edge servers close to the user to eliminate geographic latency and reduce load on the origin servers.
- **Load Balancer:** Prevents a single point of failure by distributing incoming API traffic evenly across multiple healthy app servers.
- **App Servers:** Execute the stateless application logic (like verifying tokens and routing uploads) so they can be horizontally scaled infinitely as traffic grows.
- **Cache (Redis):** Stores frequently accessed database results (like user feeds) in high-speed RAM to reduce database load and serve reads in ~1ms.
- **Primary Database:** Acts as the single source of truth for all write operations to ensure strict data consistency when saving new photo metadata.
- **Read Replica:** Handles the massive 2,500 views/sec read load by offloading `SELECT` queries from the primary database.
- **Object Storage:** Provides cheap, infinitely scalable flat storage specifically optimized for holding large binary files like 2MB photos.
- **Queue & Worker:** Decouples slow tasks (like resizing images) from the main request cycle so the App Server can respond to the user immediately while the Worker builds the thumbnail in the background.

## 7. The Upload Flow (Step-by-Step)

1. The user's mobile app sends the 2MB photo to the **Load Balancer**, which routes it to an available **App Server**.
2. The App Server uploads the raw 2MB image directly to **Object Storage** and receives a URL back.
3. The App Server executes an `INSERT` statement on the **Primary Database**, saving the photo's URL, the uploader's `user_id`, and the timestamp.
4. The App Server drops a job message into the **Message Queue** containing the photo's ID and URL, instructing the system to generate a thumbnail.
5. The App Server immediately responds to the mobile app with a `201 Created` status, allowing the user to keep scrolling without waiting.
6. A background **Worker** pulls the job from the queue, downloads the 2MB photo, compresses it into a 50KB thumbnail, saves the thumbnail to Object Storage, and updates the Primary Database with the new thumbnail URL.

## 8. Trade-offs

1. **Speed vs. Freshness (Caching):** By aggressively caching the user feed in Redis, we achieve lightning-fast load times for the 50,000,000 daily reads, but we accept the trade-off that a user might not see their friend's newly uploaded photo for a few seconds or minutes until the cache TTL expires.
2. **Simplicity vs. Scalability (Eventual Consistency):** By using a Primary database for writes and Replicas for reads, we scale easily to 2,500 reads per second, but we pay the cost of architectural complexity and the risk that a user might read from a replica that hasn't synchronized the latest write yet.

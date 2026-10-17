# Web Foundations & System Design: Capstone Reflection

### 1. Most Difficult Concept & How I Overcame It
The most challenging concept in this course was mastering concurrency and data integrity under high traffic. Initially, I assumed building scalable web systems was simply a matter of adding faster servers. However, understanding race conditions—where thousands of users attempt to hold the exact same seat at the same millisecond—forced me to fundamentally rethink state management. 

I overcame this challenge by breaking down the transactional lifecycle step-by-step. Learning how database-level row locks (`SELECT ... FOR UPDATE`) enforce strict serialization, and combining that with an in-memory Redis barrier (`SET NX EX`), helped me understand defense-in-depth architecture. Writing out sequence diagrams and understanding ACID transaction boundaries made distributed locking concrete rather than theoretical.

### 2. Capstone Improvement Based on Feedback
Based on architectural review feedback, I would improve the real-time seat selection user experience by integrating WebSockets or Server-Sent Events (SSE). Currently, seat maps rely on short-TTL polling, which still incurs HTTP overhead during flash sales. A real-time bidirectional event stream would broadcast seat state changes instantly to all connected clients, turning seats gray in real time and dramatically reducing 409 Conflict rejection rates.

### 3. What I Will Learn Next
Next, I plan to build a complete backend implementation using Node.js, Express, and PostgreSQL. I want to containerize services using Docker, configure connection pooling with PgBouncer, and implement asynchronous message queues using RabbitMQ to bring these architectural blueprints into production-ready software.

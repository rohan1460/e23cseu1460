# Notification System Design - Campus Hiring Technical Test

## Overview
A real-time, priority-aware notification platform for campus recruitment. The system uses a multi-tier architecture with a shared logging middleware, an Express backend, and a Material UI React frontend.

---

## Stage 1: REST API Contract & Real-time Mechanism

### Endpoints
1.  `GET /api/notifications`
    -   **Purpose**: List all notifications with optional filters.
    -   **Params**: `limit`, `page`, `notification_type`.
    -   **Response**: `{ notifications: Notification[], total: number }`
2.  `GET /api/notifications/priority`
    -   **Purpose**: Fetch Top-N notifications based on importance.
    -   **Params**: `n` (default 10).
    -   **Response**: `{ notifications: Notification[] }`

### Headers
-   `Authorization: Bearer <token>`
-   `Content-Type: application/json`

### Real-time Strategy
We recommend **Server-Sent Events (SSE)** over WebSockets. SSE is simpler for unidirectional notification streams (Server -> Client), automatically handles reconnections, and works over standard HTTP without firewall issues.

---

## Stage 2: Database Schema & Indexing Strategy (PostgreSQL)

### Schema Design
-   **Students**: `id (PK), email, name, roll_no`
-   **Notifications**: `id (PK), type (enum), message, created_at`
-   **Notification_Reads**: `student_id (FK), notification_id (FK), read_at` (Junction table to track per-student read status).

### Scaling & Performance
-   **Partitioning**: As the `notifications` table grows, we should partition by `created_at` (e.g., monthly partitions) to keep active indexes small.
-   **Archival**: Old notifications (e.g., > 1 year) should be moved to cold storage (e.g., S3/Data Warehouse) to maintain production performance.
-   **Index Strategy**:
    -   **Composite Index**: Use `(student_id, is_read, created_at DESC)` for the "unread notifications" query.
    -   **Avoid**: "Index every column" is bad advice. It causes **write amplification** (every INSERT becomes slow), consumes excessive storage, and can confuse the query planner.

---

## Stage 3: Query Optimization Analysis

**Problem**: A query like `SELECT * FROM notifications WHERE type='Placement' ORDER BY created_at DESC` is slow.
**Diagnosis**: The database is likely performing a full table scan.
**Fix**: Add a composite index on `(type, created_at DESC)`. 
**Wait!** A common mistake is thinking indexing `type` and `created_at` separately is enough. A composite index allows the DB to find the type and sort the results in one go without a separate sort step.

---

## Stage 4: Caching & Pagination

### Redis Integration
-   **Cache Strategy**: Store the "Top 10" or "Unread Count" per student in Redis.
-   **Invalidation**: Use a **push-based invalidation** (Write-through or Cache Eviction on new notification) to keep the cache fresh.
-   **Pagination**: Use **Cursor-based pagination** (e.g., `last_id`, `last_timestamp`) instead of OFFSET. OFFSET becomes extremely slow on large datasets as the DB has to scan and discard previous rows.

---

## Stage 5: Reliability & Background Processing

### The `notify_all` Problem
The current synchronous implementation (looping through all students and sending emails/DB saves) has major flaws:
1.  **Blocking**: The API request hangs until the last email is sent.
2.  **Partial Failure**: If student #50 fails, students #51-100 might never get the notification.
3.  **No Idempotency**: Retrying the whole request might send duplicate emails to the first 49 students.

### Redesign (Queue + Workers)
-   **Message Queue**: Use RabbitMQ or AWS SQS.
-   **Workers**: Background workers pick tasks from the queue.
-   **Outbox Pattern**: Save the notification and the "pending tasks" to the DB in a single transaction, then a separate process pushes to the queue. This ensures DB and Queue are always in sync.
-   **Retries**: Implement exponential backoff with a **Dead Letter Queue (DLQ)** for permanently failed tasks.

---

## Stage 6: Priority Scoring Algorithm

### Scoring Logic
We use weights to ensure critical information surfaces first:
-   **Placement**: 3 | **Result**: 2 | **Event**: 1
-   **Formula**: `(Weight * 10,000,000,000) + Timestamp`

### Min-Heap Implementation
Instead of sorting the entire list ($O(K \log K)$), we use a **Min-Heap** of size $N$. 
-   We iterate through all notifications once.
-   If the current notification's score > heap's minimum, we replace the minimum and re-heapify.
-   Resulting Complexity: **$O(K \log N)$**, which is significantly faster when $N \ll K$.

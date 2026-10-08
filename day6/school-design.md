# School Database Architecture

## Tables

- **students:** Stores student profile details and enforces a unique constraint on emails.
- **courses:** Stores available courses and credit weightings.
- **enrolments:** A join table recording course registrations and grades.

## Relationships

A student takes many courses, and a course contains many students, creating a **many-to-many** relationship. Relational databases cannot map this directly, so the `enrolments` join table is used to split the architecture into two **one-to-many** relationships.

## Indexes

`CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);`

**Reason:** The `UNIQUE(student_id, course_id)` constraint automatically generates a composite index where `student_id` is the leading column, optimizing queries filtering by student. However, it does not optimize reverse lookups. Adding an explicit index on `course_id` guarantees a fast `SEARCH` execution path instead of a full table `SCAN` when fetching course rosters.

## SQL vs NoSQL

SQL is the correct choice for this system. Academic data requires rigid schema constraints (e.g., unique emails, preventing duplicate enrolments). SQL enforces these natively. Additionally, generating transcripts or class rosters requires joining multiple relational data points, which SQL is specifically optimized to execute efficiently.

# School Database Architecture

## Tables

- **students:** Stores the core profile details. Enforces a unique constraint on emails to prevent duplicate accounts.
- **courses:** Stores the available units and their credit weightings.
- **enrolments:** The join table that records when a student registers for a course, along with the grade they received.

## Relationships

A student takes many courses, and a course contains many students. This is a **many-to-many** relationship. Because relational databases cannot map many-to-many relationships directly, the `enrolments` join table is required. It splits the architecture into two **one-to-many** relationships: one student has many enrolments, and one course has many enrolments.

## Indexes

I would add an index to the `student_id` foreign key column in the `enrolments` table:
`CREATE INDEX idx_enrolments_student_id ON enrolments(student_id);`

**Reason:** While user emails are searched frequently, the `email` column already has a `UNIQUE` constraint, which automatically generates a background index in SQLite. Therefore, explicitly indexing it is redundant. Instead, indexing the `student_id` foreign key is much more impactful. The `enrolments` table acts as a structural bridge and is constantly queried using `JOIN` operations on `student_id` (e.g., retrieving a student's full transcript). This index ensures the database engine uses a fast `SEARCH` execution path rather than a slow full table `SCAN` when joining records.

## SQL vs NoSQL

SQL is the correct choice for a school system. Academic data is highly structured and relies on strict rules (e.g., a student must have a valid email, and they cannot enroll in the same class twice). SQL enforces these constraints natively at the schema level. Furthermore, calculating transcripts or generating class rosters requires joining multiple data points together, which relational databases are specifically optimized to do. A NoSQL document store would struggle to keep this highly connected data consistent.

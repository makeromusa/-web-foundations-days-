# School Database Architecture

## Tables

- **students:** Stores the core profile details. Enforces a unique constraint on emails so accounts don't overlap.
- **courses:** Stores the available units and their credit weightings.
- **enrolments:** The join table that records when a student registers for a course, along with the grade they received.

## Relationships

A student takes many courses, and a course contains many students. This is a **many-to-many** relationship. Because relational databases cannot map many-to-many relationships directly, the `enrolments` join table is required. It splits the architecture into two **one-to-many** relationships (one student has many enrolments; one course has many enrolments).

## Indexes

I would add an index to the `email` column in the `students` table:
`CREATE INDEX idx_student_email ON students(email);`
Authentication systems constantly look up users by their email address during login. Without an index, the database scans every row sequentially. An index creates a direct lookup path, keeping logins fast as the student population scales.

## SQL vs NoSQL

SQL is the correct choice for a school system. Academic data is highly structured and relies on strict rules; for example, a student must have a valid email, and they cannot enroll in the same class twice. SQL enforces these constraints natively at the schema level. Furthermore, calculating transcripts or generating class rosters requires joining multiple data points together, which relational databases are specifically optimized to do. A NoSQL document store would struggle to keep this highly connected data consistent.

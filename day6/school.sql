-- Table definitions
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    credits INTEGER NOT NULL
);

-- Join table for the many-to-many relationship
CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    -- Prevents duplicate enrolments for the same class
    UNIQUE (student_id, course_id) 
);

-- Sample data insertion
INSERT INTO students (name, email) VALUES
('Brian Kamau', 'kamau.b@school.edu'),
('Mercy Akinyi', 'akinyi.m@school.edu'),
('Ian Kiprono', 'kiprono.i@school.edu'),
('Faith Wanjiku', 'wanjiku.f@school.edu'); -- No enrolments yet

INSERT INTO courses (title, credits) VALUES
('Data Structures and Algorithms', 4),
('Digital Electronics', 3),
('Systems Analysis and Design', 3);

INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'),
(1, 2, 'B'),
(2, 1, 'A'),
(2, 3, 'C'),
(3, 2, 'B');

-- 1. All courses for one student (by name)
SELECT courses.title, enrolments.grade
FROM courses
JOIN enrolments ON courses.id = enrolments.course_id
JOIN students ON students.id = enrolments.student_id
WHERE students.name = 'Brian Kamau';

-- 2. All students on one course
SELECT students.name, students.email
FROM students
JOIN enrolments ON students.id = enrolments.student_id
JOIN courses ON courses.id = enrolments.course_id
WHERE courses.title = 'Data Structures and Algorithms';

-- 3. The number of students per course
SELECT courses.title, COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON courses.id = enrolments.course_id
GROUP BY courses.id, courses.title;

-- 4. Students who have no enrolments
SELECT students.name, students.email
FROM students
LEFT JOIN enrolments ON students.id = enrolments.student_id
WHERE enrolments.id IS NULL;

-- 5. Update one enrolment's grade
UPDATE enrolments
SET grade = 'A'
WHERE student_id = 2 AND course_id = 3;
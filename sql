


CREATE DATABASE LIBRARY;
USE LIBRARY

CREATE TABLE LoginLog (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
 
);
USE LIBRARY; -- Aapka working database name

CREATE TABLE Transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL,
    book_id VARCHAR(50) NOT NULL,
    issue_date DATETIME DEFAULT GETDATE(),
    due_date VARCHAR(20) NOT NULL
);


INSERT INTO LoginLog (student_id)VALUES ('hi') 

select * from LoginLog

drop table LoginLog

USE LIBRARY
CREATE TABLE Book (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    borrower VARCHAR(50) NULL,
    due_date VARCHAR(20) NULL,
    borrow_count INT DEFAULT 0
);

INSERT INTO Book2 (id, title, status, borrow_count) 
VALUES ('B101', 'Python Programming', 'available', 5);

INSERT INTO Book2 (id, title, status, borrower, due_date, borrow_count) 
VALUES ('B102', 'Data Structures', 'issued', 'ST-2024-01', '2026-05-10', 12);


INSERT INTO Book2 (id, title, status, borrow_count) 
VALUES ('B105', 'physics', 'available', 5);

INSERT INTO Book2 (id, title, status, borrow_count) 
VALUES ('B185', 'AI', 'available', 5);

select * from Book2






USE LIBRARY;

CREATE TABLE Book2 (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    borrow_count INT DEFAULT 0
);

CREATE TABLE Transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL,
    book_id VARCHAR(50) NOT NULL,
    issue_date DATETIME DEFAULT GETDATE(),
    due_date VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'issued' 
);




USE LIBRARY; 
INSERT INTO Book2 (id, title, status, borrow_count) 
VALUES 
('B101', 'Python Programming Core', 'available', 0),
('B102', 'Data Structures & Algorithms', 'available', 0),
('B103', 'Database Management Systems (SQL)', 'available', 0),
('B104', 'Introduction to Software Engineering', 'available', 0),
('B105', 'Artificial Intelligence & Machine Learning', 'available', 0),
('B106', 'Computer Networks & Security', 'available', 0),
('B107', 'Operating Systems Principles', 'available', 0);

SELECT * FROM Transactions;

SELECT * FROM Book2;



USE LIBRARY;

CREATE TABLE Student (
    student_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BIT DEFAULT 1 
);

INSERT INTO Student (student_id, name, is_active) 
VALUES 
('CS-2023-011', 'Ali', 1),
('CS-2023-002', 'Bilal Ahmed Khan', 1), 
('CS-2023-003', 'Zainab Fatima', 0), 
('CS-2023-005', 'Asad Raza', 0);


SELECT * FROM Student;




USE LIBRARY;

-- Admin Users Table Create Karein
CREATE TABLE AdminUser (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(50) NOT NULL
);

-- Testing Admin User Credentials Insert Karein
INSERT INTO AdminUser (username, password) 
VALUES ('admin', 'admin123');
USE LIBRARY;
-- Verify karne ke liye:
SELECT * FROM AdminUser;



USE LIBRARY;

-- Agar table pehle se bana hai to pehle drop karlein (Optional)
DROP TABLE Book2;

-- Quantity ke sath naya table structure
CREATE TABLE Book2 (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'available', -- Agar stock 0 ho jaye to 'out of stock' ho jayega
    borrow_count INT DEFAULT 0,
    quantity INT DEFAULT 1,                -- Total physical copies kitni hain
    available_quantity INT DEFAULT 1       -- Is waqt shelf par kitni bachi hain
);

-- Testing Data Inserts (Ab aap ek book ki multiple copies rakh sakte hain)
INSERT INTO Book2 (id, title, status, borrow_count, quantity, available_quantity) 
VALUES 
('B101', 'Python Programming Core', 'available', 0, 5, 5), -- Is book ki 5 copies hain
('B102', 'Data Structures & Algorithms', 'available', 0, 3, 3),
('B103', 'Database Management Systems (SQL)', 'available', 0, 2, 2);

USE LIBRARY;
select * from Book2


SELECT id AS id, title,quantity, available_quantity FROM Book2
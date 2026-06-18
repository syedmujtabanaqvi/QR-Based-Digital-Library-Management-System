# SSUET Smart Library Management System

## Overview

SSUET Smart Library Management System is a QR Code based library automation system built using **HTML, CSS, JavaScript, Node.js, Express.js, MS SQL Server**, and REST APIs.

The system allows students to issue and return books using QR codes, automatically calculates overdue fines, and provides an admin dashboard for monitoring library activities.

---

## Implemented Features

### 1. Student Authentication

* Student login using Student ID
* Active/Inactive student verification from database
* Session persistence using Local Storage

---

### 2. QR Based Book Issue System

* Generate QR code for selected books
* Issue books by scanning QR code
* Maximum borrowing limit: **3 books per student**
* Automatic due date generation (14 days)

---

### 3. QR Based Book Return System

* Generate Return QR code for issued books
* Return books by scanning QR code
* Automatically update:

  * Return date
  * Transaction status (`issued → returned`)
  * Book availability
  * Available stock quantity

---

### 4. Fine Management System

* Automatic overdue fine calculation
* Fine rate: **Rs. 10 per day**
* Live fine calculation for active overdue books
* Store final fine amount after return
* Display total fine on student dashboard

---

### 5. Notification / Alert System

* Alert students when:

  * Book is issued successfully
  * Book is returned successfully
  * Outstanding fine exists
* Daily fine warning popup

---

### 6. Student Dashboard

Displays:

* Current borrowed books count
* Total accumulated fine
* Transaction history
* Due dates
* Return dates
* Book status (Issued / Returned)

---

### 7. Admin Dashboard

#### Library Statistics

* Total issued books
* Overdue books
* Active borrowers
* Total fine collected

#### Dashboard Metrics

* Most borrowed books
* Defaulters list
* Daily transactions
* Inventory summary

  * Total stock
  * Available stock
* Fine collection summary

---

### 8. Book Management

Admin can:

* Add new books
* Delete books
* View all books
* Track borrow count
* Monitor available inventory

---

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* HTML5 QR Code Library

### Backend

* Node.js
* Express.js

### Database

* Microsoft SQL Server

---

## API Endpoints

### Student APIs

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| POST   | `/api/login`              | Student Login       |
| GET    | `/api/books`              | Get Available Books |
| GET    | `/r`                      | Transaction History |
| GET    | `/issue/:book_id`         | Issue Book          |
| GET    | `/return/:transaction_id` | Return Book         |
| GET    | `/api/circulation/return` | QR Based Return     |

---

### Admin APIs

| Method | Endpoint                       | Description        |
| ------ | ------------------------------ | ------------------ |
| POST   | `/api/admin/login`             | Admin Login        |
| GET    | `/api/admin/books`             | View Books         |
| POST   | `/api/admin/books/add`         | Add Book           |
| POST   | `/api/admin/books/delete`      | Delete Book        |
| GET    | `/api/admin/stats`             | Library Statistics |
| GET    | `/api/admin/dashboard-metrics` | Dashboard Metrics  |

---

## Fine Rules

* Borrowing Limit: **3 books**
* Due Date: **14 days**
* Fine: **Rs. 10 per overdue day**

---

## Author

**SSUET Smart Library Management System**
Developed as a Library Automation Project using QR Code Technology and MS SQL Server.
syed mujtaba ali 
2024f-bcs-086
section : A
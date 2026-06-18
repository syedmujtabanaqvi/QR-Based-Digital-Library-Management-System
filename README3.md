# 📚 Smart Library Automation System

An automated, QR-based library management platform designed for student verification, real-time catalog syncing, dynamic fine calculation, and data-driven administrative insights. The system relies on an Express Node.js cluster network layer powered by a persistent **Microsoft SQL Server (MS SQL)** environment architecture.

---

## 🚀 Key Features

### 👤 Student Core Portal
* **Session Authentication:** Secure login using Roll Numbers/Student IDs synchronized cleanly with live student profiles.
* **QR Compiler Sandbox:** Dynamic compilation of text stream matrices to plot live QR codes for secure book issuance.
* **Permanent Transaction Logs:** Real-time historical ledger updates displaying active leases, return stamps, and dynamic overdue alerts.
* **✨ AI Smart Recommendations:** Matrix tier profiling that calculates personalized suggestions based on student history types, department trends, and target semester modules.

### 🛡️ Admin Control Center Dashboard
* **Live Catalog Control:** Interface to dynamically populate, add new assets, or purge book records permanently from database registers.
* **⚠️ Overdue Books Registry:** Live tracking of systemic defaulters listing accumulated fine structures updated via backend telemetry.
* **📊 Deep Analytics Panels:** Real-time generation of data metrics including:
  * Top Active Borrowers Profile Index
  * Catalog Popularity Matrix Width Scaling
  * Peak Operations Rush Hour telemetry loggers
  * Department-wise Circulation Cluster Segmentations
* **💰 Ledger Accounting:** Instant visual trends comparing Collected Fine Cash versus Pending Systemic Overdue Levies.

---

## 🛠️ Tech Stack & Architecture

### Frontend Layers
* **UI Structure:** Fully responsive semantic HTML5 structure with custom modular CSS variables layout grid styles.
* **QR Handlers:** API QR server vectors mapping layout matrix parameters using automated bypass streams.

### Backend Cluster Engine
* **Node.js Ecosystem:** Express framework handling pipeline streams, request parsing, and system routes logic.
* **Security & Verification:** `jsonwebtoken` (JWT) authorization blocks, `bcrypt` password hashing matrices, and `express-rate-limit` endpoint protection layers.
* **Database Driver:** Core `mssql` client layer connecting cluster configurations to persistent server tables.

---

## 📂 Database Schema Overview

The system expects the following persistent table relations inside your Microsoft SQL Server instance:

### 1. `Student` Table
* `student_id` (VarChar, PK) — Student Roll Number
* `name` (VarChar) — Student Name
* `department` (VarChar) — Academic Department
* `semester` (Int) — Current Module Level
* `is_active` (Bit/Int) — Status Verification Layer

### 2. `Book2` Table
* `id` (VarChar, PK) — Systemic Book Asset Code
* `title` (VarChar) — Asset Title
* `department` (VarChar) — Catalog Genre Classification
* `semester` (Int) — Relevant Academic Semester Target
* `quantity` (Int) — Total Logged Stock Base
* `available_quantity` (Int) — Live Available Allocations Count
* `borrow_count` (Int) — Systemic Popularity Matrix Data

### 3. `Transactions` Table
* `id` (Int, Identity PK) — Database Entry Index
* `transaction_id` (VarChar) — Unique Hex Hashed Block ID Token
* `student_id` (VarChar) — Foreign Relation Mapping Student Profile
* `book_id` (VarChar) — Foreign Relation Mapping Book Asset Code
* `issue_date` (DateTime) — Circulation Issue Time Stamp
* `due_date` (VarChar/DateTime) — System Calculated Return Ceiling
* `return_date` (DateTime, Nullable) — Real-time Return Check-out Logging
* `status` (VarChar) — String state indicator (`issued` / `returned`)
* `fine` (Decimal(10,2)) — Calculated Overdue Levy Penalty

### 4. `AdminUser` Table
* `username` (VarChar, PK) — Identity Console Access Tokens
* `password` (VarChar) — Hashed Authentication Signatures

---

## ⚙️ Installation & Configuration Setup

### 1. Database Connection Setting
Create a file named `dbConfig.js` inside your project root backend directory and export your MS SQL configuration matching your ecosystem parameters:

```javascript
module.exports = {
    user: 'YOUR_DB_USER',
    password: 'YOUR_DB_PASSWORD',
    server: 'YOUR_SERVER_ADDRESS', 
    database: 'YOUR_DATABASE_NAME',
    options: {
        encrypt: true, 
        trustServerCertificate: true 
    }
};
# 📚 Smart Library Automation System

An enterprise-grade, automated, QR-based library management platform designed for multi-branch student verification, real-time catalog syncing, automated fine calculations, adaptive AI recommendation systems, and micro-service analytics telemetry. The system relies on an Express Node.js cluster network layer powered by a persistent **Microsoft SQL Server (MS SQL)** environment architecture.

---

## 🚀 Key Features

### 👤 Student Core Portal
* **Session Authentication:** Secure login using Roll Numbers/Student IDs synchronized cleanly with live student profiles via secure JSON Web Tokens (JWT).
* **QR Compiler Sandbox:** Dynamic compilation of text stream matrices to plot live QR codes for secure book issuance.
* **Permanent Transaction Logs:** Real-time historical ledger updates displaying active leases, return stamps, and dynamic overdue alerts.
* **✨ AI Smart Recommendations:** Weighted matrix profiling engine that processes content arrays dynamically based on user history genres (+25), core department tracks (+15), academic semesters (+10), and global content popularity metrics while checking for duplicate active items (-100).

### 🛡️ Admin Control Center Dashboard
* **Live Catalog Control:** Interface to dynamically populate, add new assets, or purge book records permanently from database registers, bounded safely by transaction state checks.
* **⚠️ Overdue Books Registry:** Live tracking of systemic defaulters listing accumulated fine structures updated via backend telemetry.
* **📊 Deep Analytics Panels:** Real-time generation of data metrics including:
  * Top Active Borrowers Profile Index (Dynamic row streams mapping frequency indices).
  * Catalog Popularity Matrix Width Scaling (Responsive UI progress bar rendering engine).
  * Peak Operations Rush Hour telemetry loggers (SQL `DATEPART` aggregation tracking hourly operational traffic volume loops).
  * Department-wise Circulation Cluster Segmentations.
* **💰 Ledger Accounting & Fine Trends:** Instant visual trends comparing Collected Fine Cash versus Pending Systemic Overdue Levies.

### 🏢 Enterprise Operations & Infrastructures
* **Multi-Branch & Departmental Support:** Central database schema capable of tracking cross-campus allocations, inventory distribution parameters, and isolated service desk events across independent campus outlet segments or departments.
* **Comprehensive Multi-State Logging:** Unalterable database log entries recording tracking operations for historical auditing: `LOGIN`, `FAILED ATTEMPT`, `BOOK ISSUE`, `BOOK RETURN`, and `FINE PAYMENT`.
* **Database Archival Subsystems:** Closed transaction logs older than 365 days are filtered and shifted dynamically to compressed cold storage tables to maintain production index speed.

---

## 🛠️ Tech Stack & Security Hardening

### Frontend Layers
* **UI Structure:** Fully responsive semantic HTML5 structure with custom modular CSS variables layout grid styles.
* **QR Handlers:** Embedded HTML5 QR Code script for counter scanning, combined with remote API QR encoding servers generating dynamic vector blocks.

### Backend Cluster Engine
* **Node.js Ecosystem:** Express framework handling pipeline streams, request parsing, and multi-layered route processing.
* **Rate-Limiting Throttling:** Robust script mitigation using custom network guards:
  * **Global Limiter:** Limits standard API requests to **100 requests per 15 minutes** window.
  * **Auth Limiter:** Strict lockouts protecting login routes at **15 authentications per 15 minutes**.
* **Security Layer Rules:** Encrypted administrative credentials powered by `bcrypt` salt comparisons, secure context query binding (`.input()` parameterization) to completely neutralize SQL injection vectors, and TLS protocol configurations for secure HTTPS deployments.

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
* `department` (VarChar) — Catalog Genre / Department Classification
* `semester` (Int) — Relevant Academic Semester Target
* `quantity` (Int) — Total Logged Stock Base
* `available_quantity` (Int) — Live Available Allocations Count
* `borrow_count` (Int) — Systemic Popularity Matrix Data
* `branch_id` (VarChar, Nullable) — Multi-Branch Asset Identifier

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

## 📐 Business Logic Rules

### Fine Calculation Matrix
Fines are processed automatically during check-in using the following calculation loop:

$$\text{Late Days} = \lceil \text{Current Timestamp} - \text{Due Date Timestamp} \rceil$$

$$\text{Levy Penalty} = \begin{cases} \text{Late Days} \times \text{Rs. 10.00}, & \text{if } \text{Current Date} > \text{Due Date} \\ \text{Rs. 0.00}, & \text{otherwise} \end{cases}$$

### System Constraints
* **Borrowing Cap:** Maximum limit of **3 active book leases** allowed per student profile concurrently.
* **Checkout Lifespan:** Default loan periods are calculated as **14 days** from the checkout timestamp.

---
**SSUET Smart Library Management System**  
Developed as a Library Automation Project using QR Code Technology and MS SQL Server.  

* **Name:** Syeda fizza 
* **Roll Number:** 2024F-BCS-099
* **Section:** A
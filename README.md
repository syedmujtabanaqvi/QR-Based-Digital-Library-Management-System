<<<<<<< HEAD
# SSUET Smart Library Management System (Assignment 3)

Automated QR circulation application tailored for Sir-Syed University Computer Science & IT Department constraints using Flask and MS SQL Server.

## Features Added
1. **Student Login Redirection:** Explicitly binds University IDs via session parameter pipelines.
2. **Borrowing Limit Validation:** Direct raw query filters check active arrays and block transactions if a student has already issued 3 items.
3. **Simultaneous Contention Guard:** Blocks multiple scans from checking out an identical book object context simultaneously.
4. **Audit Immutability:** Transaction tracking data history is written via `INSERT` commands, preserving historical traces natively.

## Installation Sequence
1. Install extensions:
   ```bash
   pip install flask flask-sqlalchemy pyodbc qrcode pillow
=======
# QR-Based-Digital-Library-Management-System
QR-Based Digital Library Management System is a smart library solution where students issue books by scanning QR codes. The system checks student eligibility, book availability, borrowing limits, and generates transaction IDs automatically while maintaining permanent issue records.
>>>>>>> 660092328b088c0a4604c7629ad2092191fafef3

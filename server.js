const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const sql = require("mssql");
const config = require("./dbConfig");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());
app.use(cors()); 

const NODE_PORT = 5000;
const JWT_SECRET = "SSUET_SMART_LIBRARY_SECRET_TOKEN_VECTOR_2026";

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 15, 
    message: { success: false, message: "Too many login attempts. Locked for 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ success: false, message: "Access Denied: Missing Authorization Signature." });
    }

    const token = authHeader.split(' ')[1] || authHeader;

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: "Session Expired or Corrupted Token Validation." });
        }
        req.user = decoded;
        next();
    });
}

app.get("/r", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT id, transaction_id, student_id, book_id, issue_date, due_date, status, return_date, fine FROM Transactions ORDER BY id DESC');
        return res.json(result.recordset);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

app.get("/api/books", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Book2");
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/transactions', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Transactions ORDER BY id DESC");
        return res.json({ success: true, data: result.recordset });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/login', authLimiter, async (req, res) => {
    const { student_id } = req.body;

    if (!student_id) {
        return res.status(400).json({ success: false, message: "Error: Student ID missing!" });
    }

    try {
        let pool = await sql.connect(config);
        let studentResult = await pool.request()
            .input("studentId", sql.VarChar, student_id)
            .query("SELECT * FROM Student WHERE student_id = @studentId");

        const student = studentResult.recordset[0];

        if (!student) {
            return res.status(404).json({ success: false, message: "Student record not found in Database." });
        }

        if (student.is_active === false || student.is_active === 0) {
            return res.status(403).json({ success: false, message: "Access Denied: Student profile is INACTIVE." });
        }

        const token = jwt.sign(
            { student_id: student.student_id, role: 'student' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`🔑 Login Logged: Student ${student.name} (${student_id}) successfully authenticated.`);
        return res.status(200).json({ 
            success: true, 
            message: "Login verified successfully!", 
            student_id: student.student_id,
            token: token
        });
        
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        let pool = await sql.connect(config);
        
        const result = await pool.request()
            .input("adminUser", sql.VarChar, username)
            .query("SELECT * FROM AdminUser WHERE username = @adminUser");

        if (result.recordset.length > 0) {
            const admin = result.recordset[0];
            const match = await bcrypt.compare(password, admin.password);

            if (match) {
                const adminToken = jwt.sign(
                    { username: admin.username, role: 'admin' }, 
                    JWT_SECRET, 
                    { expiresIn: '12h' }
                );

                return res.json({ success: true, message: 'Admin login successful', token: adminToken });
            }
        }
        return res.json({ success: false, message: 'Invalid username or password' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/generate_qr', async (req, res) => {
    const { book_id, student_id, action } = req.query;
    const currentAction = action || "issue";

    if (!book_id || !student_id) {
        return res.status(400).json({ success: false, message: "Parameters missing!" });
    }

    try {
        let pool = await sql.connect(config);
        let borrowCountResult = await pool.request()
            .input("student_id", sql.VarChar, student_id)
            .query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");

        const totalBorrowed = borrowCountResult.recordset[0].total_borrowed;

        if (totalBorrowed >= 3) {
            return res.status(400).json({
                success: false,
                message: `Bypass Blocked: Student already has ${totalBorrowed} active books. Cannot issue more than 3 books!`
            });
        }

        const target_url = `http://192.168.100.6:${NODE_PORT}/${currentAction}/${book_id}?student_id=${student_id}`;
        console.log(` Generated Matrix Link Vector: ${target_url}`);

        return res.status(200).json({
            success: true,
            target_payload: target_url,
            image_data: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(target_url)}`
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/books', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query(`
            SELECT id AS book_id, title, quantity, available_quantity, borrow_count 
            FROM Book2 ORDER BY id DESC
        `);
        return res.json({ success: true, data: result.recordset });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        let pool = await sql.connect(config);

        let totalIssued = await pool.request().query(`SELECT COUNT(*) AS totalIssued FROM Transactions`);
        let overdueBooks = await pool.request().query(`
            SELECT COUNT(*) AS overdueBooks FROM Transactions
            WHERE LOWER(TRIM(status))='issued' AND CAST(due_date AS DATE) < CAST(GETDATE() AS DATE)
        `);
        let activeBorrowers = await pool.request().query(`
            SELECT COUNT(DISTINCT student_id) AS activeBorrowers FROM Transactions WHERE LOWER(TRIM(status))='issued'
        `);
        let totalFine = await pool.request().query(`
            SELECT ISNULL(SUM(CASE 
                WHEN LOWER(TRIM(status)) = 'returned' OR LOWER(TRIM(status)) = 'retuned' THEN ISNULL(fine, 0)
                WHEN LOWER(TRIM(status)) = 'issued' AND CAST(due_date AS DATE) < CAST(GETDATE() AS DATE) 
                THEN DATEDIFF(day, CAST(due_date AS DATE), CAST(GETDATE() AS DATE)) * 10 ELSE 0 
            END), 0) AS totalFine FROM Transactions
        `);

        return res.json({
            success: true,
            totalIssued: totalIssued.recordset[0].totalIssued,
            overdueBooks: overdueBooks.recordset[0].overdueBooks,
            activeBorrowers: activeBorrowers.recordset[0].activeBorrowers,
            totalFine: totalFine.recordset[0].totalFine
        });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/books/add', async (req, res) => {
    const { book_id, title, quantity } = req.body; 
    if (!book_id || !title || !quantity) {
        return res.status(400).json({ success: false, message: "Required parameter attributes missing!" });
    }

    try {
        let pool = await sql.connect(config);
        let checkExist = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Book2 WHERE id = @id");

        if (checkExist.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "Book ID already exists in database registry!" });
        }

        await pool.request()
            .input("id", sql.VarChar, book_id)
            .input("title", sql.VarChar, title)
            .input("qty", sql.Int, quantity) 
            .query(`INSERT INTO Book2 (id, title, status, borrow_count, quantity, available_quantity) VALUES (@id, @title, 'available', 0, @qty, @qty)`);

        console.log(`Added to Catalog: ${book_id}`);
        return res.json({ success: true, message: "New book record written successfully!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/books/delete', async (req, res) => {
    const { book_id } = req.body;
    if (!book_id) return res.status(400).json({ success: false, message: "Book ID token missing!" });

    try {
        let pool = await sql.connect(config);
        let activeLeaseCheck = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Transactions WHERE book_id = @id AND status = 'issued'");

        if (activeLeaseCheck.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete asset! Active in ongoing transactions." });
        }

        await pool.request().input("id", sql.VarChar, book_id).query("DELETE FROM Book2 WHERE id = @id");
        return res.json({ success: true, message: "Asset cleared permanently." });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/dashboard-metrics', async (req, res) => {
    try {
        let pool = await sql.connect(config);

        let dailyTransactionsResult = await pool.request().query(`SELECT COUNT(*) AS dailyTransactions FROM Transactions WHERE CAST(issue_date AS DATE) = CAST(GETDATE() AS DATE)`);
        let inventory = await pool.request().query(`SELECT SUM(quantity) AS totalStock, SUM(available_quantity) AS availableStock FROM Book2`);
        let fine = await pool.request().query(`SELECT ISNULL(SUM(fine), 0) AS totalFine FROM Transactions`);
        let totalIssued = await pool.request().query(`SELECT COUNT(*) AS totalIssued FROM Transactions`);

        let activeStudentsResult = await pool.request().query(`
            SELECT TOP 5 t.student_id, s.name, COUNT(*) AS total_borrowed
            FROM Transactions t
            JOIN Student s ON t.student_id = s.student_id
            GROUP BY t.student_id, s.name
            ORDER BY total_borrowed DESC
        `);

        let popularBooksResult = await pool.request().query(`
            SELECT TOP 5 id AS book_id, title, borrow_count 
            FROM Book2 
            ORDER BY borrow_count DESC
        `);

        let peakTimingsResult = await pool.request().query(`
            SELECT DATEPART(HOUR, issue_date) AS issue_hour, COUNT(*) AS volume
            FROM Transactions
            GROUP BY DATEPART(HOUR, issue_date)
            ORDER BY volume DESC
        `);

        let fineTrendsResult = await pool.request().query(`
            SELECT 
                ISNULL(SUM(CASE WHEN LOWER(TRIM(status)) = 'returned' THEN fine ELSE 0 END), 0) AS collected_fine,
                ISNULL(SUM(CASE WHEN LOWER(TRIM(status)) = 'issued' AND CAST(due_date AS DATETIME) < GETDATE() 
                         THEN DATEDIFF(day, CAST(due_date AS DATETIME), GETDATE()) * 10 ELSE 0 END), 0) AS pending_fine
            FROM Transactions
        `);

        let deptStatsResult = await pool.request().query(`
            SELECT s.department, COUNT(*) AS total_issues
            FROM Transactions t
            JOIN Student s ON t.student_id = s.student_id
            WHERE s.department IS NOT NULL
            GROUP BY s.department
            ORDER BY total_issues DESC
        `);

        let defaulters = await pool.request().query(`
            SELECT t.student_id, s.name, t.book_id, CONVERT(VARCHAR, t.due_date, 105) AS due_date,
            CASE WHEN CAST(t.due_date AS DATETIME) < GETDATE() THEN DATEDIFF(day, CAST(t.due_date AS DATETIME), GETDATE()) * 10 ELSE 0 END AS fine
            FROM Transactions t 
            JOIN Student s ON t.student_id = s.student_id 
            WHERE LOWER(TRIM(t.status)) = 'issued' AND CAST(t.due_date AS DATETIME) < GETDATE()
        `);

        return res.json({
            success: true,
            dailyTransactions: dailyTransactionsResult.recordset[0].dailyTransactions,
            inventory: inventory.recordset[0],
            totalFine: fine.recordset[0].totalFine,
            totalIssued: totalIssued.recordset[0].totalIssued,
            activeStudents: activeStudentsResult.recordset,
            popularBooks: popularBooksResult.recordset,
            peakTimings: peakTimingsResult.recordset,
            fineTrends: fineTrendsResult.recordset[0],
            deptStats: deptStatsResult.recordset,
            defaulters: defaulters.recordset
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/:action/:identifier', async (req, res) => {
    const { action, identifier } = req.params;

    if (action === 'issue') {
        const book_id = identifier;
        const { student_id } = req.query;

        try {
            let pool = await sql.connect(config);
            let studentCheckResult = await pool.request().input("student_id", sql.VarChar, student_id).query("SELECT * FROM Student WHERE student_id = @student_id");
            const student = studentCheckResult.recordset[0];
            
            if (!student || student.is_active === false || student.is_active === 0) {
                return res.status(403).send(`<h1>Transaction Denied: Inactive Profile</h1>`);
            }

            let borrowCountResult = await pool.request().input("student_id", sql.VarChar, student_id).query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");
            if (borrowCountResult.recordset[0].total_borrowed >= 3) return res.status(400).send(`<h1> Limit Violation </h1>`);

            let result = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Book2 WHERE id = @id");
            const book = result.recordset[0];
            if (!book || book.available_quantity <= 0) return res.status(400).send(`<h1>Out of Stock!</h1>`);

            const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); 
            const formattedDueDate = dueDate.toISOString().slice(0, 10);

            await pool.request().input("id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity - 1, borrow_count = borrow_count + 1 WHERE id = @id");
            await pool.request()
                .input("txn_id", sql.VarChar, generatedTransactionID).input("student_id", sql.VarChar, student_id).input("book_id", sql.VarChar, book_id).input("due_date", sql.VarChar, formattedDueDate) 
                .query("INSERT INTO Transactions (transaction_id, student_id, book_id, due_date, status, fine) VALUES (@txn_id, @student_id, @book_id, @due_date, 'issued', 0.00)");

            return res.status(200).send(`<h1>Digital Book Issued Context Cleanly</h1><p>ID: ${generatedTransactionID}</p>`);
        } catch (err) { return res.status(500).send(err.message); }
    }

    else if (action === 'return') {
        const transaction_id = identifier;
        const { book_id } = req.query;

        try {
            let pool = await sql.connect(config);
            let txnResult = await pool.request().input("txn_id", sql.VarChar, transaction_id).query("SELECT CAST(due_date AS DATETIME) AS due_date, status FROM Transactions WHERE transaction_id = @txn_id");
            if (txnResult.recordset.length === 0) return res.status(404).send(`<h1>Not Found</h1>`);
            
            const txnRow = txnResult.recordset[0];
            if (txnRow.status === 'returned') return res.status(400).send(`<h1>Already Processed</h1>`);

            const dueDate = new Date(txnRow.due_date);
            const returnDate = new Date();
            let lateDays = 0, fine = 0.00;

            if (returnDate > dueDate) {
                lateDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                fine = lateDays * 10; 
            }

            await pool.request().input("txn_id", sql.VarChar, transaction_id).input("return_date", sql.DateTime, returnDate).input("fine", sql.VarChar, fine.toFixed(2)) 
                .query("UPDATE Transactions SET status = 'returned', return_date = @return_date, fine = CAST(@fine AS DECIMAL(10,2)) WHERE transaction_id = @txn_id");
            await pool.request().input("book_id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

            return res.status(200).send(`<h1>Asset Return Verified Fine: Rs.${fine.toFixed(2)}</h1>`);
        } catch (err) { return res.status(500).send(err.message); }
    }
});

// Circulation Scanner Sync Hook
app.get('/api/circulation/return', async (req, res) => {
    const { transaction_id, book_id } = req.query;
    try {
        let pool = await sql.connect(config);
        let txnResult = await pool.request().input("txn_id", sql.VarChar, transaction_id).query("SELECT due_date, status, student_id FROM Transactions WHERE transaction_id = @txn_id");
        const txnRow = txnResult.recordset[0];

        let lateDays = 0, fine = 0.00;
        if (new Date() > new Date(txnRow.due_date)) {
            lateDays = Math.ceil((new Date().getTime() - new Date(txnRow.due_date).getTime()) / (1000 * 60 * 60 * 24));
            fine = lateDays * 10; 
        }

        await pool.request().input("txn_id", sql.VarChar, transaction_id).input("fine", sql.Decimal(10, 2), fine) 
            .query(`UPDATE Transactions SET status = 'returned', return_date = GETDATE(), fine = @fine WHERE transaction_id = @txn_id`);
        await pool.request().input("book_id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

        return res.status(200).send(`<h3>✅ Automated System Return Sequenced Fine: Rs. ${fine.toFixed(2)}</h3>`);
    } catch (err) { return res.status(500).send(err.message); }
});

// AI Recommendation Engine
app.get('/api/recommendations/:student_id', async (req, res) => {
    const { student_id } = req.params;
    if (!student_id) return res.status(400).json({ success: false, message: "Missing Student ID Vector" });

    try {
        let pool = await sql.connect(config);
        let studentProfile = await pool.request().input("student_id", sql.VarChar, student_id).query("SELECT department, semester FROM Student WHERE student_id = @student_id");
        const student = studentProfile.recordset[0];
        if (!student) return res.status(404).json({ success: false, message: "Profile missing" });

        let recommendationResult = await pool.request()
            .input("student_id", sql.VarChar, student_id)
            .input("department", sql.VarChar, student.department || '')
            .input("semester", sql.Int, student.semester || 1)
            .query(`
                WITH UserHistoryGenres AS (
                    SELECT TOP 1 b.department AS FavGenre FROM Transactions t
                    JOIN Book2 b ON t.book_id = b.id WHERE t.student_id = @student_id
                    GROUP BY b.department ORDER BY COUNT(*) DESC
                ),
                BookScores AS (
                    SELECT b.id AS book_id, b.title, b.available_quantity,
                    CASE WHEN LOWER(TRIM(b.department)) = (SELECT LOWER(TRIM(FavGenre)) FROM UserHistoryGenres) THEN 25 ELSE 0 END AS HistoryTypeScore,
                    CASE WHEN LOWER(TRIM(b.department)) = LOWER(TRIM(@department)) THEN 15 ELSE 0 END AS DeptScore,
                    CASE WHEN b.semester = @semester THEN 10 ELSE 0 END AS SemScore,
                    ISNULL(b.borrow_count, 0) AS PopularityScore,
                    CASE WHEN EXISTS (SELECT 1 FROM Transactions t WHERE t.book_id = b.id AND t.student_id = @student_id AND t.status = 'issued') THEN -100 ELSE 0 END AS DuplicationPenalty
                    FROM Book2 b WHERE b.available_quantity > 0
                )
                SELECT TOP 5 book_id, title FROM BookScores 
                WHERE (HistoryTypeScore + DeptScore + SemScore + PopularityScore + DuplicationPenalty) > 0
                ORDER BY (HistoryTypeScore + DeptScore + SemScore + PopularityScore + DuplicationPenalty) DESC
            `);

        return res.json({ success: true, recommendations: recommendationResult.recordset });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/:action/:identifier', globalLimiter, async (req, res) => {
    const { action, identifier } = req.params;

    const renderMobileUI = (title, status, message, statusClass) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                :root {
                    --primary: #0f5a6e;
                    --success: #2ecc71;
                    --error: #e74c3c;
                    --bg: #f4f7f6;
                }
                body {
                    margin: 0; padding: 0;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    background-color: var(--bg);
                    display: flex; justify-content: center; align-items: center;
                    min-height: 100vh; color: #333;
                }
                .status-card {
                    background: white; padding: 30px;
                    border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    width: 90%; max-width: 400px; text-align: center;
                    box-sizing: border-box; border-top: 8px solid var(--primary);
                }
                .status-card.${statusClass} {
                    border-top-color: ${statusClass === 'success' ? 'var(--success)' : 'var(--error)'};
                }
                .icon-circle {
                    width: 70px; height: 70px;
                    border-radius: 50%; display: flex;
                    align-items: center; justify-content: center;
                    margin: 0 auto 20px;
                    background: ${statusClass === 'success' ? '#e8f8f0' : '#fdeded'};
                    color: ${statusClass === 'success' ? 'var(--success)' : 'var(--error)'};
                    font-size: 32px; font-weight: bold;
                }
                h2 { margin: 0 0 10px; color: #2c3e50; font-size: 22px; }
                p { margin: 0 0 20px; color: #666; font-size: 14px; line-height: 1.5; }
                .meta-box {
                    background: #f8f9fa; border-radius: 8px;
                    padding: 15px; font-family: monospace;
                    font-size: 13px; color: #495057; text-align: left;
                    border: 1px solid #e9ecef;
                }
                .footer-brand {
                    margin-top: 25px; font-size: 11px;
                    color: #999; letter-spacing: 1px; text-transform: uppercase;
                }
            </style>
        </head>
        <body>
            <div class="status-card ${statusClass}">
                <div class="icon-circle">${statusClass === 'success' ? '✓' : '✕'}</div>
                <h2>${status.toUpperCase()}</h2>
                <p>${message}</p>
                <div class="meta-box">
                    <strong>Action:</strong> ${action.toUpperCase()}<br>
                    <strong>Target ID:</strong> ${identifier}<br>
                    <strong>Timestamp:</strong> ${new Date().toLocaleString()}<br>
                    <strong>Status:</strong> Processed Securely
                </div>
                <div class="footer-brand">SSUET Smart Library Terminal</div>
            </div>
        </body>
        </html>
    `;

    if (action === 'issue') {
        const book_id = identifier;
        const { student_id } = req.query;

        try {
            let pool = await sql.connect(config);
            let studentCheckResult = await pool.request().input("student_id", sql.VarChar, student_id).query("SELECT * FROM Student WHERE student_id = @student_id");
            const student = studentCheckResult.recordset[0];
            
            if (!student || student.is_active === false || student.is_active === 0) {
                return res.status(403).send(renderMobileUI("Access Denied", "Transaction Denied", "Student profile is currently INACTIVE or missing in database catalog registration.", "error"));
            }

            let borrowCountResult = await pool.request().input("student_id", sql.VarChar, student_id).query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");
            if (borrowCountResult.recordset[0].total_borrowed >= 3) {
                return res.status(400).send(renderMobileUI("Limit Violation", "Bypass Blocked", "Limit Violation! Student has already reached the maximum cap of 3 active book leases.", "error"));
            }

            let result = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Book2 WHERE id = @id");
            const book = result.recordset[0];
            if (!book || book.available_quantity <= 0) {
                return res.status(400).send(renderMobileUI("Out of Stock", "Allocation Failed", "The requested book asset is currently out of stock or completely allocated.", "error"));
            }

            const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); 
            const formattedDueDate = dueDate.toISOString().slice(0, 10);

            await pool.request().input("id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity - 1, borrow_count = borrow_count + 1 WHERE id = @id");
            await pool.request()
                .input("txn_id", sql.VarChar, generatedTransactionID).input("student_id", sql.VarChar, student_id).input("book_id", sql.VarChar, book_id).input("due_date", sql.VarChar, formattedDueDate) 
                .query("INSERT INTO Transactions (transaction_id, student_id, book_id, due_date, status, fine) VALUES (@txn_id, @student_id, @book_id, @due_date, 'issued', 0.00)");

            return res.status(200).send(renderMobileUI("Asset Issued", "Success", `Digital book asset allocated successfully under verification hash block id. Check-out complete.`, "success"));
        } catch (err) { 
            return res.status(500).send(renderMobileUI("Server Error", "Exception Fault", err.message, "error")); 
        }
    }

    else if (action === 'return') {
        const transaction_id = identifier;
        const { book_id } = req.query;

        try {
            let pool = await sql.connect(config);
            let txnResult = await pool.request().input("txn_id", sql.VarChar, transaction_id).query("SELECT CAST(due_date AS DATETIME) AS due_date, status FROM Transactions WHERE transaction_id = @txn_id");
            if (txnResult.recordset.length === 0) {
                return res.status(404).send(renderMobileUI("Not Found", "Registry Missing", "Transaction signature vector matching this token was not found in database records.", "error"));
            }
            
            const txnRow = txnResult.recordset[0];
            if (txnRow.status === 'returned') {
                return res.status(400).send(renderMobileUI("Duplicate Operation", "Already Processed", "This return loop token has already been verified and flushed into logs registry.", "error"));
            }

            const dueDate = new Date(txnRow.due_date);
            const returnDate = new Date();
            let lateDays = 0, fine = 0.00;

            if (returnDate > dueDate) {
                lateDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                fine = lateDays * 10; 
            }

            await pool.request().input("txn_id", sql.VarChar, transaction_id).input("return_date", sql.DateTime, returnDate).input("fine", sql.VarChar, fine.toFixed(2)) 
                .query("UPDATE Transactions SET status = 'returned', return_date = @return_date, fine = CAST(@fine AS DECIMAL(10,2)) WHERE transaction_id = @txn_id");
            await pool.request().input("book_id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

            return res.status(200).send(renderMobileUI("Asset Returned", "Success", `Asset return processed successfully. Calculated Overdue Levy Penalty: Rs. ${fine.toFixed(2)}`, "success"));
        } catch (err) { 
            return res.status(500).send(renderMobileUI("Server Error", "Exception Fault", err.message, "error")); 
        }
    }
});
app.listen(NODE_PORT, () => {
    console.log(`Server running on http://localhost:${NODE_PORT}`);
});
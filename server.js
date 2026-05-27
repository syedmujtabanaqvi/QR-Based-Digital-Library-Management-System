const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const sql = require("mssql");
const config = require("./dbConfig");

const app = express();
app.use(express.json());
app.use(cors()); 

const NODE_PORT = 5000;

const staticTransactionsArchive = [];
const loginLogTable = []; 

// 1. Get Login Logs from DB
app.get("/r", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM Transactions ORDER BY id DESC');
        return res.json(result.recordset);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

// 2. Get All Books from DB table 'Book2' (FIXED: Out of stock books bhi dropdown mein aayengi)
app.get("/api/books", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        // ✅ FIXED: Filter hata diya taake saari library inventory dropdown mein show ho ske
        let result = await pool.request().query("SELECT * FROM Book2");

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// --- ADMIN CONTROL API 1: GET ALL HISTORICAL TRANSACTIONS ---
app.get('/api/admin/transactions', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Transactions ORDER BY id DESC");
        
        return res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// --- ADMIN CONTROL API 2: REVERSE CORE LEASE (RETURN BOOK OPERATION) ---
app.post('/api/admin/return', async (req, res) => {
    const { transaction_id, book_id } = req.body;

    if (!transaction_id || !book_id) {
        return res.status(400).json({ success: false, message: "Parameters context tokens missing!" });
    }

    try {
        let pool = await sql.connect(config);

        // 1. Transactions table mein status ko 'issued' se 'returned' kar dein
        await pool.request()
            .input("txn_id", sql.VarChar, transaction_id)
            .query("UPDATE Transactions SET status = 'returned' WHERE transaction_id = @txn_id");

        // 2. Book2 table mein available_quantity barha dein aur status 'available' set kardein
        await pool.request()
            .input("book_id", sql.VarChar, book_id)
            .query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

        console.log(`🔄 Admin Operation: Book ${book_id} returned successfully. Txn Settled: ${transaction_id}`);
        
        return res.json({
            success: true,
            message: "Asset state reverted and synchronized safely inside database cluster!"
        });

    } catch (err) {
        console.error("Admin Return Error: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Dynamic Student Login Auth Module (100% DB Driven)
app.post('/api/login', async (req, res) => {
    const { student_id } = req.body;

    if (!student_id) {
        return res.status(400).json({ success: false, message: "Error: Student ID missing!" });
    }

    try {
        let pool = await sql.connect(config);
        
        let studentResult = await pool.request()
            .input("student_id", sql.VarChar, student_id)
            .query("SELECT * FROM Student WHERE student_id = @student_id");

        const student = studentResult.recordset[0];

        if (!student) {
            return res.status(404).json({ success: false, message: "Student record not found in Database." });
        }

        if (student.is_active === false || student.is_active === 0) {
            return res.status(403).json({ success: false, message: "Access Denied: Student profile is INACTIVE." });
        }

        console.log(`🔑 Login Logged: Student ${student.name} (${student_id}) successfully authenticated from DB.`);
        
        return res.status(200).json({ 
            success: true, 
            message: "Login verified successfully!", 
            student_id: student_id 
        });
        
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Generate QR Payload Link
app.get('/api/generate_qr', (req, res) => {
    const { book_id, student_id, action } = req.query;
    const currentAction = action || "issue";

    if (!book_id || !student_id) {
        return res.status(400).json({ success: false, message: "Parameters arrays missing!" });
    }

    const target_url = `http://192.168.100.6:${NODE_PORT}/${currentAction}/${book_id}?student_id=${student_id}`;
    console.log(`🎯 Generated Matrix Link Vector: ${target_url}`);

    return res.status(200).json({
        success: true,
        target_payload: target_url,
        image_data: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(target_url)}`
    });
});

// 5. Core Unified Business Logic & DB Book Issuance Controller
app.get('/:action/:book_id', async (req, res) => {
    const { action, book_id } = req.params;
    const { student_id } = req.query;

    if (action !== 'issue') {
        return res.status(400).send(`<h1>❌ Error: Invalid System Operation Parameter!</h1>`);
    }

    console.log(`⚡ Execution Pipeline Triggered: Processing book ${book_id} for student ${student_id}`);

    try {
        let pool = await sql.connect(config);

        // --- STEP A: DYNAMIC STUDENT ELIGIBILITY CHECK FROM DB ---
        let studentCheckResult = await pool.request()
            .input("student_id", sql.VarChar, student_id)
            .query("SELECT * FROM Student WHERE student_id = @student_id");

        const student = studentCheckResult.recordset[0];

        if (!student || student.is_active === false || student.is_active === 0) {
            return res.status(403).send(`
                <div style="font-family:Arial; text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c;">❌ Transaction Denied</h1>
                    <p>Student profile is either <strong>INACTIVE</strong> or Unauthorized in Database.</p>
                </div>
            `);
        }

        // --- STEP B: COUNT ACTIVE LEASES FROM TRANSACTIONS TABLE ---
        let borrowCountResult = await pool.request()
            .input("student_id", sql.VarChar, student_id)
            .query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");

        const totalBorrowed = borrowCountResult.recordset[0].total_borrowed;
        console.log(`📊 Live Database Metrics: Student ${student.name} has currently ${totalBorrowed} active transactions.`);

        if (totalBorrowed >= 3) {
            return res.status(400).send(`
                <div style="font-family:Arial; text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c;">❌ Limit Violation</h1>
                    <p>Constraint breached! You have already borrowed ${totalBorrowed} books according to Transactions Log (Max limit: 3).</p>
                </div>
            `);
        }

        // Fetch book data to check physical shelf status
        let result = await pool.request()
            .input("id", sql.VarChar, book_id)
            .query("SELECT * FROM Book2 WHERE id = @id");

        const book = result.recordset[0];

        if (!book) {
            return res.status(404).send(`
                <div style="font-family:Arial; text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c;">❌ Registry Error</h1>
                    <p>Asset identifier token <strong>${book_id}</strong> not found inside database catalog.</p>
                </div>
            `);
        }

        // Validation: Ab quantity check dynamic karega stock management rules par
        if (book.available_quantity <= 0) {
            return res.status(400).send(`
                <div style="font-family:Arial; text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c;">❌ Out of Stock</h1>
                    <p>The requested book <strong>${book.title}</strong> is currently out of stock on shelf.</p>
                </div>
            `);
        }

        // --- STEP C: COMMIT PHASE ---
        const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(issueDate.getDate() + 14); 
        const formattedDueDate = dueDate.toISOString().slice(0, 10); // Format: YYYY-MM-DD

        // Query 1: Deduct copies balance index parameter allocation
        await pool.request()
            .input("id", sql.VarChar, book_id)
            .query(`
                UPDATE Book2
                SET available_quantity = available_quantity - 1,
                    borrow_count = borrow_count + 1,
                    status = CASE WHEN available_quantity - 1 <= 0 THEN 'out of stock' ELSE 'available' END
                WHERE id = @id
            `);

        // Query 2: Insert permanent operational log row data
        await pool.request()
            .input("txn_id", sql.VarChar, generatedTransactionID)
            .input("student_id", sql.VarChar, student_id)
            .input("book_id", sql.VarChar, book_id)
            .input("due_date", sql.VarChar, formattedDueDate)
            .query(`
                INSERT INTO Transactions (transaction_id, student_id, book_id, due_date, status)
                VALUES (@txn_id, @student_id, @book_id, @due_date, 'issued')
            `);

        console.log(`📦 SQL Server Permanent Records Saved! New Txn Row Written: ${generatedTransactionID}`);

        return res.status(200).send(`
            <div style="text-align:center; font-family:'Segoe UI',Arial; padding:50px; background:#f4f7f6; min-height:100vh; margin:0;">
                <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); max-width:450px; border-top: 8px solid #0f5a6e;">
                    <h1 style="color:#2ecc71; margin-top:0;">✅ Digital Book Issued</h1>
                    <p style="color:#666; font-size:14px;">Sir Syed University Smart Library automated system transaction processed safely and saved permanently to Transactions Register.</p>
                    <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
                    <div style="text-align:left; font-size:15px; color:#333; line-height:2;">
                        <strong>Transaction ID:</strong> <span style="font-family:monospace; background:#e9ecef; padding:2px 6px; border-radius:4px;">${generatedTransactionID}</span><br>
                        <strong>Student Name:</strong> ${student.name}<br>
                        <strong>Book Title:</strong> ${book.title}<br>
                        <strong>Due Date Allocation:</strong> <span style="color:#e74c3c; font-weight:bold;">${formattedDueDate}</span>
                    </div>
                </div>
            </div>
        `);

    } catch (err) {
        console.error("SQL Processing Exception: ", err);
        return res.status(500).send(`<h1>Database Transaction Error: ${err.message}</h1>`);
    }
});

// --- ADMIN DATABASE-DRIVEN LOGIN AUTHENTICATION ENDPOINT ---
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username or Password parameters missing!" });
    }

    try {
        let pool = await sql.connect(config);
        
        let result = await pool.request()
            .input("username", sql.VarChar, username)
            .input("password", sql.VarChar, password)
            .query("SELECT * FROM AdminUser WHERE username = @username AND password = @password");

        const admin = result.recordset[0];

        if (admin) {
            console.log(`🛡️ Admin Session Authenticated: '${username}' logged in successfully.`);
            return res.json({
                success: true,
                message: "Admin verification cleared safely from database matrix cluster!"
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "❌ Access Denied: Invalid Username or Password record signatures."
            });
        }

    } catch (err) {
        console.error("Admin Auth Cluster Error: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// --- ENDPOINT: GET LIVE BORROWED COUNT FOR A SPECIFIC STUDENT ---
app.get("/api/student/borrow-count/:student_id", async (req, res) => {
    const { student_id } = req.params;

    try {
        let pool = await sql.connect(config);
        
        let result = await pool.request()
            .input("student_id", sql.VarChar, student_id)
            .query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");

        const totalBorrowed = result.recordset[0].total_borrowed;

        return res.json({
            success: true,
            student_id: student_id,
            total_borrowed: totalBorrowed
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Server Initialization
app.listen(5000, () => {
    console.log("Server running safely on http://localhost:5000");
});
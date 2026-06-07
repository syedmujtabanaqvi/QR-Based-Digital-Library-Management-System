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

app.get("/r", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM Transactions ORDER BY id DESC');
        return res.json(result.recordset);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

app.get("/api/books", async (req, res) => {
    try {
        let pool = await sql.connect(config);
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

app.post('/api/admin/return', async (req, res) => {
    const { transaction_id, book_id } = req.body;

    if (!transaction_id || !book_id) {
        return res.status(400).json({ success: false, message: "Parameters context tokens missing!" });
    }

    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input("txn_id", sql.VarChar, transaction_id)
            .query("UPDATE Transactions SET status = 'returned' WHERE transaction_id = @txn_id");

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

app.get('/:action/:book_id', async (req, res) => {
    const { action, book_id } = req.params;
    const { student_id } = req.query;

    if (action !== 'issue') {
        return res.status(400).send(`<h1>❌ Error: Invalid System Operation Parameter!</h1>`);
    }

    console.log(`⚡ Execution Pipeline Triggered: Processing book ${book_id} for student ${student_id}`);

    try {
        let pool = await sql.connect(config);

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

        if (book.available_quantity <= 0) {
            return res.status(400).send(`
                <div style="font-family:Arial; text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c;">❌ Out of Stock</h1>
                    <p>The requested book <strong>${book.title}</strong> is currently out of stock on shelf.</p>
                </div>
            `);
        }

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

app.get('/api/admin/books', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        
        let result = await pool.request().query("SELECT id AS book_id, title, borrow_count FROM Book2");
        
        return res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
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

        let checkExist = await pool.request()
            .input("id", sql.VarChar, book_id)
            .query("SELECT * FROM Book2 WHERE id = @id");

        if (checkExist.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "Book ID already exists in database registry!" });
        }

        await pool.request()
            .input("id", sql.VarChar, book_id)
            .input("title", sql.VarChar, title)
            .input("qty", sql.Int, quantity) // Integer pass kiya
            .query(`
                INSERT INTO Book2 (id, title, status, borrow_count) 
                VALUES (@id, @title, 'available', @qty)
            `);

        console.log(`➕ Added to Catalog: ${book_id} with Quantity: ${quantity}`);
        return res.json({ success: true, message: "New book record written to DB cluster successfully!" });

    } catch (err) {
        console.error("Add Book Error: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});
app.post('/api/admin/books/delete', async (req, res) => {
    const { book_id } = req.body;

    if (!book_id) {
        return res.status(400).json({ success: false, message: "Book ID reference token missing!" });
    }

    try {
        let pool = await sql.connect(config);

        let activeLeaseCheck = await pool.request()
            .input("id", sql.VarChar, book_id) 
            .query("SELECT * FROM Transactions WHERE book_id = @id AND status = 'issued'");

        if (activeLeaseCheck.recordset.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot delete asset! This book is currently active in ongoing transactions." 
            });
        }

        await pool.request()
            .input("id", sql.VarChar, book_id) 
            .query("DELETE FROM Book2 WHERE id = @id");

        console.log(`❌ Purged from Catalog: ${book_id}`);
        return res.json({ success: true, message: "Asset cleared permanently from DB catalog." });

    } catch (err) {
        console.error("Delete Book Error: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/return', async (req, res) => {
    const { transaction_id, book_id } = req.body;

    if (!transaction_id || !book_id) {
        return res.status(400).json({
            success: false,
            message: "transaction_id and book_id required"
        });
    }

    try {
        let pool = await sql.connect(config);

        // Transaction details nikalo
        let txnResult = await pool.request()
            .input("txn_id", sql.VarChar, transaction_id)
            .query(`
                SELECT due_date
                FROM Transactions
                WHERE transaction_id = @txn_id
            `);

        if (txnResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const dueDate = new Date(txnResult.recordset[0].due_date);
        const returnDate = new Date();

        let lateDays = 0;
        let fine = 0;

        if (returnDate > dueDate) {
            lateDays = Math.ceil(
                (returnDate - dueDate) / (1000 * 60 * 60 * 24)
            );

            fine = lateDays * 10; // Rs.10 per day
        }

        // Transaction update
        await pool.request()
            .input("txn_id", sql.VarChar, transaction_id)
            .input("return_date", sql.Date, returnDate)
            .input("fine", sql.Decimal(10, 2), fine)
            .query(`
                UPDATE Transactions
                SET
                    status = 'returned',
                    return_date = @return_date,
                    fine = @fine
                WHERE transaction_id = @txn_id
            `);

        // Book quantity wapas increase
        await pool.request()
            .input("book_id", sql.VarChar, book_id)
            .query(`
                UPDATE Book2
                SET available_quantity = available_quantity + 1,
                    status = 'available'
                WHERE id = @book_id
            `);

        return res.json({
            success: true,
            message: "Book returned successfully",
            late_days: lateDays,
            fine: fine
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


app.listen(5000, () => {
    console.log("Server running safely on http://localhost:5000");
});
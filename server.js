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
            .input("qty", sql.Int, quantity) 
            .query(`
                INSERT INTO Book2 (id, title, status, borrow_count, quantity, available_quantity) 
                VALUES (@id, @title, 'available', 0, @qty, @qty)
            `);

        console.log(`Added to Catalog: ${book_id} with Quantity: ${quantity}`);
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

        console.log(` Purged from Catalog: ${book_id}`);
        return res.json({ success: true, message: "Asset cleared permanently from DB catalog." });

    } catch (err) {
        console.error("Delete Book Error: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/api/student/dashboard-stats/:student_id", async (req, res) => {
    const { student_id } = req.params;

    try {
        let pool = await sql.connect(config);
        
        let result = await pool.request()
            .input("student_id", sql.VarChar, student_id)
            .query(`
                SELECT 
                    COUNT(*) AS total_transactions,
                    SUM(CASE WHEN status = 'issued' THEN 1 ELSE 0 END) AS currently_borrowed,
                    SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS total_returned,
                    SUM(ISNULL(fine, 0)) AS total_fine_accumulated
                FROM Transactions 
                WHERE student_id = @student_id
            `);

        const stats = result.recordset[0];

        return res.json({
            success: true,
            student_id: student_id,
            metrics: {
                total_transactions: stats.total_transactions || 0,
                currently_borrowed: stats.currently_borrowed || 0,
                total_returned: stats.total_returned || 0,
                total_fine: parseFloat(stats.total_fine_accumulated || 0).toFixed(2)
            }
        });

    } catch (err) {
        console.error("Dashboard Stats Error: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/:action/:identifier', async (req, res) => {
    const { action, identifier } = req.params;

    if (action === 'issue') {
        const book_id = identifier;
        const { student_id } = req.query;

        try {
            let pool = await sql.connect(config);

            let studentCheckResult = await pool.request()
                .input("student_id", sql.VarChar, student_id)
                .query("SELECT * FROM Student WHERE student_id = @student_id");

            const student = studentCheckResult.recordset[0];
            if (!student || student.is_active === false || student.is_active === 0) {
                return res.status(403).send(`<h1>Transaction Denied: Inactive Profile</h1>`);
            }

            let borrowCountResult = await pool.request()
                .input("student_id", sql.VarChar, student_id)
                .query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");

            if (borrowCountResult.recordset[0].total_borrowed >= 3) {
                return res.status(400).send(`<h1> Limit Violation: Max limit 3 books!</h1>`);
            }

            let result = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Book2 WHERE id = @id");
            const book = result.recordset[0];
            if (!book || book.available_quantity <= 0) return res.status(400).send(`<h1>Out of Stock!</h1>`);

            const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); 
            const formattedDueDate = dueDate.toISOString().slice(0, 10);

            await pool.request().input("id", sql.VarChar, book_id)
                .query("UPDATE Book2 SET available_quantity = available_quantity - 1, borrow_count = borrow_count + 1 WHERE id = @id");

            await pool.request()
                .input("txn_id", sql.VarChar, generatedTransactionID)
                .input("student_id", sql.VarChar, student_id)
                .input("book_id", sql.VarChar, book_id)
                .input("due_date", sql.VarChar, formattedDueDate) 
                .query("INSERT INTO Transactions (transaction_id, student_id, book_id, due_date, status, fine) VALUES (@txn_id, @student_id, @book_id, @due_date, 'issued', 0.00)");

            return res.status(200).send(`
                <div style="text-align:center; font-family:Arial; padding:50px; background:#f4f7f6; min-height:100vh;">
                    <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); border-top: 8px solid #0f5a6e;">
                        <h1 style="color:#2ecc71;">Digital Book Issued</h1>
                        <p>Transaction ID: <strong>${generatedTransactionID}</strong></p>
                        <p>Due Date: <strong style="color:#e74c3c;">${formattedDueDate}</strong></p>
                    </div>
                </div>
            `);
        } catch (err) {
            return res.status(500).send(`<h1>Database Error: ${err.message}</h1>`);
        }
    }

    else if (action === 'return') {
        const transaction_id = identifier;
        const { book_id } = req.query;

        try {
            let pool = await sql.connect(config);

            let txnResult = await pool.request()
                .input("txn_id", sql.VarChar, transaction_id)
                .query("SELECT CAST(due_date AS DATETIME) AS due_date, status, student_id FROM Transactions WHERE transaction_id = @txn_id");

            if (txnResult.recordset.length === 0) return res.status(404).send(`<h1>Transaction not found!</h1>`);
            const txnRow = txnResult.recordset[0];
            if (txnRow.status === 'returned') return res.status(400).send(`<h1>Asset already returned!</h1>`);

            const dueDate = new Date(txnRow.due_date);
            const returnDate = new Date();
            let lateDays = 0, fine = 0.00;

            if (returnDate > dueDate) {
                const timeDiff = returnDate.getTime() - dueDate.getTime();
                lateDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                fine = lateDays * 10; 
            }

            await pool.request()
                .input("txn_id", sql.VarChar, transaction_id)
                .input("return_date", sql.DateTime, returnDate) 
                .input("fine", sql.VarChar, fine.toFixed(2)) 
                .query("UPDATE Transactions SET status = 'returned', return_date = @return_date, fine = CAST(@fine AS DECIMAL(10,2)) WHERE transaction_id = @txn_id");

            await pool.request().input("book_id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

            return res.status(200).send(`
                <div style="text-align:center; font-family:Arial; padding:50px; background:#f4f7f6; min-height:100vh;">
                    <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); border-top: 8px solid #2ecc71;">
                        <h1 style="color:#2ecc71; margin-top:0;"> Asset Return Confirmed</h1>
                        <p>Transaction ID: <strong>${transaction_id}</strong></p>
                        <p>Late Days: <strong>${lateDays} Days</strong></p>
                        <p>Fine Charged: <strong style="color:#e74c3c;">Rs. ${fine.toFixed(2)}</strong></p>
                    </div>
                </div>
            `);
        } catch (err) {
            return res.status(500).send(`<h1>Database Error: ${err.message}</h1>`);
        }
    }
    
    else {
        return res.status(400).send(`<h1> Invalid Action Parameters!</h1>`);
    }
});
app.get('/api/circulation/return', async (req, res) => {
    const { transaction_id, book_id } = req.query;

    if (!transaction_id || !book_id) {
        return res.status(400).send(`<h1> Error: Query parameters sequence broken!</h1>`);
    }

    try {
        let pool = await sql.connect(config);

        let txnResult = await pool.request()
            .input("txn_id", sql.VarChar, transaction_id)
            .query("SELECT due_date, status, student_id FROM Transactions WHERE transaction_id = @txn_id");

        if (txnResult.recordset.length === 0) {
            return res.status(404).send(`<h1> Registry Error: Transaction not found!</h1>`);
        }

        const txnRow = txnResult.recordset[0];

        if (txnRow.status === 'returned') {
            return res.status(400).send(`<h1>Audit Notice: Asset already marked as returned!</h1>`);
        }

        const dueDate = new Date(txnRow.due_date);
        const returnDate = new Date();
        let lateDays = 0, fine = 0.00;

        if (returnDate > dueDate) {
            const timeDiff = returnDate.getTime() - dueDate.getTime();
            lateDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            fine = lateDays * 10; 
        }

        await pool.request()
            .input("txn_id", sql.VarChar, transaction_id)
            .input("fine", sql.Decimal(10, 2), fine) 
            .query(`
                UPDATE Transactions 
                SET status = 'returned', 
                    return_date = GETDATE(), 
                    fine = @fine 
                WHERE transaction_id = @txn_id
            `);

        await pool.request()
            .input("book_id", sql.VarChar, book_id)
            .query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

        return res.status(200).send(`
            <div style="text-align:center; font-family:'Segoe UI',Arial,sans-serif; padding:50px; background:#f4f7f6; min-height:100vh; margin:0;">
                <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); max-width:450px; border-top: 8px solid #2ecc71; text-align:center;">
                    <h1 style="color:#2ecc71; margin-top:0;">✅ Asset Return Confirmed</h1>
                    <p style="color:#666; font-size:14px;">SSUET Smart Library Automation System has synchronized ledger index rows cleanly.</p>
                    <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
                    <div style="text-align:left; font-size:15px; color:#333; line-height:2; margin: 0 auto; display: inline-block;">
                        <strong>Transaction ID:</strong> <span style="font-family:monospace; background:#e9ecef; padding:2px 6px; border-radius:4px;">${transaction_id}</span><br>
                        <strong>Student ID:</strong> ${txnRow.student_id}<br>
                        <strong>Overdue Late Days:</strong> ${lateDays} Days<br>
                        <strong>Automated Calculated Fine:</strong> <span style="color:#e74c3c; font-weight:bold;">Rs. ${fine.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `);

    } catch (err) {
        console.error("Return Process Error: ", err);
        return res.status(500).send(`<h1>Database Transaction Error: ${err.message}</h1>`);
    }
});

app.listen(5000, () => {
    console.log("Server running safely on http://localhost:5000");
});
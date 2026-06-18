// // const express = require('express');
// // const crypto = require('crypto');
// // const cors = require('cors');
// // const sql = require("mssql");
// // const config = require("./dbConfig");

// // const app = express();
// // app.use(express.json());
// // app.use(cors()); 

// // const NODE_PORT = 5000;

// // const staticTransactionsArchive = [];
// // const loginLogTable = []; 

// // app.get("/r", async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);
// //         let result = await pool.request().query('SELECT id, transaction_id, student_id, book_id, issue_date, due_date, status, return_date, fine FROM Transactions ORDER BY id DESC');
// //         return res.json(result.recordset);
// //     } catch (err) {
// //         return res.status(500).send(err.message);
// //     }
// // });

// // app.get("/api/books", async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);
// //         let result = await pool.request().query("SELECT * FROM Book2");

// //         res.json({
// //             success: true,
// //             data: result.recordset
// //         });
// //     } catch (err) {
// //         res.status(500).json({
// //             success: false,
// //             message: err.message
// //         });
// //     }
// // });

// // app.get('/api/admin/transactions', async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);
// //         let result = await pool.request().query("SELECT * FROM Transactions ORDER BY id DESC");
        
// //         return res.json({
// //             success: true,
// //             data: result.recordset
// //         });
// //     } catch (err) {
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // app.post('/api/login', async (req, res) => {
// //     const { student_id } = req.body;

// //     if (!student_id) {
// //         return res.status(400).json({ success: false, message: "Error: Student ID missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);
        
// //         let studentResult = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .query("SELECT * FROM Student WHERE student_id = @student_id");

// //         const student = studentResult.recordset[0];

// //         if (!student) {
// //             return res.status(404).json({ success: false, message: "Student record not found in Database." });
// //         }

// //         if (student.is_active === false || student.is_active === 0) {
// //             return res.status(403).json({ success: false, message: "Access Denied: Student profile is INACTIVE." });
// //         }

// //         console.log(`🔑 Login Logged: Student ${student.name} (${student_id}) successfully authenticated from DB.`);
        
// //         return res.status(200).json({ 
// //             success: true, 
// //             message: "Login verified successfully!", 
// //             student_id: student_id 
// //         });
        
// //     } catch (err) {
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // app.get('/api/generate_qr', async (req, res) => {
// //     const { book_id, student_id, action } = req.query;
// //     const currentAction = action || "issue";

// //     if (!book_id || !student_id) {
// //         return res.status(400).json({ success: false, message: "Parameters missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);
        
// //         let borrowCountResult = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");

// //         const totalBorrowed = borrowCountResult.recordset[0].total_borrowed;

// //         if (totalBorrowed >= 3) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: `Bypass Blocked: Student already has ${totalBorrowed} active books. Cannot issue more than 3 books!`
// //             });
// //         }

// //         const target_url = `http://192.168.100.6:${NODE_PORT}/${currentAction}/${book_id}?student_id=${student_id}`;
// //         console.log(` Generated Matrix Link Vector: ${target_url}`);

// //         return res.status(200).json({
// //             success: true,
// //             target_payload: target_url,
// //             image_data: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(target_url)}`
// //         });

// //     } catch (err) {
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // // app.get('/api/admin/books', async (req, res) => {
// // //     try {
// // //         let pool = await sql.connect(config);
        
// // //         let result = await pool.request().query("SELECT id AS book_id, title, borrow_count FROM Book2");
        
// // //         return res.json({
// // //             success: true,
// // //             data: result.recordset
// // //         });
// // //     } catch (err) {
// // //         return res.status(500).json({ success: false, message: err.message });
// // //     }
// // // });

// // app.get('/api/admin/books', async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);
        
// //         let result = await pool.request().query(`
// //             SELECT 
// //                 id AS book_id, 
// //                 title, 
// //                 quantity, 
// //                 available_quantity, 
// //                 borrow_count 
// //             FROM Book2
// //             ORDER BY id DESC
// //         `);
        
// //         return res.json({
// //             success: true,
// //             data: result.recordset
// //         });
// //     } catch (err) {
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // app.get('/api/admin/stats', async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);

// //         // Total issued books
// //         let totalIssued = await pool.request().query(`
// //             SELECT COUNT(*) AS totalIssued FROM Transactions
// //         `);

// //         // Overdue books
// //         let overdueBooks = await pool.request().query(`
// //             SELECT COUNT(*) AS overdueBooks
// //             FROM Transactions
// //             WHERE LOWER(TRIM(status))='issued'
// //             AND TRY_CAST(due_date AS DATE) < CAST(GETDATE() AS DATE)
// //         `);

// //         // Active borrowers
// //         let activeBorrowers = await pool.request().query(`
// //             SELECT COUNT(DISTINCT student_id) AS activeBorrowers
// //             FROM Transactions
// //             WHERE LOWER(TRIM(status))='issued'
// //         `);

// //         // UPDATED QUERY: Jab se library start hui hai, saare returned aur live active fines ka grand total
// //         let totalFine = await pool.request().query(`
// //             SELECT 
// //                 ISNULL(SUM(CASE 
// //                     -- 1. Jo return ho chuki hain unka saved fine
// //                     WHEN LOWER(TRIM(status)) = 'returned' OR LOWER(TRIM(status)) = 'retuned' THEN ISNULL(fine, 0)
// //                     -- 2. Jo abhi tak issued hain aur overdue hain, unka live fine calculation
// //                     WHEN LOWER(TRIM(status)) = 'issued' AND TRY_CAST(due_date AS DATE) < CAST(GETDATE() AS DATE) 
// //                     THEN DATEDIFF(day, TRY_CAST(due_date AS DATE), CAST(GETDATE() AS DATE)) * 10
// //                     ELSE 0 
// //                 END), 0) AS totalFine
// //             FROM Transactions
// //         `);

// //         return res.json({
// //             success: true,
// //             totalIssued: totalIssued.recordset[0].totalIssued,
// //             overdueBooks: overdueBooks.recordset[0].overdueBooks,
// //             activeBorrowers: activeBorrowers.recordset[0].activeBorrowers,
// //             totalFine: totalFine.recordset[0].totalFine
// //         });

// //     } catch(err) {
// //         console.error(err);
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });
// // app.post('/api/admin/books/add', async (req, res) => {
// //     const { book_id, title, quantity } = req.body; 

// //     if (!book_id || !title || !quantity) {
// //         return res.status(400).json({ success: false, message: "Required parameter attributes missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);

// //         let checkExist = await pool.request()
// //             .input("id", sql.VarChar, book_id)
// //             .query("SELECT * FROM Book2 WHERE id = @id");

// //         if (checkExist.recordset.length > 0) {
// //             return res.status(400).json({ success: false, message: "Book ID already exists in database registry!" });
// //         }

// //         await pool.request()
// //             .input("id", sql.VarChar, book_id)
// //             .input("title", sql.VarChar, title)
// //             .input("qty", sql.Int, quantity) 
// //             .query(`
// //                 INSERT INTO Book2 (id, title, status, borrow_count, quantity, available_quantity) 
// //                 VALUES (@id, @title, 'available', 0, @qty, @qty)
// //             `);

// //         console.log(`Added to Catalog: ${book_id} with Quantity: ${quantity}`);
// //         return res.json({ success: true, message: "New book record written to DB cluster successfully!" });

// //     } catch (err) {
// //         console.error("Add Book Error: ", err);
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // app.post('/api/admin/books/delete', async (req, res) => {
// //     const { book_id } = req.body;

// //     if (!book_id) {
// //         return res.status(400).json({ success: false, message: "Book ID reference token missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);

// //         let activeLeaseCheck = await pool.request()
// //             .input("id", sql.VarChar, book_id) 
// //             .query("SELECT * FROM Transactions WHERE book_id = @id AND status = 'issued'");

// //         if (activeLeaseCheck.recordset.length > 0) {
// //             return res.status(400).json({ 
// //                 success: false, 
// //                 message: "Cannot delete asset! This book is currently active in ongoing transactions." 
// //             });
// //         }

// //         await pool.request()
// //             .input("id", sql.VarChar, book_id) 
// //             .query("DELETE FROM Book2 WHERE id = @id");

// //         console.log(` Purged from Catalog: ${book_id}`);
// //         return res.json({ success: true, message: "Asset cleared permanently from DB catalog." });

// //     } catch (err) {
// //         console.error("Delete Book Error: ", err);
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // app.get("/api/student/dashboard-stats/:student_id", async (req, res) => {
// //     const { student_id } = req.params;

// //     try {
// //         let pool = await sql.connect(config);
        
// //         let result = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .query(`
// //                 SELECT 
// //                     COUNT(*) AS total_transactions,
// //                     SUM(CASE WHEN status = 'issued' THEN 1 ELSE 0 END) AS currently_borrowed,
// //                     SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS total_returned,
// //                     SUM(ISNULL(fine, 0)) AS total_fine_accumulated
// //                 FROM Transactions 
// //                 WHERE student_id = @student_id
// //             `);

// //         const stats = result.recordset[0];

// //         return res.json({
// //             success: true,
// //             student_id: student_id,
// //             metrics: {
// //                 total_transactions: stats.total_transactions || 0,
// //                 currently_borrowed: stats.currently_borrowed || 0,
// //                 total_returned: stats.total_returned || 0,
// //                 total_fine: parseFloat(stats.total_fine_accumulated || 0).toFixed(2)
// //             }
// //         });

// //     } catch (err) {
// //         console.error("Dashboard Stats Error: ", err);
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // app.get('/:action/:identifier', async (req, res) => {
// //     const { action, identifier } = req.params;

// //     if (action === 'issue') {
// //         const book_id = identifier;
// //         const { student_id } = req.query;

// //         try {
// //             let pool = await sql.connect(config);

// //             let studentCheckResult = await pool.request()
// //                 .input("student_id", sql.VarChar, student_id)
// //                 .query("SELECT * FROM Student WHERE student_id = @student_id");

// //             const student = studentCheckResult.recordset[0];
// //             if (!student || student.is_active === false || student.is_active === 0) {
// //                 return res.status(403).send(`<h1>Transaction Denied: Inactive Profile</h1>`);
// //             }

// //             let borrowCountResult = await pool.request()
// //                 .input("student_id", sql.VarChar, student_id)
// //                 .query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");

// //             if (borrowCountResult.recordset[0].total_borrowed >= 3) {
// //                 return res.status(400).send(`<h1> Limit Violation: Max limit 3 books!</h1>`);
// //             }

// //             let result = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Book2 WHERE id = @id");
// //             const book = result.recordset[0];
// //             if (!book || book.available_quantity <= 0) return res.status(400).send(`<h1>Out of Stock!</h1>`);

// //             const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
// //             const dueDate = new Date();
// //             dueDate.setDate(dueDate.getDate() + 14); 
// //             const formattedDueDate = dueDate.toISOString().slice(0, 10);

// //             await pool.request().input("id", sql.VarChar, book_id)
// //                 .query("UPDATE Book2 SET available_quantity = available_quantity - 1, borrow_count = borrow_count + 1 WHERE id = @id");

// //             await pool.request()
// //                 .input("txn_id", sql.VarChar, generatedTransactionID)
// //                 .input("student_id", sql.VarChar, student_id)
// //                 .input("book_id", sql.VarChar, book_id)
// //                 .input("due_date", sql.VarChar, formattedDueDate) 
// //                 .query("INSERT INTO Transactions (transaction_id, student_id, book_id, due_date, status, fine) VALUES (@txn_id, @student_id, @book_id, @due_date, 'issued', 0.00)");

// //             return res.status(200).send(`
// //                 <div style="text-align:center; font-family:Arial; padding:50px; background:#f4f7f6; min-height:100vh;">
// //                     <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); border-top: 8px solid #0f5a6e;">
// //                         <h1 style="color:#2ecc71;">Digital Book Issued</h1>
// //                         <p>Transaction ID: <strong>${generatedTransactionID}</strong></p>
// //                         <p>Due Date: <strong style="color:#e74c3c;">${formattedDueDate}</strong></p>
// //                     </div>
// //                 </div>
// //             `);
// //         } catch (err) {
// //             return res.status(500).send(`<h1>Database Error: ${err.message}</h1>`);
// //         }
// //     }

// //     else if (action === 'return') {
// //         const transaction_id = identifier;
// //         const { book_id } = req.query;

// //         try {
// //             let pool = await sql.connect(config);

// //             let txnResult = await pool.request()
// //                 .input("txn_id", sql.VarChar, transaction_id)
// //                 .query("SELECT CAST(due_date AS DATETIME) AS due_date, status, student_id FROM Transactions WHERE transaction_id = @txn_id");

// //             if (txnResult.recordset.length === 0) return res.status(404).send(`<h1>Transaction not found!</h1>`);
// //             const txnRow = txnResult.recordset[0];
// //             if (txnRow.status === 'returned') return res.status(400).send(`<h1>Asset already returned!</h1>`);

// //             const dueDate = new Date(txnRow.due_date);
// //             const returnDate = new Date();
// //             let lateDays = 0, fine = 0.00;

// //             if (returnDate > dueDate) {
// //                 const timeDiff = returnDate.getTime() - dueDate.getTime();
// //                 lateDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
// //                 fine = lateDays * 10; 
// //             }

// //             await pool.request()
// //                 .input("txn_id", sql.VarChar, transaction_id)
// //                 .input("return_date", sql.DateTime, returnDate) 
// //                 .input("fine", sql.VarChar, fine.toFixed(2)) 
// //                 .query("UPDATE Transactions SET status = 'returned', return_date = @return_date, fine = CAST(@fine AS DECIMAL(10,2)) WHERE transaction_id = @txn_id");

// //             await pool.request().input("book_id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

// //             return res.status(200).send(`
// //                 <div style="text-align:center; font-family:Arial; padding:50px; background:#f4f7f6; min-height:100vh;">
// //                     <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); border-top: 8px solid #2ecc71;">
// //                         <h1 style="color:#2ecc71; margin-top:0;"> Asset Return Confirmed</h1>
// //                         <p>Transaction ID: <strong>${transaction_id}</strong></p>
// //                         <p>Late Days: <strong>${lateDays} Days</strong></p>
// //                         <p>Fine Charged: <strong style="color:#e74c3c;">Rs. ${fine.toFixed(2)}</strong></p>
// //                     </div>
// //                 </div>
// //             `);
// //         } catch (err) {
// //             return res.status(500).send(`<h1>Database Error: ${err.message}</h1>`);
// //         }
// //     }
    
// //     else {
// //         return res.status(400).send(`<h1> Invalid Action Parameters!</h1>`);
// //     }
// // });
// // app.get('/api/circulation/return', async (req, res) => {
// //     const { transaction_id, book_id } = req.query;

// //     if (!transaction_id || !book_id) {
// //         return res.status(400).send(`<h1> Error: Query parameters sequence broken!</h1>`);
// //     }

// //     try {
// //         let pool = await sql.connect(config);

// //         let txnResult = await pool.request()
// //             .input("txn_id", sql.VarChar, transaction_id)
// //             .query("SELECT due_date, status, student_id FROM Transactions WHERE transaction_id = @txn_id");

// //         if (txnResult.recordset.length === 0) {
// //             return res.status(404).send(`<h1> Registry Error: Transaction not found!</h1>`);
// //         }

// //         const txnRow = txnResult.recordset[0];

// //         if (txnRow.status === 'returned') {
// //             return res.status(400).send(`<h1>Audit Notice: Asset already marked as returned!</h1>`);
// //         }

// //         const dueDate = new Date(txnRow.due_date);
// //         const returnDate = new Date();
// //         let lateDays = 0, fine = 0.00;

// //         if (returnDate > dueDate) {
// //             const timeDiff = returnDate.getTime() - dueDate.getTime();
// //             lateDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
// //             fine = lateDays * 10; 
// //         }

// //         await pool.request()
// //             .input("txn_id", sql.VarChar, transaction_id)
// //             .input("fine", sql.Decimal(10, 2), fine) 
// //             .query(`
// //                 UPDATE Transactions 
// //                 SET status = 'returned', 
// //                     return_date = GETDATE(), 
// //                     fine = @fine 
// //                 WHERE transaction_id = @txn_id
// //             `);

// //         await pool.request()
// //             .input("book_id", sql.VarChar, book_id)
// //             .query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

// //         return res.status(200).send(`
// //             <div style="text-align:center; font-family:'Segoe UI',Arial,sans-serif; padding:50px; background:#f4f7f6; min-height:100vh; margin:0;">
// //                 <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); max-width:450px; border-top: 8px solid #2ecc71; text-align:center;">
// //                     <h1 style="color:#2ecc71; margin-top:0;">✅ Asset Return Confirmed</h1>
// //                     <p style="color:#666; font-size:14px;">SSUET Smart Library Automation System has synchronized ledger index rows cleanly.</p>
// //                     <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
// //                     <div style="text-align:left; font-size:15px; color:#333; line-height:2; margin: 0 auto; display: inline-block;">
// //                         <strong>Transaction ID:</strong> <span style="font-family:monospace; background:#e9ecef; padding:2px 6px; border-radius:4px;">${transaction_id}</span><br>
// //                         <strong>Student ID:</strong> ${txnRow.student_id}<br>
// //                         <strong>Overdue Late Days:</strong> ${lateDays} Days<br>
// //                         <strong>Automated Calculated Fine:</strong> <span style="color:#e74c3c; font-weight:bold;">Rs. ${fine.toFixed(2)}</span>
// //                     </div>
// //                 </div>
// //             </div>
// //         `);

// //     } catch (err) {
// //         console.error("Return Process Error: ", err);
// //         return res.status(500).send(`<h1>Database Transaction Error: ${err.message}</h1>`);
// //     }
// // });


// // app.post('/api/admin/login', async (req, res) => {
// //     try {
// //         const { username, password } = req.body;
// // let pool = await sql.connect(config);
// //         const result = await pool.request()
// //             .input('username', sql.VarChar, username)
// //             .input('password', sql.VarChar, password)
// //             .query(`
// //                 SELECT *
// //                 FROM AdminUser
// //                 WHERE username = @username
// //                 AND password = @password
// //             `);

// //         if (result.recordset.length > 0) {
// //             return res.json({
// //                 success: true,
// //                 message: 'Admin login successful'
// //             });
// //         }

// //         return res.json({
// //             success: false,
// //             message: 'Invalid username or password'
// //         });

// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Server error'
// //         });
// //     }
// // });


// // app.get('/api/admin/stats', async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);

// //         // Total issued books
// //         let totalIssued = await pool.request().query(`
// //             SELECT COUNT(*) AS totalIssued
// //             FROM Transactions
// //         `);

// //         // Overdue books
// //         let overdueBooks = await pool.request().query(`
// //             SELECT COUNT(*) AS overdueBooks
// //             FROM Transactions
// //             WHERE status='issued'
// //             AND CAST(due_date AS DATE) < CAST(GETDATE() AS DATE)
// //         `);

// //         // Active borrowers
// //         let activeBorrowers = await pool.request().query(`
// //             SELECT COUNT(DISTINCT student_id) AS activeBorrowers
// //             FROM Transactions
// //             WHERE status='issued'
// //         `);

// //         // Fine reports
// //         let totalFine = await pool.request().query(`
// //             SELECT ISNULL(SUM(fine),0) AS totalFine
// //             FROM Transactions
// //         `);

// //         res.json({
// //             success: true,
// //             totalIssued:
// //                 totalIssued.recordset[0].totalIssued,

// //             overdueBooks:
// //                 overdueBooks.recordset[0].overdueBooks,

// //             activeBorrowers:
// //                 activeBorrowers.recordset[0].activeBorrowers,

// //             totalFine:
// //                 totalFine.recordset[0].totalFine
// //         });

// //     } catch(err) {
// //         console.log(err);
// //         res.status(500).json({
// //             success:false,
// //             message:err.message
// //         });
// //     }
// // });


// // app.get('/api/admin/dashboard-metrics', async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);

// //         // 1. Daily Transactions Count
// //         let dailyTransactionsResult = await pool.request().query(`
// //             SELECT COUNT(*) AS dailyTransactions
// //             FROM Transactions
// //             WHERE CAST(issue_date AS DATE) = CAST(GETDATE() AS DATE)
// //         `);

// //         // 2. Top 5 Most Borrowed Books
// //         let mostBorrowed = await pool.request().query(`
// //             SELECT TOP 5 id, title, borrow_count
// //             FROM Book2
// //             ORDER BY borrow_count DESC
// //         `);

// //         // 3. UPDATED: Defaulters List with Live Fine Calculation Logic (Rs. 10 per day)
// //         let defaulters = await pool.request().query(`
// //             SELECT 
// //                 t.student_id,
// //                 s.name,
// //                 t.book_id,
// //                 t.due_date,
// //                 -- Live calculation agar book overdue hai: (Current Date - Due Date) * Rs.10
// //                 CASE 
// //                     WHEN TRY_CAST(t.due_date AS DATE) < CAST(GETDATE() AS DATE)
// //                     THEN DATEDIFF(day, TRY_CAST(t.due_date AS DATE), CAST(GETDATE() AS DATE)) * 10
// //                     ELSE 0
// //                 END AS fine
// //             FROM Transactions t
// //             JOIN Student s ON t.student_id = s.student_id
// //             WHERE LOWER(TRIM(t.status)) = 'issued'
// //             AND TRY_CAST(t.due_date AS DATE) < CAST(GETDATE() AS DATE)
// //         `);

// //         // 4. Inventory Metrics
// //         let inventory = await pool.request().query(`
// //             SELECT 
// //                 SUM(quantity) AS totalStock,
// //                 SUM(available_quantity) AS availableStock
// //             FROM Book2
// //         `);

// //         // 5. Total Accumulated Fine
// //         let fine = await pool.request().query(`
// //             SELECT ISNULL(SUM(fine), 0) AS totalFine
// //             FROM Transactions
// //         `);

// //         // Clean & complete JSON response
// //         return res.json({
// //             success: true,
// //             dailyTransactions: dailyTransactionsResult.recordset[0].dailyTransactions,
// //             mostBorrowed: mostBorrowed.recordset,
// //             defaulters: defaulters.recordset,
// //             inventory: inventory.recordset[0],
// //             totalFine: fine.recordset[0].totalFine
// //         });

// //     } catch (err) {
// //         console.error("Dashboard Metrics Error: ", err);
// //         return res.status(500).json({
// //             success: false,
// //             message: "Internal Server Error",
// //             error: err.message
// //         });
// //     }
// // });

// // // 15. AI Content-Based Recommendation Engine Endpoint
// // app.get('/api/recommendations/:student_id', async (req, res) => {
// //     const { student_id } = req.params;

// //     if (!student_id) {
// //         return res.status(400).json({ success: false, message: "Student ID parameter missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);

// //         // Step 1: Student profile aur unka personal department/semester fetch karein
// //         let studentProfile = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .query("SELECT department, semester FROM Student WHERE student_id = @student_id");

// //         const student = studentProfile.recordset[0];
// //         if (!student) {
// //             return res.status(404).json({ success: false, message: "Student profile not found." });
// //         }

// //         const { department, semester } = student;

// //         // Step 2: Running Content-Based Filtering + Rule Weights Scoring
// //         let recommendationResult = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .input("department", sql.VarChar, department || '')
// //             .input("semester", sql.Int, semester || 1)
// //             .query(`
// //                 WITH UserHistoryGenres AS (
// //                     -- Student ki borrowing history se uski most preferred book categories/departments nikalte hain
// //                     SELECT TOP 1 b.department AS FavGenre
// //                     FROM Transactions t
// //                     JOIN Book2 b ON t.book_id = b.id
// //                     WHERE t.student_id = @student_id
// //                     GROUP BY b.department
// //                     ORDER BY COUNT(*) DESC
// //                 ),
// //                 BookScores AS (
// //                     SELECT 
// //                         b.id AS book_id,
// //                         b.title,
// //                         b.available_quantity,
// //                         b.department AS book_dept,
                        
// //                         -- 1. Personal History Type Match (Content-Based Core): Agar book ka type student ke favorite type se match kare to 25 Points!
// //                         CASE WHEN LOWER(TRIM(b.department)) = (SELECT LOWER(TRIM(FavGenre)) FROM UserHistoryGenres) THEN 25 ELSE 0 END AS HistoryTypeScore,

// //                         -- 2. General Department Alignment: 15 Points
// //                         CASE WHEN LOWER(TRIM(b.department)) = LOWER(TRIM(@department)) THEN 15 ELSE 0 END AS DeptScore,

// //                         -- 3. Semester Academic Mapping: 10 Points
// //                         CASE WHEN b.semester = @semester THEN 10 ELSE 0 END AS SemScore,

// //                         -- 4. Global Popularity Scaling: Borrow count directly scales the score
// //                         ISNULL(b.borrow_count, 0) AS PopularityScore,

// //                         -- 5. Anti-Redundancy Filter: Jo book active inventory me student ke paas hai ya le chuka hai use algorithm block (-100) karega
// //                         CASE WHEN EXISTS (
// //                             SELECT 1 FROM Transactions t 
// //                             WHERE t.book_id = b.id AND t.student_id = @student_id AND t.status = 'issued'
// //                         ) THEN -100 ELSE 0 END AS DuplicationPenalty
// //                     FROM Book2 b
// //                     WHERE b.available_quantity > 0
// //                 )
// //                 SELECT TOP 5 
// //                     book_id, 
// //                     title,
// //                     (HistoryTypeScore + DeptScore + SemScore + PopularityScore + DuplicationPenalty) AS TotalRecommendationWeight
// //                 FROM BookScores
// //                 WHERE (HistoryTypeScore + DeptScore + SemScore + PopularityScore + DuplicationPenalty) > 0
// //                 ORDER BY TotalRecommendationWeight DESC, PopularityScore DESC
// //             `);

// //         return res.json({
// //             success: true,
// //             recommendations: recommendationResult.recordset
// //         });

// //     } catch (err) {
// //         console.error("AI Recommendation Engine Error: ", err);
// //         return res.status(500).json({ success: false, message: "Internal Engine Fault", error: err.message });
// //     }
// // });

// // app.listen(5000, () => {
// //     console.log("Server running safely on http://localhost:5000");
// // });

// // const express = require('express');
// // const crypto = require('crypto');
// // const cors = require('cors');
// // const sql = require("mssql");
// // const config = require("./dbConfig");
// // const rateLimit = require('express-rate-limit'); // 1. Package import kiya

// // const app = express();
// // app.use(express.json());
// // app.use(cors()); 

// // const NODE_PORT = 5000;

// // // ==========================================
// // // 2. RATE LIMITING CONFIGURATION (Throttling)
// // // ==========================================

// // // Global Rate Limiter: Saari normal APIs ke liye
// // const globalLimiter = rateLimit({
// //     windowMs: 15 * 60 * 1000, // 15 Minutes ka time window
// //     max: 100, // Har IP se max 100 requests allow hongi per windowMs
// //     message: {
// //         success: false,
// //         message: "Too many requests from this IP, please try again after 15 minutes."
// //     },
// //     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
// //     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// // });

// // // Strict Limiter for Authentication: Login/Brute-force se bachne ke liye
// // const authLimiter = rateLimit({
// //     windowMs: 15 * 60 * 1000, // 15 Minutes
// //     max: 15, // Max 15 login attempts allow honge
// //     message: {
// //         success: false,
// //         message: "Too many login attempts. Access locked for 15 minutes."
// //     },
// //     standardHeaders: true,
// //     legacyHeaders: false,
// // });

// // // Pure server par global limiter apply kar rahe hain
// // app.use(globalLimiter);

// // // ==========================================

// // const staticTransactionsArchive = [];
// // const loginLogTable = []; 

// // // 1. Get all transactions
// // app.get("/r", async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);
// //         let result = await pool.request().query('SELECT id, transaction_id, student_id, book_id, issue_date, due_date, status, return_date, fine FROM Transactions ORDER BY id DESC');
// //         return res.json(result.recordset);
// //     } catch (err) {
// //         return res.status(500).send(err.message);
// //     }
// // });

// // // 2. Get all books
// // app.get("/api/books", async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);
// //         let result = await pool.request().query("SELECT * FROM Book2");

// //         res.json({
// //             success: true,
// //             data: result.recordset
// //         });
// //     } catch (err) {
// //         res.status(500).json({
// //             success: false,
// //             message: err.message
// //         });
// //     }
// // });

// // // 3. Get admin transactions
// // app.get('/api/admin/transactions', async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);
// //         let result = await pool.request().query("SELECT * FROM Transactions ORDER BY id DESC");
        
// //         return res.json({
// //             success: true,
// //             data: result.recordset
// //         });
// //     } catch (err) {
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // // 4. Student Login (Secured + Rate Limited)
// // app.post('/api/login', authLimiter, async (req, res) => { // authLimiter lagaya yahan
// //     const { student_id } = req.body;

// //     if (!student_id) {
// //         return res.status(400).json({ success: false, message: "Error: Student ID missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);
        
// //         let studentResult = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .query("SELECT * FROM Student WHERE student_id = @student_id");

// //         const student = studentResult.recordset[0];

// //         if (!student) {
// //             return res.status(404).json({ success: false, message: "Student record not found in Database." });
// //         }

// //         if (student.is_active === false || student.is_active === 0) {
// //             return res.status(403).json({ success: false, message: "Access Denied: Student profile is INACTIVE." });
// //         }

// //         console.log(`🔑 Login Logged: Student ${student.name} (${student_id}) successfully authenticated from DB.`);
        
// //         return res.status(200).json({ 
// //             success: true, 
// //             message: "Login verified successfully!", 
// //             student_id: student_id 
// //         });
        
// //     } catch (err) {
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // // 5. Generate QR Link (Secured)
// // app.get('/api/generate_qr', async (req, res) => {
// //     const { book_id, student_id, action } = req.query;
// //     const currentAction = action || "issue";

// //     if (!book_id || !student_id) {
// //         return res.status(400).json({ success: false, message: "Parameters missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);
        
// //         let borrowCountResult = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");

// //         const totalBorrowed = borrowCountResult.recordset[0].total_borrowed;

// //         if (totalBorrowed >= 3) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: `Bypass Blocked: Student already has ${totalBorrowed} active books. Cannot issue more than 3 books!`
// //             });
// //         }

// //         const target_url = `http://192.168.100.6:${NODE_PORT}/${currentAction}/${book_id}?student_id=${student_id}`;
// //         console.log(` Generated Matrix Link Vector: ${target_url}`);

// //         return res.status(200).json({
// //             success: true,
// //             target_payload: target_url,
// //             image_data: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(target_url)}`
// //         });

// //     } catch (err) {
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // // 6. Admin Books Catalog
// // app.get('/api/admin/books', async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);
        
// //         let result = await pool.request().query(`
// //             SELECT 
// //                 id AS book_id, 
// //                 title, 
// //                 quantity, 
// //                 available_quantity, 
// //                 borrow_count 
// //             FROM Book2
// //             ORDER BY id DESC
// //         `);
        
// //         return res.json({
// //             success: true,
// //             data: result.recordset
// //         });
// //     } catch (err) {
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // // 7. Admin Stats Overview
// // app.get('/api/admin/stats', async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);

// //         let totalIssued = await pool.request().query(`
// //             SELECT COUNT(*) AS totalIssued FROM Transactions
// //         `);

// //         let overdueBooks = await pool.request().query(`
// //             SELECT COUNT(*) AS overdueBooks
// //             FROM Transactions
// //             WHERE LOWER(TRIM(status))='issued'
// //             AND TRY_CAST(due_date AS DATE) < CAST(GETDATE() AS DATE)
// //         `);

// //         let activeBorrowers = await pool.request().query(`
// //             SELECT COUNT(DISTINCT student_id) AS activeBorrowers
// //             FROM Transactions
// //             WHERE LOWER(TRIM(status))='issued'
// //         `);

// //         let totalFine = await pool.request().query(`
// //             SELECT 
// //                 ISNULL(SUM(CASE 
// //                     WHEN LOWER(TRIM(status)) = 'returned' OR LOWER(TRIM(status)) = 'retuned' THEN ISNULL(fine, 0)
// //                     WHEN LOWER(TRIM(status)) = 'issued' AND TRY_CAST(due_date AS DATE) < CAST(GETDATE() AS DATE) 
// //                     THEN DATEDIFF(day, TRY_CAST(due_date AS DATE), CAST(GETDATE() AS DATE)) * 10
// //                     ELSE 0 
// //                 END), 0) AS totalFine
// //             FROM Transactions
// //         `);

// //         return res.json({
// //             success: true,
// //             totalIssued: totalIssued.recordset[0].totalIssued,
// //             overdueBooks: overdueBooks.recordset[0].overdueBooks,
// //             activeBorrowers: activeBorrowers.recordset[0].activeBorrowers,
// //             totalFine: totalFine.recordset[0].totalFine
// //         });

// //     } catch(err) {
// //         console.error(err);
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // // 8. Add Book (Secured)
// // app.post('/api/admin/books/add', async (req, res) => {
// //     const { book_id, title, quantity } = req.body; 

// //     if (!book_id || !title || !quantity) {
// //         return res.status(400).json({ success: false, message: "Required parameter attributes missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);

// //         let checkExist = await pool.request()
// //             .input("id", sql.VarChar, book_id)
// //             .query("SELECT * FROM Book2 WHERE id = @id");

// //         if (checkExist.recordset.length > 0) {
// //             return res.status(400).json({ success: false, message: "Book ID already exists in database registry!" });
// //         }

// //         await pool.request()
// //             .input("id", sql.VarChar, book_id)
// //             .input("title", sql.VarChar, title)
// //             .input("qty", sql.Int, quantity) 
// //             .query(`
// //                 INSERT INTO Book2 (id, title, status, borrow_count, quantity, available_quantity) 
// //                 VALUES (@id, @title, 'available', 0, @qty, @qty)
// //             `);

// //         console.log(`Added to Catalog: ${book_id} with Quantity: ${quantity}`);
// //         return res.json({ success: true, message: "New book record written to DB cluster successfully!" });

// //     } catch (err) {
// //         console.error("Add Book Error: ", err);
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // // 9. Delete Book (Secured)
// // app.post('/api/admin/books/delete', async (req, res) => {
// //     const { book_id } = req.body;

// //     if (!book_id) {
// //         return res.status(400).json({ success: false, message: "Book ID reference token missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);

// //         let activeLeaseCheck = await pool.request()
// //             .input("id", sql.VarChar, book_id) 
// //             .query("SELECT * FROM Transactions WHERE book_id = @id AND status = 'issued'");

// //         if (activeLeaseCheck.recordset.length > 0) {
// //             return res.status(400).json({ 
// //                 success: false, 
// //                 message: "Cannot delete asset! This book is currently active in ongoing transactions." 
// //             });
// //         }

// //         await pool.request()
// //             .input("id", sql.VarChar, book_id) 
// //             .query("DELETE FROM Book2 WHERE id = @id");

// //         console.log(` Purged from Catalog: ${book_id}`);
// //         return res.json({ success: true, message: "Asset cleared permanently from DB catalog." });

// //     } catch (err) {
// //         console.error("Delete Book Error: ", err);
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // // 10. Student Dashboard Stats (Secured)
// // app.get("/api/student/dashboard-stats/:student_id", async (req, res) => {
// //     const { student_id } = req.params;

// //     try {
// //         let pool = await sql.connect(config);
        
// //         let result = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .query(`
// //                 SELECT 
// //                     COUNT(*) AS total_transactions,
// //                     SUM(CASE WHEN status = 'issued' THEN 1 ELSE 0 END) AS currently_borrowed,
// //                     SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS total_returned,
// //                     SUM(ISNULL(fine, 0)) AS total_fine_accumulated
// //                 FROM Transactions 
// //                 WHERE student_id = @student_id
// //             `);

// //         const stats = result.recordset[0];

// //         return res.json({
// //             success: true,
// //             student_id: student_id,
// //             metrics: {
// //                 total_transactions: stats.total_transactions || 0,
// //                 currently_borrowed: stats.currently_borrowed || 0,
// //                 total_returned: stats.total_returned || 0,
// //                 total_fine: parseFloat(stats.total_fine_accumulated || 0).toFixed(2)
// //             }
// //         });

// //     } catch (err) {
// //         console.error("Dashboard Stats Error: ", err);
// //         return res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // // 11. Core QR Action Handler (FIXED, SECURED & GLOBAL LIMIT APPLIED)
// // app.get('/:action/:identifier', async (req, res) => {
// //     const { action, identifier } = req.params;

// //     if (action === 'issue') {
// //         const book_id = identifier;
// //         const { student_id } = req.query;

// //         try {
// //             let pool = await sql.connect(config);

// //             let studentCheckResult = await pool.request()
// //                 .input("student_id", sql.VarChar, student_id)
// //                 .query("SELECT * FROM Student WHERE student_id = @student_id");

// //             const student = studentCheckResult.recordset[0];
// //             if (!student || student.is_active === false || student.is_active === 0) {
// //                 return res.status(403).send(`<h1>Transaction Denied: Inactive Profile</h1>`);
// //             }

// //             let borrowCountResult = await pool.request()
// //                 .input("student_id", sql.VarChar, student_id)
// //                 .query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");

// //             if (borrowCountResult.recordset[0].total_borrowed >= 3) {
// //                 return res.status(400).send(`<h1> Limit Violation: Max limit 3 books!</h1>`);
// //             }

// //             let result = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Book2 WHERE id = @id");
// //             const book = result.recordset[0];
// //             if (!book || book.available_quantity <= 0) return res.status(400).send(`<h1>Out of Stock!</h1>`);

// //             const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
// //             const dueDate = new Date();
// //             dueDate.setDate(dueDate.getDate() + 14); 
// //             const formattedDueDate = dueDate.toISOString().slice(0, 10);

// //             await pool.request()
// //                 .input("id", sql.VarChar, book_id)
// //                 .query("UPDATE Book2 SET available_quantity = available_quantity - 1, borrow_count = borrow_count + 1 WHERE id = @id");

// //             await pool.request()
// //                 .input("txn_id", sql.VarChar, generatedTransactionID)
// //                 .input("student_id", sql.VarChar, student_id)
// //                 .input("book_id", sql.VarChar, book_id)
// //                 .input("due_date", sql.VarChar, formattedDueDate) 
// //                 .query("INSERT INTO Transactions (transaction_id, student_id, book_id, due_date, status, fine) VALUES (@txn_id, @student_id, @book_id, @due_date, 'issued', 0.00)");

// //             return res.status(200).send(`
// //                 <div style="text-align:center; font-family:Arial; padding:50px; background:#f4f7f6; min-height:100vh;">
// //                     <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); border-top: 8px solid #0f5a6e;">
// //                         <h1 style="color:#2ecc71;">Digital Book Issued</h1>
// //                         <p>Transaction ID: <strong>${generatedTransactionID}</strong></p>
// //                         <p>Due Date: <strong style="color:#e74c3c;">${formattedDueDate}</strong></p>
// //                     </div>
// //                 </div>
// //             `);
// //         } catch (err) {
// //             return res.status(500).send(`<h1>Database Error: ${err.message}</h1>`);
// //         }
// //     }

// //     else if (action === 'return') {
// //         const transaction_id = identifier;
// //         const { book_id } = req.query;

// //         try {
// //             let pool = await sql.connect(config);

// //             let txnResult = await pool.request()
// //                 .input("txn_id", sql.VarChar, transaction_id)
// //                 .query("SELECT CAST(due_date AS DATETIME) AS due_date, status, student_id FROM Transactions WHERE transaction_id = @txn_id");

// //             if (txnResult.recordset.length === 0) return res.status(404).send(`<h1>Transaction not found!</h1>`);
// //             const txnRow = txnResult.recordset[0];
// //             if (txnRow.status === 'returned') return res.status(400).send(`<h1>Asset already returned!</h1>`);

// //             const dueDate = new Date(txnRow.due_date);
// //             const returnDate = new Date();
// //             let lateDays = 0, fine = 0.00;

// //             if (returnDate > dueDate) {
// //                 const timeDiff = returnDate.getTime() - dueDate.getTime();
// //                 lateDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
// //                 fine = lateDays * 10; 
// //             }

// //             await pool.request()
// //                 .input("txn_id", sql.VarChar, transaction_id)
// //                 .input("return_date", sql.DateTime, returnDate) 
// //                 .input("fine", sql.VarChar, fine.toFixed(2)) 
// //                 .query("UPDATE Transactions SET status = 'returned', return_date = @return_date, fine = CAST(@fine AS DECIMAL(10,2)) WHERE transaction_id = @txn_id");

// //             await pool.request()
// //                 .input("book_id", sql.VarChar, book_id)
// //                 .query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

// //             return res.status(200).send(`
// //                 <div style="text-align:center; font-family:Arial; padding:50px; background:#f4f7f6; min-height:100vh;">
// //                     <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); border-top: 8px solid #2ecc71;">
// //                         <h1 style="color:#2ecc71; margin-top:0;"> Asset Return Confirmed</h1>
// //                         <p>Transaction ID: <strong>${transaction_id}</strong></p>
// //                         <p>Late Days: <strong>${lateDays} Days</strong></p>
// //                         <p>Fine Charged: <strong style="color:#e74c3c;">Rs. ${fine.toFixed(2)}</strong></p>
// //                     </div>
// //                 </div>
// //             `);
// //         } catch (err) {
// //             return res.status(500).send(`<h1>Database Error: ${err.message}</h1>`);
// //         }
// //     }
    
// //     else {
// //         return res.status(400).send(`<h1> Invalid Action Parameters!</h1>`);
// //     }
// // });

// // // 12. Circulation Return (Secured)
// // app.get('/api/circulation/return', async (req, res) => {
// //     const { transaction_id, book_id } = req.query;

// //     if (!transaction_id || !book_id) {
// //         return res.status(400).send(`<h1> Error: Query parameters sequence broken!</h1>`);
// //     }

// //     try {
// //         let pool = await sql.connect(config);

// //         let txnResult = await pool.request()
// //             .input("txn_id", sql.VarChar, transaction_id)
// //             .query("SELECT due_date, status, student_id FROM Transactions WHERE transaction_id = @txn_id");

// //         if (txnResult.recordset.length === 0) {
// //             return res.status(404).send(`<h1> Registry Error: Transaction not found!</h1>`);
// //         }

// //         const txnRow = txnResult.recordset[0];

// //         if (txnRow.status === 'returned') {
// //             return res.status(400).send(`<h1>Audit Notice: Asset already marked as returned!</h1>`);
// //         }

// //         const dueDate = new Date(txnRow.due_date);
// //         const returnDate = new Date();
// //         let lateDays = 0, fine = 0.00;

// //         if (returnDate > dueDate) {
// //             const timeDiff = returnDate.getTime() - dueDate.getTime();
// //             lateDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
// //             fine = lateDays * 10; 
// //         }

// //         await pool.request()
// //             .input("txn_id", sql.VarChar, transaction_id)
// //             .input("fine", sql.Decimal(10, 2), fine) 
// //             .query(`
// //                 UPDATE Transactions 
// //                 SET status = 'returned', 
// //                     return_date = GETDATE(), 
// //                     fine = @fine 
// //                 WHERE transaction_id = @txn_id
// //             `);

// //         await pool.request()
// //             .input("book_id", sql.VarChar, book_id)
// //             .query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

// //         return res.status(200).send(`
// //             <div style="text-align:center; font-family:'Segoe UI',Arial,sans-serif; padding:50px; background:#f4f7f6; min-height:100vh; margin:0;">
// //                 <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); max-width:450px; border-top: 8px solid #2ecc71; text-align:center;">
// //                     <h1 style="color:#2ecc71; margin-top:0;">✅ Asset Return Confirmed</h1>
// //                     <p style="color:#666; font-size:14px;">SSUET Smart Library Automation System has synchronized ledger index rows cleanly.</p>
// //                     <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
// //                     <div style="text-align:left; font-size:15px; color:#333; line-height:2; margin: 0 auto; display: inline-block;">
// //                         <strong>Transaction ID:</strong> <span style="font-family:monospace; background:#e9ecef; padding:2px 6px; border-radius:4px;">${transaction_id}</span><br>
// //                         <strong>Student ID:</strong> ${txnRow.student_id}<br>
// //                         <strong>Overdue Late Days:</strong> ${lateDays} Days<br>
// //                         <strong>Automated Calculated Fine:</strong> <span style="color:#e74c3c; font-weight:bold;">Rs. ${fine.toFixed(2)}</span>
// //                     </div>
// //                 </div>
// //             </div>
// //         `);

// //     } catch (err) {
// //         console.error("Return Process Error: ", err);
// //         return res.status(500).send(`<h1>Database Transaction Error: ${err.message}</h1>`);
// //     }
// // });

// // // 13. Admin Login (Secured + Rate Limited)
// // app.post('/api/admin/login', authLimiter, async (req, res) => { // authLimiter lagaya yahan bhi
// //     try {
// //         const { username, password } = req.body;
// //         let pool = await sql.connect(config);
// //         const result = await pool.request()
// //             .input('username', sql.VarChar, username)
// //             .input('password', sql.VarChar, password)
// //             .query(`
// //                 SELECT *
// //                 FROM AdminUser
// //                 WHERE username = @username
// //                 AND password = @password
// //             `);

// //         if (result.recordset.length > 0) {
// //             return res.json({
// //                 success: true,
// //                 message: 'Admin login successful'
// //             });
// //         }

// //         return res.json({
// //             success: false,
// //             message: 'Invalid username or password'
// //         });

// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Server error'
// //         });
// //     }
// // });

// // // 14. Admin Metrics Analytics
// // app.get('/api/admin/dashboard-metrics', async (req, res) => {
// //     try {
// //         let pool = await sql.connect(config);

// //         let dailyTransactionsResult = await pool.request().query(`
// //             SELECT COUNT(*) AS dailyTransactions
// //             FROM Transactions
// //             WHERE CAST(issue_date AS DATE) = CAST(GETDATE() AS DATE)
// //         `);

// //         let mostBorrowed = await pool.request().query(`
// //             SELECT TOP 5 id, title, borrow_count
// //             FROM Book2
// //             ORDER BY borrow_count DESC
// //         `);

// //         let defaulters = await pool.request().query(`
// //             SELECT 
// //                 t.student_id,
// //                 s.name,
// //                 t.book_id,
// //                 t.due_date,
// //                 case 
// //                     when TRY_CAST(t.due_date AS DATE) < CAST(GETDATE() AS DATE)
// //                     then DATEDIFF(day, TRY_CAST(t.due_date AS DATE), CAST(GETDATE() AS DATE)) * 10
// //                     else 0
// //                 end AS fine
// //             FROM Transactions t
// //             JOIN Student s ON t.student_id = s.student_id
// //             WHERE LOWER(TRIM(t.status)) = 'issued'
// //             AND TRY_CAST(t.due_date AS DATE) < CAST(GETDATE() AS DATE)
// //         `);

// //         let inventory = await pool.request().query(`
// //             SELECT 
// //                 SUM(quantity) AS totalStock,
// //                 SUM(available_quantity) AS availableStock
// //             FROM Book2
// //         `);

// //         let fine = await pool.request().query(`
// //             SELECT ISNULL(SUM(fine), 0) AS totalFine
// //             FROM Transactions
// //         `);

// //         return res.json({
// //             success: true,
// //             dailyTransactions: dailyTransactionsResult.recordset[0].dailyTransactions,
// //             mostBorrowed: mostBorrowed.recordset,
// //             defaulters: defaulters.recordset,
// //             inventory: inventory.recordset[0],
// //             totalFine: fine.recordset[0].totalFine
// //         });

// //     } catch (err) {
// //         console.error("Dashboard Metrics Error: ", err);
// //         return res.status(500).json({
// //             success: false,
// //             message: "Internal Server Error",
// //             error: err.message
// //         });
// //     }
// // });

// // // 15. AI Recommendation Engine Endpoint
// // app.get('/api/recommendations/:student_id', async (req, res) => {
// //     const { student_id } = req.params;

// //     if (!student_id) {
// //         return res.status(400).json({ success: false, message: "Student ID parameter missing!" });
// //     }

// //     try {
// //         let pool = await sql.connect(config);

// //         // Pehle current student ka department aur semester nikaalte hain
// //         let studentProfile = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .query("SELECT department, semester FROM Student WHERE student_id = @student_id");

// //         const student = studentProfile.recordset[0];
// //         if (!student) {
// //             return res.status(404).json({ success: false, message: "Student profile not found." });
// //         }

// //         const { department, semester } = student;

// //         // Smart Recommendation Engine Query using Scoring Weights
// //         let recommendationResult = await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
// //             .input("department", sql.VarChar, department || '')
// //             .input("semester", sql.Int, semester || 1)
// //             .query(`
// //                 WITH BookScores AS (
// //                     SELECT 
// //                         b.id AS book_id,
// //                         b.title,
// //                         b.available_quantity,
// //                         -- 1. Popularity Weight: Jitni dafa borrow hui, utne points (1 borrowed count = 1 point)
// //                         ISNULL(b.borrow_count, 0) AS PopularityScore,

// //                         -- 2. Department Alignment Weight: Agar book student ke department ki hai to 15 points
// //                         CASE WHEN LOWER(TRIM(b.department)) = LOWER(TRIM(@department)) THEN 15 ELSE 0 END AS DeptScore,

// //                         -- 3. Semester Alignment Weight: Agar book usi semester ki hai to 10 points
// //                         CASE WHEN b.semester = @semester THEN 10 ELSE 0 END AS SemScore,

// //                         -- 4. Borrowing History Penalty/Rule: Jo book student pehle hi le chuka hai, use recommend nahi karna (Score = -100)
// //                         CASE WHEN EXISTS (
// //                             SELECT 1 FROM Transactions t 
// //                             WHERE t.book_id = b.id AND t.student_id = @student_id
// //                         ) THEN -100 ELSE 0 END AS HistoryPenalty
// //                     FROM Book2 b
// //                     WHERE b.available_quantity > 0 -- Sirf wahi books jo library me mojud hon
// //                 )
// //                 SELECT TOP 5 
// //                     book_id, 
// //                     title,
// //                     (PopularityScore + DeptScore + SemScore + HistoryPenalty) AS TotalRecommendationWeight
// //                 FROM BookScores
// //                 WHERE (PopularityScore + DeptScore + SemScore + HistoryPenalty) > 0
// //                 ORDER BY TotalRecommendationWeight DESC, PopularityScore DESC
// //             `);

// //         return res.json({
// //             success: true,
// //             recommendations: recommendationResult.recordset
// //         });

// //     } catch (err) {
// //         console.error("AI Recommendation Engine Error: ", err);
// //         return res.status(500).json({ success: false, message: "Internal Engine Fault", error: err.message });
// //     }
// // });
// // app.listen(NODE_PORT, () => {
// //     console.log(`Server running safely on http://localhost:${NODE_PORT}`);
// // });


// const express = require('express');
// const crypto = require('crypto');
// const cors = require('cors');
// const sql = require("mssql");
// const config = require("./dbConfig");
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const rateLimit = require('express-rate-limit');

// const app = express();
// app.use(express.json());
// app.use(cors()); 

// const NODE_PORT = 5000;
// const JWT_SECRET = "SSUET_SMART_LIBRARY_SECRET_TOKEN_VECTOR_2026";

// // ==========================================
// // 1. RATE LIMITING CONFIGURATION (Throttling)
// // ==========================================
// const globalLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 Minutes
//     max: 100, // Max 100 requests per IP
//     message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 Minutes
//     max: 15, // Max 15 login attempts
//     message: { success: false, message: "Too many login attempts. Locked for 15 minutes." },
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// // Applying Global Limiter across the application
// app.use(globalLimiter);

// // ==========================================
// // 2. SECURITY MIDDLEWARE: Token Guard
// // ==========================================
// function verifyToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     if (!authHeader) {
//         return res.status(403).json({ success: false, message: "Access Denied: Missing Authorization Signature." });
//     }

//     const token = authHeader.split(' ')[1] || authHeader;

//     jwt.verify(token, JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ success: false, message: "Session Expired or Corrupted Token Validation." });
//         }
//         req.user = decoded;
//         next();
//     });
// }

// // ==========================================
// // 3. CORE ROUTE APIS
// // ==========================================

// // Get all transactions
// app.get("/r", async (req, res) => {
//     try {
//         let pool = await sql.connect(config);
//         let result = await pool.request().query('SELECT id, transaction_id, student_id, book_id, issue_date, due_date, status, return_date, fine FROM Transactions ORDER BY id DESC');
//         return res.json(result.recordset);
//     } catch (err) {
//         return res.status(500).send(err.message);
//     }
// });

// // Get all books
// app.get("/api/books", async (req, res) => {
//     try {
//         let pool = await sql.connect(config);
//         let result = await pool.request().query("SELECT * FROM Book2");
//         res.json({ success: true, data: result.recordset });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// });

// // Get admin transactions
// app.get('/api/admin/transactions', async (req, res) => {
//     try {
//         let pool = await sql.connect(config);
//         let result = await pool.request().query("SELECT * FROM Transactions ORDER BY id DESC");
//         return res.json({ success: true, data: result.recordset });
//     } catch (err) {
//         return res.status(500).json({ success: false, message: err.message });
//     }
// });

// // Student Login
// app.post('/api/login', authLimiter, async (req, res) => {
//     const { student_id } = req.body;

//     if (!student_id) {
//         return res.status(400).json({ success: false, message: "Error: Student ID missing!" });
//     }

//     try {
//         let pool = await sql.connect(config);
//         let studentResult = await pool.request()
//             .input("student_id", sql.VarChar, student_id)
//             .query("SELECT * FROM Student WHERE student_id = @student_id");

//         const student = studentResult.recordset[0];

//         if (!student) {
//             return res.status(404).json({ success: false, message: "Student record not found in Database." });
//         }

//         if (student.is_active === false || student.is_active === 0) {
//             return res.status(403).json({ success: false, message: "Access Denied: Student profile is INACTIVE." });
//         }

//         const token = jwt.sign(
//             { student_id: student.student_id, role: 'student' },
//             JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         console.log(`🔑 Login Logged: Student ${student.name} (${student_id}) successfully authenticated.`);
//         return res.status(200).json({ 
//             success: true, 
//             message: "Login verified successfully!", 
//             student_id: student_id,
//             token: token
//         });
        
//     } catch (err) {
//         return res.status(500).json({ success: false, message: err.message });
//     }
// });

// // Generate QR Link
// app.get('/api/generate_qr', async (req, res) => {
//     const { book_id, student_id, action } = req.query;
//     const currentAction = action || "issue";

//     if (!book_id || !student_id) {
//         return res.status(400).json({ success: false, message: "Parameters missing!" });
//     }

//     try {
//         let pool = await sql.connect(config);
//         let borrowCountResult = await pool.request()
//             .input("student_id", sql.VarChar, student_id)
//             .query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");

//         const totalBorrowed = borrowCountResult.recordset[0].total_borrowed;

//         if (totalBorrowed >= 3) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Bypass Blocked: Student already has ${totalBorrowed} active books. Cannot issue more than 3 books!`
//             });
//         }

//         const target_url = `http://192.168.100.6:${NODE_PORT}/${currentAction}/${book_id}?student_id=${student_id}`;
//         console.log(` Generated Matrix Link Vector: ${target_url}`);

//         return res.status(200).json({
//             success: true,
//             target_payload: target_url,
//             image_data: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(target_url)}`
//         });
//     } catch (err) {
//         return res.status(500).json({ success: false, message: err.message });
//     }
// });

// // Admin Books Catalog Fetch
// app.get('/api/admin/books', async (req, res) => {
//     try {
//         let pool = await sql.connect(config);
//         let result = await pool.request().query(`
//             SELECT id AS book_id, title, quantity, available_quantity, borrow_count 
//             FROM Book2 ORDER BY id DESC
//         `);
//         return res.json({ success: true, data: result.recordset });
//     } catch (err) {
//         return res.status(500).json({ success: false, message: err.message });
//     }
// });

// // Admin Statistics Engine
// app.get('/api/admin/stats', async (req, res) => {
//     try {
//         let pool = await sql.connect(config);

//         let totalIssued = await pool.request().query(`SELECT COUNT(*) AS totalIssued FROM Transactions`);
//         let overdueBooks = await pool.request().query(`
//             SELECT COUNT(*) AS overdueBooks FROM Transactions
//             WHERE LOWER(TRIM(status))='issued' AND TRY_CAST(due_date AS DATE) < CAST(GETDATE() AS DATE)
//         `);
//         let activeBorrowers = await pool.request().query(`
//             SELECT COUNT(DISTINCT student_id) AS activeBorrowers FROM Transactions WHERE LOWER(TRIM(status))='issued'
//         `);
//         let totalFine = await pool.request().query(`
//             SELECT ISNULL(SUM(CASE 
//                 WHEN LOWER(TRIM(status)) = 'returned' OR LOWER(TRIM(status)) = 'retuned' THEN ISNULL(fine, 0)
//                 WHEN LOWER(TRIM(status)) = 'issued' AND TRY_CAST(due_date AS DATE) < CAST(GETDATE() AS DATE) 
//                 THEN DATEDIFF(day, TRY_CAST(due_date AS DATE), CAST(GETDATE() AS DATE)) * 10 ELSE 0 
//             END), 0) AS totalFine FROM Transactions
//         `);

//         return res.json({
//             success: true,
//             totalIssued: totalIssued.recordset[0].totalIssued,
//             overdueBooks: overdueBooks.recordset[0].overdueBooks,
//             activeBorrowers: activeBorrowers.recordset[0].activeBorrowers,
//             totalFine: totalFine.recordset[0].totalFine
//         });
//     } catch(err) {
//         console.error(err);
//         return res.status(500).json({ success: false, message: err.message });
//     }
// });

// // Admin Add Book API
// app.post('/api/admin/books/add', async (req, res) => {
//     const { book_id, title, quantity } = req.body; 
//     if (!book_id || !title || !quantity) {
//         return res.status(400).json({ success: false, message: "Required parameter attributes missing!" });
//     }

//     try {
//         let pool = await sql.connect(config);
//         let checkExist = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Book2 WHERE id = @id");

//         if (checkExist.recordset.length > 0) {
//             return res.status(400).json({ success: false, message: "Book ID already exists in database registry!" });
//         }

//         await pool.request()
//             .input("id", sql.VarChar, book_id)
//             .input("title", sql.VarChar, title)
//             .input("qty", sql.Int, quantity) 
//             .query(`INSERT INTO Book2 (id, title, status, borrow_count, quantity, available_quantity) VALUES (@id, @title, 'available', 0, @qty, @qty)`);

//         console.log(`Added to Catalog: ${book_id}`);
//         return res.json({ success: true, message: "New book record written successfully!" });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ success: false, message: err.message });
//     }
// });

// // Admin Delete Book API
// app.post('/api/admin/books/delete', async (req, res) => {
//     const { book_id } = req.body;
//     if (!book_id) return res.status(400).json({ success: false, message: "Book ID token missing!" });

//     try {
//         let pool = await sql.connect(config);
//         let activeLeaseCheck = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Transactions WHERE book_id = @id AND status = 'issued'");

//         if (activeLeaseCheck.recordset.length > 0) {
//             return res.status(400).json({ success: false, message: "Cannot delete asset! Active in ongoing transactions." });
//         }

//         await pool.request().input("id", sql.VarChar, book_id).query("DELETE FROM Book2 WHERE id = @id");
//         return res.json({ success: true, message: "Asset cleared permanently." });
//     } catch (err) {
//         return res.status(500).json({ success: false, message: err.message });
//     }
// });

// // Admin Login (FIXED: Uses secure Bcrypt hash check and strict limits)
// app.post('/api/admin/login', authLimiter, async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let pool = await sql.connect(config);
        
//         const result = await pool.request()
//             .input('username', sql.VarChar, username)
//             .query(`SELECT * FROM AdminUser WHERE username = @username`);

//         if (result.recordset.length > 0) {
//             const admin = result.recordset[0];

//             // Secure Bcrypt verification handshake
//             const match = await bcrypt.compare(password, admin.password);

//             if (match) {
//                 const adminToken = jwt.sign(
//                     { username: admin.username, role: 'admin' }, 
//                     JWT_SECRET, 
//                     { expiresIn: '12h' }
//                 );

//                 return res.json({ success: true, message: 'Admin login successful', token: adminToken });
//             }
//         }
//         return res.json({ success: false, message: 'Invalid username or password' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

// // Admin Realtime Dashboard Analytics
// app.get('/api/admin/dashboard-metrics', async (req, res) => {
//     try {
//         let pool = await sql.connect(config);
//         let dailyTransactionsResult = await pool.request().query(`SELECT COUNT(*) AS dailyTransactions FROM Transactions WHERE CAST(issue_date AS DATE) = CAST(GETDATE() AS DATE)`);
//         let mostBorrowed = await pool.request().query(`SELECT TOP 5 id, title, borrow_count FROM Book2 ORDER BY borrow_count DESC`);
//         let defaulters = await pool.request().query(`
//             SELECT t.student_id, s.name, t.book_id, t.due_date,
//             CASE WHEN TRY_CAST(t.due_date AS DATE) < CAST(GETDATE() AS DATE) THEN DATEDIFF(day, TRY_CAST(t.due_date AS DATE), CAST(GETDATE() AS DATE)) * 10 ELSE 0 END AS fine
//             FROM Transactions t JOIN Student s ON t.student_id = s.student_id WHERE LOWER(TRIM(t.status)) = 'issued' AND TRY_CAST(t.due_date AS DATE) < CAST(GETDATE() AS DATE)
//         `);
//         let inventory = await pool.request().query(`SELECT SUM(quantity) AS totalStock, SUM(available_quantity) AS availableStock FROM Book2`);
//         let fine = await pool.request().query(`SELECT ISNULL(SUM(fine), 0) AS totalFine FROM Transactions`);

//         return res.json({
//             success: true,
//             dailyTransactions: dailyTransactionsResult.recordset[0].dailyTransactions,
//             mostBorrowed: mostBorrowed.recordset,
//             defaulters: defaulters.recordset,
//             inventory: inventory.recordset[0],
//             totalFine: fine.recordset[0].totalFine
//         });
//     } catch (err) {
//         return res.status(500).json({ success: false, error: err.message });
//     }
// });

// // Core QR Action Handler (Issue / Return processing routing)
// app.get('/:action/:identifier', async (req, res) => {
//     const { action, identifier } = req.params;

//     if (action === 'issue') {
//         const book_id = identifier;
//         const { student_id } = req.query;

//         try {
//             let pool = await sql.connect(config);
//             let studentCheckResult = await pool.request().input("student_id", sql.VarChar, student_id).query("SELECT * FROM Student WHERE student_id = @student_id");
//             const student = studentCheckResult.recordset[0];
            
//             if (!student || student.is_active === false || student.is_active === 0) {
//                 return res.status(403).send(`<h1>Transaction Denied: Inactive Profile</h1>`);
//             }

//             let borrowCountResult = await pool.request().input("student_id", sql.VarChar, student_id).query("SELECT COUNT(*) AS total_borrowed FROM Transactions WHERE student_id = @student_id AND status = 'issued'");
//             if (borrowCountResult.recordset[0].total_borrowed >= 3) return res.status(400).send(`<h1> Limit Violation </h1>`);

//             let result = await pool.request().input("id", sql.VarChar, book_id).query("SELECT * FROM Book2 WHERE id = @id");
//             const book = result.recordset[0];
//             if (!book || book.available_quantity <= 0) return res.status(400).send(`<h1>Out of Stock!</h1>`);

//             const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
//             const dueDate = new Date();
//             dueDate.setDate(dueDate.getDate() + 14); 
//             const formattedDueDate = dueDate.toISOString().slice(0, 10);

//             await pool.request().input("id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity - 1, borrow_count = borrow_count + 1 WHERE id = @id");
//             await pool.request()
//                 .input("txn_id", sql.VarChar, generatedTransactionID).input("student_id", sql.VarChar, student_id).input("book_id", sql.VarChar, book_id).input("due_date", sql.VarChar, formattedDueDate) 
//                 .query("INSERT INTO Transactions (transaction_id, student_id, book_id, due_date, status, fine) VALUES (@txn_id, @student_id, @book_id, @due_date, 'issued', 0.00)");

//             return res.status(200).send(`<h1>Digital Book Issued Context Cleanly</h1><p>ID: ${generatedTransactionID}</p>`);
//         } catch (err) { return res.status(500).send(err.message); }
//     }

//     else if (action === 'return') {
//         const transaction_id = identifier;
//         const { book_id } = req.query;

//         try {
//             let pool = await sql.connect(config);
//             let txnResult = await pool.request().input("txn_id", sql.VarChar, transaction_id).query("SELECT CAST(due_date AS DATETIME) AS due_date, status FROM Transactions WHERE transaction_id = @txn_id");
//             if (txnResult.recordset.length === 0) return res.status(404).send(`<h1>Not Found</h1>`);
            
//             const txnRow = txnResult.recordset[0];
//             if (txnRow.status === 'returned') return res.status(400).send(`<h1>Already Processed</h1>`);

//             const dueDate = new Date(txnRow.due_date);
//             const returnDate = new Date();
//             let lateDays = 0, fine = 0.00;

//             if (returnDate > dueDate) {
//                 lateDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
//                 fine = lateDays * 10; 
//             }

//             await pool.request().input("txn_id", sql.VarChar, transaction_id).input("return_date", sql.DateTime, returnDate).input("fine", sql.VarChar, fine.toFixed(2)) 
//                 .query("UPDATE Transactions SET status = 'returned', return_date = @return_date, fine = CAST(@fine AS DECIMAL(10,2)) WHERE transaction_id = @txn_id");
//             await pool.request().input("book_id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

//             return res.status(200).send(`<h1>Asset Return Verified Fine: Rs.${fine.toFixed(2)}</h1>`);
//         } catch (err) { return res.status(500).send(err.message); }
//     }
// });

// // Circulation Scanner Sync Hook
// app.get('/api/circulation/return', async (req, res) => {
//     const { transaction_id, book_id } = req.query;
//     try {
//         let pool = await sql.connect(config);
//         let txnResult = await pool.request().input("txn_id", sql.VarChar, transaction_id).query("SELECT due_date, status, student_id FROM Transactions WHERE transaction_id = @txn_id");
//         const txnRow = txnResult.recordset[0];

//         let lateDays = 0, fine = 0.00;
//         if (new Date() > new Date(txnRow.due_date)) {
//             lateDays = Math.ceil((new Date().getTime() - new Date(txnRow.due_date).getTime()) / (1000 * 60 * 60 * 24));
//             fine = lateDays * 10; 
//         }

//         await pool.request().input("txn_id", sql.VarChar, transaction_id).input("fine", sql.Decimal(10, 2), fine) 
//             .query(`UPDATE Transactions SET status = 'returned', return_date = GETDATE(), fine = @fine WHERE transaction_id = @txn_id`);
//         await pool.request().input("book_id", sql.VarChar, book_id).query("UPDATE Book2 SET available_quantity = available_quantity + 1, status = 'available' WHERE id = @book_id");

//         return res.status(200).send(`<h3>✅ Automated System Return Sequenced Fine: Rs. ${fine.toFixed(2)}</h3>`);
//     } catch (err) { return res.status(500).send(err.message); }
// });

// // AI Content-Based Recommendation Engine Engine Runtime
// app.get('/api/recommendations/:student_id', async (req, res) => {
//     const { student_id } = req.params;
//     if (!student_id) return res.status(400).json({ success: false, message: "Missing Student ID Vector" });

//     try {
//         let pool = await sql.connect(config);
//         let studentProfile = await pool.request().input("student_id", sql.VarChar, student_id).query("SELECT department, semester FROM Student WHERE student_id = @student_id");
//         const student = studentProfile.recordset[0];
//         if (!student) return res.status(404).json({ success: false, message: "Profile missing" });

//         let recommendationResult = await pool.request()
//             .input("student_id", sql.VarChar, student_id)
//             .input("department", sql.VarChar, student.department || '')
//             .input("semester", sql.Int, student.semester || 1)
//             .query(`
//                 WITH UserHistoryGenres AS (
//                     SELECT TOP 1 b.department AS FavGenre FROM Transactions t
//                     JOIN Book2 b ON t.book_id = b.id WHERE t.student_id = @student_id
//                     GROUP BY b.department ORDER BY COUNT(*) DESC
//                 ),
//                 BookScores AS (
//                     SELECT b.id AS book_id, b.title, b.available_quantity,
//                     CASE WHEN LOWER(TRIM(b.department)) = (SELECT LOWER(TRIM(FavGenre)) FROM UserHistoryGenres) THEN 25 ELSE 0 END AS HistoryTypeScore,
//                     CASE WHEN LOWER(TRIM(b.department)) = LOWER(TRIM(@department)) THEN 15 ELSE 0 END AS DeptScore,
//                     CASE WHEN b.semester = @semester THEN 10 ELSE 0 END AS SemScore,
//                     ISNULL(b.borrow_count, 0) AS PopularityScore,
//                     CASE WHEN EXISTS (SELECT 1 FROM Transactions t WHERE t.book_id = b.id AND t.student_id = @student_id AND t.status = 'issued') THEN -100 ELSE 0 END AS DuplicationPenalty
//                     FROM Book2 b WHERE b.available_quantity > 0
//                 )
//                 SELECT TOP 5 book_id, title FROM BookScores 
//                 WHERE (HistoryTypeScore + DeptScore + SemScore + PopularityScore + DuplicationPenalty) > 0
//                 ORDER BY (HistoryTypeScore + DeptScore + SemScore + PopularityScore + DuplicationPenalty) DESC
//             `);

//         return res.json({ success: true, recommendations: recommendationResult.recordset });
//     } catch (err) {
//         return res.status(500).json({ success: false, message: err.message });
//     }
// });

// app.listen(NODE_PORT, () => {
//     console.log(`Server running safely on http://localhost:${NODE_PORT}`);
// });



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

// ==========================================
// 1. RATE LIMITING CONFIGURATION (Throttling)
// ==========================================
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

// ==========================================
// 2. SECURITY MIDDLEWARE: Token Guard
// ==========================================
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

// ==========================================
// 3. CORE ROUTE APIS
// ==========================================

// Get all transactions
app.get("/r", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT id, transaction_id, student_id, book_id, issue_date, due_date, status, return_date, fine FROM Transactions ORDER BY id DESC');
        return res.json(result.recordset);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

// Get all books
app.get("/api/books", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Book2");
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get admin transactions
app.get('/api/admin/transactions', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Transactions ORDER BY id DESC");
        return res.json({ success: true, data: result.recordset });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ❌ VULNERABLE STUDENT LOGIN (Using Template Literals / String Concatenation)
app.post('/api/login', authLimiter, async (req, res) => {
    const { student_id } = req.body;

    if (!student_id) {
        return res.status(400).json({ success: false, message: "Error: Student ID missing!" });
    }

    try {
        let pool = await sql.connect(config);
        
        // DANGEROUS: String interpolation allows SQL injection payloads to alter query logic
        let studentResult = await pool.request()
            .query(`SELECT * FROM Student WHERE student_id = '${student_id}'`);

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

// Generate QR Link
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

// Admin Books Catalog Fetch
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

// Admin Statistics Engine
app.get('/api/admin/stats', async (req, res) => {
    try {
        let pool = await sql.connect(config);

        let totalIssued = await pool.request().query(`SELECT COUNT(*) AS totalIssued FROM Transactions`);
        let overdueBooks = await pool.request().query(`
            SELECT COUNT(*) AS overdueBooks FROM Transactions
            WHERE LOWER(TRIM(status))='issued' AND TRY_CAST(due_date AS DATE) < CAST(GETDATE() AS DATE)
        `);
        let activeBorrowers = await pool.request().query(`
            SELECT COUNT(DISTINCT student_id) AS activeBorrowers FROM Transactions WHERE LOWER(TRIM(status))='issued'
        `);
        let totalFine = await pool.request().query(`
            SELECT ISNULL(SUM(CASE 
                WHEN LOWER(TRIM(status)) = 'returned' OR LOWER(TRIM(status)) = 'retuned' THEN ISNULL(fine, 0)
                WHEN LOWER(TRIM(status)) = 'issued' AND TRY_CAST(due_date AS DATE) < CAST(GETDATE() AS DATE) 
                THEN DATEDIFF(day, TRY_CAST(due_date AS DATE), CAST(GETDATE() AS DATE)) * 10 ELSE 0 
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

// Admin Add Book API
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

// Admin Delete Book API
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

// ❌ VULNERABLE ADMIN LOGIN (Using Concatenation)
app.post('/api/admin/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        let pool = await sql.connect(config);
        
        // DANGEROUS: Directly concatenating parameters allows authentication bypass
        const result = await pool.request()
            .query(`SELECT * FROM AdminUser WHERE username = '${username}'`);

        if (result.recordset.length > 0) {
            const admin = result.recordset[0];

            // Secure hash verification remains, but the object retrieval stage above is corrupted
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

// Admin Realtime Dashboard Analytics
app.get('/api/admin/dashboard-metrics', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let dailyTransactionsResult = await pool.request().query(`SELECT COUNT(*) AS dailyTransactions FROM Transactions WHERE CAST(issue_date AS DATE) = CAST(GETDATE() AS DATE)`);
        let mostBorrowed = await pool.request().query(`SELECT TOP 5 id, title, borrow_count FROM Book2 ORDER BY borrow_count DESC`);
        let defaulters = await pool.request().query(`
            SELECT t.student_id, s.name, t.book_id, t.due_date,
            CASE WHEN TRY_CAST(t.due_date AS DATE) < CAST(GETDATE() AS DATE) THEN DATEDIFF(day, TRY_CAST(t.due_date AS DATE), CAST(GETDATE() AS DATE)) * 10 ELSE 0 END AS fine
            FROM Transactions t JOIN Student s ON t.student_id = s.student_id WHERE LOWER(TRIM(t.status)) = 'issued' AND TRY_CAST(t.due_date AS DATE) < CAST(GETDATE() AS DATE)
        `);
        let inventory = await pool.request().query(`SELECT SUM(quantity) AS totalStock, SUM(available_quantity) AS availableStock FROM Book2`);
        let fine = await pool.request().query(`SELECT ISNULL(SUM(fine), 0) AS totalFine FROM Transactions`);

        return res.json({
            success: true,
            dailyTransactions: dailyTransactionsResult.recordset[0].dailyTransactions,
            mostBorrowed: mostBorrowed.recordset,
            defaulters: defaulters.recordset,
            inventory: inventory.recordset[0],
            totalFine: fine.recordset[0].totalFine
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Core QR Action Handler (Issue / Return processing routing)
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

// AI Content-Based Recommendation Engine Engine Runtime
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

app.listen(NODE_PORT, () => {
    console.log(`Server running on http://localhost:${NODE_PORT}`);
});
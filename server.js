// // const sql = require("mssql");
// // const config = require("./dbConfig");


// // const express = require("express");
// // const cors = require("cors");
// // const { use } = require("react");
// // const app = express();
// // app.use(express.json())
// // app.use(cors());
// // app.use(express.json());

// // sql.connect(config)
// //     .then(() => console.log("✅ Database Connected Successfully!"))
// //     .catch(err => console.error("❌ Connection Failed:", err));


// // app.get("/r",async (req,res)=>{
// // try{
// // let pool = await sql.connect(config);
// // let result = await pool.request().query('select * from Book2')

// //       return res.json(result.recordset);

// //     } catch (err) {
// //         return res.status(500).send(err.message);
// //     }

// // })



// // app.post('/api/login-log', async (req, res) => {
// //     const { student_id } = req.body;

// //     if (!student_id) {
// //         return res.status(400).json({ 
// //             success: false, 
// //             message: 'student_id is required.' 
// //         });
// //     }

// //     try {
// //         const request = new sql.Request();
// //         request.input('student_id', sql.VarChar(50), student_id);

// //         const query = ` INSERT INTO LoginLog (student_id)VALUES (@student_id) `;

// //         await request.query(query);

// //         return res.status(201).json({
// //             success: true,
// //             message: 'Student login logged successfully!'
// //         });

// //     } catch (error) {
// //         console.error('Error inserting data:', error);
// //         return res.status(500).json({
// //             success: false,
// //             message: 'Internal Server Error',
// //             error: error.message
// //         });
// //     }
// // });



// // app.post("/student", async (req, res) => {

// //     try {
// //         const { student_id } = req.body;
    

// //         let pool = await sql.connect(config);
// //         await pool.request()
// //             .input("student_id", sql.VarChar, student_id)
            
// //             .query(`INSERT INTO LoginLog (student_id)VALUES (@student_id) `)

// //         return res.json({ message: "Inserted successfully" });
// //     }
// //     catch (err) {
// //         return res.status(500).json({ error: err.message });
// //     }
// // })



// // app.listen(3000, () => {
// //     console.log("running");
// // });




// const express = require('express');
// const crypto = require('crypto');
// const cors = require('cors');
// const sql = require("mssql");
// const config = require("./dbConfig");
// const app = express();
// app.use(express.json());
// app.use(cors()); 

// const NODE_SERVER_IP = "0.0.0.0"; 
// const NODE_PORT = 5000;

// const staticStudentsTable = {
//     "CS-2023-001": { name: "Syed Mujtaba Ali", is_active: true, borrowed_count: 0 },
//     "CS-2023-002": { name: "Bilal Ahmed Khan", is_active: true, borrowed_count: 3 }, 
//     "CS-2023-003": { name: "Zainab Fatima", is_active: false, borrowed_count: 0 }    
// };

// // const staticBooksTable = {
// //     "BOOK-QR-001": { title: "Introduction to JavaScript", status: "available" },
// //     "BOOK-QR-002": { title: "Database Management Systems", status: "available" },
// //     "BOOK-QR-003": { title: "Data Structures & Algorithms", status: "available" }
// // };

// const staticTransactionsArchive = [];
// const loginLogTable = []; 


// app.get("/r",async (req,res)=>{
// try{
// let pool = await sql.connect(config);
// let result = await pool.request().query('select * from  LoginLog')

//       return res.json(result.recordset);

//     } catch (err) {
//         return res.status(500).send(err.message);
//     }

// })



// app.get("/api/books", async (req, res) => {
//     try {
//         let pool = await sql.connect(config);
//         let result = await pool.request().query("SELECT * FROM Book2");

//         res.json({
//             success: true,
//             data: result.recordset
//         });

//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             message: err.message
//         });
//     }
// });

// app.post('/api/login', (req, res) => {
//     const { student_id } = req.body;

//     if (!student_id) {
//         return res.status(400).json({ success: false, message: "Error: Student ID missing!" });
//     }

//     if (staticStudentsTable[student_id]) {
//         loginLogTable.push({ id: loginLogTable.length + 1, student_id: student_id });
//         console.log(`🔑 Login Logged: Student ${student_id} successfully authenticated.`);
        
//         return res.status(200).json({ 
//             success: true, 
//             message: "Login verified successfully!", 
//             student_id: student_id 
//         });
//     } else {
//         return res.status(404).json({ success: false, message: "Student record signature not found." });
//     }
// });

// app.get('/api/generate_qr', (req, res) => {
//     const { book_id, student_id, action } = req.query;
//     const currentAction = action || "issue";

//     if (!book_id || !student_id) {
//         return res.status(400).json({ success: false, message: "Parameters arrays missing!" });
//     }

// const target_url = `http://192.168.100.6:${NODE_PORT}/${currentAction}/${book_id}?student_id=${student_id}`;
//     console.log(`🎯 Generated Matrix Link Vector: ${target_url}`);

//     return res.status(200).json({
//         success: true,
//         target_payload: target_url,
//         image_data: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(target_url)}`
//     });
// });

// app.get('/:action/:book_id', (req, res) => {
//     const { action, book_id } = req.params;
//     const { student_id } = req.query;

//     if (action !== 'issue') {
//         return res.status(400).send(`<h1>❌ Error: Invalid System Operation Parameter!</h1>`);
//     }

//     console.log(`⚡ Execution Pipeline Triggered: Processing book ${book_id} for student ${student_id}`);

//     const student = staticStudentsTable[student_id];
//     if (!student || !student.is_active) {
//         return res.status(403).send(`
//             <div style="font-family:Arial; text-align:center; padding:40px;">
//                 <h1 style="color:#e74c3c;">❌ Transaction Denied</h1>
//                 <p>Student system identity parameter profile is <strong>INACTIVE</strong> or Unauthorized.</p>
//             </div>
//         `);
//     }

//     if (student.borrowed_count >= 3) {
//         return res.status(400).send(`
//             <div style="font-family:Arial; text-align:center; padding:40px;">
//                 <h1 style="color:#e74c3c;">❌ Limit Violation</h1>
//                 <p>Constraint breached! Student reached maximum borrow limits capacity limits allocation bounds (Max 3 books).</p>
//             </div>
//         `);
//     }
    
//     // --- FIXED CORE BUSINESS LOGIC & BOOK ISSUANCE CONTROLLER ---
// app.get('/:action/:book_id', async (req, res) => {
//     const { action, book_id } = req.params;
//     const { student_id } = req.query;

//     if (action !== 'issue') {
//         return res.status(400).send(`<h1>❌ Error: Invalid System Operation Parameter!</h1>`);
//     }

//     console.log(`⚡ Execution Pipeline Triggered: Processing book ${book_id} for student ${student_id}`);

//     // 1. Student Eligibility Checks (Using Static Rules Matrix)
//     const student = staticStudentsTable[student_id];
//     if (!student || !student.is_active) {
//         return res.status(403).send(`
//             <div style="font-family:Arial; text-align:center; padding:40px;">
//                 <h1 style="color:#e74c3c;">❌ Transaction Denied</h1>
//                 <p>Student system identity parameter profile is <strong>INACTIVE</strong> or Unauthorized.</p>
//             </div>
//         `);
//     }

//     if (student.borrowed_count >= 3) {
//         return res.status(400).send(`
//             <div style="font-family:Arial; text-align:center; padding:40px;">
//                 <h1 style="color:#e74c3c;">❌ Limit Violation</h1>
//                 <p>Constraint breached! Student reached maximum borrow limit capacity (Max 3 books).</p>
//             </div>
//         `);
//     }

//     // 2. DB Book Validation & Real-time Update Processing
//     try {
//         let pool = await sql.connect(config);

//         // Fetch book data directly from real SQL Server table
//         let result = await pool.request()
//             .input("id", sql.VarChar, book_id)
//             .query("SELECT * FROM Book WHERE id = @id");

//         // ✅ VARIABLE DEFINED HERE INSIDE TRY BLOCK
//         const book = result.recordset[0];

//         // Validation A: Check if book exists in DB
//         if (!book) {
//             return res.status(404).send(`
//                 <div style="font-family:Arial; text-align:center; padding:40px;">
//                     <h1 style="color:#e74c3c;">❌ Registry Error</h1>
//                     <p>Asset identifier token <strong>${book_id}</strong> not found inside database catalog.</p>
//                 </div>
//             `);
//         }

//         // Validation B: Check if book status is available in DB
//         if (book.status !== "available") {
//             return res.status(400).send(`
//                 <div style="font-family:Arial; text-align:center; padding:40px;">
//                     <h1 style="color:#e74c3c;">❌ Concurrency Collision</h1>
//                     <p>The requested book asset signature is currently locked. State is already issued to another user.</p>
//                 </div>
//             `);
//         }

//         // 3. Execution Phase: Generate Transaction Receipts & Update DB
//         const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
//         const issueDate = new Date();
//         const dueDate = new Date();
//         dueDate.setDate(issueDate.getDate() + 14); // 14 Days return strategy

//         // Update real SQL Server Book record state
//         await pool.request()
//             .input("id", sql.VarChar, book_id)
//             .input("student", sql.VarChar, student_id)
//             .query(`
//                 UPDATE Book
//                 SET status='issued', borrower=@student, borrow_count = borrow_count + 1
//                 WHERE id=@id
//             `);

//         // Synchronize state locally with mock student counter tracker
//         student.borrowed_count++;

//         // Push execution logs to archive history cache
//         const archiveNodeElement = {
//             transaction_id: generatedTransactionID,
//             student_id: student_id,
//             book_id: book_id,
//             title: book.title, // Now perfectly safe to read
//             issued_date: issueDate.toLocaleString(),
//             due_date: dueDate.toLocaleDateString()
//         };
//         staticTransactionsArchive.push(archiveNodeElement);
//         console.log(`📦 Database updated! State Registered Successfully! Txn Logged: ${generatedTransactionID}`);

//         // Send HTML response back to user browser
//         return res.status(200).send(`
//             <div style="text-align:center; font-family:'Segoe UI',Arial; padding:50px; background:#f4f7f6; min-height:100vh; margin:0;">
//                 <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); max-width:450px; border-top: 8px solid #0f5a6e;">
//                     <h1 style="color:#2ecc71; margin-top:0;">✅ Digital Book Issued</h1>
//                     <p style="color:#666; font-size:14px;">Sir Syed University Smart Library automated system transaction processed safely without manual worker intervention loops.</p>
//                     <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
//                     <div style="text-align:left; font-size:15px; color:#333; line-height:2;">
//                         <strong>Transaction ID:</strong> <span style="font-family:monospace; background:#e9ecef; padding:2px 6px; border-radius:4px;">${generatedTransactionID}</span><br>
//                         <strong>Student Name:</strong> ${student.name}<br>
//                         <strong>Book Title:</strong> ${book.title}<br>
//                         <strong>Due Date Allocation:</strong> <span style="color:#e74c3c; font-weight:bold;">${dueDate.toLocaleDateString()}</span>
//                     </div>
//                 </div>
//             </div>
//         `);

//     } catch (err) {
//         console.error("SQL Processing Exception: ", err);
//         return res.status(500).send(`<h1>Database Transaction Error: ${err.message}</h1>`);
//     }
// });
// //     app.get('/:action/:book_id', async (req, res) => {
// //     const { action, book_id } = req.params;
// //     const { student_id } = req.query;

// //     try {
// //         let pool = await sql.connect(config);

// //         let result = await pool.request()
// //             .input("id", sql.VarChar, book_id)
// //             .query("SELECT * FROM Book WHERE id = @id");

// //         const book = result.recordset[0];

// //         if (!book) {
// //             return res.status(404).send("Book not found");
// //         }

// //         if (book.status !== "available") {
// //             return res.status(400).send("Book already issued");
// //         }

// //         // update book
// //         await pool.request()
// //             .input("id", sql.VarChar, book_id)
// //             .input("student", sql.VarChar, student_id)
// //             .query(`
// //                 UPDATE Book
// //                 SET status='issued', borrower=@student, borrow_count = borrow_count + 1
// //                 WHERE id=@id
// //             `);

// //         res.send("Book issued successfully");

// //     } catch (err) {
// //         res.status(500).send(err.message);
// //     }
// // });
// //     if (!book) {
// //         return res.status(404).send(`
// //             <div style="font-family:Arial; text-align:center; padding:40px;">
// //                 <h1 style="color:#e74c3c;">❌ Registry Error</h1>
// //                 <p>Asset block identifier matching token <strong>${book_id}</strong> not found inside system catalog.</p>
// //             </div>
// //         `);
// //     }

// //     if (book.status !== 'available') {
// //         return res.status(400).send(`
// //             <div style="font-family:Arial; text-align:center; padding:40px;">
// //                 <h1 style="color:#e74c3c;">❌ Concurrency Collision</h1>
// //                 <p>The requested book asset signature is currently locked. State is already issued to another portal connection.</p>
// //             </div>
// //         `);
// //     }
// //     const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
    
// //     const issueDate = new Date();
// //     const dueDate = new Date();
// //     dueDate.setDate(issueDate.getDate() + 14);

// //     book.status = 'issued';
// //     student.borrowed_count++;

// //     const archiveNodeElement = {
// //         transaction_id: generatedTransactionID,
// //         student_id: student_id,
// //         book_id: book_id,
// //         title: book.title,
// //         issued_date: issueDate.toLocaleString(),
// //         due_date: dueDate.toLocaleDateString()
// //     };

// //     staticTransactionsArchive.push(archiveNodeElement);
// //     console.log(`📦 System State Registered Successfully! Txn Logged: ${generatedTransactionID}`);

// //     return res.status(200).send(`
// //         <div style="text-align:center; font-family:'Segoe UI',Arial; padding:50px; background:#f4f7f6; min-height:100vh; margin:0;">
// //             <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); max-width:450px; border-top: 8px solid #0f5a6e;">
// //                 <h1 style="color:#2ecc71; margin-top:0;">✅ Digital Book Issued</h1>
// //                 <p style="color:#666; font-size:14px;">Sir Syed University Smart Library automated system transaction processed safely without manual worker intervention loops.</p>
// //                 <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
// //                 <div style="text-align:left; font-size:15px; color:#333; line-height:2;">
// //                     <strong>Transaction ID:</strong> <span style="font-family:monospace; background:#e9ecef; padding:2px 6px; border-radius:4px;">${generatedTransactionID}</span><br>
// //                     <strong>Student Name:</strong> ${student.name}<br>
// //                     <strong>Book Title:</strong> ${book.title}<br>
// //                     <strong>Due Date Allocation:</strong> <span style="color:#e74c3c; font-weight:bold;">${dueDate.toLocaleDateString()}</span>
// //                 </div>
// //             </div>
// //         </div>
// //     `);
// // });

// // app.listen(NODE_PORT, NODE_SERVER_IP, () => {
// //     console.log(`\n🚀 SSUET Smart Library Static Backend Engine Online!`);
// //     console.log(`🔗 Local Endpoint API Access Hub: http://localhost:${NODE_PORT}`);
//  });


// app.listen(5000, () => {
//     console.log("Server running on http://localhost:5000");
// });


const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const sql = require("mssql");
const config = require("./dbConfig");

const app = express();
app.use(express.json());
app.use(cors()); 

const NODE_PORT = 5000;

const staticStudentsTable = {
    "CS-2023-001": { name: "Syed Mujtaba Ali", is_active: true, borrowed_count: 0 },
    "CS-2023-002": { name: "Bilal Ahmed Khan", is_active: true, borrowed_count: 3 }, 
    "CS-2023-003": { name: "Zainab Fatima", is_active: false, borrowed_count: 0 }    
};

const staticTransactionsArchive = [];
const loginLogTable = []; 

// 1. Get Login Logs from DB
app.get("/r", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM LoginLog');
        return res.json(result.recordset);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

// 2. Get All Books from DB table 'Book2'
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

// 3. Student Login
app.post('/api/login', (req, res) => {
    const { student_id } = req.body;

    if (!student_id) {
        return res.status(400).json({ success: false, message: "Error: Student ID missing!" });
    }

    if (staticStudentsTable[student_id]) {
        loginLogTable.push({ id: loginLogTable.length + 1, student_id: student_id });
        console.log(`🔑 Login Logged: Student ${student_id} successfully authenticated.`);
        
        return res.status(200).json({ 
            success: true, 
            message: "Login verified successfully!", 
            student_id: student_id 
        });
    } else {
        return res.status(404).json({ success: false, message: "Student record signature not found." });
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

    // Step A: Static Student Validations Check
    const student = staticStudentsTable[student_id];
    if (!student || !student.is_active) {
        return res.status(403).send(`
            <div style="font-family:Arial; text-align:center; padding:40px;">
                <h1 style="color:#e74c3c;">❌ Transaction Denied</h1>
                <p>Student system identity parameter profile is <strong>INACTIVE</strong> or Unauthorized.</p>
            </div>
        `);
    }

    if (student.borrowed_count >= 3) {
        return res.status(400).send(`
            <div style="font-family:Arial; text-align:center; padding:40px;">
                <h1 style="color:#e74c3c;">❌ Limit Violation</h1>
                <p>Constraint breached! Student reached maximum borrow limit capacity (Max 3 books).</p>
            </div>
        `);
    }

    // Step B: Real-time DB Queries Execution Loop
    try {
        let pool = await sql.connect(config);

        // Fetch book data directly from real SQL Server table Book2
        let result = await pool.request()
            .input("id", sql.VarChar, book_id)
            .query("SELECT * FROM Book2 WHERE id = @id");

        const book = result.recordset[0];

        // Validation 1: Check Book existence
        if (!book) {
            return res.status(404).send(`
                <div style="font-family:Arial; text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c;">❌ Registry Error</h1>
                    <p>Asset identifier token <strong>${book_id}</strong> not found inside database catalog.</p>
                </div>
            `);
        }

        // Validation 2: Check Book availability state
        if (book.status !== "available") {
            return res.status(400).send(`
                <div style="font-family:Arial; text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c;">❌ Concurrency Collision</h1>
                    <p>The requested book asset signature is currently locked. State is already issued to another user.</p>
                </div>
            `);
        }

        // Step C: Commit Phase Processing & Logging Updates
        const generatedTransactionID = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(issueDate.getDate() + 14);

        // Update SQL Server record matching table schema configuration definitions
        await pool.request()
            .input("id", sql.VarChar, book_id)
            .input("student", sql.VarChar, student_id)
            .query(`
                UPDATE Book2
                SET status='issued', borrower=@student, borrow_count = borrow_count + 1
                WHERE id=@id
            `);

        // Sync count mapping parameter locally
        student.borrowed_count++;

        // Cache historical state register metrics node element
        const archiveNodeElement = {
            transaction_id: generatedTransactionID,
            student_id: student_id,
            book_id: book_id,
            title: book.title, 
            issued_date: issueDate.toLocaleString(),
            due_date: dueDate.toLocaleDateString()
        };
        staticTransactionsArchive.push(archiveNodeElement);
        console.log(`📦 Database updated! State Registered Successfully! Txn Logged: ${generatedTransactionID}`);

        // Return clean success response receipt HTML block to viewport
        return res.status(200).send(`
            <div style="text-align:center; font-family:'Segoe UI',Arial; padding:50px; background:#f4f7f6; min-height:100vh; margin:0;">
                <div style="background:white; padding:40px; border-radius:12px; display:inline-block; box-shadow:0 10px 30px rgba(0,0,0,0.08); max-width:450px; border-top: 8px solid #0f5a6e;">
                    <h1 style="color:#2ecc71; margin-top:0;">✅ Digital Book Issued</h1>
                    <p style="color:#666; font-size:14px;">Sir Syed University Smart Library automated system transaction processed safely without manual worker intervention loops.</p>
                    <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
                    <div style="text-align:left; font-size:15px; color:#333; line-height:2;">
                        <strong>Transaction ID:</strong> <span style="font-family:monospace; background:#e9ecef; padding:2px 6px; border-radius:4px;">${generatedTransactionID}</span><br>
                        <strong>Student Name:</strong> ${student.name}<br>
                        <strong>Book Title:</strong> ${book.title}<br>
                        <strong>Due Date Allocation:</strong> <span style="color:#e74c3c; font-weight:bold;">${dueDate.toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `);

    } catch (err) {
        console.error("SQL Processing Exception: ", err);
        return res.status(500).send(`<h1>Database Transaction Error: ${err.message}</h1>`);
    }
});

// Clear Listener Registry Core App Entry
app.listen(5000, () => {
    console.log("Server running safely on http://localhost:5000");
});
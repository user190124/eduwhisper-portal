const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const multer = require('multer');
require('dotenv').config();

const app = express();

// ------------------ Middleware ------------------
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE"] }));
app.use(express.json({ limit: '10mb' })); // Increased limit for Base64 signatures

// ------------------ SQLite DB Setup ------------------
// RECOMMENDATION: If you get errors, delete 'eduwhisper.db' file to regenerate the table
const db = new Database('./eduwhisper.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentName TEXT,
    grade TEXT,
    subject TEXT,
    type TEXT,
    details TEXT,
    score INTEGER,                     
    teacherId TEXT,
    fileData BLOB,         
    attachmentType TEXT,
    isAcknowledged INTEGER DEFAULT 0,  
    parentSignature TEXT,              
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// ------------------ Auth Middleware (Mock) ------------------
const verifyToken = async (req, res, next) => {
  // Mock User for local development
  req.user = { uid: "local_teacher_123" }; 
  next();
};

// ------------------ Multer Setup ------------------
const upload = multer({ storage: multer.memoryStorage() });

// ------------------ Routes ------------------

app.get('/', (req, res) => res.send('EduWhisper Local Backend Running!'));

// ------------------ Get All Activities ------------------
app.get('/api/activities', verifyToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM activities ORDER BY timestamp DESC').all();

    const activities = rows.map(row => {
      let attachmentUrl = null;
      
      // Convert BLOB to Data URI for frontend to display images/pdfs
      if (row.fileData && row.attachmentType) {
        const base64 = row.fileData.toString('base64');
        attachmentUrl = `data:${row.attachmentType};base64,${base64}`;
      }

      // Remove raw binary data from response to keep it light
      const { fileData, ...rest } = row;
      return { ...rest, attachmentUrl };
    });

    res.json(activities);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------ Add Activity (Teacher) ------------------
app.post('/api/activities', verifyToken, upload.single('file'), async (req, res) => {
  try {
    // Multer puts form-data text fields in req.body
    let { studentName, grade, subject, type, details, score } = req.body;
    
    let fileBuffer = null;
    let mimeType = null;

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    }

    // --- DEBUGGING LOG ---
    // This will print to your VS Code terminal so you know what is being received
    console.log("Received Data:", { studentName, grade, type, subject, score });

    // Validation: Ensure required fields exist
    if (!studentName || !grade || !type) {
      console.error("Missing Fields:", { studentName, grade, type });
      return res.status(400).json({ 
        message: "Missing required fields", 
        received: { studentName, grade, type } 
      });
    }

    const stmt = db.prepare(`
      INSERT INTO activities 
      (studentName, grade, subject, type, details, score, teacherId, fileData, attachmentType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      studentName, 
      grade, 
      subject || "General", // Default subject if missing
      type, 
      details || "",
      score || null, 
      req.user.uid, 
      fileBuffer, 
      mimeType
    );

    res.status(201).json({ id: info.lastInsertRowid, message: "Activity saved successfully" });

  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ message: "Failed to save activity", error: err.message });
  }
});

// ------------------ Acknowledge Activity (Parent) ------------------
app.put('/api/activities/:id/acknowledge', verifyToken, (req, res) => {
  try {
    const stmt = db.prepare('UPDATE activities SET isAcknowledged = 1 WHERE id = ?');
    const info = stmt.run(req.params.id);

    if (info.changes === 0) return res.status(404).json({ message: "Activity not found" });

    res.json({ success: true, message: "Activity acknowledged" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ Sign Permission Slip (Parent) ------------------
app.put('/api/activities/:id/sign', verifyToken, (req, res) => {
  const { signature } = req.body; // Expecting Base64 string

  if (!signature) {
    return res.status(400).json({ message: "Signature data missing" });
  }

  try {
    const stmt = db.prepare(`
      UPDATE activities 
      SET parentSignature = ?, isAcknowledged = 1 
      WHERE id = ?
    `);
    const info = stmt.run(signature, req.params.id);

    if (info.changes === 0) return res.status(404).json({ message: "Activity not found" });

    res.json({ success: true, message: "Permission slip signed successfully" });
  } catch (err) {
    console.error("SIGN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------ Export Server ------------------
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
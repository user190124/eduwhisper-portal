const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const multer = require('multer');
require('dotenv').config();

const app = express();

// ------------------ Middleware ------------------
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE"] }));
app.use(express.json({ limit: '10mb' }));

// ------------------ SQLite DB Setup ------------------
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
    maxPoints INTEGER,                 
    dueDate TEXT,                      
    teacherId TEXT,
    fileData BLOB,         
    attachmentType TEXT,
    isAcknowledged INTEGER DEFAULT 0,  
    parentSignature TEXT,              
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const verifyToken = async (req, res, next) => {
  req.user = { uid: "local_teacher_123" }; 
  next();
};

const upload = multer({ storage: multer.memoryStorage() });

// ------------------ Routes ------------------

app.get('/', (req, res) => res.send('EduWhisper Local Backend Running!'));

// 1. GET: Fetch all activities
app.get('/api/activities', verifyToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM activities ORDER BY timestamp DESC').all();
    const activities = rows.map(row => {
      let attachmentUrl = null;
      if (row.fileData && row.attachmentType) {
        const base64 = row.fileData.toString('base64');
        attachmentUrl = `data:${row.attachmentType};base64,${base64}`;
      }
      const { fileData, ...rest } = row;
      return { ...rest, attachmentUrl };
    });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Create New Activity
app.post('/api/activities', verifyToken, upload.single('file'), (req, res) => {
  try {
    let { studentName, grade, subject, type, details, score, maxPoints, dueDate } = req.body;
    
    // Validation
    if (!studentName || !grade || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let fileBuffer = null;
    let mimeType = null;
    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    }

    const stmt = db.prepare(`
      INSERT INTO activities 
      (studentName, grade, subject, type, details, score, maxPoints, dueDate, teacherId, fileData, attachmentType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      studentName, grade, subject || "General", type, details || "",
      score || null, maxPoints || null, dueDate || null, 
      req.user.uid, fileBuffer, mimeType
    );

    res.status(201).json({ id: info.lastInsertRowid, message: "Activity saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save", error: err.message });
  }
});

// 3. PUT: Update Existing Activity (NEW FEATURE)
app.put('/api/activities/:id', verifyToken, upload.single('file'), (req, res) => {
  try {
    const { studentName, grade, subject, type, details, score, maxPoints, dueDate } = req.body;
    const id = req.params.id;

    let sql, params;

    // If a new file is uploaded, update the BLOB data too
    if (req.file) {
       sql = `UPDATE activities SET studentName=?, grade=?, subject=?, type=?, details=?, score=?, maxPoints=?, dueDate=?, fileData=?, attachmentType=? WHERE id=?`;
       params = [studentName, grade, subject, type, details, score, maxPoints, dueDate, req.file.buffer, req.file.mimetype, id];
    } else {
       // Keep existing file data
       sql = `UPDATE activities SET studentName=?, grade=?, subject=?, type=?, details=?, score=?, maxPoints=?, dueDate=? WHERE id=?`;
       params = [studentName, grade, subject, type, details, score, maxPoints, dueDate, id];
    }

    const info = db.prepare(sql).run(...params);

    if (info.changes === 0) return res.status(404).json({ message: "Activity not found" });
    res.json({ success: true, message: "Activity updated successfully" });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. POST: Bulk Activities
app.post('/api/activities/bulk', verifyToken, (req, res) => {
  try {
    const activities = req.body;
    const insertMany = db.transaction((items) => {
      const stmt = db.prepare(`
        INSERT INTO activities (studentName, grade, subject, type, details, teacherId)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const item of items) {
        stmt.run(item.studentName, item.grade, "General", "Attendance", item.details, req.user.uid);
      }
    });
    insertMany(activities);
    res.json({ success: true, message: `Logged ${activities.length} records.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE: Remove Activity
app.delete('/api/activities/:id', verifyToken, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM activities WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ message: "Activity not found" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
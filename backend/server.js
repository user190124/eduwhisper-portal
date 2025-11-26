// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();

// Allow requests from your Vercel frontend
app.use(cors({
  origin: "*", // We will tighten this later, or use "*" for testing
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
// We connect inside the request handler for Serverless environments to avoid timeout
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI); // We will set this in Vercel
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
};

// --- FIREBASE ADMIN SETUP (Cloud Compatible) ---
// Instead of a file, we read the keys from Environment Variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel stores newlines as literal "\n", we must fix them
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), 
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

// ... (Keep your Schema Definitions: ActivitySchema, etc. here) ...
const ActivitySchema = new mongoose.Schema({
  studentName: String,
  grade: String,
  type: { type: String, enum: ['Attendance', 'Task', 'Note'] },
  details: String,
  teacherId: String,
  attachmentUrl: String,
  attachmentType: String,
  timestamp: { type: Date, default: Date.now }
});
const Activity = mongoose.model('Activity', ActivitySchema);

// Middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decodeValue = await admin.auth().verifyIdToken(token);
    req.user = decodeValue;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// --- ROUTES ---
// Wrap routes in DB connection check
app.get('/api/activities', verifyToken, async (req, res) => {
  await connectDB();
  try {
    const activities = await Activity.find().sort({ timestamp: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activities', verifyToken, async (req, res) => {
  await connectDB();
  try {
    const newActivity = new Activity({ ...req.body, teacherId: req.user.uid });
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('EduWhisper Backend is Running!'));

// Export the app for Vercel
module.exports = app;

// Only listen if running locally
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
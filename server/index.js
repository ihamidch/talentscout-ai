const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const Application = require('./models/Application');
const User = require('./models/User');
const auth = require('./middleware/auth'); 
const authRoutes = require('./routes/auth');

const app = express();

// --- Middleware ---
// Reflects browser origin so the Vite app (any *.vercel.app or CLIENT_URL) can call this API.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🚀 Neural Sync: MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

const upload = multer({ storage: multer.memoryStorage() });

// --- Email Transporter Setup ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Your 16-character App Password
  }
});

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);

/**
 * --- 1. TEST SEED (Updated for Neural Chips) ---
 */
app.get('/api/applications/test-seed', async (req, res) => {
  try {
    const testUser = await User.findOne({ role: 'candidate' });
    if (!testUser) return res.status(404).send("No candidates found.");

    const seedApp = new Application({
      candidate: testUser._id,
      job: new mongoose.Types.ObjectId(),
      resumeUrl: "uploads/manual_seed_test.pdf",
      aiAnalysis: {
        score: 95,
        summary: "Neural Seed Successful. Logic verified.",
        matched_skills: ["Node.js", "React", "MongoDB"], 
        missing_skills: ["Docker", "Kubernetes"]
      },
      status: 'pending'
    });

    await seedApp.save();
    res.send(`✅ Success: Application created for ${testUser.name}. Check Dashboard!`);
  } catch (err) {
    res.status(500).send("Seed Error: " + err.message);
  }
});

/**
 * --- 2. POST: APPLY & ANALYZE (Syncs with Python AI) ---
 */
app.post('/api/applications/apply', auth, upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription, jobId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No resume uploaded" });

    const pythonFormData = new FormData();
    pythonFormData.append('resume', req.file.buffer, { filename: req.file.originalname });
    pythonFormData.append('jobDescription', jobDescription || "General Application");

    let aiData = { score: 0, summary: "AI Offline", matched_skills: [], missing_skills: [] };

    const aiEngineBase =
      (process.env.AI_ENGINE_URL || 'http://localhost:8000').replace(/\/$/, '');

    try {
      const aiResponse = await axios.post(`${aiEngineBase}/analyze-resume`, pythonFormData, {
        headers: { ...pythonFormData.getHeaders() },
        timeout: 15000 
      });
      aiData = aiResponse.data.matchScore || aiResponse.data;
    } catch (aiErr) {
      console.error("⚠️ AI Bridge Failed - Using fallback metrics");
    }

    const newApplication = new Application({
      candidate: req.user.id, 
      job: jobId || new mongoose.Types.ObjectId(), 
      resumeUrl: `uploads/${req.file.originalname}`,
      aiAnalysis: {
        score: aiData.score || 0,
        summary: aiData.summary || "Manual review required.",
        matched_skills: aiData.matched_skills || [], 
        missing_skills: aiData.missing_skills || []  
      },
      status: 'pending' 
    });

    await newApplication.save();
    res.json({ success: true, aiAnalysis: newApplication.aiAnalysis });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * --- 3. GET: FETCH ALL (Recruiter Feed) ---
 */
app.get('/api/applications/all', auth, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('candidate', 'name email') 
      .sort({ createdAt: -1 })
      .lean();
    
    const cleanData = applications.filter(app => app.candidate !== null);
    console.log(`📥 Feed Sync: Sending ${cleanData.length} candidates to Dashboard.`);
    res.json(cleanData);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

/**
 * --- 4. PATCH: UPDATE STATUS & SEND NOTIFICATION ---
 * Fixes Mongoose Warning by using 'returnDocument'
 */
app.patch('/api/applications/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { returnDocument: 'after' } // ✅ FIXED: Deprecation warning resolved
    ).populate('candidate', 'name email');

    if (!updatedApp) return res.status(404).json({ message: "Application not found" });

    // 📧 Automated Outreach Logic
    if (status === 'shortlisted' || status === 'rejected') {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: updatedApp.candidate.email,
        subject: `Update: Your Application Status is ${status.toUpperCase()}`,
        text: `Hi ${updatedApp.candidate.name},\n\nYour application status for Talent Scout Pro has been updated to: ${status}.\n\nBest regards,\nThe Recruitment Team`
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.log("📧 Mail Error:", err.message);
        else console.log("📧 Success: Email dispatched to " + updatedApp.candidate.email);
      });
    }

    res.json(updatedApp);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

/**
 * --- 5. DELETE: REMOVE APPLICATION ---
 */
app.delete('/api/applications/:id', auth, async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`✅ Pipeline active on Port ${PORT}`));
}

module.exports = app;
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
const connectDB = require('./db');

const app = express();

// --- Middleware ---
// Reflects browser origin so the Vite app (any *.vercel.app or CLIENT_URL) can call this API.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB: lazy connect via connectDB() (serverless-safe). No fire-and-forget connect here.

// Vercel request bodies are capped (~4.5 MB); reject early with a clear message.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

function uploadResume(req, res, next) {
  upload.single("resume")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Resume file is too large (max 4 MB)." });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  });
}

function normalizeSkillList(value) {
  if (value == null) return [];
  const arr = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return arr.map((x) => (x == null ? "" : String(x))).filter((s) => s.length > 0);
}

function normalizeScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function normalizeSummary(s) {
  const t = s == null ? "" : String(s);
  return t.slice(0, 8000);
}

// --- Email Transporter Setup ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Your 16-character App Password
  }
});

// --- Routes ---
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    mongoConfigured: !!process.env.MONGO_URI,
    jwtConfigured: !!process.env.JWT_SECRET,
  }),
);

/** Ensure DB before any /api route except GET /api/health */
async function ensureDb(req, res, next) {
  const pathOnly = req.originalUrl.split('?')[0];
  if (req.method === 'GET' && pathOnly === '/api/health') {
    return next();
  }
  // Docs-only GET; no DB needed (POST /api/applications/apply does the real work)
  if (req.method === 'GET' && pathOnly === '/api/applications/apply') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('ensureDb:', err.message);
    const hint =
      err.code === 'NO_MONGO_URI'
        ? 'Add MONGO_URI in Vercel → Environment Variables for this project.'
        : 'Check MONGO_URI (Atlas IP allowlist includes 0.0.0.0/0 for Vercel).';
    res.status(503).json({
      message: 'Database unavailable',
      hint,
      detail: process.env.VERCEL ? undefined : err.message,
    });
  }
}

app.use(ensureDb);

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
 * --- 2. APPLY & ANALYZE (Syncs with Python AI) ---
 * GET is only for humans/docs — the real endpoint is POST (multipart + JWT).
 */
app.get('/api/applications/apply', (req, res) => {
  res.status(405).json({
    message: 'Method Not Allowed',
    hint:
      'Use POST with Authorization: Bearer <token>, multipart/form-data, field "resume" (file), plus jobDescription and jobId. Open the TalentScout web app to apply — do not visit this URL in the browser.',
  });
});

app.post('/api/applications/apply', auth, uploadResume, async (req, res) => {
  try {
    const { jobDescription, jobId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No resume uploaded" });

    const rawUserId = req.user && req.user.id;
    if (!rawUserId || !mongoose.Types.ObjectId.isValid(String(rawUserId))) {
      return res.status(401).json({ message: "Invalid user id in token" });
    }
    const candidateId = new mongoose.Types.ObjectId(String(rawUserId));

    const jobObjectId =
      jobId && mongoose.Types.ObjectId.isValid(jobId)
        ? new mongoose.Types.ObjectId(jobId)
        : new mongoose.Types.ObjectId();

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
      const body = aiResponse.data;
      if (body && typeof body === "object" && !Array.isArray(body)) {
        const payload = body.matchScore != null ? body.matchScore : body;
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          aiData = { ...aiData, ...payload };
        }
      }
    } catch (aiErr) {
      console.error("⚠️ AI Bridge Failed - Using fallback metrics");
    }

    const matched = normalizeSkillList(aiData.matched_skills || aiData.skillsMatch);
    const missing = normalizeSkillList(aiData.missing_skills);
    const aiAnalysisPayload = {
      score: normalizeScore(aiData.score),
      summary: normalizeSummary(aiData.summary || "Manual review required."),
      matched_skills: matched,
      missing_skills: missing,
      skillsMatch: matched,
      experienceLevel: normalizeSummary(
        aiData.experienceLevel != null && aiData.experienceLevel !== ""
          ? aiData.experienceLevel
          : "Detecting...",
      ).slice(0, 200),
    };

    const setPayload = {
      job: jobObjectId,
      resumeUrl: `uploads/${req.file.originalname}`,
      aiAnalysis: aiAnalysisPayload,
      status: "pending",
    };

    // Unique index on (job, candidate): upsert; retry once on rare E11000 race.
    let application;
    try {
      application = await Application.findOneAndUpdate(
        { job: jobObjectId, candidate: candidateId },
        { $set: setPayload },
        { new: true, upsert: true, runValidators: true },
      );
    } catch (e) {
      if (e.code === 11000) {
        application = await Application.findOneAndUpdate(
          { job: jobObjectId, candidate: candidateId },
          { $set: setPayload },
          { new: true },
        );
      } else {
        throw e;
      }
    }

    if (!application) {
      return res.status(500).json({ message: "Could not save application" });
    }

    res.json({ success: true, aiAnalysis: application.aiAnalysis });
  } catch (err) {
    console.error("POST /api/applications/apply:", err);
    const hint =
      err.name === "ValidationError" || err.name === "CastError"
        ? "Invalid data from AI or upload; try again."
        : undefined;
    res.status(500).json({
      message: "Internal Server Error",
      ...(hint && { hint }),
      ...(process.env.VERCEL ? { reason: err.name } : { detail: err.message }),
    });
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
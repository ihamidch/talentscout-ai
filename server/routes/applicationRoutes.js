const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const mongoose = require('mongoose');
const FormData = require('form-data');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// --- POST: APPLY & ANALYZE (Candidate Flow) ---
router.post('/apply', protect, authorize('candidate'), upload.single('resume'), async (req, res) => {
    try {
        const { jobDescription, jobId } = req.body;
        if (!req.file) return res.status(400).json({ message: "No resume uploaded" });

        // 1. Prepare Bridge to Python AI Engine (FastAPI)
        const pythonFormData = new FormData();
        pythonFormData.append('resume', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        pythonFormData.append('jobDescription', jobDescription || "General Application");

        // Default analysis if AI is offline
        let aiResult = { score: 0, summary: "Analysis pending (AI Engine was offline during upload)", missing_skills: [] };

        try {
            const aiResponse = await axios.post('http://localhost:8000/analyze-resume', pythonFormData, {
                headers: { ...pythonFormData.getHeaders() },
                timeout: 15000 // 15 second limit
            });
            // Handle different FastAPI response structures
            aiResult = aiResponse.data.matchScore || aiResponse.data;
        } catch (aiErr) {
            console.error("⚠️ AI Bridge Sync Failed - Saving application with fallback data.");
        }

        // 2. Create Application with explicit ObjectId casting
        // This ensures "mota" is correctly linked to their User profile
        const newApp = new Application({
            job: jobId && mongoose.Types.ObjectId.isValid(jobId) ? new mongoose.Types.ObjectId(jobId) : null, 
            candidate: new mongoose.Types.ObjectId(req.user.id), 
            resumeUrl: req.file.originalname, 
            aiAnalysis: {
                score: typeof aiResult.score === 'number' ? aiResult.score : (parseInt(aiResult.score) || 0),
                summary: aiResult.summary || "No summary generated",
                skillsMatch: aiResult.missing_skills || aiResult.skillsMatch || [] 
            }
        });

        await newApp.save();
        
        console.log(`✅ Application Pipeline Node Created: ${req.user.id}`);
        res.json({ success: true, aiAnalysis: newApp.aiAnalysis });

    } catch (error) {
        console.error("❌ Application Fatal Error:", error.message);
        res.status(500).json({ message: "Neural Pipeline Interrupted." });
    }
});

// --- GET: FETCH ALL (Recruiter Dashboard Feed) ---
router.get('/all', protect, authorize('recruiter'), async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('candidate', 'name email') // 🔥 This connects the ID to "mota" or "ali"
            .sort({ createdAt: -1 })
            .lean(); // Faster performance for read-only dashboard

        // Logs to your terminal so you can verify the data linkage
        console.log(`📥 Pipeline Feed: Found ${applications.length} active nodes.`);
        
        res.json(applications);
    } catch (error) {
        console.error("❌ Dashboard Sync Error:", error.message);
        res.status(500).json({ message: "Failed to load dynamic candidate feed." });
    }
});

// --- PATCH: UPDATE STATUS ---
router.patch('/:id/status', protect, authorize('recruiter'), async (req, res) => {
    try {
        const { status } = req.body;
        const updatedApp = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(updatedApp);
    } catch (err) {
        res.status(400).json({ message: "Node status update failed." });
    }
});

// --- DELETE: PURGE IDENTITY ---
router.delete('/:id', protect, authorize('recruiter'), async (req, res) => {
    try {
        await Application.findByIdAndDelete(req.params.id);
        res.json({ message: "Identity Purged" });
    } catch (err) {
        res.status(500).json({ message: "Purge Failed" });
    }
});
// TEMP: Create a fake application for Ali/Mota to test the dashboard
router.get('/test-seed', async (req, res) => {
    try {
        const User = require('../models/User');
        const testUser = await User.findOne({ role: 'candidate' }); // Finds Ali or Mota

        if (!testUser) return res.send("No candidates found in DB. Register one first!");

        const seedApp = new Application({
            job: new mongoose.Types.ObjectId(),
            candidate: testUser._id,
            resumeUrl: "manual_test.pdf",
            aiAnalysis: {
                score: 92,
                summary: "Manual seed successful. System is operational.",
                skillsMatch: ["Testing", "Debugging"]
            }
        });

        await seedApp.save();
        res.send(`✅ Test application created for ${testUser.name}! Now refresh your dashboard.`);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
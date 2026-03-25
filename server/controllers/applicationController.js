// server/controllers/applicationController.js
const Application = require('../models/Application');

// ✅ This function talks to MongoDB and sends data to React
exports.getAllApplications = async (req, res) => {
  try {
    // .populate('candidate', 'name email') is the "Magic" 
    // It swaps the User ID for the actual Name and Email from the User model
    const applications = await Application.find()
      .populate('candidate', 'name email') 
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${applications.length} applications in DB`);
    res.json(applications);
  } catch (err) {
    console.error("❌ Controller Error:", err.message);
    res.status(500).json({ message: "Server Error: Could not fetch candidates." });
  }
};
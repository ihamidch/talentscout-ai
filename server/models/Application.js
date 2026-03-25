const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  // 🔥 CRITICAL: ref must match the string in your User model (usually 'User')
  candidate: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  resumeUrl: String,
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected'],
    default: 'pending'
  },
  aiAnalysis: {
    score: { type: Number, default: 0 },
    summary: { type: String, default: "Analysis in progress..." },
    skillsMatch: { type: [String], default: [] },
    experienceLevel: { type: String, default: "Detecting..." }
  },
  createdAt: { type: Date, default: Date.now }
});

// Prevent "mota" from applying to the same job twice
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
const axios = require('axios');
const FormData = require('form-data');

/**
 * Communicates with the Python AI Engine (FastAPI) 
 * Normalizes data to prevent "Sync Fragmented" errors in the Dashboard.
 */
const analyzeWithAI = async (fileBuffer, fileName, jobDescription) => {
    const form = new FormData();
    const AI_URL = "http://localhost:8000/analyze-resume"; 

    // 1. Prepare Multipart Form Data
    form.append('resume', fileBuffer, {
        filename: fileName,
        contentType: 'application/pdf',
    });
    
    form.append('jobDescription', jobDescription || "General Application");

    try {
        // 2. Call Python AI (Llama 3.3 Engine)
        const response = await axios.post(AI_URL, form, {
            headers: { ...form.getHeaders() },
            timeout: 30000 // 30s timeout for heavy AI processing
        });
        
        // 3. DATA NORMALIZATION
        // Handles multiple possible response formats from FastAPI
        const rawData = response.data.matchScore || response.data;

        return {
            // Ensure score is always a Number
            score: typeof rawData.score === 'number' ? rawData.score : (parseInt(rawData.score) || 0),
            
            // Ensure summary is never empty
            summary: rawData.summary || "Neural analysis complete. Identity verified.",
            
            // Map FastAPI 'missing_skills' or 'skills' to Schema 'skillsMatch'
            skillsMatch: Array.isArray(rawData.missing_skills) ? rawData.missing_skills : 
                         Array.isArray(rawData.skills) ? rawData.skills : 
                         Array.isArray(rawData.skillsMatch) ? rawData.skillsMatch : [],
            
            // Add experienceLevel if provided by AI
            experienceLevel: rawData.experienceLevel || "Level Detected"
        };

    } catch (error) {
        console.error("❌ Neural Bridge Failure:", error.message);
        
        // CRITICAL: Return a safe fallback object so the DB record isn't broken
        // This prevents "mota" from disappearing due to a crashed AI request
        return {
            score: 0,
            summary: "Neural Sync Failed. Port 8000 was unreachable during application.",
            skillsMatch: [],
            experienceLevel: "Offline"
        };
    }
};

module.exports = { analyzeWithAI };
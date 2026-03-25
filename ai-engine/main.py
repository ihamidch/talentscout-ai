import os
import uvicorn
import fitz  # PyMuPDF
# 
import json
import re
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq

# 1. Load Environment Variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")

# Initialize Groq
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

app = FastAPI(title="Talent Scout Pro AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(pdf_bytes):
    text = ""
    try:
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        return text
    except Exception as e:
        print(f"❌ PDF Error: {e}")
        return ""

@app.post("/analyze-resume")
async def analyze_resume(resume: UploadFile = File(...), jobDescription: str = Form(...)):
    if not client:
        return {"matchScore": {"score": 0, "summary": "Groq API Key missing.", "matched_skills": [], "missing_skills": []}}

    pdf_content = await resume.read()
    resume_text = extract_text_from_pdf(pdf_content)

    if len(resume_text.strip()) < 50:
        return {"matchScore": {"score": 5, "summary": "Resume unreadable. Please upload a text-based PDF.", "matched_skills": [], "missing_skills": []}}

    # 2. Updated Prompt for Dual-Skill Extraction
    # 
    prompt = f"""
    Analyze this RESUME against the JOB DESCRIPTION.
    
    JD: {jobDescription}
    RESUME: {resume_text}
    
    Return a JSON object with:
    1. "score": (0-100)
    2. "summary": (2 concise sentences)
    3. "matched_skills": (Top 5 technical skills found in BOTH JD and Resume)
    4. "missing_skills": (Top 5 technical skills found in JD but NOT in Resume)
    
    JSON Format Example:
    {{
        "score": 85,
        "summary": "Excellent match for DevOps role. Candidate has strong Kubernetes skills but lacks specific Terraform experience.",
        "matched_skills": ["Docker", "Kubernetes", "CI/CD", "Linux", "Python"],
        "missing_skills": ["Terraform", "AWS S3", "Ansible"]
    }}
    """

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "system", "content": "You are a technical recruiter. Output ONLY JSON."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        # Parse the AI response
        ai_response = json.loads(completion.choices[0].message.content)
        
        # Ensure all fields exist to prevent Node.js crashes
        final_data = {
            "score": ai_response.get("score", 0),
            "summary": ai_response.get("summary", "Analysis complete."),
            "matched_skills": ai_response.get("matched_skills", []),
            "missing_skills": ai_response.get("missing_skills", [])
        }
        
        print(f"✅ AI Analysis complete for: {resume.filename}")
        return {"matchScore": final_data}

    except Exception as e:
        print(f"❌ AI Analysis Failed: {e}")
        return {
            "matchScore": {
                "score": 0, 
                "summary": "AI Engine encountered an error during processing.", 
                "matched_skills": [], 
                "missing_skills": []
            }
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
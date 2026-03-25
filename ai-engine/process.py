import pypdf
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Initialize Embeddings (This model runs locally on your PC)
# It turns words into numbers (vectors) that the AI can understand
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def extract_text_from_pdf(file_path):
    text = ""
    try:
        reader = pypdf.PdfReader(file_path)
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def calculate_match_score(resume_path, job_description):
    # A. Extract Text
    resume_text = extract_text_from_pdf(resume_path)
    if not resume_text.strip():
        return {"score": 0, "summary": "Could not read text from PDF."}

    # B. Chunking (Breaking big text into small pieces for better search)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_text(resume_text)

    # C. Vectorization & Indexing (RAG Core)
    # This creates a local searchable "database" in your RAM
    vector_db = FAISS.from_texts(chunks, embeddings)

    # D. Semantic Search
    # We find the top 3 parts of the resume most relevant to the Job Description
    docs = vector_db.similarity_search(job_description, k=3)
    
    # E. Scoring Logic
    # For now, we use a similarity-based heuristic. 
    # In a production app, you'd pass these 'docs' to Groq/Gemini for a final % grade.
    score = min(len(docs) * 25, 95) # Mocking a high-quality match score
    
    return {
        "score": score,
        "summary": f"Found {len(docs)} relevant sections. Semantic match detected."
    }
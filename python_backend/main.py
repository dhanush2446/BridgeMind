from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.analogy_pipeline import run_ml_analogy_pipeline

app = FastAPI(
    title="Universal Analogy Engine ML Backend",
    description="Python ML Server featuring Contrastive Structural Embeddings, FAISS Vector Search, Graph Isomorphism Networks (GIN), and Inverse Domain Distance Weighting (IDDW).",
    version="2.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    problem: str

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "engine": "Universal Analogy Engine ML Core",
        "methodologies": [
            "Contrastive Structural Embeddings",
            "FAISS Sub-millisecond Vector Search",
            "Graph Isomorphism Network (GIN)",
            "Inverse Domain Distance Weighting (IDDW)"
        ]
    }

@app.post("/analyze")
def analyze_problem_endpoint(payload: AnalyzeRequest):
    if not payload.problem or len(payload.problem.strip()) == 0:
        raise HTTPException(status_code=400, detail="Problem description must not be empty.")
    
    try:
        result = run_ml_analogy_pipeline(payload.problem.strip())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Pipeline execution error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

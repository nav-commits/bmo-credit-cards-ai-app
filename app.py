from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_pipeline import BmoRAG



# Initialize FastAPI app
app = FastAPI()

# Initialize RAG pipeline
rag = BmoRAG()

# Allow all CORS (for frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the input model
class Question(BaseModel):
    query: str

# POST /ask endpoint
@app.post("/ask")
def ask_question(q: Question):
    answer = rag.ask(q.query)
    return {"answer": answer}

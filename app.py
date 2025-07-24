from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth
from rag_pipeline import BmoRAG


# Initialize Firebase Admin
cred = credentials.Certificate("service-account.json")
firebase_admin.initialize_app(cred)

# Initialize FastAPI app
app = FastAPI()

# Initialize RAG pipeline
rag = BmoRAG()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model
class Question(BaseModel):
    query: str

# 🔐 Token verification dependency
def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    id_token = auth_header.split(" ")[1]

    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token 
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# 🔒 Secure endpoint
@app.post("/ask")
def ask_question(q: Question, user=Depends(verify_token)):
    answer = rag.ask(q.query)
    return {"answer": answer}

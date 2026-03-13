# 🧠 BMO RAG Assistant

This is a simple **RAG (Retrieval-Augmented Generation)** application that uses a **FastAPI backend** and a **React + TypeScript + Tailwind CSS** frontend built with **Vite**.

The AI assistant scrapes content from the BMO Credit Card webpage, stores embeddings in a **FAISS vector store**, and answers questions based on this saved knowledge.


---

## 📦 Tech Stack

### Backend (Python)
- FastAPI
- Langchain
- FAISS (vector store)
- HuggingFace Transformers (GPT-2)
- Sentence Transformers (`all-MiniLM-L6-v2`)
- WebBaseLoader (HTML scraping)
- Python Dotenv
- **Firebase Admin SDK for Authentication**

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite
- **Firebase Authentication**

---

## ⚙️ Features

- Retrieves and embeds content from: [https://www.bmo.com/main/personal/credit-cards/](https://www.bmo.com/main/personal/credit-cards/)
- Uses HuggingFace GPT-2 to generate answers based on retrieved context.
- Saves vector data using FAISS (locally).
- API endpoint: `POST /ask` – Accepts a query and returns an AI-generated answer.
- **Secure backend endpoints with Firebase Authentication.**
- Frontend **sends Firebase ID token as Bearer token** in requests to protected backend API.

---

## 🔒 Authentication & Security

- Backend endpoints are protected using Firebase Admin SDK.  
- Each request to `/ask` must include a valid Firebase ID token in the `Authorization` header:  
  `Authorization: Bearer <firebase-id-token>`

- Backend verifies the token to ensure only authenticated users can access the AI assistant.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nav-commits/bmo-rag-assistant.git
cd bmo-rag-app

# 🧠 BMO RAG Assistant

This is a simple **RAG (Retrieval-Augmented Generation)** application that uses a **FastAPI backend** and a **React + TypeScript + Tailwind CSS** frontend built with **Vite**.

The AI assistant scrapes content from the BMO Credit Card webpage, stores embeddings in a **FAISS vector store**, and answers questions based on this saved knowledge.
<img width="2202" height="1145" alt="Screenshot 2025-07-24 at 12 28 16 PM" src="https://github.com/user-attachments/assets/697842d2-e0ed-412d-b2cd-c324890d4f94" />
<img width="767" height="1147" alt="Screenshot 2025-07-24 at 12 28 33 PM" src="https://github.com/user-attachments/assets/9c041cba-d928-425c-963f-d5a1e472ad32" />


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

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

---

## ⚙️ Features

- Retrieves and embeds content from: [https://www.bmo.com/main/personal/credit-cards/](https://www.bmo.com/main/personal/credit-cards/)
- Uses HuggingFace GPT-2 to generate answers based on retrieved context.
- Saves vector data using FAISS (locally).
- API endpoint: `POST /ask` – Accepts a query and returns an AI-generated answer.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/bmo-rag-assistant.git
cd bmo-rag-app


import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Safely get the API key
api_key = os.getenv("API_KEY")

# You can now use `api_key` where needed securely
from transformers import pipeline
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.llms import HuggingFacePipeline

class BmoRAG:
    def __init__(self):
        self.vector_path = "vector_store"
        self.embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

        # Use HuggingFace GPT-2 text generation
        hf_pipeline = pipeline(
            "text-generation",
            model="gpt2",
            max_new_tokens=100,
            do_sample=True,
            temperature=0.7,
        )
        self.llm = HuggingFacePipeline(pipeline=hf_pipeline)

        # Load or build vector store
        if os.path.exists(self.vector_path):
            print("🔁 Loading existing vector store...")
            self.vector_store = FAISS.load_local(
                self.vector_path,
                self.embedding,
                allow_dangerous_deserialization=True,
            )
        else:
            print("⚙️ Building new vector store from BMO site...")
            self._build_vector_store()

    def _build_vector_store(self):
        url = "https://www.bmo.com/main/personal/credit-cards/"
        loader = WebBaseLoader(url)
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        docs = splitter.split_documents(documents)

        self.vector_store = FAISS.from_documents(docs, self.embedding)
        self.vector_store.save_local(self.vector_path)
        print("✅ Vector store created and saved!")

    def ask(self, query: str) -> str:
        retriever = self.vector_store.as_retriever()

        # Prompt template
        template = """
You are a helpful assistant specializing in BMO banking information.
Answer the question below clearly and concisely using the given context.

Context:
{context}

Question:
{question}

Answer:
"""

        prompt = PromptTemplate(
            input_variables=["context", "question"],
            template=template,
        )

        # Create QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=retriever,
            return_source_documents=False,
            chain_type_kwargs={"prompt": prompt},
        )

        # Use correct key name
        result = qa_chain({"query": query})  # Use "query" for RetrievalQA
        answer = result["result"].strip()

        # Clean up
        if "Answer:" in answer:
            answer = answer.split("Answer:")[-1].strip()

        return answer

import os
from dotenv import load_dotenv
from transformers import pipeline
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.llms import HuggingFacePipeline

# Load environment variables
load_dotenv()
api_key = os.getenv("API_KEY")  # currently unused, but securely loaded

class BmoRAG:
    VECTOR_PATH = "vector_store"
    EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
    TEXT_GEN_MODEL = "gpt2"
    TEXT_GEN_MAX_TOKENS = 100
    TEXT_GEN_TEMP = 0.7
    BMO_URL = "https://www.bmo.com/main/personal/credit-cards/"
    CHUNK_SIZE = 500
    CHUNK_OVERLAP = 50

    PROMPT_TEMPLATE = """
You are a helpful assistant specializing in BMO banking information.
Answer the question below clearly and concisely using the given context.

Context:
{context}

Question:
{question}

Answer:
"""

    def __init__(self):
        # Embeddings
        self.embedding = HuggingFaceEmbeddings(model_name=self.EMBEDDING_MODEL)

        # LLM pipeline
        hf_pipeline = pipeline(
            "text-generation",
            model=self.TEXT_GEN_MODEL,
            max_new_tokens=self.TEXT_GEN_MAX_TOKENS,
            do_sample=True,
            temperature=self.TEXT_GEN_TEMP,
        )
        self.llm = HuggingFacePipeline(pipeline=hf_pipeline)

        # Load or build vector store
        if os.path.exists(self.VECTOR_PATH):
            print("🔁 Loading existing vector store...")
            self.vector_store = FAISS.load_local(
                self.VECTOR_PATH,
                self.embedding,
                allow_dangerous_deserialization=True,
            )
        else:
            print("⚙️ Building new vector store from BMO site...")
            self._build_vector_store()

        # Initialize QA chain once
        retriever = self.vector_store.as_retriever()
        prompt = PromptTemplate(input_variables=["context", "question"], template=self.PROMPT_TEMPLATE)
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=retriever,
            return_source_documents=False,
            chain_type_kwargs={"prompt": prompt},
        )

    def _build_vector_store(self):
        """Load documents from BMO website, split into chunks, and create FAISS vector store."""
        loader = WebBaseLoader(self.BMO_URL)
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(chunk_size=self.CHUNK_SIZE, chunk_overlap=self.CHUNK_OVERLAP)
        docs = splitter.split_documents(documents)

        self.vector_store = FAISS.from_documents(docs, self.embedding)
        self.vector_store.save_local(self.VECTOR_PATH)
        print("✅ Vector store created and saved!")

    def ask(self, query: str) -> str:
        """Query the vector store using the LLM and return a clean answer."""
        try:
            result = self.qa_chain({"query": query})
            answer = result["result"].strip()

            # Remove "Answer:" if present
            if "Answer:" in answer:
                answer = answer.split("Answer:")[-1].strip()

            return answer
        except Exception as e:
            print(f"❌ Error in ask(): {e}")
            return "Sorry, I couldn't process your question."
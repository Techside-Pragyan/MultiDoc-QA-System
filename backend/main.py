from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import engine, Base
from backend.routes import auth, documents, qa, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MultiDoc QA System API",
    description="Backend API for an AI-powered Multi-Document Question Answering System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(qa.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the MultiDoc QA System API. Visit /docs for documentation."}

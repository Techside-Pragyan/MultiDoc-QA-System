from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True # updated for pydantic v2

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class DocumentBase(BaseModel):
    filename: str
    file_type: str

class Document(DocumentBase):
    id: int
    upload_date: datetime
    user_id: int
    class Config:
        from_attributes = True

class QuestionRequest(BaseModel):
    question: str

class SourceChunk(BaseModel):
    document_name: str
    chunk_text: str
    score: float

class AnswerResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]

class ChatHistory(BaseModel):
    id: int
    question: str
    answer: str
    created_at: datetime
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_documents: int
    total_questions: int
    storage_used_bytes: int
    recent_documents: List[Document]

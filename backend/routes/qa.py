from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database import models
from backend.models import schemas
from backend.routes.auth import get_current_user
from backend.services.qa_engine import qa_engine

router = APIRouter(prefix="/qa", tags=["Question Answering"])

@router.post("/ask", response_model=schemas.AnswerResponse)
def ask_question(
    request: schemas.QuestionRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    answer_text, sources = qa_engine.ask_question(request.question)
    
    chat_entry = models.ChatHistory(
        user_id=current_user.id,
        question=request.question,
        answer=answer_text
    )
    db.add(chat_entry)
    db.commit()
    
    return {"answer": answer_text, "sources": sources}

@router.get("/chat-history", response_model=List[schemas.ChatHistory])
def get_chat_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = db.query(models.ChatHistory).filter(
        models.ChatHistory.user_id == current_user.id
    ).order_by(models.ChatHistory.created_at.asc()).all()
    return history

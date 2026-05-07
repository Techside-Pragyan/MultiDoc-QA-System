import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database import models
from backend.models import schemas
from backend.routes.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard-stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    docs = db.query(models.Document).filter(models.Document.user_id == current_user.id).all()
    questions_count = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == current_user.id).count()
    
    storage_bytes = 0
    for doc in docs:
        if os.path.exists(doc.file_path):
            storage_bytes += os.path.getsize(doc.file_path)
            
    recent_docs = db.query(models.Document).filter(
        models.Document.user_id == current_user.id
    ).order_by(models.Document.upload_date.desc()).limit(5).all()
    
    return {
        "total_documents": len(docs),
        "total_questions": questions_count,
        "storage_used_bytes": storage_bytes,
        "recent_documents": recent_docs
    }

import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database import models
from backend.models import schemas
from backend.routes.auth import get_current_user
from backend.utils.config import settings
from backend.services.document_processor import document_processor
from backend.vector_store.faiss_store import faiss_store

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".pptx"}

@router.post("/upload", response_model=schemas.Document)
async def upload_document(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed.")
        
    existing = db.query(models.Document).filter(
        models.Document.filename == file.filename,
        models.Document.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="A document with this name already exists")

    file_type = ext[1:]
    file_path = os.path.join(settings.UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    new_doc = models.Document(
        filename=file.filename,
        file_type=file_type,
        file_path=file_path,
        user_id=current_user.id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    success = document_processor.process_document(db, new_doc)
    
    if not success:
        db.delete(new_doc)
        db.commit()
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail="Failed to process document content")
        
    return new_doc

@router.get("/", response_model=List[schemas.Document])
def get_documents(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    docs = db.query(models.Document).filter(models.Document.user_id == current_user.id).all()
    return docs

@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id,
        models.Document.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
        
    db.delete(doc)
    db.commit()
    
    faiss_store.remove_document(doc_id)
    
    return {"message": "Document deleted successfully"}

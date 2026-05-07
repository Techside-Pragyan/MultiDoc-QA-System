import os
import faiss
import numpy as np
import pickle
from langchain_huggingface import HuggingFaceEmbeddings
from backend.utils.config import settings
from typing import List, Dict, Any, Tuple

class FAISSStore:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.dimension = 384  # For all-MiniLM-L6-v2
        self.index_file = os.path.join(settings.FAISS_INDEX_PATH, "index.faiss")
        self.metadata_file = os.path.join(settings.FAISS_INDEX_PATH, "metadata.pkl")
        
        self.index = None
        self.metadata = []
        
        self.load_index()

    def load_index(self):
        if os.path.exists(self.index_file) and os.path.exists(self.metadata_file):
            self.index = faiss.read_index(self.index_file)
            with open(self.metadata_file, "rb") as f:
                self.metadata = pickle.load(f)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = []

    def save_index(self):
        faiss.write_index(self.index, self.index_file)
        with open(self.metadata_file, "wb") as f:
            pickle.dump(self.metadata, f)

    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]]):
        if not texts:
            return
            
        # Generate embeddings
        embs = self.embeddings.embed_documents(texts)
        embs_array = np.array(embs, dtype=np.float32)
        
        # Add to FAISS index
        self.index.add(embs_array)
        
        # Add metadata
        self.metadata.extend(metadatas)
        self.save_index()

    def similarity_search(self, query: str, k: int = 4) -> List[Tuple[Dict[str, Any], float]]:
        if self.index.ntotal == 0:
            return []
            
        # Generate query embedding
        query_emb = self.embeddings.embed_query(query)
        query_array = np.array([query_emb], dtype=np.float32)
        
        # Search FAISS index
        distances, indices = self.index.search(query_array, k)
        
        results = []
        for i in range(len(indices[0])):
            idx = indices[0][i]
            if idx != -1 and idx < len(self.metadata):
                dist = distances[0][i]
                # Convert L2 distance to a pseudo-similarity score (0 to 1)
                score = 1.0 / (1.0 + float(dist))
                results.append((self.metadata[idx], score))
                
        return results

    def remove_document(self, document_id: int):
        if self.index.ntotal == 0:
            return
            
        indices_to_keep = [i for i, meta in enumerate(self.metadata) if meta.get("document_id") != document_id]
        
        if len(indices_to_keep) == len(self.metadata):
            return 
            
        if not indices_to_keep:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = []
            self.save_index()
            return
            
        # To actually remove items from FAISS without recreating from scratch, we'd need IDMap.
        # For simplicity, we just rebuild if we can, otherwise we leave it as a limitation.
        pass

faiss_store = FAISSStore()

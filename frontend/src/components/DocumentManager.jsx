import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentManager = ({ documents, setDocuments }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/documents/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDocuments(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) setError('Failed to load documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8000/documents/upload', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await axios.delete(`http://localhost:8000/documents/${docId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
      {error && (
        <div style={{ background: 'rgba(255, 76, 76, 0.1)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--primary-color)', background: 'rgba(102, 252, 241, 0.05)' }}>
        <Upload size={48} style={{ color: 'var(--primary-color)', marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>Upload New Document</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center' }}>Supported formats: .pdf, .txt, .docx, .pptx</p>
        
        <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {isUploading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={18} />}
          {isUploading ? 'Uploading...' : 'Select File'}
          <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={isUploading} accept=".pdf,.txt,.docx,.pptx" />
        </label>
        
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--surface-glass-border)' }}>Your Knowledge Base ({documents.length})</h3>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-color)', animation: 'spin 1s linear infinite' }} /></div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            No documents uploaded yet. Upload one to start asking questions!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', overflowY: 'auto', paddingRight: '8px' }}>
            <AnimatePresence>
              {documents.map(doc => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--surface-glass-border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
                      <div style={{ background: 'rgba(102, 252, 241, 0.1)', padding: '12px', borderRadius: '8px', color: 'var(--primary-color)' }}>
                        <FileText size={24} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.filename}>{doc.filename}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{doc.file_type}</span>
                      </div>
                    </div>
                    <button className="btn-icon" onClick={() => handleDelete(doc.id)} title="Delete Document">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Uploaded on {new Date(doc.upload_date).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManager;

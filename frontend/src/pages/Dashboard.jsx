import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DocumentManager from '../components/DocumentManager';
import ChatInterface from '../components/ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ setAuth }) => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'documents'
  const [documents, setDocuments] = useState([]);

  return (
    <div className="app-container">
      <Sidebar setAuth={setAuth} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <header style={{ marginBottom: '24px' }}>
                <h1 className="gradient-text" style={{ fontSize: '28px' }}>Ask Questions</h1>
                <p style={{ color: 'var(--text-muted)' }}>Get instant answers from your knowledge base</p>
              </header>
              <ChatInterface documents={documents} />
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <header style={{ marginBottom: '24px' }}>
                <h1 className="gradient-text" style={{ fontSize: '28px' }}>Knowledge Base</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your documents and build the AI's knowledge</p>
              </header>
              <DocumentManager documents={documents} setDocuments={setDocuments} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;

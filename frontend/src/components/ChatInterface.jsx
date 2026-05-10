import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatInterface = ({ documents }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/qa/chat-history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const history = response.data;
      const formattedHistory = [];
      history.forEach(item => {
        formattedHistory.push({ role: 'user', content: item.question });
        formattedHistory.push({ role: 'ai', content: item.answer });
      });
      setMessages(formattedHistory);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/qa/ask', 
        { question: userMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setMessages(prev => [...prev, { role: 'ai', content: response.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
      {documents.length === 0 && (
        <div style={{ background: 'rgba(255, 165, 0, 0.1)', color: '#ffa500', padding: '12px 24px', fontSize: '14px', borderBottom: '1px solid rgba(255, 165, 0, 0.2)' }}>
          Warning: You haven't uploaded any documents yet. Answers will be based on general knowledge only.
        </div>
      )}
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', maxWidth: '400px' }}>
            <Bot size={48} style={{ color: 'var(--primary-color)', margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>How can I help you today?</h3>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Ask me anything about the documents you've uploaded in the Knowledge Base.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                display: 'flex', 
                gap: '16px', 
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' 
              }}
            >
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'user' ? 'rgba(102, 252, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: msg.role === 'user' ? 'var(--primary-color)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              
              <div style={{ 
                background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(0,0,0,0.3)',
                color: msg.role === 'user' ? 'var(--bg-color)' : 'var(--text-main)',
                padding: '16px 20px', borderRadius: '16px',
                borderTopRightRadius: msg.role === 'user' ? 0 : '16px',
                borderTopLeftRadius: msg.role === 'ai' ? 0 : '16px',
                maxWidth: '80%', lineHeight: '1.6', fontSize: '15px'
              }}>
                {msg.content}
              </div>
            </motion.div>
          ))
        )}
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '16px' }}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255, 255, 255, 0.1)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bot size={18} />
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 20px', borderRadius: '16px', borderTopLeftRadius: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="typing-dot" style={{ animationDelay: '0s' }}></div>
              <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
              <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '24px', borderTop: '1px solid var(--surface-glass-border)', background: 'rgba(0,0,0,0.2)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="input-field"
            style={{ flex: 1, padding: '16px', borderRadius: '24px', fontSize: '16px' }}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ borderRadius: '50%', width: '56px', height: '56px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={isLoading || !input.trim()}
          >
            <Send size={20} style={{ marginLeft: '4px' }} />
          </button>
        </form>
      </div>

      <style>{`
        .typing-dot {
          width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;

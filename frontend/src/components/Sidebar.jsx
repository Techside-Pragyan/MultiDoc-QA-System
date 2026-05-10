import React from 'react';
import { MessageSquare, FileText, LogOut, Settings } from 'lucide-react';

const Sidebar = ({ setAuth, activeTab, setActiveTab }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
  };

  const menuItems = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '40px', height: '40px', borderRadius: '12px', 
          background: 'var(--primary-color)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <span style={{ color: 'var(--bg-color)', fontWeight: 'bold', fontSize: '20px' }}>M</span>
        </div>
        <h2 style={{ fontSize: '20px', color: '#fff' }}>MultiDoc <span className="gradient-text">QA</span></h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '8px',
                background: isActive ? 'rgba(102, 252, 241, 0.1)' : 'transparent',
                color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: '15px', fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'inset 2px 0 0 var(--primary-color)' : 'none'
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--surface-glass-border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn-icon" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', borderRadius: '8px' }} onClick={handleLogout}>
          <LogOut size={18} style={{ marginRight: '12px' }} />
          <span style={{ fontSize: '15px', fontWeight: '500' }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

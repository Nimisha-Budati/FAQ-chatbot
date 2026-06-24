import React from 'react';

export default function SettingsModal({ user, theme, onToggleTheme, onClearChats, onClose }) {
  return (
    <div className="settings-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }} onClick={onClose}>
      
      <div className="settings-modal-card" style={{
        background: theme === 'dark' ? '#1a1a22' : '#ffffff',
        color: theme === 'dark' ? '#fff' : '#333',
        padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid #333'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600' }}>⚙️ Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        <hr style={{ borderColor: '#333', marginBottom: '1.5rem' }} />

        {/* Section 1: User Profile Details */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Active Account</label>
          <div style={{ background: theme === 'dark' ? '#0f0f12' : '#f5f5f7', padding: '0.75rem', borderRadius: '8px', marginTop: '0.4rem' }}>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>{user?.name || 'User'}</p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>{user?.email || 'No email associated'}</p>
          </div>
        </div>

        {/* Section 2: Application Theme Customizer */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Interface Mode</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '0.4rem' }}>
            <button 
              onClick={() => theme !== 'light' && onToggleTheme()}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #4f46e5',
                background: theme === 'light' ? '#4f46e5' : 'transparent', color: theme === 'light' ? '#fff' : 'inherit',
                cursor: 'pointer', fontWeight: '500'
              }}
            >
              ☀️ Light
            </button>
            <button 
              onClick={() => theme !== 'dark' && onToggleTheme()}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #4f46e5',
                background: theme === 'dark' ? '#4f46e5' : 'transparent', color: theme === 'dark' ? '#fff' : 'inherit',
                cursor: 'pointer', fontWeight: '500'
              }}
            >
              🌙 Dark
            </button>
          </div>
        </div>

        {/* Section 3: Conversation Storage Actions */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 'bold' }}>Danger Zone</label>
          <button 
            onClick={() => {
              if (confirm("Are you absolutely sure you want to permanently clear all your chat records? This action cannot be undone.")) {
                onClearChats();
                onClose();
              }
            }}
            style={{
              width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ef4444',
              background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer',
              fontWeight: '600', marginTop: '0.4rem', transition: 'background 0.2s'
            }}
          >
            🗑️ Clear All Chat History
          </button>
        </div>

      </div>
    </div>
  );
}
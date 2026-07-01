import React, { useState } from 'react';
export default function SettingsModal({ 
  user, 
  theme, 
  onToggleTheme, 
  onClearChats, 
  onClose,
  allChats = []
}) {
  const [similarityThreshold, setSimilarityThreshold] = useState(
    localStorage.getItem('ai_vector_threshold') ? parseFloat(localStorage.getItem('ai_vector_threshold')) * 100 : 70
  );
  const handleThresholdChange = (e) => {
    const val = parseInt(e.target.value);
    setSimilarityThreshold(val);
    localStorage.setItem('ai_vector_threshold', (val / 100).toString());
  };
  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allChats, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ai_chat_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Failed to generate structural backup layout array:", err);
    }
  };
  return (
    <div className="settings-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }} onClick={onClose}>     
      <div className="settings-modal-card" style={{
        background: theme === 'dark' ? '#141419' : '#ffffff',
        color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
        padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
        border: `1px solid ${theme === 'dark' ? '#2a2a35' : '#e5e7eb'}`,
        transition: 'transform 0.2s ease'
      }} onClick={(e) => e.stopPropagation()}>     
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600', letterSpacing: '-0.025em' }}>⚙️ Client Application Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.7 }}>✕</button>
        </div>
        <hr style={{ borderColor: theme === 'dark' ? '#22222a' : '#f3f4f6', marginBottom: '1.25rem', marginX: 0 }} />
        {/* SECTION 1: ACCOUNT CONTEXT PROFILE */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Active Account Identity</label>
          <div style={{ background: theme === 'dark' ? '#0b0b0e' : '#f9fafb', padding: '0.75rem', borderRadius: '10px', border: `1px solid ${theme === 'dark' ? '#1c1c24' : '#f3f4f6'}`, marginTop: '0.4rem' }}>
            <p style={{ margin: '0 0 0.15rem 0', fontWeight: '600', fontSize: '0.95rem' }}>{user?.name || 'Local Sandbox Operator'}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{user?.email || 'No email associated'}</p>
          </div>
        </div>
        {/* SECTION 2: INTERFACE VIEW MODE */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Interface Preference</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '0.4rem' }}>
            <button 
              onClick={() => theme !== 'light' && onToggleTheme()}
              style={{
                flex: 1, padding: '0.55rem', borderRadius: '8px', 
                border: theme === 'light' ? '1px solid #4f46e5' : `1px solid ${theme === 'dark' ? '#2a2a35' : '#d1d5db'}`,
                background: theme === 'light' ? '#4f46e5' : 'transparent', color: theme === 'light' ? '#fff' : 'inherit',
                cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem'
              }}
            >
              ☀️ Light View
            </button>
            <button 
              onClick={() => theme !== 'dark' && onToggleTheme()}
              style={{
                flex: 1, padding: '0.55rem', borderRadius: '8px', 
                border: theme === 'dark' ? '1px solid #4f46e5' : `1px solid ${theme === 'dark' ? '#2a2a35' : '#d1d5db'}`,
                background: theme === 'dark' ? '#4f46e5' : 'transparent', color: theme === 'dark' ? '#fff' : 'inherit',
                cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem'
              }}
            >
              🌙 Jet Dark
            </button>
          </div>
        </div>
        {/* SECTION 3: VECTOR MATCH ACCURACY SLIDER */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>NLP Similarity Trigger</label>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4f46e5' }}>{similarityThreshold}%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.4rem' }}>
            <input 
              type="range" 
              min="40" 
              max="95" 
              value={similarityThreshold} 
              onChange={handleThresholdChange}
              style={{ width: '100%', accentColor: '#4f46e5', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>
              Lowering matching metrics handles ambiguous queries; higher values protect strict accuracy levels.
            </span>
          </div>
        </div>
        {/* SECTION 4: DATA INTEGRITY PORTABILITY MANAGEMENT */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Data Portability Sync</label>
          <button 
            onClick={handleExportData}
            disabled={!allChats || allChats.length === 0}
            style={{
              width: '100%', padding: '0.55rem', borderRadius: '8px', 
              border: `1px solid ${theme === 'dark' ? '#2a2a35' : '#d1d5db'}`,
              background: theme === 'dark' ? '#1c1c24' : '#f9fafb', 
              color: theme === 'dark' ? '#e5e7eb' : '#374151',
              cursor: allChats?.length > 0 ? 'pointer' : 'not-allowed',
              fontWeight: '500', marginTop: '0.4rem', fontSize: '0.85rem', opacity: allChats?.length > 0 ? 1 : 0.5
            }}
          >
            📥 Export Dialogue Vault (.json)
          </button>
        </div>
        {/* SECTION 5: DESTRUCTIVE STORAGE DANGER REGION */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Destructive Danger Zone</label>
          <button 
            onClick={() => {
              if (confirm("Are you absolutely sure you want to permanently clear all your chat records? This action cannot be undone.")) {
                onClearChats();
                onClose();
              }
            }}
            style={{
              width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #ef4444',
              background: theme === 'dark' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.02)', 
              color: '#ef4444', cursor: 'pointer',
              fontWeight: '600', marginTop: '0.4rem', fontSize: '0.85rem', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
            onMouseLeave={(e) => e.target.style.background = theme === 'dark' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.02)'}
          >
            🗑️ Wipe Local Chat Cache Registers
          </button>
        </div>
      </div>
    </div>
  );
}
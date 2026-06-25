import React, { useState, useEffect } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard.jsx';

export default function AdminDashboard({ chats = [], onClose }) { // ✅ ACCEPTING CHATS PROP FLOW CACHE
  const [metrics, setMetrics] = useState(null);
  const [faqList, setFaqList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
  const [statusMsg, setStatusMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Active Resolution Trackers
  const [resolvingLogIndex, setResolvingLogIndex] = useState(null);

  // Editing Row Tracking States
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '', category: 'General' });
  const [activeTab, setActiveTab] = useState('edit'); // ✅ 'edit' or 'analytics' tab tracker

  // Custom User-Defined Category States
  const [isCustomCategoryAdd, setIsCustomCategoryAdd] = useState(false);
  const [customCategoryAddText, setCustomCategoryAddText] = useState('');
  const [isCustomCategoryEdit, setIsCustomCategoryEdit] = useState(false);
  const [customCategoryEditText, setCustomCategoryEditText] = useState('');

  // Extract unique categories dynamically from the database list
  const dynamicCategories = [...new Set(faqList.map(item => item.category || 'General'))];
  // Ensure 'General' is always an option if the list is empty
  if (!dynamicCategories.includes('General')) {
    dynamicCategories.unshift('General');
  }

  const getHeaders = () => {
    let token = localStorage.getItem('ai_faq_token');
    if (!token) return { 'Content-Type': 'application/json' };
    try {
      const parsed = JSON.parse(token);
      if (parsed) token = parsed;
    } catch (e) {
      token = token.replace(/^"|"$/g, '');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadDashboardData = async () => {
    try {
      const headers = getHeaders();
      
      const metricRes = await fetch('http://localhost:3000/api/admin/metrics', { headers });
      const metricData = await metricRes.json();
      setMetrics(metricData);

      const listRes = await fetch('http://localhost:3000/api/admin/faq/all', { headers });
      const listData = await listRes.json();
      setFaqList(listData);

      const feedbackRes = await fetch('http://localhost:3000/api/admin/feedback/all', { headers });
      const feedbackData = await feedbackRes.json();
      setFeedbackList(feedbackData);
    } catch (err) {
      console.error("Dashboard fetching failure:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle category dropdown change for ADD form
  const handleAddCategoryDropdownChange = (e) => {
    const val = e.target.value;
    if (val === 'USER_DEFINED_CUSTOM') {
      setIsCustomCategoryAdd(true);
      setNewFaq({ ...newFaq, category: customCategoryAddText || 'Custom' });
    } else {
      setIsCustomCategoryAdd(false);
      setNewFaq({ ...newFaq, category: val });
    }
  };

  // Handle typing a custom category name for ADD form
  const handleAddCustomTextChange = (e) => {
    const text = e.target.value;
    setCustomCategoryAddText(text);
    setNewFaq({ ...newFaq, category: text });
  };

  // Handle category dropdown change for EDIT form
  const handleEditCategoryDropdownChange = (e) => {
    const val = e.target.value;
    if (val === 'USER_DEFINED_CUSTOM') {
      setIsCustomCategoryEdit(true);
      setEditForm({ ...editForm, category: customCategoryEditText || 'Custom' });
    } else {
      setIsCustomCategoryEdit(false);
      setEditForm({ ...editForm, category: val });
    }
  };

  // Handle typing a custom category name for EDIT form
  const handleEditCustomTextChange = (e) => {
    const text = e.target.value;
    setCustomCategoryEditText(text);
    setEditForm({ ...editForm, category: text });
  };

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim() || !newFaq.category.trim()) return;

    setIsSaving(true);
    setStatusMsg('⚙️ Re-indexing vectors and retraining local engine...');

    try {
      const headers = getHeaders();
      const res = await fetch('http://localhost:3000/api/admin/faq/add', {
        method: 'POST',
        headers,
        body: JSON.stringify(newFaq)
      });
      
      if (res.ok) {
        if (resolvingLogIndex !== null) {
          await fetch(`http://localhost:3000/api/admin/unanswered/delete/${resolvingLogIndex}`, {
            method: 'DELETE',
            headers
          });
          setResolvingLogIndex(null);
        }

        setStatusMsg('✨ System trained successfully! FAQ active.');
        setNewFaq({ question: '', answer: '', category: 'General' });
        setIsCustomCategoryAdd(false);
        setCustomCategoryAddText('');
        await loadDashboardData();
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      setStatusMsg('❌ Failed updating structural layers.');
    } finally {
      setIsSaving(false);
    }
  };

  const startResolvingLog = (log) => {
    setResolvingLogIndex(log.originalLogIndex);
    setNewFaq({ question: log.query, answer: '', category: 'General' });
    setIsCustomCategoryAdd(false);
    setStatusMsg(`🎯 Now resolving log: "${log.query}"`);
  };

  const cancelResolution = () => {
    setResolvingLogIndex(null);
    setNewFaq({ question: '', answer: '', category: 'General' });
    setIsCustomCategoryAdd(false);
    setStatusMsg('');
  };

  const startEditing = (faq) => {
    setEditingIndex(faq.originalIndex);
    setEditForm({ question: faq.question, answer: faq.answer, category: faq.category });
    setIsCustomCategoryEdit(false);
    setCustomCategoryEditText('');
  };

  const handleUpdateFaq = async (originalIndex) => {
    if (!editForm.question.trim() || !editForm.answer.trim() || !editForm.category.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/admin/faq/update/${originalIndex}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingIndex(null);
        setIsCustomCategoryEdit(false);
        setCustomCategoryEditText('');
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFaq = async (originalIndex) => {
    if (!window.confirm("Are you completely sure you want to permanently delete this item from the active AI vector space?")) return;
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/admin/faq/delete/${originalIndex}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFaqs = faqList.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!metrics) return (
    <div className="admin-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="admin-modal" style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
        🔄 Assembling System Performance Data...
        <button onClick={onClose} style={{ marginLeft: '15px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="admin-overlay">
      <div className="admin-modal" style={{ maxWidth: '1200px', width: '95%' }}>
        <header className="admin-header">
          <h2>📊 System Administration & NLP Telemetry Dashboard</h2>
          <button className="admin-close-btn" onClick={onClose}>✕ Close</button>
        </header>

        <div className="metrics-grid">
          <div className="metric-card"><h3>{metrics.totalFAQs}</h3><p>Active FAQs Loaded</p></div>
          <div className="metric-card"><h3>{metrics.satisfactionRate}%</h3><p>User Satisfaction Score</p></div>
          <div className="metric-card warning-metric"><h3>{metrics.unansweredCount}</h3><p>Unanswered Fallback Logs</p></div>
          <div className="metric-card"><h3>{metrics.totalFeedback}</h3><p>Collected Feedbacks</p></div>
        </div>

        <div className="admin-tab-selector-bar" style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', borderBottom: '1px solid #2a2a35', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('edit')}
            style={{
              background: activeTab === 'edit' ? '#4f46e5' : 'transparent',
              color: '#fff', border: '1px solid ' + (activeTab === 'edit' ? '#4f46e5' : '#333'), 
              padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
            }}
          >
            📝 Core FAQ Engine Manager
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{
              background: activeTab === 'analytics' ? '#4f46e5' : 'transparent',
              color: '#fff', border: '1px solid ' + (activeTab === 'analytics' ? '#4f46e5' : '#333'), 
              padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
            }}
          >
            📊 Real-Time Engine Intelligence
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <div style={{ marginTop: '1rem' }}>
            <AnalyticsDashboard chats={chats} />
          </div>
        ) : (
          <div className="admin-body-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
            
            <div className="admin-form-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3>🧠 {resolvingLogIndex !== null ? '🎯 Resolve Unanswered Inquiry' : 'Train Local AI Engine (Add FAQ)'}</h3>
                  {resolvingLogIndex !== null && (
                    <button onClick={cancelResolution} style={{ padding: '0.2rem 0.5rem', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Cancel Bind</button>
                  )}
                </div>
                
                <form onSubmit={handleAddFaq} className="admin-faq-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" placeholder="Question context..." value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} disabled={isSaving || resolvingLogIndex !== null} required />
                  <textarea placeholder="Target verified system response..." value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} rows="3" disabled={isSaving} required />
                  
                  {/* DYNAMIC CATEGORY DROPDOWN - ADD FORM */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <select 
                      value={isCustomCategoryAdd ? 'USER_DEFINED_CUSTOM' : newFaq.category} 
                      onChange={handleAddCategoryDropdownChange} 
                      disabled={isSaving}
                      style={{ background: '#1f2937', color: '#fff', border: '1px solid #4b5563', padding: '0.5rem', borderRadius: '4px' }}
                    >
                      {dynamicCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option disabled>──────────</option>
                      <option value="USER_DEFINED_CUSTOM">➕ Create New Category...</option>
                    </select>

                    {isCustomCategoryAdd && (
                      <input 
                        type="text" 
                        placeholder="Type custom category name..." 
                        value={customCategoryAddText} 
                        onChange={handleAddCustomTextChange}
                        disabled={isSaving}
                        required
                        style={{ background: '#1f2937', color: '#fff', border: '1px solid #4f46e5', padding: '0.5rem', borderRadius: '4px', marginTop: '4px' }}
                      />
                    )}
                  </div>

                  <button type="submit" className="train-btn" disabled={isSaving}>
                    {isSaving ? '⏳ Retraining Model...' : resolvingLogIndex !== null ? '⚡ Train & Clear Log' : 'Commit FAQ changes'}
                  </button>
                  {statusMsg && <p className="status-label">{statusMsg}</p>}
                </form>
              </div>

              <div>
                <h3>⚠️ Latent Unanswered Inquiries</h3>
                <div className="logs-table-wrapper" style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '0.5rem' }}>
                  {metrics.unansweredLogs?.length === 0 ? <p className="no-logs">No system failures logged!</p> : (
                    <table className="logs-table">
                      <thead><tr><th>Query</th><th>Confidence</th><th>Action</th></tr></thead>
                      <tbody>
                        {metrics.unansweredLogs?.map((log, i) => (
                          <tr key={i} style={{ background: resolvingLogIndex === log.originalLogIndex ? 'rgba(59, 130, 246, 0.15)' : 'transparent' }}>
                            <td className="query-td" style={{ color: '#f3f4f6' }}>{log.query}</td>
                            <td>{log.detectedConfidence}%</td>
                            <td>
                              <button onClick={() => startResolvingLog(log)} style={{ padding: '0.2rem 0.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }} disabled={isSaving}>💡 Resolve</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div>
                <h3>💬 User Interaction Feedback Logs</h3>
                <div className="logs-table-wrapper" style={{ maxHeight: '180px', overflowY: 'auto', marginTop: '0.5rem' }}>
                  {feedbackList.length === 0 ? <p className="no-logs">No thumbs up/down responses collected yet.</p> : (
                    <table className="logs-table">
                      <thead><tr><th>User Question Asked</th><th>Feedback Given</th></tr></thead>
                      <tbody>
                        {feedbackList.map((f, idx) => {
                          const isHelpful = f.feedback === 'helpful' || f.feedbackType === 'helpful';
                          return (
                            <tr key={idx}>
                              <td className="query-td" style={{ fontSize: '0.85rem' }}>
                                <strong>Q:</strong> {f.query || f.userQuery || "Unknown Query Context"}
                              </td>
                              <td style={{ color: isHelpful ? '#4ade80' : '#f87171', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
                                {isHelpful ? '👍 Helpful' : '👎 Unhelpful'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-logs-section" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>📁 Active Vector Database Matrix</h3>
                <input 
                  type="text" 
                  placeholder="🔍 Search saved FAQs..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff', fontSize: '0.85rem', width: '50%' }}
                />
              </div>

              <div className="logs-table-wrapper" style={{ flexGrow: 1, maxHeight: '580px', overflowY: 'auto' }}>
                {filteredFaqs.length === 0 ? <p className="no-logs">No active matching configurations located.</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredFaqs.map((faq) => (
                      <div key={faq.originalIndex} style={{ background: '#1f2937', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {editingIndex === faq.originalIndex ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input type="text" value={editForm.question} onChange={e => setEditForm({...editForm, question: e.target.value})} style={{ background: '#374151', color: '#fff', border: '1px solid #4b5563', padding: '0.4rem' }} />
                            <textarea value={editForm.answer} onChange={e => setEditForm({...editForm, answer: e.target.value})} rows="2" style={{ background: '#374151', color: '#fff', border: '1px solid #4b5563', padding: '0.4rem' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.25rem' }}>
                              
                              {/* DYNAMIC CATEGORY DROPDOWN - EDIT STATE */}
                              <select 
                                value={isCustomCategoryEdit ? 'USER_DEFINED_CUSTOM' : editForm.category} 
                                onChange={handleEditCategoryDropdownChange} 
                                style={{ background: '#374151', color: '#fff', padding: '0.4rem', border: '1px solid #4b5563' }}
                              >
                                {dynamicCategories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option disabled>──────────</option>
                                <option value="USER_DEFINED_CUSTOM">➕ Create New Category...</option>
                              </select>

                              {isCustomCategoryEdit && (
                                <input 
                                  type="text" 
                                  placeholder="Type custom category name..." 
                                  value={customCategoryEditText} 
                                  onChange={handleEditCustomTextChange}
                                  disabled={isSaving}
                                  style={{ background: '#374151', color: '#fff', border: '1px solid #4f46e5', padding: '0.4rem', borderRadius: '4px' }}
                                />
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button onClick={() => handleUpdateFaq(faq.originalIndex)} disabled={isSaving} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                              <button onClick={() => { setEditingIndex(null); setIsCustomCategoryEdit(false); }} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', background: '#374151', padding: '0.1rem 0.4rem', borderRadius: '4px', opacity: 0.8 }}>{faq.category}</span>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => startEditing(faq)} style={{ background: 'transparent', border: '1px solid #60a5fa', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>✏️ Edit</button>
                                <button onClick={() => handleDeleteFaq(faq.originalIndex)} style={{ background: 'transparent', border: '1px solid #f87171', color: '#f87171', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>🗑️ Delete</button>
                              </div>
                            </div>
                            <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: '#f3f4f6' }}>Q: {faq.question}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#9ca3af' }}>A: {faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
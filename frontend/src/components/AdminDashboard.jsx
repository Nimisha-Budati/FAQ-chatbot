import React, { useState, useEffect } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard.jsx';
export default function AdminDashboard({ chats = [], onClose }) { 
  const [metrics, setMetrics] = useState(null);
  const [faqList, setFaqList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
  const [statusMsg, setStatusMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [resolvingLogIndex, setResolvingLogIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '', category: 'General' });
  const [activeTab, setActiveTab] = useState('edit');
  const [isCustomCategoryAdd, setIsCustomCategoryAdd] = useState(false);
  const [customCategoryAddText, setCustomCategoryAddText] = useState('');
  const [isCustomCategoryEdit, setIsCustomCategoryEdit] = useState(false);
  const [customCategoryEditText, setCustomCategoryEditText] = useState('');
  const dynamicCategories = [...new Set(faqList.map(item => item.category || 'General'))];
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
  const handleAddCustomTextChange = (e) => {
    const text = e.target.value;
    setCustomCategoryAddText(text);
    setNewFaq({ ...newFaq, category: text });
  };
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
    <div className="admin-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <div className="admin-modal" style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
        🔄 Assembling System Performance Data...
        <button onClick={onClose} style={{ marginLeft: '15px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
  return (
    <div className="admin-overlay" style={{ padding: '10px', boxSizing: 'border-box' }}>
      <div className="admin-modal" style={{ maxWidth: '1200px', width: '100%', maxHeight: '95vh', overflowY: 'auto', padding: '15px' }}>
        <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>📊 System Telemetry</h2>
          <button className="admin-close-btn" onClick={onClose} style={{ padding: '0.4rem 0.8rem' }}>✕ Close</button>
        </header>
        {/* Responsive Metrics Grid */}
        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '1rem' }}>
          <div className="metric-card" style={{ padding: '0.75rem', textAlign: 'center' }}><h3 style={{ margin: '0 0 4px 0' }}>{metrics.totalFAQs}</h3><p style={{ margin: 0, fontSize: '0.8rem' }}>Active FAQs</p></div>
          <div className="metric-card" style={{ padding: '0.75rem', textAlign: 'center' }}><h3 style={{ margin: '0 0 4px 0' }}>{metrics.satisfactionRate}%</h3><p style={{ margin: 0, fontSize: '0.8rem' }}>Satisfaction</p></div>
          <div className="metric-card warning-metric" style={{ padding: '0.75rem', textAlign: 'center' }}><h3 style={{ margin: '0 0 4px 0' }}>{metrics.unansweredCount}</h3><p style={{ margin: 0, fontSize: '0.8rem' }}>Fallback Logs</p></div>
          <div className="metric-card" style={{ padding: '0.75rem', textAlign: 'center' }}><h3 style={{ margin: '0 0 4px 0' }}>{metrics.totalFeedback}</h3><p style={{ margin: 0, fontSize: '0.8rem' }}>Feedbacks</p></div>
        </div>
        <div className="admin-tab-selector-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1.5rem', borderBottom: '1px solid #2a2a35', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('edit')}
            style={{
              background: activeTab === 'edit' ? '#4f46e5' : 'transparent',
              color: '#fff', border: '1px solid ' + (activeTab === 'edit' ? '#4f46e5' : '#333'), 
              padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', flexGrow: 1, textAlign: 'center'
            }}
          >
            📝 FAQ Engine
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{
              background: activeTab === 'analytics' ? '#4f46e5' : 'transparent',
              color: '#fff', border: '1px solid ' + (activeTab === 'analytics' ? '#4f46e5' : '#333'), 
              padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', flexGrow: 1, textAlign: 'center'
            }}
          >
            📊 Intelligence
          </button>
        </div>
        {activeTab === 'analytics' ? (
          <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
            <AnalyticsDashboard chats={chats} />
          </div>
        ) : (
          <div className="admin-body-layout" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>           
            <div className="admin-form-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '5px' }}>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>🧠 {resolvingLogIndex !== null ? '🎯 Resolve Inquiry' : 'Train Engine (Add FAQ)'}</h3>
                  {resolvingLogIndex !== null && (
                    <button onClick={cancelResolution} style={{ padding: '0.2rem 0.5rem', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Cancel Bind</button>
                  )}
                </div>
                <form onSubmit={handleAddFaq} className="admin-faq-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" placeholder="Question context..." value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} disabled={isSaving || resolvingLogIndex !== null} required style={{ padding: '0.5rem' }} />
                  <textarea placeholder="Target verified system response..." value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} rows="3" disabled={isSaving} required style={{ padding: '0.5rem' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <select 
                      value={isCustomCategoryAdd ? 'USER_DEFINED_CUSTOM' : newFaq.category} 
                      onChange={handleAddCategoryDropdownChange} 
                      disabled={isSaving}
                      style={{ background: '#1f2937', color: '#fff', border: '1px solid #4b5563', padding: '0.5rem', borderRadius: '4px', width: '100%' }}
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
                  <button type="submit" className="train-btn" disabled={isSaving} style={{ padding: '0.6rem' }}>
                    {isSaving ? '⏳ Retraining...' : resolvingLogIndex !== null ? '⚡ Train & Clear Log' : 'Commit FAQ changes'}
                  </button>
                  {statusMsg && <p className="status-label" style={{ margin: 0, fontSize: '0.85rem' }}>{statusMsg}</p>}
                </form>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>⚠️ Latent Unanswered Inquiries</h3>
                <div className="logs-table-wrapper" style={{ maxHeight: '180px', overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
                  {metrics.unansweredLogs?.length === 0 ? <p className="no-logs">No system failures logged!</p> : (
                    <table className="logs-table" style={{ width: '100%', minWidth: '400px' }}>
                      <thead><tr><th>Query</th><th>Conf</th><th>Action</th></tr></thead>
                      <tbody>
                        {metrics.unansweredLogs?.map((log, i) => (
                          <tr key={i} style={{ background: resolvingLogIndex === log.originalLogIndex ? 'rgba(59, 130, 246, 0.15)' : 'transparent' }}>
                            <td className="query-td" style={{ color: '#f3f4f6', fontSize: '0.8rem' }}>{log.query}</td>
                            <td style={{ fontSize: '0.8rem' }}>{log.detectedConfidence}%</td>
                            <td>
                              <button onClick={() => startResolvingLog(log)} style={{ padding: '0.2rem 0.4rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }} disabled={isSaving}>💡 Resolve</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>💬 User Interaction Feedback Logs</h3>
                <div className="logs-table-wrapper" style={{ maxHeight: '180px', overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
                  {feedbackList.length === 0 ? <p className="no-logs">No thumbs up/down responses collected yet.</p> : (
                    <table className="logs-table" style={{ width: '100%', minWidth: '400px' }}>
                      <thead><tr><th>User Question Asked</th><th>Feedback Given</th></tr></thead>
                      <tbody>
                        {feedbackList.map((f, idx) => {
                          const isHelpful = f.feedback === 'helpful' || f.feedbackType === 'helpful';
                          return (
                            <tr key={idx}>
                              <td className="query-td" style={{ fontSize: '0.8rem' }}>
                                <strong>Q:</strong> {f.query || f.userQuery || "Unknown Query Context"}
                              </td>
                              <td style={{ color: isHelpful ? '#4ade80' : '#f87171', fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center' }}>
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
            <div className="admin-logs-section" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>📁 Active Vector Matrix</h3>
                <input 
                  type="text" 
                  placeholder="🔍 Search saved FAQs..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff', fontSize: '0.8rem', width: '100%', maxWidth: '250px' }}
                />
              </div>
              <div className="logs-table-wrapper" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {filteredFaqs.length === 0 ? <p className="no-logs">No active matching configurations located.</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredFaqs.map((faq) => (
                      <div key={faq.originalIndex} style={{ background: '#1f2937', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {editingIndex === faq.originalIndex ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input type="text" value={editForm.question} onChange={e => setEditForm({...editForm, question: e.target.value})} style={{ background: '#374151', color: '#fff', border: '1px solid #4b5563', padding: '0.4rem', fontSize: '0.85rem' }} />
                            <textarea value={editForm.answer} onChange={e => setEditForm({...editForm, answer: e.target.value})} rows="2" style={{ background: '#374151', color: '#fff', border: '1px solid #4b5563', padding: '0.4rem', fontSize: '0.85rem' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.25rem' }}>
                              <select 
                                value={isCustomCategoryEdit ? 'USER_DEFINED_CUSTOM' : editForm.category} 
                                onChange={handleEditCategoryDropdownChange} 
                                style={{ background: '#374151', color: '#fff', padding: '0.4rem', border: '1px solid #4b5563', fontSize: '0.85rem' }}
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
                                  style={{ background: '#374151', color: '#fff', border: '1px solid #4f46e5', padding: '0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}
                                />
                              )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button onClick={() => handleUpdateFaq(faq.originalIndex)} disabled={isSaving} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                              <button onClick={() => { setEditingIndex(null); setIsCustomCategoryEdit(false); }} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: '#374151', padding: '0.1rem 0.4rem', borderRadius: '4px', opacity: 0.8 }}>{faq.category}</span>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => startEditing(faq)} style={{ background: 'transparent', border: '1px solid #60a5fa', color: '#60a5fa', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>✏️ Edit</button>
                                <button onClick={() => handleDeleteFaq(faq.originalIndex)} style={{ background: 'transparent', border: '1px solid #f87171', color: '#f87171', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>🗑️ Delete</button>
                              </div>
                            </div>
                            <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: '#f3f4f6', fontSize: '0.9rem' }}>Q: {faq.question}</h4>
                            <p style={{ margin: 0, fontSize: '0.825rem', color: '#9ca3af' }}>A: {faq.answer}</p>
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
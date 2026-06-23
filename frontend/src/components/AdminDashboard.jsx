import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ onClose }) {
  const [metrics, setMetrics] = useState(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
  const [statusMsg, setStatusMsg] = useState('');
  // ⏳ New layout indicator tracking state
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to extract auth session headers dynamically
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

  const fetchMetrics = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/metrics', {
        headers: getHeaders()
      });
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Failed fetching dashboard datasets", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;

    setIsSaving(true); // 🔒 Freeze button instantly on click
    setStatusMsg('⚙️ Re-indexing vectors and retraining local engine...');

    try {
      const res = await fetch('http://localhost:3000/api/admin/faq/add', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newFaq)
      });
      
      const data = await res.json();

      if (res.ok) {
        setStatusMsg('✨ System trained successfully! FAQ active.');
        setNewFaq({ question: '', answer: '', category: 'General' });
        await fetchMetrics(); // reload numbers
        setTimeout(() => setStatusMsg(''), 4000);
      } else {
        setStatusMsg(`❌ Error: ${data.error || 'Failed updating structural layers.'}`);
      }
    } catch (err) {
      console.error("Network fault saving FAQ data stream:", err);
      setStatusMsg('❌ Failed updating structural layers.');
    } finally {
      setIsSaving(false); // 🔓 Unfreeze button when backend finishes processing
    }
  };

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
      <div className="admin-modal">
        <header className="admin-header">
          <h2>📊 System Administration & NLP Telemetry Dashboard</h2>
          <button className="admin-close-btn" onClick={onClose}>✕ Close</button>
        </header>

        {/* Metric KPIs */}
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>{metrics.totalFAQs}</h3>
            <p>Active FAQs Loaded</p>
          </div>
          <div className="metric-card">
            <h3>{metrics.satisfactionRate}%</h3>
            <p>User Satisfaction Score</p>
          </div>
          <div className="metric-card warning-metric">
            <h3>{metrics.unansweredCount}</h3>
            <p>Unanswered Fallback Logs</p>
          </div>
          <div className="metric-card">
            <h3>{metrics.totalFeedback}</h3>
            <p>Collected Feedbacks</p>
          </div>
        </div>

        <div className="admin-body-layout">
          {/* Quick AI Training Module */}
          <div className="admin-form-section">
            <h3>🧠 Train Local AI Engine (Add FAQ)</h3>
            <form onSubmit={handleAddFaq} className="admin-faq-form">
              <input 
                type="text" 
                placeholder="Question string context..." 
                value={newFaq.question}
                onChange={e => setNewFaq({...newFaq, question: e.target.value})}
                disabled={isSaving}
                required
              />
              <textarea 
                placeholder="Target verified system response..." 
                value={newFaq.answer}
                onChange={e => setNewFaq({...newFaq, answer: e.target.value})}
                rows="3"
                disabled={isSaving}
                required
              />
              <select 
                value={newFaq.category} 
                onChange={e => setNewFaq({...newFaq, category: e.target.value})}
                disabled={isSaving}
              >
                <option value="General">General</option>
                <option value="Technology">Technology</option>
                <option value="AI Engine">AI Engine</option>
                <option value="UI Design">UI Design</option>
              </select>

              {/* ⚡ Dynamic Visual Button Feedback State */}
              <button 
                type="submit" 
                className="train-btn" 
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.6 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
              >
                {isSaving ? '⏳ Retraining Model...' : 'Commit FAQ changes'}
              </button>

              {statusMsg && <p className="status-label">{statusMsg}</p>}
            </form>
          </div>

          {/* Logs Feed */}
          <div className="admin-logs-section">
            <h3>⚠️ Latent Unanswered Inquiries (Needs Training)</h3>
            <div className="logs-table-wrapper">
              {!metrics.unansweredLogs || metrics.unansweredLogs.length === 0 ? <p className="no-logs">No system failures logged!</p> : (
                <table className="logs-table">
                  <thead>
                    <tr><th>User Query Phrase</th><th>Confidence Checked</th></tr>
                  </thead>
                  <tbody>
                    {metrics.unansweredLogs.map((log, i) => (
                      <tr key={i}>
                        <td className="query-td" onClick={() => !isSaving && setNewFaq({...newFaq, question: log.query})}>{log.query}</td>
                        <td>{log.detectedConfidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
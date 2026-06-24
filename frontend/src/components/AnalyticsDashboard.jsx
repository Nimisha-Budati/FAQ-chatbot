import React from 'react';

export default function AnalyticsDashboard({ chats = [] }) {
  // 1. Count the TRUE total number of questions this specific user typed
  const totalUserQuestions = chats.reduce((acc, chat) => {
    if (!chat || !chat.messages) return acc;
    const userMsgs = chat.messages.filter(msg => msg && msg.sender === 'user');
    return acc + userMsgs.length;
  }, 0);

  // 2. Extract all bot responses to calculate AI confidence telemetry
  const allBotMessages = chats.reduce((acc, chat) => {
    if (!chat || !chat.messages) return acc;
    const botMsgs = chat.messages.filter(msg => msg && msg.sender === 'bot');
    return [...acc, ...botMsgs];
  }, []);

  // Track Category Frequencies & Average Confidence Scores
  const categoryCounts = {};
  let totalConfidence = 0;
  let messagesWithConfidence = 0;

  allBotMessages.forEach(msg => {
    // Map Categories
    if (msg.category) {
      categoryCounts[msg.category] = (categoryCounts[msg.category] || 0) + 1;
    }

    // Map Confidence Safely
    if (msg.confidence !== undefined && msg.confidence !== null) {
      const rawConfidence = parseFloat(msg.confidence);
      if (!isNaN(rawConfidence)) {
        // Safe check for whole numbers (85) vs decimals (0.85)
        const normalConfidence = rawConfidence > 1 ? rawConfidence : rawConfidence * 100;
        totalConfidence += normalConfidence;
        messagesWithConfidence++;
      }
    }
  });

  // Calculate clean, true average percentage numbers
  const avgConfidenceNum = messagesWithConfidence > 0 ? totalConfidence / messagesWithConfidence : 0;
  const avgConfidence = avgConfidenceNum.toFixed(1);

  // Sort categories to show top performing clusters
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="analytics-dashboard-pane" style={{ padding: '1rem', color: '#fff' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: '#4f46e5', fontWeight: '600' }}>
        📈 Your Personal Session Intelligence
      </h3>

      {/* GRID LEVEL 1: HIGHLIGHT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '2rem' }}>
        <div style={{ background: '#16161a', padding: '1rem', borderRadius: '10px', border: '1px solid #2a2a35' }}>
          <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Your Total Queries</span>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{totalUserQuestions}</p>
        </div>

        <div style={{ background: '#16161a', padding: '1rem', borderRadius: '10px', border: '1px solid #2a2a35' }}>
          <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Avg AI Confidence</span>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{avgConfidence}%</p>
        </div>

        <div style={{ background: '#16161a', padding: '1rem', borderRadius: '10px', border: '1px solid #2a2a35' }}>
          <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Your Chat Threads</span>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#6366f1' }}>{chats.length}</p>
        </div>
      </div>

      {/* GRID LEVEL 2: DETAILED METRICS DISTRIBUTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Topic Breakdown Bar Listing */}
        <div style={{ background: '#16161a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #2a2a35' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase' }}>🔥 Your Top Intent Categories</h4>
          {sortedCategories.length === 0 ? (
            <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.5rem' }}>No classified categories captured yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedCategories.map(([category, count]) => {
                // Percentage based on total bot responses received
                const totalBotCount = allBotMessages.length;
                const percentageNum = totalBotCount > 0 ? (count / totalBotCount) * 100 : 0;
                const percentageStr = percentageNum.toFixed(0);

                return (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: '#ddd' }}>{category}</span>
                      <span style={{ color: '#888' }}>{count} hits ({percentageStr}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentageStr}%`, height: '100%', background: '#4f46e5', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confidence Health Gauge */}
        <div style={{ background: '#16161a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #2a2a35', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase' }}>🛡️ Match Score Health</h4>
            <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 1.5rem 0' }}>
              Reflects the mathematical vector similarity metrics calculated across your personal interactions.
            </p>
          </div>
          
          <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
              width: '100px', height: '100px', borderRadius: '50%', 
              border: `6px solid ${avgConfidenceNum >= 75 ? '#10b981' : '#f59e0b'}`,
              fontSize: '1.4rem', fontWeight: 'bold'
            }}>
              {avgConfidence}%
            </div>
            <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '1rem', margin: 0 }}>
              {avgConfidenceNum >= 75 ? "🟢 AI responses are highly relevant" : "🟡 Try rephrasing your matching parameters"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
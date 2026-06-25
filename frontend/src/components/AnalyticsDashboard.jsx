import React, { useState } from 'react';

export default function AnalyticsDashboard({ chats = [] }) {
  // ⏳ Time Filter State: 'all' | 'today' | '7days' | 'month'
  const [timeFilter, setTimeFilter] = useState('all');

  // Helper function to check if a timestamp string falls within the selected window
  const isWithinTimeRange = (timestampStr) => {
    if (timeFilter === 'all') return true;
    if (!timestampStr) return false;

    const messageDate = new Date(timestampStr);
    const now = new Date();
    
    // Normalize times to midnight for clean day-boundary checks
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timeFilter) {
      case 'today':
        return messageDate >= startOfToday;
      case '7days':
        const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
        return messageDate >= sevenDaysAgo;
      case 'month':
        const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
        return messageDate >= thirtyDaysAgo;
      default:
        return true;
    }
  };

  // 1. Count the filtered user questions
  const totalUserQuestions = chats.reduce((acc, chat) => {
    if (!chat || !chat.messages) return acc;
    const filteredUserMsgs = chat.messages.filter(
      msg => msg && msg.sender === 'user' && isWithinTimeRange(msg.timestamp)
    );
    return acc + filteredUserMsgs.length;
  }, 0);

  // 2. Extract and filter bot responses for AI confidence/category telemetry
  const allBotMessages = chats.reduce((acc, chat) => {
    if (!chat || !chat.messages) return acc;
    const filteredBotMsgs = chat.messages.filter(
      msg => msg && msg.sender === 'bot' && isWithinTimeRange(msg.timestamp)
    );
    return [...acc, ...filteredBotMsgs];
  }, []);

  // Track Category Frequencies & Average Confidence Scores
  const categoryCounts = {};
  let totalConfidence = 0;
  let messagesWithConfidence = 0;

  allBotMessages.forEach(msg => {
    if (msg.category) {
      categoryCounts[msg.category] = (categoryCounts[msg.category] || 0) + 1;
    }

    if (msg.confidence !== undefined && msg.confidence !== null) {
      const rawConfidence = parseFloat(msg.confidence);
      if (!isNaN(rawConfidence)) {
        const normalConfidence = rawConfidence > 1 ? rawConfidence : rawConfidence * 100;
        totalConfidence += normalConfidence;
        messagesWithConfidence++;
      }
    }
  });

  const avgConfidenceNum = messagesWithConfidence > 0 ? totalConfidence / messagesWithConfidence : 0;
  const avgConfidence = avgConfidenceNum.toFixed(1);

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Count active threads that have at least one message in the selected time frame
  const activeThreadsCount = chats.filter(chat => {
    if (!chat || !chat.messages) return false;
    return chat.messages.some(msg => isWithinTimeRange(msg.timestamp));
  }).length;

  return (
    <div className="analytics-dashboard-pane" style={{ padding: '1rem', color: '#fff' }}>
      
      {/* HEADER SECTION WITH FILTER CONTROL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#4f46e5', fontWeight: '600' }}>
          📈 Personal Session Intelligence
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Timeframe:</span>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              background: '#16161a',
              color: '#fff',
              border: '1px solid #2a2a35',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* GRID LEVEL 1: HIGHLIGHT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '2rem' }}>
        <div style={{ background: '#16161a', padding: '1rem', borderRadius: '10px', border: '1px solid #2a2a35' }}>
          <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Queries</span>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{totalUserQuestions}</p>
        </div>

        <div style={{ background: '#16161a', padding: '1rem', borderRadius: '10px', border: '1px solid #2a2a35' }}>
          <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Avg AI Confidence</span>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{avgConfidence}%</p>
        </div>

        <div style={{ background: '#16161a', padding: '1rem', borderRadius: '10px', border: '1px solid #2a2a35' }}>
          <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Active Threads</span>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#6366f1' }}>{activeThreadsCount}</p>
        </div>
      </div>

      {/* GRID LEVEL 2: DETAILED METRICS DISTRIBUTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Topic Breakdown Bar Listing */}
        <div style={{ background: '#16161a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #2a2a35' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase' }}>🔥 Top Intent Categories</h4>
          {sortedCategories.length === 0 ? (
            <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.5rem' }}>
              No entries found for this time period.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedCategories.map(([category, count]) => {
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
              Reflects mathematical vector similarity metrics calculated across selected interactions.
            </p>
          </div>
          
          <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
              width: '100px', height: '100px', borderRadius: '50%', 
              border: `6px solid ${avgConfidenceNum >= 75 ? '#10b981' : avgConfidenceNum > 0 ? '#f59e0b' : '#3a3a45'}`,
              fontSize: '1.4rem', fontWeight: 'bold'
            }}>
              {avgConfidence}%
            </div>
            <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '1rem', margin: 0 }}>
              {avgConfidenceNum === 0 ? "⚪ No data available" : avgConfidenceNum >= 75 ? "🟢 AI responses are highly relevant" : "🟡 Try rephrasing your parameters"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
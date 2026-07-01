import React, { useState, useEffect } from 'react';
export default function FeedbackButtons({ savedFeedback, onFeedbackSubmit }) {
  const [status, setStatus] = useState(savedFeedback || null);
  useEffect(() => {
    setStatus(savedFeedback || null);
  }, [savedFeedback]);
  const handleFeedback = (type) => {
    const newStatus = status === type ? null : type;
    setStatus(newStatus);
    onFeedbackSubmit(newStatus); 
  };
  return (
    <div className="feedback-wrapper">
      <span className="feedback-label">Was this response helpful?</span>
      <div className="feedback-actions">
        <button 
          className={`feedback-btn ${status === 'helpful' ? 'active-good' : ''}`} 
          onClick={() => handleFeedback('helpful')}
          title="Helpful"
        >
          👍 Nice
        </button>
        <button 
          className={`feedback-btn ${status === 'not_helpful' || status === 'unhelpful' ? 'active-bad' : ''}`} 
          onClick={() => handleFeedback('not_helpful')}
          title="Not Helpful"
        >
          👎 Not matching
        </button>
      </div>
    </div>
  );
}
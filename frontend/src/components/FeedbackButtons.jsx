import React, { useState } from 'react';

export default function FeedbackButtons({ onFeedbackSubmit }) {
  const [status, setStatus] = useState(null); // 'helpful' | 'not_helpful'

  const handleFeedback = (type) => {
    if (status) return; // limit interaction to once per event trigger node
    setStatus(type);
    onFeedbackSubmit(type);
  };

  return (
    <div className="feedback-wrapper">
      <span className="feedback-label">Was this response helpful?</span>
      <div className="feedback-actions">
        <button 
          className={`feedback-btn ${status === 'helpful' ? 'active-good' : ''}`} 
          onClick={() => handleFeedback('helpful')}
          disabled={status !== null}
          title="Helpful"
        >
          👍 Nice
        </button>
        <button 
          className={`feedback-btn ${status === 'not_helpful' ? 'active-bad' : ''}`} 
          onClick={() => handleFeedback('not_helpful')}
          disabled={status !== null}
          title="Not Helpful"
        >
          👎 Not matching
        </button>
      </div>
    </div>
  );
}
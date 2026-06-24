import React from 'react';
import FeedbackButtons from './FeedbackButtons.jsx';

export default function Message({ message, onFeedback }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="avatar">{isUser ? 'U' : 'AI'}</div>
      <div className="message-content-wrapper">
        <div className="message-content">
          <p className="message-text">{message.text}</p>
          
          {!isUser && message.confidence !== undefined && (
            <div className="meta-badge-container">
              {/* FIXED: Using confidence >= 75 for green badge */}
              <span className={`confidence-badge ${message.confidence >= 75 ? 'badge-high' : 'badge-low'}`}>
                Match: {message.confidence}%
              </span>
              {message.category && message.category !== 'None' && (
                <span className="category-badge">{message.category}</span>
              )}
            </div>
          )}
        </div>
       {!isUser && (
          <FeedbackButtons 
            savedFeedback={message.feedbackStatus} 
            onFeedbackSubmit={(type) => onFeedback(message.id, message.userQuery, message.text, type)} 
          />
        )}
      </div>
    </div>
  );
}
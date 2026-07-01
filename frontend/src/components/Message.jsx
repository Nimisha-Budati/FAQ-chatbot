import React from 'react';
import FeedbackButtons from './FeedbackButtons.jsx';
export default function Message({ message, onFeedback }) {
  const isUser = message.sender === 'user';
  return (
    <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
      {/* White User Icon SVG for User, 🤖 for AI Engine */}
      <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isUser ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        ) : (
          '🤖'
        )}
      </div>
      <div className="message-content-wrapper">
        <div className="message-content">
          <p className="message-text">{message.text}</p>     
          {!isUser && message.confidence !== undefined && (
            <div className="meta-badge-container">
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
import React from 'react';
import FeedbackButtons from './FeedbackButtons.jsx';

export default function Message({ message, onFeedback }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="avatar">
        {isUser ? 'U' : 'AI'}
      </div>
      <div className="message-content-wrapper">
        <div className="message-content">
          <p className="message-text">{message.text}</p>
          
          {!isUser && message.confidence !== undefined && (
            <div className="meta-badge-container">
              <span className={`confidence-badge ${message.matched ? 'badge-high' : 'badge-low'}`}>
                Match: {message.confidence}%
              </span>
              {message.category && message.category !== 'None' && (
                <span className="category-badge">{message.category}</span>
              )}
            </div>
          )}
        </div>

        {!isUser && message.matched && (
          <FeedbackButtons 
            onFeedbackSubmit={(type) => onFeedback(message.id, message.userQuery, message.text, type)} 
          />
        )}
      </div>
    </div>
  );
}
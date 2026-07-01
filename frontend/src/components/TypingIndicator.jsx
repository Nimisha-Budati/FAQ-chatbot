import React from 'react';
export default function TypingIndicator() {
  return (
    <div className="message bot-message typing-box">
      <div className="avatar">AI</div>
      <div className="message-content indicator-container">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  );
}
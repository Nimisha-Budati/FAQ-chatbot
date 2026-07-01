import React from 'react';
export default function SuggestedQuestions({ prompts, onPromptSelect }) {
  if (!prompts || prompts.length === 0) return null;
  return (
    <div className="suggestions-wrapper">
      <p className="suggestions-title">💡 Frequently Asked Questions</p>
      <div className="suggestions-grid">
        {prompts.map((question, idx) => (
          <button 
            key={idx} 
            className="suggestion-card" 
            onClick={() => onPromptSelect(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
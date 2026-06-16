import React, { useState, useRef, useEffect } from 'react';
import Message from './Message.jsx';
import SuggestedQuestions from './SuggestedQuestions.jsx';
import TypingIndicator from './TypingIndicator.jsx';

export default function ChatWindow({ chat, onSendMessage, suggestions, isLoading, onFeedback }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto growing textarea configuration tracking logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!chat) {
    return (
      <div className="chat-window-fallback">
        <h2>Welcome to the AI Semantic FAQ System</h2>
        <p>Please initiate a new discussion or choose an item from the history panel.</p>
      </div>
    );
  }

  return (
    <div className="chat-window-container">
      <div className="messages-viewport">
        {chat.messages.length === 0 ? (
          <div className="welcome-prompt-area">
            <h1 className="welcome-heading">How can I assist you today?</h1>
            <p className="welcome-subtext">Ask me anything about our software engineering documentation or system configurations.</p>
            <SuggestedQuestions 
              prompts={suggestions} 
              onPromptSelect={(question) => onSendMessage(question)} 
            />
          </div>
        ) : (
          <div className="messages-list">
            {chat.messages.map((msg) => (
              <Message key={msg.id} message={msg} onFeedback={onFeedback} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="chat-input-sticky-footer">
        <form onSubmit={handleSubmit} className="input-form-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-textarea-input"
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Press Enter to submit)"
            disabled={isLoading}
          />
          <button type="submit" className="send-action-btn" disabled={!input.trim() || isLoading}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
        <div className="form-disclaimer-text">AI NLP Semantic Engine running locally on TensorFlow.js</div>
      </div>
    </div>
  );
}
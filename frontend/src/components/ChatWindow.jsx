import React, { useState, useRef, useEffect } from 'react';
import Message from './Message.jsx';
import SuggestedQuestions from './SuggestedQuestions.jsx';
import TypingIndicator from './TypingIndicator.jsx';

export default function ChatWindow({ chat, onSendMessage, suggestions, isLoading, onFeedback }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Voice Input Speech State Hooks
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Auto growing textarea configuration tracking logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Smooth scroll helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages, isLoading]);

  // Dynamic initialization handler triggered upon explicit user interaction
  const toggleVoiceInput = (e) => {
    e.preventDefault();
    
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge!");
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      rec.onerror = (err) => {
        console.error("Speech API error encountered:", err.error);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          alert("Microphone access blocked. Click the lock/mic icon in your browser address bar to switch permissions to 'Allow'!");
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    // Process actual tracking engine hardware loops
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log("Recognition instances resetting context safely...");
      }
    }
  };

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
              required
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
            className={`chat-textarea-input ${isListening ? 'input-listening-glow' : ''}`}
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening closely... Speak now." : "Ask a question... (Press Enter to submit)"}
            disabled={isLoading}
          />

          <div className="input-actions-cluster">
            {/* 🎙️ Premium Dynamic Microphone Action Button */}
            <button 
              type="button"
              className={`voice-mic-btn-premium ${isListening ? 'mic-pulse-active' : ''}`}
              onClick={toggleVoiceInput}
              title={isListening ? "Stop listening" : "Type with your voice"}
              disabled={isLoading}
            >
              {isListening ? (
                <span className="mic-stop-square"></span>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              )}
            </button>

            <button type="submit" className="send-action-btn" disabled={!input.trim() || isLoading}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </form>
        <div className="form-disclaimer-text">AI NLP Semantic Engine running locally on TensorFlow.js</div>
      </div>
    </div>
  );
}
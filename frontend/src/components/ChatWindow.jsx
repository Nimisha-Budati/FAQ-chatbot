import React, { useState, useRef, useEffect } from 'react';
import Message from './Message.jsx';
import SuggestedQuestions from './SuggestedQuestions.jsx';
import TypingIndicator from './TypingIndicator.jsx';

// DEFINE SYSTEM COMMANDS
const COMMANDS = [
  { label: '/clear', desc: 'Clear all messages in this session window' },
  { label: '/summarize', desc: 'Generate an instant internal summary of this chat' },
  { label: '/help', desc: 'Display local blueprint capabilities & active tags' }
];

export default function ChatWindow({ chat, onSendMessage, suggestions, isLoading, onFeedback, onClearChat }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Voice Input Speech State Hooks
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // SLASH COMMAND MENU STATES
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

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

  // Handle Input Changes to Detect "/"
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // If string ends with / or text contains slash trigger flags, show menu
    if (value.endsWith('/')) {
      setShowCommands(true);
      setSelectedCommandIndex(0);
    } else if (showCommands && !value.includes('/')) {
      setShowCommands(false);
    }
  };

  // ⚡ SELECT & EXECUTE SYSTEM ACTION (Bypasses backend engine falls for instant accuracy)
  const executeCommand = (cmdLabel) => {
    setShowCommands(false);
    setInput('');
    
    if (cmdLabel === '/clear') {
      if (window.confirm("Clear all conversation visibility context in this local tab thread?")) {
        if (onClearChat && chat) {
          onClearChat(chat.id);
        } else {
          alert("Clear handler triggered! Make sure to pass onClearChat from App.jsx.");
        }
      }
    } 
    else if (cmdLabel === '/summarize') {
      if (!chat.messages || chat.messages.length === 0) {
        alert("Nothing to summarize yet! Send a few messages first.");
        return;
      }
      
      // Local runtime compilation wrapper
      onSendMessage(`[SYSTEM MACRO /SUMMARIZE]\n\nHere is a quick breakdown of our active session:\n- **Current Chat Thread:** "${chat.title}"\n- **Total Exchanges:** ${chat.messages.length} messages logged.\n- **Latest Focus:** Refining UI dashboard analytics and troubleshooting low confidence score matches.`);
    } 
    else if (cmdLabel === '/help') {
      onSendMessage(`[SYSTEM MACRO /HELP]\n\n### 🛠️ System Dashboard Blueprint\n\n| Capability | Scope | Hotkey Trigger |\n|---|---|---|\n| **Vector Administration** | CRUD data operations & training | Admin Panel Tab 1 |\n| **Engine Intelligence** | Real-time TF.js calibration telemetry | Admin Panel Tab 2 |\n| **Quick Actions Menu** | Instant utility macro injection | Type \`/\` in input |\n\n* **Active NLP Categories:** General, Technology, AI Engine, UI Design.\n* Need more help? Review the core source files inside your \`/src/components\` tree.`);
    }
  };

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
    // INTERCEPT KEYBOARD LOOPS FOR SLASH MENU SELECTION
    if (showCommands) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev + 1) % COMMANDS.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev - 1 + COMMANDS.length) % COMMANDS.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        executeCommand(COMMANDS[selectedCommandIndex].label);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommands(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // EXPORT CONVERSATION DOWNLOAD ROUTINE
  const handleExportChat = () => {
    if (!chat || !chat.messages || chat.messages.length === 0) {
      alert("There are no messages in this discussion to export yet!");
      return;
    }

    const fileContent = chat.messages.map(msg => {
      const label = msg.sender === 'user' ? '🧑 User' : '🤖 AI Engine';
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
      let textLine = `[${timestamp}] ${label}:\n${msg.text}\n`;
      
      if (msg.sender === 'bot' && msg.confidence) {
        textLine += `(Match Score/Confidence: ${msg.confidence}%)\n`;
      }
      return textLine + `\n${'='.repeat(40)}\n\n`;
    }).join('');

    const blob = new Blob([`📜 DISCUSSION HISTORY: ${chat.title}\n${'='.repeat(50)}\n\n` + fileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${chat.title.toLowerCase().replace(/\s+/g, '_')}_history.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="chat-window-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* EXPORT HEADER ELEMENT */}
      <div className="chat-window-header" style={{
        padding: '0.75rem 1.5rem',
        background: 'rgba(0, 0, 0, 0.15)',
        borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span className="chat-header-title-text" style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main, #fff)' }}>
          {chat.title}
        </span>
        
        {chat.messages.length > 0 && (
          <button 
            onClick={handleExportChat}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff',
              padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
          >
            📥 Export Chat
          </button>
        )}
      </div>

      <div className="messages-viewport" style={{ flex: 1, overflowY: 'auto' }}>
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

      {/* FOOTER INPUT CONTAINER ROW OVERLAY */}
      <div className="chat-input-sticky-footer" style={{ position: 'relative' }}>
        
        {/* FLOATING COMMAND DROPDOWN CONTAINER */}
        {showCommands && (
          <div className="slash-commands-popup" style={{
            position: 'absolute', bottom: 'calc(100% - 5px)', left: '1rem', right: '1rem',
            background: '#16161a', border: '1px solid #343541', borderRadius: '8px',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.3)', padding: '0.5rem 0', zIndex: '9999',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', borderBottom: '1px solid #222', marginBottom: '4px' }}>
              ⚡ Quick System Actions
            </div>
            {COMMANDS.map((cmd, idx) => {
              const isSelected = idx === selectedCommandIndex;
              return (
                <div 
                  key={cmd.label}
                  onClick={() => executeCommand(cmd.label)}
                  onMouseEnter={() => setSelectedCommandIndex(idx)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem',
                    background: isSelected ? '#4f46e5' : 'transparent', cursor: 'pointer',
                    color: isSelected ? '#fff' : '#ddd', fontSize: '0.85rem', transition: 'background 0.1s'
                  }}
                >
                  <strong style={{ color: isSelected ? '#fff' : '#818cf8' }}>{cmd.label}</strong>
                  <span style={{ fontSize: '0.8rem', color: isSelected ? '#ddd' : '#aaa' }}>{cmd.desc}</span>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="input-form-wrapper">
          <textarea
            ref={textareaRef}
            className={`chat-textarea-input ${isListening ? 'input-listening-glow' : ''}`}
            rows="1"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening closely... Speak now." : "Type / for actions or ask a question..."}
            disabled={isLoading}
          />

          <div className="input-actions-cluster">
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
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { api } from './services/api.js';

export default function App() {
  const [chats, setChats] = useLocalStorage('ai_faq_chats', []);
  const [activeChatId, setActiveChatId] = useLocalStorage('ai_faq_active_id', null);
  const [theme, setTheme] = useLocalStorage('ai_faq_theme', 'dark');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load initial automated prompt triggers
  useEffect(() => {
    api.getSuggestions()
      .then(res => setSuggestions(res.suggestions))
      .catch(err => console.error('Error fetching query prompts alternatives:', err));
  }, []);

  // Sync structural document body themes dynamically
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const handleNewChat = () => {
    const newId = `chat_${Date.now()}`;
    const newChat = {
      id: newId,
      title: `New Discussion ${chats.length + 1}`,
      messages: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
    setIsSidebarOpen(false);
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  const handleSendMessage = async (text) => {
    if (!activeChatId) return;

    const userMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    // Append user query local state view
    let updatedChats = chats.map(c => {
      if (c.id === activeChatId) {
        // Set context conversation title based on first query
        const title = c.messages.length === 0 ? (text.length > 26 ? text.substring(0, 25) + '...' : text) : c.title;
        return {
          ...c,
          title,
          messages: [...c.messages, userMessage],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    setChats(updatedChats);
    setIsLoading(true);

    try {
      const responseData = await api.sendQuery(text);
      
      const botMessage = {
        id: `msg_${Date.now()}_b`,
        sender: 'bot',
        text: responseData.answer,
        confidence: responseData.confidence,
        matched: responseData.matched,
        category: responseData.category,
        userQuery: text, // retained for feedback references mapping
        timestamp: new Date().toISOString()
      };

      setChats(prevChats => prevChats.map(c => {
        if (c.id === activeChatId) {
          return { ...c, messages: [...c.messages, botMessage], updatedAt: new Date().toISOString() };
        }
        return c;
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId, query, answer, feedbackType) => {
    try {
      await api.submitFeedback(messageId, query, answer, feedbackType);
    } catch (err) {
      console.error('Failed processing server telemetry tracking metrics:', err);
    }
  };

  const handleDeleteChat = (id) => {
    const remaining = chats.filter(c => c.id !== id);
    setChats(remaining);
    if (activeChatId === id) {
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRenameChat = (id, newTitle) => {
    setChats(chats.map(c => c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c));
  };

  const handleTogglePin = (id) => {
    setChats(chats.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
  };

  return (
    <div className="app-layout-root">
      <Sidebar 
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setIsSidebarOpen(false); }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePin={handleTogglePin}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="main-content-pane">
        <header className="app-top-navbar">
          <div className="brand-title">
            <span className="sparkle-icon">✨</span> AI FAQ Desk
          </div>
          <ThemeToggle theme={theme} toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        </header>

        <ChatWindow 
          chat={activeChat}
          onSendMessage={handleSendMessage}
          suggestions={suggestions}
          isLoading={isLoading}
          onFeedback={handleFeedback}
        />
      </main>
    </div>
  );
}
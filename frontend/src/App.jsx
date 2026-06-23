import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import Auth from './components/Auth.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { api } from './services/api.js';

export default function App() {
  // Authentication & Session Session Tracking Hooks
  const [token, setToken] = useLocalStorage('ai_faq_token', null);
  const [user, setUser] = useLocalStorage('ai_faq_user', null);

  // Layout View & Core System States
  const [chats, setChats] = useLocalStorage('ai_faq_chats', []);
  const [activeChatId, setActiveChatId] = useLocalStorage('ai_faq_active_id', null);
  const [theme, setTheme] = useLocalStorage('ai_faq_theme', 'dark');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Fetch initial system suggestions when user logs in successfully
  useEffect(() => {
    if (!token) return;

    api.getSuggestions()
      .then(data => {
        if (data?.authError) return handleLogout();
        setSuggestions(data || []);
      })
      .catch(err => console.error('Error fetching dynamic prompts:', err));
  }, [token]);

  // Sync interface themes smoothly
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setActiveChatId(null);
    setChats([]); // Clear active local layout cache to preserve user privacy
  };

  const handleNewChat = () => {
    const newId = `chat_${Date.now()}`;
    const newChat = {
      id: newId,
      userId: user?.id,
      title: `New Discussion ${chats.filter(c => c.userId === user?.id).length + 1}`,
      messages: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
    setIsSidebarOpen(false);
  };

  // Keep conversations isolated per active account signature
  const userFilteredChats = chats.filter(c => c.userId === user?.id);
  const activeChat = userFilteredChats.find(c => c.id === activeChatId);

  const handleSendMessage = async (text, currentLanguageCode = 'en-US') => {
    if (!activeChatId) return;

    const userMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    // Optimistically push user message to UI state layout
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        const title = c.messages.length === 0 ? (text.length > 26 ? text.substring(0, 25) + '...' : text) : c.title;
        return { ...c, title, messages: [...c.messages, userMessage], updatedAt: new Date().toISOString() };
      }
      return c;
    }));
    
    setIsLoading(true);

    try {
      const responseData = await api.sendQuery(text, currentLanguageCode);

      if (responseData?.authError) {
        handleLogout();
        return;
      }
      
      const botMessage = {
        id: responseData.id || `msg_${Date.now()}_b`,
        sender: 'bot',
        // FIX: Extract responseData.answer (or fallback to responseData.text/message) 
        text: responseData.answer || responseData.text || responseData.message || "No textual response content provided.", 
        confidence: responseData.confidence || responseData.matchScore,
        matched: responseData.matched,
        category: responseData.category,
        userQuery: text,
        timestamp: responseData.timestamp || new Date().toISOString()
      };

      setChats(prevChats => prevChats.map(c => {
        if (c.id === activeChatId) {
          return { ...c, messages: [...c.messages, botMessage], updatedAt: new Date().toISOString() };
        }
        return c;
      }));
    } catch (err) {
      console.error('Failed parsing AI reply streams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId, query, answer, feedbackType) => {
    try {
      await api.submitFeedback(messageId, query, answer, feedbackType);
    } catch (err) {
      console.error('Failed processing backend telemetry sync:', err);
    }
  };

  const handleDeleteChat = (id) => {
    const remaining = chats.filter(c => c.id !== id);
    setChats(remaining);
    if (activeChatId === id) {
      const nextUserChat = remaining.filter(c => c.userId === user?.id);
      setActiveChatId(nextUserChat.length > 0 ? nextUserChat[0].id : null);
    }
  };

  const handleRenameChat = (id, newTitle) => {
    setChats(chats.map(c => c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c));
  };

  const handleTogglePin = (id) => {
    setChats(chats.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
  };

  // 🛡️ SECURITY INTERCEPT GUARD WALL
  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-layout-root">
      <Sidebar 
        chats={userFilteredChats} 
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
        <header className="app-top-navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem' }}>
          <div className="brand-title">
            <span className="sparkle-icon">✨</span> AI FAQ Desk <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: '0.5rem' }}>({user?.name})</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="admin-toggle-nav-btn" onClick={() => setIsAdminOpen(true)}>
              📊 Admin Portal
            </button>
            <button 
              onClick={handleLogout} 
              style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              🚪 Logout
            </button>
            <ThemeToggle theme={theme} toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          </div>
        </header>

        <ChatWindow 
          chat={activeChat}
          onSendMessage={handleSendMessage}
          suggestions={suggestions}
          isLoading={isLoading}
          onFeedback={handleFeedback}
        />
      </main>
      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}
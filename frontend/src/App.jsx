import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import Auth from './components/Auth.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { api } from './services/api.js';

export default function App() {
  const [token, setToken] = useLocalStorage('ai_faq_token', null);
  const [user, setUser] = useLocalStorage('ai_faq_user', null);
  const [chats, setChats] = useLocalStorage('ai_faq_chats', []);
  const [activeChatId, setActiveChatId] = useLocalStorage('ai_faq_active_id', null);
  const [theme, setTheme] = useLocalStorage('ai_faq_theme', 'dark');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const openSettings = () => setIsSettingsOpen(true);
    window.addEventListener('open-ai-settings', openSettings);
    return () => window.removeEventListener('open-ai-settings', openSettings);
  }, []);

  useEffect(() => {
    if (!token) return;
    api.getSuggestions()
      .then(data => { if (data?.authError) return handleLogout(); setSuggestions(data || []); })
      .catch(err => console.error('Error fetching dynamic prompts:', err));
  }, [token]);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const handleAuthSuccess = (newToken, newUser) => { setToken(newToken); setUser(newUser); };
  const handleLogout = () => { setToken(null); setUser(null); setActiveChatId(null); };

  const handleNewChat = () => {
    const newId = `chat_${Date.now()}`;
    const currentUserId = user?.id || user?.userId;
    const newChat = {
      id: newId, userId: currentUserId,
      title: `New Discussion ${chats.filter(c => c.userId === currentUserId).length + 1}`,
      messages: [], isPinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
    setIsSidebarOpen(false);
  };

  const currentUserId = user?.id || user?.userId;
  const userFilteredChats = chats.filter(c => c.userId === currentUserId);
  const activeChat = userFilteredChats.find(c => c.id === activeChatId);

  const handleClearAllUserChats = () => {
    setChats(prev => prev.filter(c => c.userId !== currentUserId));
    setActiveChatId(null);
  };

  const handleSendMessage = async (text, currentLanguageCode = 'en-US') => {
    if (!activeChatId) return;

    const userMessage = { id: `msg_${Date.now()}_u`, sender: 'user', text, timestamp: new Date().toISOString() };

    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, userMessage], updatedAt: new Date().toISOString() } : c));

    // ⚡ INTERCEPT SYSTEM MACROS
    if (text.startsWith('[SYSTEM MACRO')) {
      let mockBotReply = { id: `msg_${Date.now()}_b`, sender: 'bot', timestamp: new Date().toISOString(), category: 'System', confidence: 100, userQuery: 'System Command' };

      if (text.includes('/HELP')) {
        mockBotReply.text = `### 🛠️ System Dashboard Blueprint\n\n| Capability | Scope | Hotkey Trigger |\n|---|---|---|\n| **Vector Administration** | CRUD data operations & training | Admin Panel Tab 1 |\n| **Engine Intelligence** | Real-time TF.js calibration telemetry | Admin Panel Tab 2 |\n| **Quick Actions Menu** | Instant utility macro injection | Type \`/\` in input |\n\n* **Active NLP Categories:** General, Technology, AI Engine, UI Design.`;
      } else if (text.includes('/SUMMARIZE')) {
        mockBotReply.text = `Here is a quick runtime summary of your session environment:\n- **Dashboard Active:** True\n- **Analytics Connected:** Live telemetry hooked up\n- **Command Status:** Local macro interception applied successfully.`;
      }

      setTimeout(() => {
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, mockBotReply], updatedAt: new Date().toISOString() } : c));
      }, 300);
      return;
    }

    // 🚀 Standard API Backend Flow
    setIsLoading(true);
    try {
      const responseData = await api.sendQuery(text, currentLanguageCode);
      if (responseData?.authError) { handleLogout(); return; }
      
      const botMessage = {
        id: responseData.id || `msg_${Date.now()}_b`,
        sender: 'bot',
        text: responseData.answer || responseData.text || "No response provided.",
        confidence: responseData.confidence || responseData.matchScore,
        timestamp: responseData.timestamp || new Date().toISOString(),
        userQuery: text 
      };
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, botMessage], updatedAt: new Date().toISOString() } : c));
    } catch (err) { console.error('Failed parsing AI reply streams:', err); }
    finally { setIsLoading(false); }
  };

  const handleFeedback = async (messageId, query, answer, feedbackType) => {
    setChats(prevChats => prevChats.map(c => {
      if (c.id !== activeChatId) return c;
      return {
        ...c,
        messages: c.messages.map(m => 
          m.id === messageId ? { ...m, feedbackStatus: feedbackType } : m
        )
      };
    }));

    try { 
      let realQuery = query;
      if (!realQuery && activeChat) {
        const userMessages = activeChat.messages.filter(m => m.sender === 'user');
        if (userMessages.length > 0) {
          realQuery = userMessages[userMessages.length - 1].text;
        }
      }
      const safeQuery = realQuery || "User Chat Query Inquiry";
      
      await api.submitFeedback(messageId, safeQuery, answer, feedbackType); 
    } catch (err) { 
      console.error("Could not send feedback payloads:", err); 
    }
  };

  const handleDeleteChat = (id) => {
    const remaining = chats.filter(c => c.id !== id);
    setChats(remaining);
    if (activeChatId === id) {
      const nextUserChat = remaining.filter(c => c.userId === currentUserId);
      setActiveChatId(nextUserChat.length > 0 ? nextUserChat[0].id : null);
    }
  };

  const handleRenameChat = (id, newTitle) => { setChats(chats.map(c => c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c)); };
  const handleTogglePin = (id) => { setChats(chats.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c)); };

  if (!token) return <Auth onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="app-layout-root">
      <Sidebar chats={userFilteredChats} activeChatId={activeChatId} onSelectChat={(id) => { setActiveChatId(id); setIsSidebarOpen(false); }} onNewChat={handleNewChat} onDeleteChat={handleDeleteChat} onRenameChat={handleRenameChat} onTogglePin={handleTogglePin} isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="main-content-pane">
        <header className="app-main-header">
          <div className="header-brand-section">
            <div className="brand-logo-glow">🤖</div>
            <div className="brand-text-wrapper"><h1>AI FAQ Engine</h1><span className="user-session-badge">Active Session: <strong>{user?.name || 'User'}</strong></span></div>
          </div>
          <div className="header-actions-panel">
            <button className="nav-action-btn" onClick={() => setIsAdminOpen(true)}>📊 Admin Portal</button>
            <button className="nav-action-btn" onClick={handleLogout}>🚪 Logout</button>
            <ThemeToggle theme={theme} toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          </div>
        </header>
        <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} suggestions={suggestions} isLoading={isLoading} onFeedback={handleFeedback} />
      </main>
      {isAdminOpen && <AdminDashboard chats={chats} onClose={() => setIsAdminOpen(false)} />}
      
      {/* ✅ FIX: Added the allChats={chats} state injection prop right here */}
      {isSettingsOpen && (
        <SettingsModal 
          user={user} 
          theme={theme} 
          allChats={chats} 
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          onClearChats={handleClearAllUserChats} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}
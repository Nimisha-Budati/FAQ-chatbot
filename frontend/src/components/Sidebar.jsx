import React, { useState } from 'react';

export default function Sidebar({
  chats = [],
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePin,
  isSidebarOpen,
  toggleSidebar
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // FILTERING LOGIC
  const filteredChats = chats.filter(chat => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const matchesTitle = chat.title?.toLowerCase().includes(query);
    const matchesMessages = chat.messages?.some(msg => 
      msg.text?.toLowerCase().includes(query)
    );
    return matchesTitle || matchesMessages;
  });

  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const unpinnedChats = filteredChats.filter(c => !c.isPinned);

  const startEditing = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveRename = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  return (
    <aside 
      className={`app-sidebar-pane ${isSidebarOpen ? 'is-expanded' : ''}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        width: isSidebarOpen ? '260px' : '60px', // Fallback defaults if classes fail
        background: '#171717', 
        borderRight: '1px solid #2a2a35',
        transition: 'width 0.2s ease',
        overflow: 'hidden'
      }}
    >
      {/* ➕ TOP SECTION: SIDEBAR TOGGLE & NEW DISCUSSION BUTTON */}
      <div className="sidebar-control-header" style={{ 
        padding: '0.75rem 1rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        borderBottom: '1px solid #2a2a35'
      }}>
        <button className="sidebar-toggle-trigger" onClick={toggleSidebar} style={{
          background: 'transparent', border: '1px solid #333', color: '#fff', 
          borderRadius: '6px', cursor: 'pointer', padding: '0.5rem'
        }}>
          {isSidebarOpen ? '◀' : '▶'}
        </button>
        
        {isSidebarOpen && (
          <button 
            className="action-btn-primary core-new-chat-btn" 
            onClick={onNewChat}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.5rem 0.75rem',
              background: '#202123',
              border: '1px solid #4d4d4d',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              textAlign: 'left'
            }}
          >
            <span className="icon-plus" style={{ fontSize: '1rem' }}>+</span> New Discussion
          </button>
        )}
      </div>

      {/* 🔍 MIDDLE SECTION 1: SEARCH BAR */}
      {isSidebarOpen && (
        <div className="sidebar-search-container" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #2a2a35' }}>
          <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span className="search-icon" style={{ position: 'absolute', left: '10px', color: '#666', fontSize: '0.9rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.5rem 0.5rem 2.2rem',
                borderRadius: '6px',
                border: '1px solid #343541',
                background: '#202123',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 📜 MIDDLE SECTION 2: SCROLLABLE CHAT LISTING */}
      <div className="sidebar-scrollable-history-list" style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
        {isSidebarOpen ? (
          <>
            {filteredChats.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem 1rem', fontSize: '0.85rem' }}>
                No discussions found.
              </div>
            )}

            {/* Pinned Section */}
            {pinnedChats.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#8e8ea0', fontWeight: '700', textTransform: 'uppercase', paddingLeft: '0.5rem' }}>Pinned</span>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0.25rem 0' }}>
                  {pinnedChats.map(chat => renderChatListItem(chat))}
                </ul>
              </div>
            )}

            {/* Unpinned Section */}
            {unpinnedChats.length > 0 && (
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8e8ea0', fontWeight: '700', textTransform: 'uppercase', paddingLeft: '0.5rem' }}>All Chats</span>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0.25rem 0' }}>
                  {unpinnedChats.map(chat => renderChatListItem(chat))}
                </ul>
              </div>
            )}
          </>
        ) : (
          /* Mini Icons View Mode when Sidebar is collapsed */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '0.5rem' }}>
            {chats.map(chat => (
              <button 
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                title={chat.title}
                style={{
                  background: chat.id === activeChatId ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                  border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px', borderRadius: '4px'
                }}
              >
                💬
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ⚙️ BOTTOM SECTION: SETTINGS BAR */}
      <div className="sidebar-footer-profile-bar" style={{
        padding: '0.5rem',
        borderTop: '1px solid #2a2a35',
        background: '#171717'
      }}>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-ai-settings'))}
          title="Settings"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
            gap: '10px',
            padding: '0.6rem 0.75rem',
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2b32'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '1.1rem' }}>⚙️</span>
          {isSidebarOpen && <span style={{ fontWeight: '500' }}>Settings</span>}
        </button>
      </div>
    </aside>
  );

  function renderChatListItem(chat) {
    const isActive = chat.id === activeChatId;
    const isEditing = chat.id === editingChatId;

    return (
      <li 
        key={chat.id}
        onClick={() => !isEditing && onSelectChat(chat.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem',
          borderRadius: '6px',
          cursor: isEditing ? 'default' : 'pointer',
          marginBottom: '0.2rem',
          background: isActive ? '#2a2b32' : 'transparent',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.background = '#202123'; }}
        onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.9rem' }}>💬</span>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveRename(e, chat.id)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                background: '#1a1a22', border: '1px solid #4f46e5', color: '#fff',
                padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.8rem', width: '80%'
              }}
            />
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#ececf1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {chat.title}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '2px' }}>
          {isEditing ? (
            <button onClick={(e) => saveRename(e, chat.id)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}>💾</button>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); onTogglePin(chat.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                {chat.isPinned ? '📌' : '📍'}
              </button>
              <button onClick={(e) => startEditing(e, chat)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>✏️</button>
              <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>🗑️</button>
            </>
          )}
        </div>
      </li>
    );
  }
}
import React, { useState } from 'react';

export default function Sidebar({ 
  chats, 
  activeChatId, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat, 
  onRenameChat, 
  onTogglePin,
  isSidebarOpen,
  toggleSidebar
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startRename = (chat, e) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveRename = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  // Sort logic: pinned chats stay anchored at the top
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return (
    <>
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        🗂️ Menu
      </button>

      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={onNewChat}>
            <span>+</span> New Chat
          </button>
        </div>

        <nav className="chat-history-list">
          <div className="history-section-title">Conversations</div>
          {sortedChats.length === 0 ? (
            <p className="empty-history-text">No chat sessions logged</p>
          ) : (
            sortedChats.map((chat) => (
              <div 
                key={chat.id} 
                className={`chat-history-item ${chat.id === activeChatId ? 'active' : ''} ${chat.isPinned ? 'pinned' : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="chat-item-main">
                  <span className="chat-icon-indicator">💬</span>
                  {editingId === chat.id ? (
                    <input 
                      type="text" 
                      className="rename-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={(e) => saveRename(chat.id, e)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename(chat.id, e)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="chat-title-text">{chat.title}</span>
                  )}
                </div>

                <div className="chat-item-actions">
                  <button 
                    className="action-icon-btn pin-btn" 
                    onClick={(e) => { e.stopPropagation(); onTogglePin(chat.id); }}
                    title={chat.isPinned ? "Unpin Chat" : "Pin Chat"}
                  >
                    📌
                  </button>
                  <button 
                    className="action-icon-btn edit-btn" 
                    onClick={(e) => startRename(chat, e)}
                    title="Rename"
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-icon-btn delete-btn" 
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
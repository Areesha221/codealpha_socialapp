let currentChat = null;
let messagePollingInterval = null;

async function renderMessages() {
  const storiesSection = document.getElementById('stories-section');
  if (storiesSection) storiesSection.style.display = 'none';

  const feedContent = document.getElementById('feed-content');
  const mainContent = document.getElementById('main-content');
  if (!feedContent) return;
  
  if (mainContent) {
    mainContent.classList.add('messages-active');
    mainContent.classList.remove('profile-active', 'explore-active', 'search-active', 'reels-active');
    mainContent.style.padding = '0';
    mainContent.style.maxWidth = '100%';
  }

  feedContent.innerHTML = `
    <div class="messages-layout">
      <!-- LEFT PANEL: Conversations List -->
      <div class="conversations-sidebar" id="conversations-sidebar">
        <div class="sidebar-header">
          <h4 class="mb-0 text-white">
            <i class="bi bi-chat-dots me-2"></i>Messages
          </h4>
          <button class="btn btn-link text-white p-0" onclick="showNewMessageModal()">
            <i class="bi bi-pencil-square fs-5"></i>
          </button>
        </div>
        
        <div class="search-box">
          <input type="text" placeholder="Search" oninput="filterConversations(this.value)">
        </div>
        
        <div class="notes-section" id="notes-section">
          <div class="notes-wrapper" id="notes-wrapper"></div>
        </div>
        
        <div class="conversations-list" id="conversations-list">
          <div class="text-center py-5"><div class="spinner-border text-light"></div></div>
        </div>
      </div>

      <!-- RIGHT PANEL: Chat Area or Empty State -->
      <div class="chat-area" id="chat-area">
        <!-- Empty State (Visible when no chat is open) -->
        <div id="empty-state" class="empty-messages">
          <i class="bi bi-chat-square-text" style="font-size: 96px; color: var(--text-secondary); margin-bottom: 20px;"></i>
          <h3 style="font-size: 24px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">Your messages</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.5; margin-bottom: 30px; max-width: 300px;">
            Send private photos and messages to a friend or group.
          </p>
          <button class="btn btn-primary rounded-pill px-4" onclick="showNewMessageModal()" style="padding: 12px 32px; font-weight: 600;">
            Send message
          </button>
        </div>

        <!-- Active Chat (Visible when a conversation is selected) -->
        <div id="active-chat" class="active-chat-container" style="display: none;">
          <div class="chat-header">
            <button class="btn btn-link text-white d-md-none me-2" onclick="backToConversations()">
              <i class="bi bi-arrow-left fs-5"></i>
            </button>
            <div class="chat-header-avatar">
              <img id="chat-user-avatar" src="" alt="">
              <span id="chat-user-status" class="status-indicator offline"></span>
            </div>
            <div class="chat-header-info">
              <div id="chat-username" class="chat-header-name"></div>
              <div id="chat-status" class="chat-header-status"></div>
            </div>
            <button class="btn btn-link text-white" onclick="closeActiveChat()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="messages-area" id="messages-container"></div>

          <div class="chat-input-wrapper">
            <form onsubmit="handleSendMessage(event)">
              <input type="text" id="message-input" placeholder="Message..." autocomplete="off">
              <button type="submit"><i class="bi bi-send-fill"></i></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadConversations();
  await loadNotes();
}

async function loadNotes() {
  try {
    const convData = await api.getConversations();
    // ✅ SAFE ARRAY CHECK
    const conversations = Array.isArray(convData) ? convData : (convData.conversations || []);
    
    const notesWrapper = document.getElementById('notes-wrapper');
    if (!notesWrapper || !conversations) return;
    
    const notesHtml = conversations.map(conv => {
      let userImg = conv.user?.profileImage || '';
      if (!userImg.startsWith('http')) userImg = `https://codealpha-socialapp-backend.onrender.com${userImg}`;
      const note = localStorage.getItem(`note_${conv.user?._id}`) || '';
      
      return `
        <div class="note-item" onclick="openChat('${conv.user._id}', '${conv.user.username}', '${conv.user.profileImage || ''}', '${conv.user.isOnline || false}')">
          ${note ? `
            <div class="note-bubble">${note}</div>
          ` : `
            <div class="note-bubble"><img src="${userImg}" alt=""></div>
          `}
          <div class="note-username">${conv.user.username}</div>
        </div>
      `;
    }).join('');
    
    notesWrapper.innerHTML = notesHtml;
  } catch (error) {
    console.error('Error loading notes:', error);
  }
}

async function loadConversations() {
  try {
    const convData = await api.getConversations();
    // ✅ SAFE ARRAY CHECK
    const conversations = Array.isArray(convData) ? convData : (convData.conversations || []);
    
    const container = document.getElementById('conversations-list');
    if (!container) return;
    
    if (!conversations || conversations.length === 0) {
      container.innerHTML = `<div class="text-center py-5 text-muted">No conversations yet</div>`;
      return;
    }
    
    container.innerHTML = conversations.map(conv => {
      let userImg = conv.user?.profileImage || '';
      if (!userImg.startsWith('http')) userImg = `https://codealpha-socialapp-backend.onrender.com${userImg}`;
      const isOnline = conv.user?.isOnline || false;
      
      return `
        <div class="conversation-item" data-username="${(conv.user?.username || '').toLowerCase()}"
             onclick="openChat('${conv.user._id}', '${conv.user.username}', '${conv.user.profileImage || ''}', '${isOnline}')">
          <div class="conversation-avatar">
            <img src="${userImg}" alt="">
            <span class="status-indicator ${isOnline ? 'online' : 'offline'}"></span>
          </div>
          <div class="conversation-info">
            <div class="conversation-username">${conv.user.username}</div>
            <div class="conversation-preview">${conv.lastMessage ? conv.lastMessage.text : 'No messages yet'}</div>
          </div>
          ${conv.unreadCount > 0 ? `<span class="badge bg-primary">${conv.unreadCount}</span>` : ''}
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
}

function filterConversations(query) {
  const items = document.querySelectorAll('.conversation-item');
  const lowerQuery = query.toLowerCase();
  items.forEach(item => {
    const username = item.dataset.username || '';
    item.style.display = username.includes(lowerQuery) ? 'flex' : 'none';
  });
}

async function openChat(userId, username, profileImage, isOnline) {
  currentChat = userId;
  
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('active-chat').style.display = 'flex';
  
  const sidebar = document.getElementById('conversations-sidebar');
  if (sidebar && window.innerWidth <= 768) sidebar.style.display = 'none';
  
  document.getElementById('chat-username').textContent = username;
  
  let img = profileImage || '';
  if (!img.startsWith('http')) img = `https://codealpha-socialapp-backend.onrender.com${img}`;
  document.getElementById('chat-user-avatar').src = img;
  
  const statusDot = document.getElementById('chat-user-status');
  const statusText = document.getElementById('chat-status');
  
  if (isOnline === 'true' || isOnline === true) {
    statusDot.className = 'status-indicator online';
    statusText.textContent = 'Active now';
  } else {
    statusDot.className = 'status-indicator offline';
    statusText.textContent = 'Offline';
  }
  
  await loadMessages(userId);
  
  if (messagePollingInterval) clearInterval(messagePollingInterval);
  messagePollingInterval = setInterval(() => loadMessages(userId), 3000);
}

async function loadMessages(userId) {
  try {
    const msgData = await api.getMessages(userId);
    // ✅ SAFE ARRAY CHECK
    const messages = Array.isArray(msgData) ? msgData : (msgData.messages || []);
    
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    if (!messages || messages.length === 0) {
      container.innerHTML = `<div class="text-center text-muted py-5">Say hi! 👋</div>`;
      return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    container.innerHTML = messages.map(msg => {
      const isSender = msg.sender?._id === currentUser._id;
      const time = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
      
      return `
        <div class="message-wrapper ${isSender ? 'sent' : 'received'}">
          <div class="message-bubble">
            <div>${msg.text}</div>
            <div class="message-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
    
    container.scrollTop = container.scrollHeight;
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

async function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('message-input');
  const text = input ? input.value.trim() : '';
  if (!text || !currentChat) return;
  
  try {
    await api.sendMessage(currentChat, text);
    input.value = '';
    await loadMessages(currentChat);
    await loadConversations();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

function closeActiveChat() {
  document.getElementById('empty-state').style.display = 'flex';
  document.getElementById('active-chat').style.display = 'none';
  currentChat = null;
  if (messagePollingInterval) clearInterval(messagePollingInterval);
}

function backToConversations() {
  const sidebar = document.getElementById('conversations-sidebar');
  if (sidebar) sidebar.style.display = 'flex';
  closeActiveChat();
}

function showNewMessageModal() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white">New Message</h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-control bg-dark border-secondary text-white mb-3 rounded-pill" 
                 id="search-users-input" placeholder="Search users...">
          <div id="search-users-results"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  document.getElementById('search-users-input').addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) {
      document.getElementById('search-users-results').innerHTML = '';
      return;
    }
    
    try {
      const userData = await api.searchUsers(query);
      // ✅ SAFE ARRAY CHECK
      const users = Array.isArray(userData) ? userData : (userData.users || []);
      
      const resultsDiv = document.getElementById('search-users-results');
      
      if (users.length === 0) {
        resultsDiv.innerHTML = '<p class="text-muted text-center py-3">No users found</p>';
      } else {
        resultsDiv.innerHTML = users.map(user => {
          let img = user.profileImage || '';
          if (!img.startsWith('http')) img = `https://codealpha-socialapp-backend.onrender.com${img}`;
          return `
            <div class="conversation-item" onclick="startNewConversation('${user._id}', '${user.username}', '${user.profileImage || ''}')">
              <div class="conversation-avatar"><img src="${img}" alt=""></div>
              <div class="conversation-info">
                <div class="conversation-username">${user.username}</div>
                <div class="conversation-preview">${user.fullName || ''}</div>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  });
  
  window.startNewConversation = (userId, username, profileImage) => {
    modal.remove();
    openChat(userId, username, profileImage, 'false');
    delete window.startNewConversation;
  };
}

// Export all functions
window.renderMessages = renderMessages;
window.openChat = openChat;
window.handleSendMessage = handleSendMessage;
window.loadConversations = loadConversations;
window.closeActiveChat = closeActiveChat;
window.backToConversations = backToConversations;
window.showNewMessageModal = showNewMessageModal;
window.filterConversations = filterConversations;
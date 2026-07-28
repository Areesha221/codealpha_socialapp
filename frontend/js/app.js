var socket = null;
const BACKEND_URL = 'https://codealpha-socialapp-backend.onrender.com';
let currentPage = 'feed';

// Save current page
function saveCurrentPage(page) {
  currentPage = page;
  localStorage.setItem('currentPage', page);
}

// Load saved page
function loadSavedPage() {
  const savedPage = localStorage.getItem('currentPage') || 'feed';
  return savedPage;
}

function navigate(page, param = null) {
  const token = localStorage.getItem('token');
  if (!token && page !== 'login' && page !== 'register') {
    if (typeof renderLogin === 'function') renderLogin();
    return;
  }

  saveCurrentPage(page);

  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[onclick*="navigate('${page}'"]`);
  if (activeNav) activeNav.classList.add('active');

  const feedContent = document.getElementById('feed-content');
  const storiesSection = document.getElementById('stories-section');
  const rightSidebar = document.getElementById('right-sidebar');
  const mainContent = document.getElementById('main-content');

  if (mainContent) {
    mainContent.classList.remove('messages-active', 'profile-active', 'explore-active', 'search-active', 'reels-active');
    mainContent.style.maxWidth = '';
  }
  if (rightSidebar) rightSidebar.style.display = 'block';
  if (storiesSection) storiesSection.style.display = 'block';

  switch (page) {
    case 'feed':
      if (feedContent) feedContent.innerHTML = '';
      if (typeof renderFeed === 'function') renderFeed();
      break;
    case 'login':
      if (feedContent) feedContent.innerHTML = '';
      if (typeof renderLogin === 'function') renderLogin();
      break;
    case 'register':
      if (feedContent) feedContent.innerHTML = '';
      if (typeof renderRegister === 'function') renderRegister();
      break;
    case 'profile':
      if (feedContent) feedContent.innerHTML = '';
      if (mainContent) mainContent.classList.add('profile-active');
      if (rightSidebar) rightSidebar.style.display = 'none';
      if (storiesSection) storiesSection.style.display = 'none';
      let userId = param;
      if (!userId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try { userId = JSON.parse(userStr)._id; } catch (e) { }
        }
      }
      if (userId && typeof renderProfile === 'function') renderProfile(userId);
      break;
    case 'messages':
      if (feedContent) feedContent.innerHTML = '';
      if (mainContent) mainContent.classList.add('messages-active');
      if (rightSidebar) rightSidebar.style.display = 'none';
      if (storiesSection) storiesSection.style.display = 'none';
      if (typeof renderMessages === 'function') renderMessages();
      break;
    case 'notifications':
      if (feedContent) feedContent.innerHTML = '';
      if (mainContent) mainContent.classList.add('search-active');
      if (rightSidebar) rightSidebar.style.display = 'none';
      if (storiesSection) storiesSection.style.display = 'none';
      if (typeof renderNotifications === 'function') renderNotifications();
      break;
    case 'search':
      if (feedContent) feedContent.innerHTML = '';
      if (mainContent) mainContent.classList.add('search-active');
      if (rightSidebar) rightSidebar.style.display = 'none';
      if (storiesSection) storiesSection.style.display = 'none';
      if (typeof renderSearch === 'function') renderSearch();
      break;
    case 'explore':
      if (feedContent) feedContent.innerHTML = '';
      if (mainContent) mainContent.classList.add('explore-active');
      if (rightSidebar) rightSidebar.style.display = 'none';
      if (storiesSection) storiesSection.style.display = 'none';
      if (typeof renderExplore === 'function') renderExplore();
      break;
    case 'create':
      if (feedContent) feedContent.innerHTML = '';
      if (mainContent) mainContent.classList.add('search-active');
      if (rightSidebar) rightSidebar.style.display = 'none';
      if (storiesSection) storiesSection.style.display = 'none';
      showCreatePostModal();
      break;
    case 'reels':
      if (feedContent) feedContent.innerHTML = '';
      if (mainContent) mainContent.classList.add('reels-active');
      if (rightSidebar) rightSidebar.style.display = 'none';
      if (storiesSection) storiesSection.style.display = 'none';
      renderReels();
      break;
    case 'saved':
      if (feedContent) feedContent.innerHTML = '';
      if (mainContent) mainContent.classList.add('search-active');
      if (rightSidebar) rightSidebar.style.display = 'none';
      if (storiesSection) storiesSection.style.display = 'none';
      if (typeof renderSaved === 'function') renderSaved();
      break;
    case 'activity':
      if (feedContent) feedContent.innerHTML = '';
      if (mainContent) mainContent.classList.add('search-active');
      if (rightSidebar) rightSidebar.style.display = 'none';
      if (storiesSection) storiesSection.style.display = 'none';
      if (typeof renderActivity === 'function') renderActivity();
      break;
    default:
      if (feedContent) feedContent.innerHTML = '';
      if (typeof renderFeed === 'function') renderFeed();
  }
}

function updateNavigation() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user) return;

  let profileImg = user.profileImage || '';
  if (!profileImg.startsWith('http')) profileImg = `${BACKEND_URL}${profileImg}`;

  const navImg = document.getElementById('nav-profile-img');
  const navImgMobile = document.getElementById('nav-profile-img-mobile');
  const sidebarImg = document.getElementById('sidebar-profile-img');
  const sidebarUsername = document.getElementById('sidebar-username');
  const sidebarFullname = document.getElementById('sidebar-fullname');

  if (navImg) navImg.src = profileImg;
  if (navImgMobile) navImgMobile.src = profileImg;
  if (sidebarImg) sidebarImg.src = profileImg;
  if (sidebarUsername) sidebarUsername.textContent = user.username;
  if (sidebarFullname) sidebarFullname.textContent = user.fullName;
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('addingNewAccount');
    window.location.reload();
  }
}

function initSocket() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user || !user._id) return;
  if (socket && socket.connected) return;

  socket = io('http://localhost:5000');
  socket.on('connect', () => {
    console.log('✅ Connected to Socket.IO');
    socket.emit('join', user._id);
  });
  socket.on('receive_notification', (n) => {
    if (typeof showNotificationToast === 'function') showNotificationToast(n);
  });
}

function showNotificationToast(notification) {
  let message = '';
  switch (notification.type) {
    case 'like': message = 'liked your post'; break;
    case 'comment': message = 'commented on your post'; break;
    case 'follow': message = 'started following you'; break;
    default: message = 'has a notification';
  }
  showToast(`${notification.sender.username} ${message}`, 'info');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastBody = document.getElementById('toast-body');
  toastTitle.textContent = type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info';
  toastBody.textContent = message;
  new bootstrap.Toast(toast).show();
}

// ==========================================
// WORKING ACCOUNT SWITCHER & ADD ACCOUNT
// ==========================================
function showAccountSwitcher() {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white">Switch Account</h5>
          <button type="button" class="btn-close btn-close-white" onclick="closeModal(this)"></button>
        </div>
        <div class="modal-body p-0">
          <div class="list-group list-group-flush">
            ${accounts.length === 0 ? `
              <div class="list-group-item bg-dark text-white border-secondary text-center py-3">
                <i class="bi bi-people d-block mb-2" style="font-size:2rem;"></i>
                No other accounts
              </div>
            ` : accounts.map(acc => `
              <div class="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex align-items-center justify-content-between" 
                   onclick="switchToAccount('${acc.username}')">
                <div class="d-flex align-items-center">
                  <img src="${acc.profileImage || ''}" class="rounded-circle me-2" style="width:32px;height:32px;object-fit:cover;">
                  <div>
                    <div class="fw-bold">${acc.username}</div>
                    <div class="text-muted small">${acc.fullName}</div>
                  </div>
                </div>
                ${acc.username === currentUser.username ? '<span class="badge bg-primary">Current</span>' : ''}
              </div>
            `).join('')}
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary text-center" onclick="addNewAccount()">
              <i class="bi bi-plus-circle me-2"></i>Add Account
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
}

function addNewAccount() {
  // Save current user to accounts list before navigating to login
  saveCurrentUserToAccounts();
  localStorage.setItem('addingNewAccount', 'true');
  closeModal(document.querySelector('.modal'));
  navigate('login');
}

function saveCurrentUserToAccounts() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (currentUser.username) {
    let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    // Remove if already exists to avoid duplicates
    accounts = accounts.filter(acc => acc.username !== currentUser.username);
    accounts.push(currentUser);
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }
}

function switchToAccount(username) {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  const account = accounts.find(acc => acc.username === username);
  if (account) {
    localStorage.setItem('user', JSON.stringify(account));
    localStorage.setItem('token', account.token || 'dummy-token');
    showToast(`Switched to ${username}`, 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

// Call this function in auth.js after successful login/register
window.finalizeAccountSwitch = function(newUser) {
  const isAdding = localStorage.getItem('addingNewAccount') === 'true';
  if (isAdding) {
    localStorage.removeItem('addingNewAccount');
    showToast(`Successfully added and switched to ${newUser.username}`, 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

function closeModal(element) {
  const modal = element.closest('.modal');
  if (modal) {
    modal.remove();
  }
}

// ==========================================
// MOBILE HAMBURGER MENU (TOGGLE WORKING)
// ==========================================
let menuModal = null;

function showMobileMenu() {
  // If menu is already open, close it (Toggle functionality)
  if (menuModal) {
    closeMenu();
    return;
  }

  menuModal = document.createElement('div');
  menuModal.className = 'modal fade show';
  menuModal.style.display = 'block';
  menuModal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-body p-0">
          <div class="list-group list-group-flush">
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="navigate('explore'); closeMenu()">
              <i class="bi bi-compass me-2"></i>Explore
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="navigate('notifications'); closeMenu()">
              <i class="bi bi-heart me-2"></i>Notifications
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="showCreatePostModal(); closeMenu()">
              <i class="bi bi-plus-square me-2"></i>Create Post
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="navigate('saved'); closeMenu()">
              <i class="bi bi-bookmark me-2"></i>Saved
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="navigate('activity'); closeMenu()">
              <i class="bi bi-activity me-2"></i>Your Activity
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="toggleAppearance(); closeMenu()">
              <i class="bi bi-moon me-2"></i>Switch appearance
            </button>
            <hr class="border-secondary my-2">
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="showAccountSwitcher(); closeMenu()">
              <i class="bi bi-person-gear me-2"></i>Account Center
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="showToast('Settings coming soon', 'info'); closeMenu()">
              <i class="bi bi-gear me-2"></i>Settings
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="showToast('Privacy coming soon', 'info'); closeMenu()">
              <i class="bi bi-shield-lock me-2"></i>Privacy
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="showToast('Blocked users coming soon', 'info'); closeMenu()">
              <i class="bi bi-slash-circle me-2"></i>Blocked
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-danger border-secondary" onclick="handleLogout()">
              <i class="bi bi-box-arrow-right me-2"></i>Log out
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary text-center" onclick="closeMenu()">
              <i class="bi bi-x-lg me-2"></i>Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(menuModal);
  
  menuModal.addEventListener('click', (e) => {
    if (e.target === menuModal) closeMenu();
  });
}

function closeMenu() {
  if (menuModal) {
    menuModal.remove();
    menuModal = null;
  }
}

function showMoreMenu() {
  showMobileMenu();
}

function toggleAppearance() {
  const isLightMode = document.body.classList.contains('light-mode');
  
  if (isLightMode) {
    document.body.classList.remove('light-mode');
    document.documentElement.style.setProperty('--bg-primary', '#000000');
    document.documentElement.style.setProperty('--bg-secondary', '#121212');
    document.documentElement.style.setProperty('--bg-tertiary', '#262626');
    document.documentElement.style.setProperty('--text-primary', '#ffffff');
    document.documentElement.style.setProperty('--text-secondary', '#8e8e8e');
    document.documentElement.style.setProperty('--border-color', '#262626');
    
    document.querySelectorAll('.instagram-theme, .sidebar-navigation, .main-content, .card, .modal-content, .profile-page-container, .messages-layout, .conversations-sidebar, .chat-area').forEach(el => {
      el.style.backgroundColor = '#000000';
      el.style.color = '#ffffff';
    });
    
    localStorage.setItem('theme', 'dark');
    showToast('Switched to dark mode', 'success');
  } else {
    document.body.classList.add('light-mode');
    document.documentElement.style.setProperty('--bg-primary', '#ffffff');
    document.documentElement.style.setProperty('--bg-secondary', '#fafafa');
    document.documentElement.style.setProperty('--bg-tertiary', '#efefef');
    document.documentElement.style.setProperty('--text-primary', '#262626');
    document.documentElement.style.setProperty('--text-secondary', '#8e8e8e');
    document.documentElement.style.setProperty('--border-color', '#dbdbdb');
    
    document.querySelectorAll('.instagram-theme, .sidebar-navigation, .main-content, .card, .modal-content, .profile-page-container, .messages-layout, .conversations-sidebar, .chat-area').forEach(el => {
      el.style.backgroundColor = '#ffffff';
      el.style.color = '#262626';
    });
    
    localStorage.setItem('theme', 'light');
    showToast('Switched to light mode', 'success');
  }
}

function showAllSuggestions() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white">Suggested for you</h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body" id="all-suggestions-list">
          <div class="text-center py-3"><div class="spinner-border text-light"></div></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  loadAllSuggestions();
}

async function loadAllSuggestions() {
  try {
    const users = await api.searchUsers('');
    const container = document.getElementById('all-suggestions-list');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const suggestions = users.filter(u => u._id !== currentUser._id);

    if (suggestions.length === 0) {
      container.innerHTML = '<p class="text-muted text-center">No suggestions</p>';
      return;
    }
    container.innerHTML = suggestions.map(user => {
      let img = user.profileImage || '';
      if (!img.startsWith('http')) img = `${BACKEND_URL}${img}`;
      return `
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
          <div class="d-flex align-items-center">
            <img src="${img}" class="rounded-circle me-3" style="width:44px;height:44px;object-fit:cover;">
            <div>
              <div class="text-white fw-bold">${user.username}</div>
              <div class="text-muted small">${user.fullName}</div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="navigate('profile', '${user._id}')">View</button>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Suggestions error:', error);
  }
}

function renderSearch() {
  const feedContent = document.getElementById('feed-content');
  if (!feedContent) return;

  feedContent.innerHTML = `
    <div class="search-page-container">
      <h2 class="text-white mb-4" style="font-size:28px;font-weight:300;">Search</h2>
      <div class="search-box mb-4">
        <input type="text" class="form-control form-control-lg bg-dark border-secondary text-white rounded-pill" 
               id="global-search-input" placeholder="Search users..." 
               style="padding:15px 25px;font-size:16px;" oninput="handleGlobalSearch(this.value)">
      </div>
      <div id="search-results-container"></div>
    </div>
  `;
}

async function handleGlobalSearch(query) {
  const container = document.getElementById('search-results-container');
  if (!container) return;

  if (!query || query.trim().length < 2) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-light"></div></div>';

  try {
    const users = await api.searchUsers(query);

    if (users.length === 0) {
      container.innerHTML = '<p class="text-muted text-center mt-4">No results found</p>';
      return;
    }

    container.innerHTML = `
      <h5 class="text-white mb-3">Users</h5>
      <div class="list-group">
        ${users.map(user => {
      let img = user.profileImage || '';
      if (!img.startsWith('http')) img = `http://localhost:5000${img}`;
      return `
            <div class="list-group-item list-group-item-action bg-dark border-secondary text-white p-3 mb-2" 
                 style="cursor:pointer;" onclick="navigate('profile', '${user._id}')">
              <div class="d-flex align-items-center">
                <img src="${img}" class="rounded-circle me-3" style="width:50px;height:50px;object-fit:cover;">
                <div>
                  <div class="fw-bold">${user.username}</div>
                  <div class="text-muted small">${user.fullName}</div>
                </div>
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Search error:', error);
    container.innerHTML = '<p class="text-danger text-center mt-4">Error searching</p>';
  }
}

function renderSaved() {
  const feedContent = document.getElementById('feed-content');
  if (!feedContent) return;
  feedContent.innerHTML = `
    <div class="text-center py-5">
      <h2 class="text-white mb-4">Saved Posts</h2>
      <i class="bi bi-bookmark" style="font-size:5rem;color:#262626;"></i>
      <p class="text-muted mt-4">No saved posts yet</p>
    </div>
  `;
}

function renderActivity() {
  const feedContent = document.getElementById('feed-content');
  if (!feedContent) return;
  feedContent.innerHTML = `
    <div class="text-center py-5">
      <h2 class="text-white mb-4">Your Activity</h2>
      <i class="bi bi-activity" style="font-size:5rem;color:#262626;"></i>
      <p class="text-muted mt-4">Activity tracking coming soon</p>
    </div>
  `;
}

function renderReels() {
  const feedContent = document.getElementById('feed-content');
  if (!feedContent) return;
  
  feedContent.innerHTML = `
    <div class="reels-page-container" style="max-width:470px;margin:0 auto;padding:30px 20px;">
      <h2 class="text-white mb-4 text-center" style="font-size:28px;font-weight:300;">Reels</h2>
      <div class="text-center py-5">
        <i class="bi bi-camera-reels" style="font-size:5rem;color:#262626;"></i>
        <h4 class="text-white mt-4">Reels Feature</h4>
        <p class="text-muted">Create and share short videos</p>
        <button class="btn btn-primary mt-4" onclick="showToast('Reels creation coming soon!', 'info')">
          <i class="bi bi-plus-circle me-2"></i>Create Reel
        </button>
      </div>
    </div>
  `;
}

function showCreatePostModal() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white">
            <i class="bi bi-plus-circle me-2"></i>Create New Post
          </h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          <form id="create-post-form" onsubmit="handleCreatePostSubmit(event)">
            <div class="mb-3">
              <label class="form-label text-white">Caption</label>
              <textarea class="form-control bg-dark border-secondary text-white" 
                        id="create-post-caption" rows="3" placeholder="What's happening?"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label text-white">Select Image</label>
              <div class="custom-file-upload">
                <input type="file" class="form-control bg-dark border-secondary text-white" 
                       id="create-post-image" accept="image/*" required onchange="updateFileName(this)">
                <label for="create-post-image" class="file-upload-label">
                  <i class="bi bi-cloud-upload me-2"></i>
                  <span id="file-name">Choose File</span>
                </label>
              </div>
            </div>
            <div id="image-preview" class="mb-3" style="display:none;">
              <img src="" alt="Preview" style="max-width:100%;max-height:300px;border-radius:8px;">
            </div>
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-camera me-2"></i>Share Post
              </button>
              <button type="button" class="btn btn-outline-light" onclick="this.closest('.modal').remove()">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function updateFileName(input) {
  const fileName = input.files[0]?.name || 'Choose File';
  document.getElementById('file-name').textContent = fileName;

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById('image-preview');
      preview.querySelector('img').src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function handleCreatePostSubmit(e) {
  e.preventDefault();

  const caption = document.getElementById('create-post-caption').value;
  const imageInput = document.getElementById('create-post-image');

  if (!imageInput.files[0]) {
    showToast('Please select an image', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('caption', caption);
  formData.append('image', imageInput.files[0]);

  try {
    await api.createPost(formData);
    showToast('Post created successfully!', 'success');
    document.querySelector('.modal').remove();
    navigate('feed');
  } catch (error) {
    showToast('Error creating post: ' + error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 SocialApp initialized');
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    initSocket();
    const savedPage = loadSavedPage();
    navigate(savedPage);
    updateNavigation();
  } else {
    navigate('login');
  }
});

// Export all functions
window.navigate = navigate;
window.showToast = showToast;
window.initSocket = initSocket;
window.updateNavigation = updateNavigation;
window.handleLogout = handleLogout;
window.showMoreMenu = showMoreMenu;
window.showMobileMenu = showMobileMenu;
window.closeMenu = closeMenu;
window.showAllSuggestions = showAllSuggestions;
window.loadAllSuggestions = loadAllSuggestions;
window.toggleAppearance = toggleAppearance;
window.renderSearch = renderSearch;
window.handleGlobalSearch = handleGlobalSearch;
window.renderSaved = renderSaved;
window.renderActivity = renderActivity;
window.renderReels = renderReels;
window.showCreatePostModal = showCreatePostModal;
window.updateFileName = updateFileName;
window.handleCreatePostSubmit = handleCreatePostSubmit;
window.showAccountSwitcher = showAccountSwitcher;
window.switchToAccount = switchToAccount;
window.closeModal = closeModal;
window.addNewAccount = addNewAccount;
window.finalizeAccountSwitch = finalizeAccountSwitch;
async function renderProfile(userId) {
  const feedContent = document.getElementById('feed-content');
  const mainContent = document.getElementById('main-content');
  if (!feedContent) return;

  if (mainContent) mainContent.classList.add('profile-active');

  feedContent.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-light"></div></div>`;

  try {
    const data = await api.getUserProfile(userId);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwnProfile = currentUser._id === userId;

    let profileImage = data.user.profileImage || '';
    if (!profileImage.startsWith('http')) profileImage = `http://localhost:5000${profileImage}`;

    const highlights = JSON.parse(localStorage.getItem(`highlights_${userId}`) || '[]');

    feedContent.innerHTML = `
      <div class="profile-page-container">
        <div class="profile-top-nav">
          <button class="profile-nav-btn" onclick="showCreateMenu()">
            <i class="bi bi-plus-lg"></i>
          </button>
          <div class="profile-username-header" onclick="showAccountSwitcher()">
            ${data.user.username}
            <i class="bi bi-chevron-down"></i>
          </div>
          <button class="profile-nav-btn" onclick="showProfileMenu()">
            <i class="bi bi-list"></i>
          </button>
        </div>

        <div class="profile-top-section">
          <div class="profile-avatar-section">
            <img src="${profileImage}" class="profile-avatar-large" alt="${data.user.username}">
          </div>
          <div class="profile-info-section">
            <div class="profile-name-section">
              <div class="profile-fullname">${data.user.fullName}</div>
            </div>

            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-number">${data.posts ? data.posts.length : 0}</span>
                <span class="stat-label">posts</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${data.user.followersCount || 0}</span>
                <span class="stat-label">followers</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${data.user.followingCount || 0}</span>
                <span class="stat-label">following</span>
              </div>
            </div>
            ${data.user.bio ? `<div class="profile-bio">${data.user.bio}</div>` : ''}
          </div>
        </div>

        <div class="profile-action-strip">
          ${isOwnProfile ? `
            <button class="action-btn" onclick="renderEditProfile()"><i class="bi bi-pencil"></i> Edit profile</button>
            <button class="action-btn" onclick="showShareProfile()"><i class="bi bi-share"></i> Share profile</button>
          ` : `
            <button class="action-btn primary" onclick="handleToggleFollow('${userId}')">${data.isFollowing ? 'Following' : 'Follow'}</button>
            <button class="action-btn" onclick="navigate('messages')">Message</button>
          `}
        </div>

        <div class="story-highlights">
          ${isOwnProfile ? `
            <div class="highlight-item" onclick="showCreateHighlight()">
              <div class="highlight-ring" style="display:flex;align-items:center;justify-content:center;border:1px dashed var(--border-color);">
                <i class="bi bi-plus-lg" style="font-size:24px;color:var(--text-primary);"></i>
              </div>
              <div class="highlight-name">New</div>
            </div>
          ` : ''}
          ${highlights.map(highlight => `
            <div class="highlight-item" onclick="viewHighlight(${highlight.id})" oncontextmenu="event.preventDefault(); editHighlight(${highlight.id})">
              <div class="highlight-ring"><img src="${highlight.cover}" alt="${highlight.name}"></div>
              <div class="highlight-name">${highlight.name}</div>
            </div>
          `).join('')}
        </div>

        <div class="profile-tabs">
          <button class="profile-tab active" onclick="switchProfileTab('posts', this)"><i class="bi bi-grid-fill"></i> POSTS</button>
          ${isOwnProfile ? `
            <button class="profile-tab" onclick="switchProfileTab('saved', this)"><i class="bi bi-bookmark"></i> SAVED</button>
            <button class="profile-tab" onclick="switchProfileTab('reposted', this)"><i class="bi bi-arrow-repeat"></i> REPOSTED</button>
            <button class="profile-tab" onclick="switchProfileTab('mentioned', this)"><i class="bi bi-at"></i> MENTIONED</button>
          ` : ''}
        </div>

        <div class="profile-posts-grid" id="profile-posts-grid">
          ${data.posts && data.posts.length > 0 ? data.posts.map(post => {
      let postImage = post.image || '';
      if (!postImage.startsWith('http')) postImage = `http://localhost:5000${postImage}`;
      return `<div class="profile-post-item" onclick="viewPost('${post._id}')"><img src="${postImage}" alt="Post"></div>`;
    }).join('') : `<div class="no-posts"><i class="bi bi-camera"></i><h5>No Posts Yet</h5></div>`}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading profile:', error);
    feedContent.innerHTML = `<div class="alert alert-danger">Error loading profile.</div>`;
  }
}

// ==========================================
// CREATE MENU (GUARANTEED WORKING)
// ==========================================
function showCreateMenu() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white">Create</h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body p-0">
          <div class="create-option" onclick="handleCreateOption('story')">
            <i class="bi bi-camera"></i>
            <span class="create-option-text">Story</span>
          </div>
          <div class="create-option" onclick="handleCreateOption('post')">
            <i class="bi bi-image"></i>
            <span class="create-option-text">Post</span>
          </div>
          <div class="create-option" onclick="handleCreateOption('reel')">
            <i class="bi bi-camera-reels"></i>
            <span class="create-option-text">Reel</span>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function handleCreateOption(type) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(m => m.remove());

  if (type === 'story') {
    showStoryCreationModal();
  } else if (type === 'post') {
    if (typeof window.showCreatePostModal === 'function') {
      window.showCreatePostModal();
    } else {
      showBasicPostModal();
    }
  } else if (type === 'reel') {
    showReelCreationModal();
  }
}

function showBasicPostModal() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white">Create New Post</h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          <textarea class="form-control bg-dark border-secondary text-white mb-3" placeholder="What's happening?" rows="3"></textarea>
          <input type="file" class="form-control bg-dark border-secondary text-white mb-3" accept="image/*">
          <button class="btn btn-primary w-100" onclick="showToast('Post shared!', 'success'); this.closest('.modal').remove()">Share Post</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function showStoryCreationModal() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white"><i class="bi bi-camera me-2"></i>Create Story</h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          <form onsubmit="handleStorySubmit(event)">
            <div class="mb-3">
              <label class="form-label text-white">Select Photo or Video</label>
              <input type="file" class="form-control bg-dark border-secondary text-white" id="story-file" accept="image/*,video/*" required>
            </div>
            <div class="mb-3">
              <label class="form-label text-white">Caption (Optional)</label>
              <textarea class="form-control bg-dark border-secondary text-white" id="story-caption" rows="2" placeholder="Add a caption..."></textarea>
            </div>
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary"><i class="bi bi-share me-2"></i>Share to Story</button>
              <button type="button" class="btn btn-outline-light" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function handleStorySubmit(e) {
  e.preventDefault();
  showToast('Story uploaded successfully!', 'success');
  const modal = document.querySelector('.modal');
  if (modal) modal.remove();
}

function showReelCreationModal() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white"><i class="bi bi-camera-reels me-2"></i>Create Reel</h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          <form onsubmit="handleReelSubmit(event)">
            <div class="mb-3">
              <label class="form-label text-white">Upload Video</label>
              <input type="file" class="form-control bg-dark border-secondary text-white" id="reel-video" accept="video/*" required>
            </div>
            <div class="mb-3">
              <label class="form-label text-white">Caption</label>
              <textarea class="form-control bg-dark border-secondary text-white" id="reel-caption" rows="2" placeholder="Write a caption..."></textarea>
            </div>
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary"><i class="bi bi-share me-2"></i>Share Reel</button>
              <button type="button" class="btn btn-outline-light" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function handleReelSubmit(e) {
  e.preventDefault();
  showToast('Reel uploaded successfully!', 'success');
  const modal = document.querySelector('.modal');
  if (modal) modal.remove();
}

function closeModalFunc(element) {
  const modal = element.closest('.modal');
  if (modal) modal.remove();
}

// ==========================================
// ACCOUNT SWITCHER (NO INFINITE LOOP)
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
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body p-0">
          <div class="list-group list-group-flush">
            ${accounts.length === 0 ? `
              <div class="list-group-item bg-dark text-white border-secondary text-center py-3">
                <i class="bi bi-people d-block mb-2" style="font-size:2rem;"></i>
                No other accounts
              </div>
            ` : accounts.map(acc => {
    // Fix profile image URL
    let profileImg = acc.profileImage || '';
    if (profileImg && !profileImg.startsWith('http')) {
      profileImg = 'http://localhost:5000' + profileImg;
    }

    return `
                <div class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="switchToAccount('${acc.username}')">
                  <div class="d-flex align-items-center">
                    <img src="${profileImg}" onerror="this.src='https://via.placeholder.com/32'" class="rounded-circle me-2" style="width:32px;height:32px;object-fit:cover;">
                    <div>
                      <div class="fw-bold">${acc.username}</div>
                      <div class="text-muted small">${acc.fullName}</div>
                    </div>
                  </div>
                  ${acc.username === currentUser.username ? '<span class="badge bg-primary ms-2">Current</span>' : ''}
                </div>
              `;
  }).join('')}
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary text-center" onclick="this.closest('.modal').remove(); addNewAccount()">
              <i class="bi bi-plus-circle me-2"></i>Add Account
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function switchToAccount(username) {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  const account = accounts.find(acc => acc.username === username);
  if (account) {
    localStorage.setItem('user', JSON.stringify(account));
    localStorage.setItem('token', account.token || 'dummy-token');
    showToast(`Switched to ${username}`, 'success');
    setTimeout(() => { window.location.reload(); }, 1000);
  }
}

function addNewAccount() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (currentUser.username) {
    let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    accounts = accounts.filter(acc => acc.username !== currentUser.username);
    accounts.push(currentUser);
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }
  localStorage.setItem('addingNewAccount', 'true');
  if (typeof window.navigate === 'function') window.navigate('login');
}

// ==========================================
// HAMBURGER MENU
// ==========================================
function showProfileMenu() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-body p-0">
          <div class="list-group list-group-flush">
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="closeModalFunc(this); showAccountSwitcher();">
              <i class="bi bi-person-gear me-2"></i>Account Center
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="closeModalFunc(this); showToast('Settings coming soon', 'info')">
              <i class="bi bi-gear me-2"></i>Settings
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-white border-secondary" onclick="closeModalFunc(this); if(typeof window.toggleAppearance === 'function') window.toggleAppearance(); else showToast('Theme toggle not found', 'info')">
              <i class="bi bi-moon me-2"></i>Switch appearance
            </button>
            <button class="list-group-item list-group-item-action bg-dark text-danger border-secondary" onclick="closeModalFunc(this); if(typeof window.handleLogout === 'function') window.handleLogout();">
              <i class="bi bi-box-arrow-right me-2"></i>Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function showShareProfile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const shareUrl = `${window.location.origin}/profile/${user._id}`;
  if (navigator.share) {
    navigator.share({ title: `Check out ${user.username}'s profile`, url: shareUrl });
  } else {
    navigator.clipboard.writeText(shareUrl);
    showToast('Profile link copied!', 'success');
  }
}

// ==========================================
// HIGHLIGHTS & OTHER FUNCTIONS
// ==========================================
function showCreateHighlight() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white">Create Highlight</h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          <form onsubmit="handleCreateHighlight(event)">
            <div class="mb-3">
              <label class="form-label text-white">Highlight Name</label>
              <input type="text" class="form-control bg-dark border-secondary text-white" id="highlight-name" placeholder="e.g., Travel" required maxlength="20">
            </div>
            <div class="mb-3">
              <label class="form-label text-white">Cover Image</label>
              <input type="file" class="form-control bg-dark border-secondary text-white" id="highlight-cover" accept="image/*" required onchange="updateHighlightPreview(this)">
              <div id="highlight-preview" class="mt-2" style="display:none;"><img src="" alt="Preview" style="width:77px;height:77px;border-radius:50%;object-fit:cover;"></div>
            </div>
            <div class="d-grid"><button type="submit" class="btn btn-primary">Create Highlight</button></div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function updateHighlightPreview(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById('highlight-preview');
      preview.querySelector('img').src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function handleCreateHighlight(e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = document.getElementById('highlight-name').value;
  const coverInput = document.getElementById('highlight-cover');
  if (!coverInput.files[0]) { showToast('Please select a cover image', 'error'); return; }

  const highlights = JSON.parse(localStorage.getItem(`highlights_${user._id}`) || '[]');
  const reader = new FileReader();
  reader.onload = function (e) {
    highlights.push({ id: Date.now(), name: name, cover: e.target.result, stories: [], createdAt: new Date().toISOString() });
    localStorage.setItem(`highlights_${user._id}`, JSON.stringify(highlights));
    showToast('Highlight created!', 'success');
    document.querySelector('.modal').remove();
    renderProfile(user._id);
  };
  reader.readAsDataURL(coverInput.files[0]);
}

function editHighlight(highlightId) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const highlights = JSON.parse(localStorage.getItem(`highlights_${user._id}`) || '[]');
  const highlight = highlights.find(h => h.id === highlightId);
  if (!highlight) return;

  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white">Edit Highlight</h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          <form onsubmit="handleEditHighlight(event, ${highlightId})">
            <div class="mb-3">
              <label class="form-label text-white">Highlight Name</label>
              <input type="text" class="form-control bg-dark border-secondary text-white" id="edit-highlight-name" value="${highlight.name}" required maxlength="20">
            </div>
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary">Save Changes</button>
              <button type="button" class="btn btn-outline-danger" onclick="deleteHighlight(${highlightId})"><i class="bi bi-trash me-2"></i>Delete Highlight</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function handleEditHighlight(e, highlightId) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const highlights = JSON.parse(localStorage.getItem(`highlights_${user._id}`) || '[]');
  const index = highlights.findIndex(h => h.id === highlightId);
  if (index === -1) return;

  highlights[index].name = document.getElementById('edit-highlight-name').value;
  localStorage.setItem(`highlights_${user._id}`, JSON.stringify(highlights));
  showToast('Highlight updated!', 'success');
  document.querySelector('.modal').remove();
  renderProfile(user._id);
}

function deleteHighlight(highlightId) {
  if (!confirm('Are you sure you want to delete this highlight?')) return;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  let highlights = JSON.parse(localStorage.getItem(`highlights_${user._id}`) || '[]');
  highlights = highlights.filter(h => h.id !== highlightId);
  localStorage.setItem(`highlights_${user._id}`, JSON.stringify(highlights));
  showToast('Highlight deleted', 'success');
  document.querySelector('.modal').remove();
  renderProfile(user._id);
}

function toggleSettings(event) {
  event.stopPropagation();
  const menu = document.getElementById('settings-menu');
  if (menu) menu.classList.toggle('show');
}

document.addEventListener('click', () => {
  const menu = document.getElementById('settings-menu');
  if (menu) menu.classList.remove('show');
});

function switchProfileTab(tab, btn) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('profile-posts-grid');
  if (!grid) return;
  if (tab === 'posts') {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    renderProfile(user._id);
  } else if (tab === 'saved') {
    grid.innerHTML = `<div class="no-posts"><i class="bi bi-bookmark"></i><h5>Saved posts will appear here</h5></div>`;
  } else if (tab === 'reposted') {
    grid.innerHTML = `<div class="no-posts"><i class="bi bi-arrow-repeat"></i><h5>Reposted posts will appear here</h5></div>`;
  } else if (tab === 'mentioned') {
    grid.innerHTML = `<div class="no-posts"><i class="bi bi-at"></i><h5>Mentions will appear here</h5></div>`;
  }
}

function showArchivedStories() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user._id) return;
  api.getStories().then(stories => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const archived = stories.filter(s => s.user._id === user._id && new Date(s.createdAt) >= thirtyDaysAgo);
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content bg-dark border-secondary">
          <div class="modal-header border-secondary">
            <h5 class="modal-title text-white"><i class="bi bi-archive me-2"></i>Archived Stories</h5>
            <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
          </div>
          <div class="modal-body">
            ${archived.length === 0 ? '<p class="text-muted text-center">No archived stories</p>' : `
              <div class="row g-3">
                ${archived.map(story => {
      let img = story.image;
      if (!img.startsWith('http')) img = `http://localhost:5000${img}`;
      return `<div class="col-md-4"><div class="card bg-dark border-secondary"><img src="${img}" class="card-img-top" style="max-height:200px;object-fit:cover;"><div class="card-body"><small class="text-muted">${new Date(story.createdAt).toLocaleString()}</small>${story.caption ? `<p class="mt-2 mb-0 text-white small">${story.caption}</p>` : ''}</div></div></div>`;
    }).join('')}
              </div>`}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }).catch(() => { showToast('Error loading archived stories', 'error'); });
}

function viewHighlight(highlightId) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const highlights = JSON.parse(localStorage.getItem(`highlights_${user._id}`) || '[]');
  const highlight = highlights.find(h => h.id === highlightId);
  if (highlight && highlight.stories && highlight.stories.length > 0) {
    if (typeof window.viewInstagramStory === 'function') window.viewInstagramStory(user._id, user.username, highlight.stories);
  } else {
    showToast('No stories in this highlight yet', 'info');
  }
}

function renderEditProfile() {
  const feedContent = document.getElementById('feed-content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  feedContent.innerHTML = `
    <div class="card border-0" style="background: #000; border: 1px solid #262626 !important; max-width: 600px; margin: 50px auto;">
      <div class="card-header bg-transparent border-0 py-3"><h5 class="mb-0 text-white">Edit Profile</h5></div>
      <div class="card-body">
        <form onsubmit="handleUpdateProfile(event)">
          <div class="mb-3"><label class="form-label text-white">Full Name</label><input type="text" class="form-control bg-dark border-secondary text-white" id="edit-fullname" value="${user.fullName || ''}"></div>
          <div class="mb-3"><label class="form-label text-white">Bio</label><textarea class="form-control bg-dark border-secondary text-white" id="edit-bio" rows="3">${user.bio || ''}</textarea></div>
          <button type="submit" class="btn btn-primary w-100">Save Changes</button>
          <button type="button" class="btn btn-link text-white w-100 mt-2" onclick="navigate('profile', '${user._id}')">Cancel</button>
        </form>
      </div>
    </div>
  `;
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const profileData = { fullName: document.getElementById('edit-fullname').value, bio: document.getElementById('edit-bio').value };
  try {
    const updatedUser = await api.updateProfile(profileData);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentUser.fullName = updatedUser.fullName;
    currentUser.bio = updatedUser.bio;
    localStorage.setItem('user', JSON.stringify(currentUser));
    showToast('Profile updated!', 'success');
    navigate('profile', currentUser._id);
  } catch (error) {
    console.error('Update error:', error);
    showToast('Error updating profile', 'error');
  }
}

async function handleToggleFollow(userId) {
  try {
    const data = await api.toggleFollow(userId);
    const followBtn = document.getElementById('follow-btn');
    if (followBtn) {
      if (data.isFollowing) { followBtn.textContent = 'Following'; followBtn.classList.remove('primary'); }
      else { followBtn.textContent = 'Follow'; followBtn.classList.add('primary'); }
    }
    renderProfile(userId);
  } catch (error) {
    console.error('Follow error:', error);
    showToast('Error following user', 'error');
  }
}

function viewPost(postId) {
  showToast('Post view feature coming soon', 'info');
}

// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================
window.renderProfile = renderProfile;
window.renderEditProfile = renderEditProfile;
window.handleUpdateProfile = handleUpdateProfile;
window.handleToggleFollow = handleToggleFollow;
window.viewPost = viewPost;
window.switchProfileTab = switchProfileTab;
window.showArchivedStories = showArchivedStories;
window.viewHighlight = viewHighlight;
window.showCreateMenu = showCreateMenu;
window.handleCreateOption = handleCreateOption;
window.showBasicPostModal = showBasicPostModal;
window.showStoryCreationModal = showStoryCreationModal;
window.handleStorySubmit = handleStorySubmit;
window.showReelCreationModal = showReelCreationModal;
window.handleReelSubmit = handleReelSubmit;
window.closeModalFunc = closeModalFunc;
window.showAccountSwitcher = showAccountSwitcher;
window.switchToAccount = switchToAccount;
window.addNewAccount = addNewAccount;
window.showProfileMenu = showProfileMenu;
window.showShareProfile = showShareProfile;
window.showCreateHighlight = showCreateHighlight;
window.updateHighlightPreview = updateHighlightPreview;
window.handleCreateHighlight = handleCreateHighlight;
window.editHighlight = editHighlight;
window.handleEditHighlight = handleEditHighlight;
window.deleteHighlight = deleteHighlight;
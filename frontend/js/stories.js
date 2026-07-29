const BACKEND_URL = 'https://codealpha-socialapp-backend.onrender.com';
const defaultStoryAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23262626"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="30" fill="%238e8e8e"%3E👤%3C/text%3E%3C/svg%3E';

// ✅ LOAD STORIES
async function loadStories() {
  try {
    const storiesList = document.getElementById('stories-list');
    if (!storiesList) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      storiesList.innerHTML = '';
      return;
    }

    const currentUser = JSON.parse(userStr);
    storiesList.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm text-light"></div></div>';

    const storiesData = await api.getStories();
    
    // ✅ SAFE ARRAY CHECK: Agar backend object return kare toh uske andar 'stories' array dhundho
    const stories = Array.isArray(storiesData) ? storiesData : (storiesData.stories || []);

    if (!stories || stories.length === 0) {
      storiesList.innerHTML = '';
      return;
    }

    const userStories = {};
    stories.forEach(story => {
      if (!userStories[story.user._id]) {
        userStories[story.user._id] = { user: story.user, stories: [] };
      }
      userStories[story.user._id].stories.push(story);
    });

    storiesList.innerHTML = Object.values(userStories).map(({ user, stories }) => {
      let profileImg = user.profileImage || '';
      if (!profileImg.startsWith('http')) {
        profileImg = `${BACKEND_URL}${profileImg}`;
      }
      const storyCount = stories.length;
      const isOwnStory = user._id === currentUser._id;

      return `
        <div class="text-center flex-shrink-0 position-relative" style="cursor: pointer;" 
             onclick="viewInstagramStory('${user._id}', '${user.username}', ${JSON.stringify(stories).replace(/"/g, '&quot;')})">
          <div class="position-relative">
            <div class="rounded-circle p-1" style="width: 66px; height: 66px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc1888 75%, #405de6 100%);">
              <div class="rounded-circle bg-white p-1" style="width: 100%; height: 100%;">
                <img src="${profileImg}" class="rounded-circle" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='${defaultStoryAvatar}'">
              </div>
            </div>
            ${storyCount > 1 ? `<div style="position: absolute; bottom: 0; right: 0; background: #0095f6; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 2px solid white;">${storyCount}</div>` : ''}
          </div>
          <div class="small mt-1 text-truncate text-white" style="max-width: 70px; font-size: 11px;">${isOwnStory ? 'Your story' : user.username}</div>
          ${isOwnStory ? `<button class="position-absolute top-0 end-0 btn btn-sm btn-danger rounded-circle shadow-sm" style="width: 20px; height: 20px; padding: 0; font-size: 10px; z-index: 100; line-height: 1;" onclick="event.stopPropagation(); confirmDeleteStory('${stories[0]._id}')"><i class="bi bi-x"></i></button>` : ''}
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading stories:', error);
    const storiesList = document.getElementById('stories-list');
    if (storiesList) storiesList.innerHTML = '';
  }
}

// ✅ DELETE STORY
async function confirmDeleteStory(storyId) {
  if (confirm('Are you sure you want to delete this story?')) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        if (typeof showToast === 'function') showToast('Story deleted', 'success');
        loadStories();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  }
}

// ✅ STORY CREATION MODAL
function showStoryCreationModal() {
  const modal = document.createElement('div');
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title text-white">Create Story</h5>
          <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          <div class="d-grid gap-3">
            <button class="btn btn-outline-primary btn-lg py-3" onclick="selectStoryImage()">
              <i class="bi bi-image-fill me-2"></i> Photo from Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  window.selectStoryImage = async () => {
    modal.remove();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('storyImage', file); // Backend expects 'storyImage' or 'image' based on your route
        formData.append('caption', '');
        formData.append('storyType', 'image');
        try {
          await api.createStory(formData);
          if (typeof showToast === 'function') showToast('Story uploaded!', 'success');
          loadStories();
        } catch (error) {
          console.error('Upload error:', error);
          if (typeof showToast === 'function') showToast('Error uploading story', 'error');
        }
      }
    };
    input.click();
    delete window.selectStoryImage;
  };
}

// ✅ STORY VIEWER (Instagram Style)
let currentStoryIndex = 0;
let currentStories = [];
let storyTimer = null;

function viewInstagramStory(userId, username, stories) {
  currentStories = stories;
  currentStoryIndex = 0;
  showStoryViewer(username);
}

function showStoryViewer(username) {
  const story = currentStories[currentStoryIndex];
  let imageUrl = story.image;
  if (!imageUrl.startsWith('http')) imageUrl = `${BACKEND_URL}${imageUrl}`;

  let profileImg = story.user.profileImage || '';
  if (!profileImg.startsWith('http')) profileImg = `${BACKEND_URL}${profileImg}`;

  const modal = document.createElement('div');
  modal.id = 'story-viewer-modal';
  modal.className = 'modal fade show';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-fullscreen bg-dark">
      <div class="modal-content bg-dark border-0">
        <div class="position-absolute top-0 start-0 w-100 px-2 pt-2" style="z-index: 1050;">
          <div class="d-flex gap-1">
            ${currentStories.map((_, i) => `
              <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
                <div id="progress-${i}" class="story-progress-bar" style="width: ${i < currentStoryIndex ? '100%' : '0%'}; height: 100%; background: white; transition: width 5s linear;"></div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="position-absolute top-0 start-0 w-100 px-3 pt-14 pb-2 d-flex align-items-center" style="z-index: 1050; background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);">
          <img src="${profileImg}" class="rounded-circle me-2" style="width: 36px; height: 36px; object-fit: cover;">
          <span class="text-white fw-bold">${username}</span>
          <button type="button" class="btn-close btn-close-white ms-auto" onclick="closeStoryViewer()"></button>
        </div>
        <div class="d-flex align-items-center justify-content-center h-100" style="padding-top: 80px;">
          <img src="${imageUrl}" class="img-fluid h-100" style="object-fit: contain; max-height: calc(100vh - 150px);">
        </div>
        <div class="position-absolute top-0 start-0 h-100" style="width: 30%; z-index: 1040;" onclick="prevStory()"></div>
        <div class="position-absolute top-0 end-0 h-100" style="width: 30%; z-index: 1040;" onclick="nextStory()"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  setTimeout(() => {
    const bar = document.getElementById(`progress-${currentStoryIndex}`);
    if (bar) bar.style.width = '100%';
  }, 50);

  storyTimer = setTimeout(() => {
    if (document.getElementById('story-viewer-modal')) nextStory();
  }, 5000);
}

function nextStory() {
  clearTimeout(storyTimer);
  if (currentStoryIndex < currentStories.length - 1) {
    currentStoryIndex++;
    document.getElementById('story-viewer-modal')?.remove();
    showStoryViewer(currentStories[currentStoryIndex].user.username);
  } else {
    closeStoryViewer();
  }
}

function prevStory() {
  clearTimeout(storyTimer);
  if (currentStoryIndex > 0) {
    currentStoryIndex--;
    document.getElementById('story-viewer-modal')?.remove();
    showStoryViewer(currentStories[currentStoryIndex].user.username);
  }
}

function closeStoryViewer() {
  clearTimeout(storyTimer);
  document.getElementById('story-viewer-modal')?.remove();
}

// Auto-load on init
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    setTimeout(() => loadStories(), 500);
  }
});

// Export
window.loadStories = loadStories;
window.confirmDeleteStory = confirmDeleteStory;
window.showStoryCreationModal = showStoryCreationModal;
window.viewInstagramStory = viewInstagramStory;
window.nextStory = nextStory;
window.prevStory = prevStory;
window.closeStoryViewer = closeStoryViewer;
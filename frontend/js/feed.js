// Feed Functions
async function renderFeed() {
  // Update navigation
  if (typeof updateNavigation === 'function') {
    updateNavigation();
  }
  
  const feedContent = document.getElementById('feed-content');
  if (!feedContent) return;

  feedContent.innerHTML = `
    <!-- Posts Container -->
    <div id="posts-container">
      <div class="text-center py-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  `;

  // Load posts
  try {
    const posts = await api.getFeed();
    const container = document.getElementById('posts-container');
    
    if (!posts || posts.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-image" style="font-size: 4rem; color: #262626;"></i>
          <h5 class="mt-3 text-white">No posts yet</h5>
          <p class="text-muted">When people you follow post, you'll see them here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = posts.map(post => renderPostCard(post)).join('');
  } catch (error) {
    console.error('Error loading feed:', error);
    const container = document.getElementById('posts-container');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> Error loading posts.
        </div>
      `;
    }
  }
}

function renderPostCard(post) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnPost = user._id === post.user._id;
  
  // ✅ PROFILE PICTURE FIX
  let imageUrl = post.image || '';
  if (!imageUrl.startsWith('http')) {
    imageUrl = `http://localhost:5000${imageUrl}`;
  }
  
  let profileImage = post.user.profileImage || '';
  if (!profileImage || profileImage === 'https://via.placeholder.com/150') {
    profileImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23262626"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%238e8e8e"%3E👤%3C/text%3E%3C/svg%3E';
  } else if (!profileImage.startsWith('http')) {
    profileImage = `http://localhost:5000${profileImage}`;
  }

  return `
    <article class="card mb-4 border-0" style="background: #000; border: 1px solid #262626 !important;">
      <div class="card-header bg-transparent border-0 py-3 px-3 d-flex align-items-center">
        <img src="${profileImage}" class="rounded-circle me-3" style="width: 32px; height: 32px; object-fit: cover;">
        <div class="flex-grow-1">
          <strong class="text-white">${post.user.username}</strong>
          <div class="text-muted small">${formatTime(post.createdAt)}</div>
        </div>
        ${isOwnPost ? `
          <div class="dropdown">
            <button class="btn btn-link text-white" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item text-danger" href="#" onclick="handleDeletePost('${post._id}')">
                <i class="bi bi-trash"></i> Delete
              </a></li>
            </ul>
          </div>
        ` : ''}
      </div>
      
      <div class="position-relative">
        <img src="${imageUrl}" class="card-img-top" alt="Post" style="max-height: 600px; object-fit: contain;">
      </div>
      
      <div class="card-body bg-transparent p-3">
        <div class="d-flex gap-3 mb-3">
          <button class="btn btn-link text-white p-0" onclick="handleLike('${post._id}')">
            <i class="bi ${post.isLiked ? 'bi-heart-fill text-danger' : 'bi-heart'} fs-4"></i>
          </button>
          <button class="btn btn-link text-white p-0" onclick="showComments('${post._id}')">
            <i class="bi bi-chat fs-4"></i>
          </button>
          <button class="btn btn-link text-white p-0">
            <i class="bi bi-send fs-4"></i>
          </button>
        </div>
        
        <div class="mb-2">
          <strong class="text-white">${post.likesCount || 0} likes</strong>
        </div>
        
        <div class="mb-2">
          <strong class="text-white">${post.user.username}</strong>
          <span class="text-white">${post.caption || ''}</span>
        </div>
        
        ${post.commentsCount > 0 ? `
          <div class="text-muted mb-2" style="cursor: pointer;" onclick="showComments('${post._id}')">
            View all ${post.commentsCount} comments
          </div>
        ` : ''}
        
        <div id="comments-${post._id}" style="display: none;"></div>
        
        <form class="mt-3" onsubmit="handleAddComment(event, '${post._id}')">
          <input type="text" class="form-control bg-transparent border-0 text-white" 
                 placeholder="Add a comment..." id="comment-input-${post._id}">
        </form>
      </div>
    </article>
  `;
}

async function handleCreatePost(e) {
  e.preventDefault();
  
  const caption = document.getElementById('post-caption')?.value || '';
  const imageInput = document.getElementById('post-image');
  
  if (!imageInput || !imageInput.files[0]) {
    showToast('Please select an image', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('caption', caption);
  formData.append('image', imageInput.files[0]);

  try {
    await api.createPost(formData);
    showToast('Post created successfully!', 'success');
    renderFeed();
  } catch (error) {
    showToast('Error creating post: ' + error.message, 'error');
  }
}

async function handleLike(postId) {
  try {
    const data = await api.toggleLike(postId);
    
    const postCard = document.querySelector(`[data-post-id="${postId}"]`);
    if (postCard) {
      const likeBtn = postCard.querySelector('.bi-heart, .bi-heart-fill');
      const likesCount = postCard.querySelector('.text-white');
      
      if (data.isLiked) {
        likeBtn.classList.remove('bi-heart');
        likeBtn.classList.add('bi-heart-fill', 'text-danger');
      } else {
        likeBtn.classList.remove('bi-heart-fill', 'text-danger');
        likeBtn.classList.add('bi-heart');
      }
      
      if (likesCount) {
        likesCount.textContent = `${data.likesCount} likes`;
      }
    }
  } catch (error) {
    showToast('Error liking post', 'error');
  }
}

async function showComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  
  if (!commentsSection) return;
  
  if (commentsSection.style.display === 'none') {
    try {
      commentsSection.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div>';
      commentsSection.style.display = 'block';
      
      const comments = await api.getComments(postId);
      
      if (comments.length === 0) {
        commentsSection.innerHTML = '<p class="text-muted text-center">No comments yet</p>';
      } else {
        commentsSection.innerHTML = comments.map(comment => renderComment(comment)).join('');
      }
    } catch (error) {
      commentsSection.innerHTML = '<p class="text-danger text-center">Error loading comments</p>';
    }
  } else {
    commentsSection.style.display = 'none';
  }
}

function renderComment(comment) {
  let profileImg = comment.user.profileImage || '';
  if (!profileImg.startsWith('http')) {
    profileImg = `http://localhost:5000${profileImg}`;
  }
  
  return `
    <div class="d-flex align-items-start mb-2">
      <img src="${profileImg}" class="rounded-circle me-2" style="width: 32px; height: 32px; object-fit: cover;">
      <div class="flex-grow-1">
        <strong class="text-white small">${comment.user.username}</strong>
        <span class="text-white small">${comment.text}</span>
        <div class="text-muted small">${formatTime(comment.createdAt)}</div>
      </div>
    </div>
  `;
}

async function handleAddComment(e, postId) {
  e.preventDefault();
  
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input?.value.trim();
  
  if (!text) return;

  try {
    const comment = await api.addComment(postId, text);
    
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
      if (commentsSection.innerHTML.includes('No comments yet')) {
        commentsSection.innerHTML = '';
      }
      commentsSection.innerHTML += renderComment(comment);
      commentsSection.style.display = 'block';
    }
    
    if (input) input.value = '';
  } catch (error) {
    showToast('Error adding comment', 'error');
  }
}

async function handleDeletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    await api.deletePost(postId);
    showToast('Post deleted successfully', 'success');
    renderFeed();
  } catch (error) {
    showToast('Error deleting post', 'error');
  }
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

function loadFeed() {
  renderFeed();
}

function loadSuggestions() {
  // Load suggestions for right sidebar
  const suggestionsList = document.getElementById('suggestions-list');
  if (!suggestionsList) return;
  
  suggestionsList.innerHTML = '<div class="text-center py-2"><small class="text-muted">Loading...</small></div>';
}

window.renderFeed = renderFeed;
window.loadFeed = loadFeed;
window.handleCreatePost = handleCreatePost;
window.handleLike = handleLike;
window.showComments = showComments;
window.handleAddComment = handleAddComment;
window.handleDeletePost = handleDeletePost;
window.loadSuggestions = loadSuggestions;
window.formatTime = formatTime;
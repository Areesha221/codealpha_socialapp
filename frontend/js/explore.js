async function renderExplore() {
  // Hide stories on explore page
  const storiesSection = document.getElementById('stories-section');
  if (storiesSection) {
    storiesSection.style.display = 'none';
  }

  // Set main content to explore-active for full width layout
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.classList.add('explore-active');
  }

  const feedContent = document.getElementById('feed-content');
  if (!feedContent) return;

  feedContent.innerHTML = `
    <div class="explore-page-container">
      <h2 class="text-white mb-4 text-center" style="font-size:28px;font-weight:300;">Explore</h2>
      <div class="explore-grid" id="explore-grid">
        <div class="text-center py-5" style="grid-column:1/-1;">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadExplorePosts();
}

async function loadExplorePosts() {
  try {
    // Get all posts from the API
    const posts = await api.getFeed();
    const grid = document.getElementById('explore-grid');
    
    if (!posts || posts.length === 0) {
      grid.innerHTML = '<div class="text-center py-5 text-muted" style="grid-column:1/-1;">No posts to explore</div>';
      return;
    }

    // ✅ SHUFFLE POSTS: Taake sirf aapki posts na dikhein, random mix lage
    const shuffledPosts = [...posts].sort(() => Math.random() - 0.5);

    grid.innerHTML = shuffledPosts.map(post => {
      let imageUrl = post.image || '';
      if (!imageUrl.startsWith('http')) {
        imageUrl = `https://codealpha-socialapp-backend.onrender.com${imageUrl}`;
      }
      
      let userImg = post.user?.profileImage || '';
      if (!userImg.startsWith('http')) {
        userImg = `https://codealpha-socialapp-backend.onrender.com${userImg}`;
      }
      
      const username = post.user?.username || 'user';

      return `
        <div class="explore-item" onclick="viewPost('${post._id}')">
          <img src="${imageUrl}" alt="Explore post" loading="lazy" 
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23262626%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22 fill=%22%238e8e8e%22%3E📷%3C/text%3E%3C/svg%3E'">
          
          <!-- Hover Overlay: Likes & Comments -->
          <div class="explore-overlay">
            <span><i class="bi bi-heart me-1"></i>${post.likesCount || 0}</span>
            <span><i class="bi bi-chat me-1"></i>${post.commentsCount || 0}</span>
          </div>
          
          <!-- Hover Overlay: User Info at Bottom -->
          <div class="explore-user-info">
            <div style="display:flex;align-items:center;gap:6px;color:#fff;font-size:12px;">
              <img src="${userImg}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;" 
                   onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22%3E%3Crect width=%2220%22 height=%2220%22 fill=%22%23262626%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2210%22 fill=%22%238e8e8e%22%3E👤%3C/text%3E%3C/svg%3E'">
              <span style="font-weight:600;">${username}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading explore:', error);
    const grid = document.getElementById('explore-grid');
    if (grid) {
      grid.innerHTML = '<div class="text-center py-5 text-danger" style="grid-column:1/-1;">Error loading posts</div>';
    }
  }
}

function viewPost(postId) {
  // Abhi ke liye toast show karein, baad mein modal open kar sakte hain
  if (typeof showToast === 'function') {
    showToast('Post view feature coming soon', 'info');
  } else {
    console.log('View post:', postId);
  }
}

// Export functions to window
window.renderExplore = renderExplore;
window.loadExplorePosts = loadExplorePosts;
window.viewPost = viewPost;
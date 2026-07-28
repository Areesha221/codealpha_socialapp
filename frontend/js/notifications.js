async function renderNotifications() {
  // Hide stories on notifications page
  const storiesSection = document.getElementById('stories-section');
  if (storiesSection) {
    storiesSection.style.display = 'none';
  }

  const feedContent = document.getElementById('feed-content');
  if (!feedContent) return;

  feedContent.innerHTML = `
    <div class="card border-0" style="background: #000; border: 1px solid #262626 !important; max-width: 600px; margin: 0 auto;">
      <div class="card-header bg-transparent border-0 py-3 px-4">
        <h5 class="mb-0 text-white" style="font-size: 22px; font-weight: 600;">
          <i class="bi bi-bell me-2"></i>Notifications
        </h5>
      </div>
      <div class="card-body p-0" id="notifications-list">
        <div class="text-center py-5">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadNotifications();
}

async function loadNotifications() {
  try {
    const notifications = await api.getNotifications();
    const container = document.getElementById('notifications-list');
    
    if (!container) return;
    
    if (!notifications || notifications.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-bell-slash" style="font-size: 4rem; color: #262626;"></i>
          <p class="text-muted mt-3">No notifications yet</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = notifications.map(notif => {
      let senderImg = notif.sender.profileImage || '';
      if (!senderImg.startsWith('http')) {
        senderImg = `http://localhost:5000${senderImg}`;
      }
      
      let actionText = '';
      let icon = '';
      switch(notif.type) {
        case 'like': 
          actionText = 'liked your post'; 
          icon = 'bi-heart text-danger';
          break;
        case 'comment': 
          actionText = 'commented on your post'; 
          icon = 'bi-chat text-primary';
          break;
        case 'follow': 
          actionText = 'started following you'; 
          icon = 'bi-person-plus text-success';
          break;
        default: 
          actionText = 'has a notification';
          icon = 'bi-bell';
      }
      
      return `
        <div class="d-flex align-items-center p-3 px-4 border-bottom border-secondary ${notif.isRead ? '' : 'bg-dark'}" 
             style="cursor: pointer;" 
             onclick="handleNotificationClick('${notif.type}', '${notif.sender._id}')">
          <img src="${senderImg}" class="rounded-circle me-3" style="width: 44px; height: 44px; object-fit: cover;">
          <div class="flex-grow-1">
            <div class="text-white">
              <strong>${notif.sender.username}</strong> ${actionText}
              <div class="text-muted small">${formatTime(notif.createdAt)}</div>
            </div>
          </div>
          ${!notif.isRead ? '<div class="badge bg-primary rounded-circle" style="width: 8px; height: 8px;"></div>' : ''}
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading notifications:', error);
    const container = document.getElementById('notifications-list');
    if (container) {
      container.innerHTML = '<p class="text-danger text-center p-3">Error loading notifications</p>';
    }
  }
}

function handleNotificationClick(type, userId) {
  if (type === 'follow') {
    navigate('profile', userId);
  } else if (type === 'like' || type === 'comment') {
    navigate('feed');
  }
}

window.renderNotifications = renderNotifications;
window.loadNotifications = loadNotifications;
window.handleNotificationClick = handleNotificationClick;
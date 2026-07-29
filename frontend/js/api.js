// Backend API URL - Production
const API_URL = 'https://codealpha-socialapp-backend.onrender.com/api';

// Helper function to get auth headers with token
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// ==================== AUTHENTICATION ====================
export async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
}

export async function login(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

// ==================== USERS ====================
export async function getUsers() {
  const response = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function getUserById(userId) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function updateUser(userId, userData) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  return response.json();
}

export async function searchUsers(query) {
  const response = await fetch(`${API_URL}/users/search?q=${query}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function followUser(userId) {
  const response = await fetch(`${API_URL}/users/${userId}/follow`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return response.json();
}

// ==================== POSTS ====================
export async function getPosts(page = 1, limit = 10) {
  const response = await fetch(`${API_URL}/posts/feed?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function getPostById(postId) {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createPost(postData) {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(postData)
  });
  return response.json();
}

export async function deletePost(postId) {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function likePost(postId) {
  const response = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return response.json();
}

// ==================== STORIES ====================
export async function getStories() {
  const response = await fetch(`${API_URL}/stories`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createStory(storyData) {
  const response = await fetch(`${API_URL}/stories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(storyData)
  });
  return response.json();
}

export async function deleteStory(storyId) {
  const response = await fetch(`${API_URL}/stories/${storyId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// ==================== MESSAGES ====================
export async function getConversations() {
  const response = await fetch(`${API_URL}/messages/conversations`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function getMessages(userId) {
  const response = await fetch(`${API_URL}/messages/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function sendMessage(receiverId, text) {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ receiverId, text })
  });
  return response.json();
}

// ==================== NOTIFICATIONS ====================
export async function getNotifications() {
  const response = await fetch(`${API_URL}/notifications`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function markNotificationAsRead(notificationId) {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return response.json();
}

// ==================== COMMENTS ====================
export async function getComments(postId) {
  const response = await fetch(`${API_URL}/comments/post/${postId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createComment(postId, commentData) {
  const response = await fetch(`${API_URL}/comments/post/${postId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(commentData)
  });
  return response.json();
}

export async function deleteComment(commentId) {
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// ==================== LIKES ====================
export async function unlikePost(postId) {
  const response = await fetch(`${API_URL}/likes/${postId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Export all functions to window for global access
window.api = {
  register,
  login,
  getCurrentUser,
  getUsers,
  getUserById,
  updateUser,
  searchUsers,
  followUser,
  getPosts,
  getPostById,
  createPost,
  deletePost,
  likePost,
  getStories,
  createStory,
  deleteStory,
  getConversations,
  getMessages,
  sendMessage,
  getNotifications,
  markNotificationAsRead,
  getComments,
  createComment,
  deleteComment,
  unlikePost
};
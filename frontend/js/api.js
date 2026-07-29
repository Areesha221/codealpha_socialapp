const API_URL = 'https://codealpha-socialapp-backend.onrender.com/api';

// Helper: Get headers with Token
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==================== AUTH ====================
async function register(userData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return res.json();
}

async function login(credentials) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return res.json();
}

// ==================== FEED & POSTS ====================
async function getFeed() {
  const res = await fetch(`${API_URL}/posts/feed`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return res.json();
}

async function createPost(formData) {
  // NOTE: FormData ke saath 'Content-Type' manually set NAHI karte, browser khud boundary set karta hai
  const res = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });
  return res.json();
}

async function deletePost(postId) {
  const res = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

async function toggleLike(postId) {
  const res = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

// ==================== COMMENTS ====================
async function getComments(postId) {
  const res = await fetch(`${API_URL}/comments/post/${postId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return res.json();
}

async function addComment(postId, text) {
  const res = await fetch(`${API_URL}/comments/post/${postId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ text })
  });
  return res.json();
}

// ==================== STORIES ====================
async function getStories() {
  const res = await fetch(`${API_URL}/stories`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return res.json();
}

async function createStory(formData) {
  const res = await fetch(`${API_URL}/stories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });
  return res.json();
}

// ==================== USERS ====================
async function searchUsers(query) {
  const res = await fetch(`${API_URL}/users/search?q=${query}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return res.json();
}

async function getUserProfile(userId) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return res.json();
}

async function toggleFollow(userId) {
  const res = await fetch(`${API_URL}/users/${userId}/follow`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

// ==================== MESSAGES ====================
async function getConversations() {
  const res = await fetch(`${API_URL}/messages/conversations`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return res.json();
}

async function getMessages(userId) {
  const res = await fetch(`${API_URL}/messages/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return res.json();
}

async function sendMessage(receiverId, text) {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ receiverId, text })
  });
  return res.json();
}

// ==================== EXPORT TO WINDOW ====================
window.api = {
  register,
  login,
  getFeed,
  createPost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  getStories,
  createStory,
  searchUsers,
  getUserProfile,
  toggleFollow,
  getConversations,
  getMessages,
  sendMessage
};
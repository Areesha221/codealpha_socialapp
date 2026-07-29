const API_URL = 'https://codealpha-socialapp-backend.onrender.com/api';

// API Helper Functions
const api = {
    // ============ AUTH ============
    async register(userData) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    },

    async login(credentials) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return await response.json();
    },

    async getMe() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    // ============ USERS ============
    async getUserProfile(userId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async updateProfile(profileData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        return await response.json();
    },

    async searchUsers(query) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    // ============ FOLLOW ============
    async toggleFollow(userId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/follow/${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    // ============ POSTS ============
    async getFeed(page = 1, limit = 10) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts/feed?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async createPost(formData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return await response.json();
    },

    async getPost(postId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async updatePost(postId, data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async deletePost(postId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    // ============ LIKES ============
    async toggleLike(postId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/likes/${postId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    // ============ COMMENTS ============
    async getComments(postId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/comments/${postId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async addComment(postId, text) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/comments/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });
        return await response.json();
    },

    async deleteComment(commentId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    // ============ NOTIFICATIONS ============
    async getNotifications() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async markNotificationAsRead(notificationId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async uploadProfileImage(formData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/profile-image`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return await response.json();
    },

    // Messages
    // Messages APIs
    async getConversations() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/messages/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async getMessages(userId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/messages/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async sendMessage(receiverId, text) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ receiverId, text })
        });
        return await response.json();
    },

    // Stories
    async getStories() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/stories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async createStory(formData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/stories`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return await response.json();
    },

    async viewStory(storyId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/stories/${storyId}/view`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    }
};

window.api = api;
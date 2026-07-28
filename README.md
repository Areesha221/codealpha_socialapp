# README.md

```markdown
# SocialApp - Share Moments 📱

A full-stack social media web application built during the **CodeAlpha Internship**. It features an Instagram-inspired UI with real-time messaging, stories, highlights, and a fully responsive design that works seamlessly across mobile, tablet, and desktop devices.

![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 👤 User Features
- **Authentication**: Secure login and registration with JWT tokens
- **User Profiles**: Customizable profiles with bio, profile pictures, and stats
- **Follow System**: Follow/unfollow users
- **Account Switching**: Switch between multiple accounts easily

### 📸 Content Features
- **Posts**: Share images with captions
- **Stories**: Share temporary content that disappears after 24 hours
- **Highlights**: Save favorite stories to your profile permanently
- **Explore Page**: Discover new content and users

### 💬 Social Features
- **Direct Messaging**: Real-time chat powered by Socket.IO
- **Notes**: Share short text notes with friends
- **Notifications**: Real-time notifications for likes, comments, and follows
- **Search**: Find users and content quickly

### 🎨 UI/UX Features
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark/Light Mode**: Toggle between themes seamlessly
- **Mobile Navigation**: Bottom navigation bar for mobile devices
- **Modern Interface**: Clean, Instagram-inspired design

---

## ️ Tech Stack

### Frontend
- HTML5, CSS3 (CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- Bootstrap 5
- Bootstrap Icons
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO (Real-time engine)
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads

---

## 📁 Project Structure

```
codealpha_socialapp/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── storyController.js
│   │   ── messageController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Story.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── posts.js
│   │   ├── stories.js
│   │   └── messages.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   ── package.json
│
├── frontend/
│   ├── css/
│   │   ── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── feed.js
│   │   ├── messages.js
│   │   ├── profile.js
│   │   ├── stories.js
│   │   ├── explore.js
│   │   └── notifications.js
│   └── index.html
│
── README.md
```

---

##  Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/Areesha221/codealpha_socialapp.git
cd codealpha_socialapp
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file with the following:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialapp
JWT_SECRET=your_secret_key_here
```

3. **Start Backend**
```bash
npm run dev
# or
node server.js
```

4. **Frontend Setup**
```bash
cd ../frontend
# Open index.html in browser or use Live Server extension
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/follow` - Follow/Unfollow user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post

### Stories
- `GET /api/stories` - Get all stories
- `POST /api/stories` - Create story
- `DELETE /api/stories/:id` - Delete story

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message

---

## 🌍 Deployment

### Backend (Render)
1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set root directory: `backend`
5. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Frontend (Netlify)
1. Create account on [Netlify](https://netlify.com)
2. Import from GitHub
3. Set base directory: `frontend`
4. Deploy

### Database (MongoDB Atlas)
1. Create free cluster on [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. Get connection string
3. Whitelist IP addresses

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

##  License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Areesha**
- GitHub: [@Areesha221](https://github.com/Areesha221)
- Project: CodeAlpha Internship

---

**Made with ❤️ during CodeAlpha Internship 2026**
```
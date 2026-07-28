const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { 
  getFeed, 
  createPost, 
  getPost, 
  updatePost, 
  deletePost 
} = require('../controllers/postController');

// @route   GET /api/posts/feed
// @desc    Get feed posts
router.get('/feed', auth, getFeed);

// @route   POST /api/posts
// @desc    Create post
router.post('/', auth, upload.single('image'), createPost);

// @route   GET /api/posts/:id
// @desc    Get single post
router.get('/:id', auth, getPost);

// @route   PUT /api/posts/:id
// @desc    Update post
router.put('/:id', auth, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete post
router.delete('/:id', auth, deletePost);

module.exports = router;
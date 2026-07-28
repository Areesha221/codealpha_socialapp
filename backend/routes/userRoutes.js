const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserProfile, updateProfile, searchUsers } = require('../controllers/userController');
const upload = require('../middleware/upload');
const { uploadProfileImage } = require('../controllers/userController');

router.put('/profile-image', auth, upload.single('profileImage'), uploadProfileImage);

// @route   GET /api/users/search
// @desc    Search users
router.get('/search', auth, searchUsers);

// @route   PUT /api/users/profile
// @desc    Update profile
router.put('/profile', auth, updateProfile);

// @route   GET /api/users/:id
// @desc    Get user profile
router.get('/:id', auth, getUserProfile);

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { toggleLike } = require('../controllers/likeController');

// @route   POST /api/likes/:postId
// @desc    Like/Unlike post
router.post('/:postId', auth, toggleLike);

module.exports = router;
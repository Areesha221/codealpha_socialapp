const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');

// @route   GET /api/comments/:postId
// @desc    Get comments for a post
router.get('/:postId', auth, getComments);

// @route   POST /api/comments/:postId
// @desc    Add comment to post
router.post('/:postId', auth, addComment);

// @route   DELETE /api/comments/:id
// @desc    Delete comment
router.delete('/:id', auth, deleteComment);

module.exports = router;
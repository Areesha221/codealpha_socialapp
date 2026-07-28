const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { toggleFollow } = require('../controllers/followController');

// @route   POST /api/follow/:id
// @desc    Follow/Unfollow user
router.post('/:id', auth, toggleFollow);

module.exports = router;
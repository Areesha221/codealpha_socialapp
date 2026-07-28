const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .populate('user', 'username fullName profileImage');
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comments
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = await Comment.create({
      user: req.user._id,
      post: req.params.postId,
      text
    });
    
    // Update post's comments count
    await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });
    
    // Create notification (if not commenting on own post)
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        sender: req.user._id,
        receiver: post.user,
        type: 'comment',
        post: post._id
      });
    }
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username fullName profileImage');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check ownership
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await Comment.findByIdAndDelete(req.params.id);
    
    // Update post's comments count
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
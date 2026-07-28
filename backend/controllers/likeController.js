const Like = require('../models/Like');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const existingLike = await Like.findOne({
      user: req.user._id,
      post: req.params.postId
    });
    
    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      await Post.findByIdAndUpdate(req.params.postId, { $inc: { likesCount: -1 } });
      
      res.json({ isLiked: false, likesCount: post.likesCount - 1 });
    } else {
      // Like
      await Like.create({
        user: req.user._id,
        post: req.params.postId
      });
      await Post.findByIdAndUpdate(req.params.postId, { $inc: { likesCount: 1 } });
      
      // Create notification (if not liking own post)
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          sender: req.user._id,
          receiver: post.user,
          type: 'like',
          post: post._id
        });
      }
      
      res.json({ isLiked: true, likesCount: post.likesCount + 1 });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const cloudinary = require('../config/cloudinary');

// @desc    Get feed posts
// @route   GET /api/posts/feed
exports.getFeed = async (req, res) => {
  try {
    // Get IDs of users the current user follows
    const following = await Follow.find({ follower: req.user._id }).select('following');
    const followingIds = following.map(f => f.following);
    followingIds.push(req.user._id); // Include own posts
    
    // Fetch posts with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ user: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName profileImage');
    
    // Check like status for current user
    const postIds = posts.map(p => p._id);
    const likes = await Like.find({ 
      user: req.user._id, 
      post: { $in: postIds } 
    }).select('post');
    
    const likedPostIds = likes.map(l => l.post.toString());
    
    const feed = posts.map(p => ({
      ...p.toObject(),
      isLiked: likedPostIds.includes(p._id.toString())
    }));
    
    res.json(feed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create post
// @route   POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'social_media/posts',
      width: 1000,
      crop: 'scale'
    });
    
    const post = await Post.create({
      user: req.user._id,
      caption,
      image: result.secure_url
    });
    
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });
    
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username fullName profileImage');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username fullName profileImage');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user liked
    const like = await Like.findOne({ 
      user: req.user._id, 
      post: post._id 
    });
    
    res.json({
      ...post.toObject(),
      isLiked: !!like
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const { caption } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    post.caption = caption || post.caption;
    const updatedPost = await post.save();
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    // Update user's posts count
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
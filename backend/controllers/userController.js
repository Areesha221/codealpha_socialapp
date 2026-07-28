const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const cloudinary = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/:id
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's posts
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'username fullName profileImage');
    
    // Check if current user is following
    const isFollowing = await Follow.findOne({
      follower: req.user._id,
      following: req.params.id
    });
    
    res.json({
      user,
      posts,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      bio: updatedUser.bio,
      profileImage: updatedUser.profileImage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    let users;
    if (!query || query.trim() === '') {
      // Return all users except current user
      users = await User.find({ _id: { $ne: req.user._id } })
        .select('-password')
        .limit(20)
        .sort({ createdAt: -1 });
    } else {
      users = await User.find({
        _id: { $ne: req.user._id },
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { fullName: { $regex: query, $options: 'i' } }
        ]
      }).select('-password').limit(20);
    }
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile picture
// @route   PUT /api/users/profile-image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'social_media/profiles',
      width: 300,
      height: 300,
      crop: 'fill',
      gravity: 'face'
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: result.secure_url },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: error.message });
  }
};
const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: targetUserId
    });
    
    if (existingFollow) {
      // Unfollow
      await Follow.findByIdAndDelete(existingFollow._id);
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
      
      res.json({ 
        isFollowing: false, 
        followersCount: targetUser.followersCount - 1 
      });
    } else {
      // Follow
      await Follow.create({
        follower: req.user._id,
        following: targetUserId
      });
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
      
      // Create notification
      await Notification.create({
        sender: req.user._id,
        receiver: targetUserId,
        type: 'follow'
      });
      
      res.json({ 
        isFollowing: true, 
        followersCount: targetUser.followersCount + 1 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
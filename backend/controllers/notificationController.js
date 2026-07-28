const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username fullName profileImage');
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create notification helper
exports.createNotification = async (senderId, receiverId, type, postId = null, io = null) => {
  try {
    const notification = await Notification.create({
      sender: senderId,
      receiver: receiverId,
      type,
      post: postId
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'username fullName profileImage');

    // Send real-time notification
    if (io) {
      io.to(receiverId).emit('receive_notification', populatedNotification);
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};
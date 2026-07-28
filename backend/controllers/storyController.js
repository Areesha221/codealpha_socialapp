const Story = require('../models/Story');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc    Create story
// @route   POST /api/stories
exports.createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    let imageUrl;
    if (process.env.NODE_ENV === 'production' && cloudinary) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'stories',
        width: 1080,
        height: 1920,
        crop: 'fill'
      });
      imageUrl = result.secure_url;
    } else {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const storyData = {
      user: req.user._id,
      image: imageUrl,
      caption: req.body.caption || '',
      storyType: req.body.storyType || 'image'
    };

    if (req.body.music) {
      try {
        storyData.music = JSON.parse(req.body.music);
      } catch (e) {
        storyData.music = null;
      }
    }

    const story = await Story.create(storyData);
    await story.populate('user', 'username fullName profileImage');

    res.status(201).json(story);
  } catch (error) {
    console.error('Story creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active stories
// @route   GET /api/stories
exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() }
    })
    .populate('user', 'username fullName profileImage')
    .sort({ createdAt: -1 });

    res.json(stories || []);
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ message: error.message, stories: [] });
  }
};

// @desc    View story (mark as viewed)
// @route   GET /api/stories/:id/view
exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const alreadyViewed = story.views.some(
      v => v.user.toString() === req.user._id.toString()
    );
    
    if (!alreadyViewed) {
      story.views.push({ user: req.user._id });
      await story.save();
    }

    await story.populate('user', 'username fullName profileImage');
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete story (only owner)
// @route   DELETE /api/stories/:id
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: error.message });
  }
};
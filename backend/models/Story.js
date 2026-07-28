const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    maxlength: 500,
    default: ''
  },
  storyType: {
    type: String,
    enum: ['image', 'text', 'music'],
    default: 'image'
  },
  music: {
    title: { type: String },
    artist: { type: String },
    url: { type: String },
    duration: { type: Number, default: 15 }, // seconds (5-30)
    startTime: { type: Number, default: 0 }  // where song starts
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    default: () => Date.now() + 24 * 60 * 60 * 1000
  }
}, {
  timestamps: true
});

StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', StorySchema);
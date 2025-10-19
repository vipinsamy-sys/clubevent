const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  eventsAttended: {
    type: Number,
    default: 0
  },
  certificatesEarned: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number
  }
}, {
  timestamps: true
});

// Index for efficient leaderboard queries
leaderboardSchema.index({ totalPoints: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

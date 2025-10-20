const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  registeredEvents: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed'],
      default: 'registered'
    }
  }],
  certificates: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    certificateUrl: String,
    issuedDate: {
      type: Date,
      default: Date.now
    }
  }],
  points: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    default: 'student',
    enum: ['student', 'admin', 'faculty']
  },
  clubName: {
    type: String,
    required: function() {
      return this.role === 'admin';
    }
  },
  position: {
    type: String,
    default: 'Student'
  },
  isClubAdmin: {
    type: Boolean,
    default: false
  },
  adminClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }
}, {
  timestamps: true
});


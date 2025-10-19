const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Event = require('../models/Event');
const Leaderboard = require('../models/Leaderboard');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get user's registered events
router.get('/events', auth, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('registeredEvents.eventId');
    
    res.json(user.registeredEvents);
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's certificates
router.get('/certificates', auth, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('certificates.eventId');
    
    res.json(user.certificates);
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ totalPoints: -1 })
      .limit(50);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().notEmpty(),
  body('phone').optional().notEmpty(),
  body('department').optional().notEmpty(),
  body('year').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, department, year } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (year) updateData.year = year;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
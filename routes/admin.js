const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Admin Signup
router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('clubName').notEmpty().withMessage('Club name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, clubName } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already registered' });
    }

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password,
      clubName,
      createdBy: req.user?.id || null // This will be set when created by faculty
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        clubName: admin.clubName
      }
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ message: 'Server error during admin registration' });
  }
});

// Admin Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: 'admin', loginType: 'admin', clubName: admin.clubName },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        clubName: admin.clubName
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get admin dashboard stats
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalEvents = await Event.countDocuments({ createdBy: req.user.id });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const upcomingEvents = await Event.countDocuments({ 
      createdBy: req.user.id, 
      status: 'upcoming' 
    });
    const completedEvents = await Event.countDocuments({ 
      createdBy: req.user.id, 
      status: 'completed' 
    });

    res.json({
      totalEvents,
      totalStudents,
      upcomingEvents,
      completedEvents
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin's events
router.get('/events', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const events = await Event.find({ createdBy: req.user.id })
      .populate('participants.userId', 'name studentId department year')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event participants
router.get('/events/:eventId/participants', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const event = await Event.findById(req.params.eventId)
      .populate('participants.userId', 'name studentId department year phone');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event.participants);
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students
router.get('/students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const students = await User.find({ role: 'student' })
      .select('name email studentId department year phone points')
      .sort({ points: -1 });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create admin (for faculty use)
router.post('/create-admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, password, clubName } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password,
      clubName,
      createdBy: req.user.id
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        clubName: admin.clubName
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

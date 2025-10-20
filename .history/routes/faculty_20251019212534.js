const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Faculty Login (plain-text password)
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
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Find faculty by email
    const faculty = await Faculty.findOne({ email: normalizedEmail });
    if (!faculty) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if faculty is active
    if (!faculty.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Plain-text password comparison
    if (faculty.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: faculty._id, role: faculty.role, loginType: 'faculty', clubName: faculty.clubName },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Faculty login successful',
      token,
      user: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        facultyId: faculty.facultyId,
        department: faculty.department,
        position: faculty.position,
        clubName: faculty.clubName
      }
    });
  } catch (error) {
    console.error('Faculty login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// All other routes remain unchanged
// ... dashboard-stats, events, past-events, students-progress, leaderboard, admins, promote, remove admin ...

module.exports = router;

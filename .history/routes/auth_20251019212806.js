const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Faculty = require('../models/Faculty');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ---------------------- User Registration ----------------------
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('year').notEmpty().withMessage('Year is required'),
  body('phone').notEmpty().withMessage('Phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, studentId, department, year, phone, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Create user (plain-text password)
    const user = new User({ name, email, password, studentId, department, year, phone, role: role || 'student' });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '7d' });

    res.status(201).json({ message: 'User registered successfully', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ---------------------- User Login ----------------------
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ---------------------- Student Login ----------------------
router.post('/student-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.role !== 'student' || user.password !== password) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, loginType: 'student' }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '7d' });

    res.json({ message: 'Student login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId, department: user.department, year: user.year, points: user.points } });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ---------------------- Admin Login ----------------------
router.post('/admin-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || admin.password !== password || !admin.isActive) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: 'admin', loginType: 'admin', clubName: admin.clubName }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '7d' });

    res.json({ message: 'Admin login successful', token, user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin', clubName: admin.clubName } });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ---------------------- Faculty Login ----------------------
router.post('/faculty-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const faculty = await Faculty.findOne({ email: normalizedEmail });

    if (!faculty || !faculty.isActive || faculty.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: faculty._id, role: faculty.role, loginType: 'faculty', clubName: faculty.clubName }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '7d' });

    res.json({
      message: 'Faculty login successful',
      token,
      user: { id: faculty._id, name: faculty.name, email: faculty.email, role: faculty.role, facultyId: faculty.facultyId, department: faculty.department, position: faculty.position, clubName: faculty.clubName }
    });
  } catch (error) {
    console.error('Faculty login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;

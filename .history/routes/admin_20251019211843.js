const express = require('express');
const router = express.Router();
const Admin = require('../models/admin.');

// Register Admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, clubName, adminId } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const admin = new Admin({
      name,
      email,
      password, // plaintext
      clubName,
      adminId
    });

    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during admin registration' });
  }
});

// Login Admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || admin.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Admin login successful',
      admin: {
        name: admin.name,
        email: admin.email,
        clubName: admin.clubName,
        adminId: admin.adminId
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

module.exports = router;

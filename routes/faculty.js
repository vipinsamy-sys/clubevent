const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Faculty Login
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

    // Check password
    let isMatch = false;
    try {
      isMatch = await faculty.comparePassword(password);
    } catch (_) {
      isMatch = false;
    }

    // If password was stored in plaintext (e.g., manual DB insert),
    // allow one-time migration: verify by direct equality, then hash and save.
    if (!isMatch) {
      const looksHashed = typeof faculty.password === 'string' && faculty.password.startsWith('$2');
      if (!looksHashed && faculty.password === password) {
        const bcrypt = require('bcryptjs');
        faculty.password = await bcrypt.hash(password, 12);
        await faculty.save();
        isMatch = true;
      }
    }

    if (!isMatch) {
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

// Get faculty dashboard stats
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalEvents = await Event.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await Admin.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
    const completedEvents = await Event.countDocuments({ status: 'completed' });

    res.json({
      totalEvents,
      totalStudents,
      totalAdmins,
      upcomingEvents,
      completedEvents
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events
router.get('/events', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const events = await Event.find()
      .populate('createdBy', 'name email')
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
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const event = await Event.findById(req.params.eventId)
      .populate('participants.userId', 'name studentId department year phone');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      event: {
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        venue: event.venue
      },
      participants: event.participants
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get past events
router.get('/past-events', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pastEvents = await Event.find({ status: 'completed' })
      .populate('createdBy', 'name email')
      .populate('certificates.userId', 'name studentId')
      .sort({ date: -1 });

    res.json(pastEvents);
  } catch (error) {
    console.error('Get past events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students progress
router.get('/students-progress', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const students = await User.find({ role: 'student' })
      .populate('registeredEvents.eventId', 'title points')
      .populate('certificates.eventId', 'title')
      .select('name studentId department year phone points registeredEvents certificates')
      .sort({ points: -1 });

    const studentsWithProgress = students.map(student => {
      const totalEvents = student.registeredEvents.length;
      const completedEvents = student.registeredEvents.filter(event => 
        event.status === 'completed'
      ).length;
      const certificatesEarned = student.certificates.length;

      return {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        department: student.department,
        year: student.year,
        phone: student.phone,
        points: student.points,
        totalEvents,
        completedEvents,
        certificatesEarned
      };
    });

    res.json(studentsWithProgress);
  } catch (error) {
    console.error('Get students progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const students = await User.find({ role: 'student' })
      .populate('registeredEvents.eventId', 'title points')
      .populate('certificates.eventId', 'title')
      .select('name studentId department year phone points registeredEvents certificates')
      .sort({ points: -1 })
      .limit(50);

    const leaderboard = students.map((student, index) => {
      const eventsAttended = student.registeredEvents.filter(event => 
        event.status === 'completed'
      ).length;
      const certificatesEarned = student.certificates.length;

      return {
        rank: index + 1,
        name: student.name,
        studentId: student.studentId,
        department: student.department,
        year: student.year,
        totalPoints: student.points,
        eventsAttended,
        certificatesEarned
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all admins
router.get('/admins', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const admins = await Admin.find()
      .populate('createdBy', 'name email')
      .select('name email clubName position isActive createdAt')
      .sort({ createdAt: -1 });

    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Promote student to admin
router.post('/promote', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { studentId, clubName } = req.body;

    // Find the student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student is already an admin
    const existingAdmin = await Admin.findOne({ email: student.email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Student is already an admin' });
    }

    // Create admin account
    const admin = new Admin({
      name: student.name,
      email: student.email,
      password: student.password, // Use the same password
      clubName: clubName || 'General Club',
      createdBy: req.user.id,
      promotedFrom: student._id
    });

    await admin.save();

    // Update student role to admin
    student.role = 'admin';
    student.isClubAdmin = true;
    student.clubName = clubName || 'General Club';
    await student.save();

    res.json({
      message: 'Student promoted to admin successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        clubName: admin.clubName
      }
    });
  } catch (error) {
    console.error('Promote student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove admin
router.delete('/admins/:adminId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // If admin was promoted from a student, revert their role
    if (admin.promotedFrom) {
      await User.findByIdAndUpdate(admin.promotedFrom, {
        role: 'student',
        isClubAdmin: false,
        clubName: undefined
      });
    }

    await Admin.findByIdAndDelete(req.params.adminId);

    res.json({ message: 'Admin removed successfully' });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

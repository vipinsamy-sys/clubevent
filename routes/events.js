const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('participants.userId', 'name email studentId department year');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (Admin only)
router.post('/', auth, authorize('admin'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('venue').notEmpty().withMessage('Venue is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = new Event({
      ...req.body,
      createdBy: req.user._id
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event (Students only)
router.post('/:id/register', auth, authorize('student'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const alreadyRegistered = event.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Add participant
    event.participants.push({
      userId: req.user._id,
      status: 'registered'
    });
    event.currentParticipants += 1;

    // Add to user's registered events
    req.user.registeredEvents.push({
      eventId: event._id,
      status: 'registered'
    });

    await event.save();
    await req.user.save();

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event status (Admin only)
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = status;
    await event.save();

    res.json({ message: 'Event status updated' });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update participant status (Admin only)
router.put('/:id/participants/:userId/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const participant = event.participants.find(
      p => p.userId.toString() === req.params.userId
    );
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    participant.status = status;
    await event.save();

    // Update user's registered events status
    const user = await User.findById(req.params.userId);
    if (user) {
      const userEvent = user.registeredEvents.find(
        e => e.eventId.toString() === req.params.id
      );
      if (userEvent) {
        userEvent.status = status;
        await user.save();
      }
    }

    res.json({ message: 'Participant status updated' });
  } catch (error) {
    console.error('Update participant status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload certificate (Admin only)
router.post('/:id/certificates', auth, authorize('admin'), async (req, res) => {
  try {
    const { userId, certificateUrl } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Add certificate
    event.certificates.push({
      userId,
      certificateUrl
    });

    // Add certificate to user
    const user = await User.findById(userId);
    if (user) {
      user.certificates.push({
        eventId: event._id,
        certificateUrl
      });
      
      // Add points
      user.points += event.points;
      await user.save();

      // Update leaderboard
      await updateLeaderboard(user);
    }

    await event.save();
    res.json({ message: 'Certificate uploaded successfully' });
  } catch (error) {
    console.error('Upload certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update leaderboard
async function updateLeaderboard(user) {
  try {
    const eventsAttended = user.registeredEvents.filter(e => e.status === 'completed').length;
    const certificatesEarned = user.certificates.length;

    await Leaderboard.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        name: user.name,
        studentId: user.studentId,
        department: user.department,
        year: user.year,
        totalPoints: user.points,
        eventsAttended,
        certificatesEarned
      },
      { upsert: true }
    );

    // Update ranks
    const leaderboard = await Leaderboard.find().sort({ totalPoints: -1 });
    for (let i = 0; i < leaderboard.length; i++) {
      leaderboard[i].rank = i + 1;
      await leaderboard[i].save();
    }
  } catch (error) {
    console.error('Update leaderboard error:', error);
  }
}

module.exports = router;

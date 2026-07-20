const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get XP Leaderboard (Top Ranked Students)
router.get('/leaderboard', async (req, res) => {
  try {
    const topStudents = await User.find({ status: 'active' })
      .select('name department avatar xpPoints level badges studentId position role')
      .sort({ xpPoints: -1 })
      .limit(10);

    res.json(topStudents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Register for an event (+100 XP Bonus & Badges)
router.post('/', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is fully booked' });
    }

    const existingReg = await Registration.findOne({ eventId, userId: req.user.id });
    if (existingReg) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    const ticketCode = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketCode}`;

    const registration = new Registration({
      eventId,
      userId: req.user.id,
      ticketCode,
      qrCodeUrl
    });

    await registration.save();

    // Increment registeredCount
    event.registeredCount += 1;
    await event.save();

    // Award +100 XP Gamification Points to User
    const userObj = await User.findById(req.user.id);
    if (userObj) {
      userObj.xpPoints = (userObj.xpPoints || 150) + 100;
      
      // Grant Badges
      if (event.category === 'technical' && !userObj.badges.includes('🚀 Tech Master')) {
        userObj.badges.push('🚀 Tech Master');
      }
      if (event.category === 'cultural' && !userObj.badges.includes('🎨 Cultural Star')) {
        userObj.badges.push('🎨 Cultural Star');
      }
      if (!userObj.badges.includes('⚡ Campus Pioneer')) {
        userObj.badges.push('⚡ Campus Pioneer');
      }
      await userObj.save();
    }

    const populatedReg = await Registration.findById(registration._id).populate('eventId');
    res.status(201).json(populatedReg);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering for event', error: err.message });
  }
});

// Get user registrations
router.get('/my', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user.id, status: 'registered' })
      .populate('eventId')
      .sort({ registeredAt: -1 });

    res.json(registrations);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ message: 'Error fetching user registrations' });
  }
});

// Cancel registration
router.delete('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findOne({ _id: req.params.id, userId: req.user.id });
    if (!registration) {
      return res.status(404).json({ message: 'Registration record not found' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrement registered count
    const event = await Event.findById(registration.eventId);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling registration' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { auth, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Protect all admin endpoints for coordinators and admins
router.use(auth, authorizeRoles('admin', 'coordinator'));

// Primary Root Super Admin Emails (Immune to demotion or deactivation)
const ROOT_SUPER_ADMIN_EMAILS = ['mr.sankya@digicampus.edu', 'mr.sankya@campuspulse.edu'];

// Analytics Summary Dashboard Data
router.get('/analytics', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'Upcoming' });
    const completedEvents = await Event.countDocuments({ status: 'Completed' });
    const totalUsers = await User.countDocuments();
    const totalRegistrations = await Registration.countDocuments({ status: 'registered' });
    
    // Category Breakdown
    const categoryStats = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalSeats: { $sum: '$registeredCount' } } }
    ]);

    // Popular events
    const topEvents = await Event.find().sort({ registeredCount: -1 }).limit(5).select('title category registeredCount capacity price location date');

    res.json({
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalUsers,
      totalRegistrations,
      categoryStats,
      topEvents
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Error loading analytics', error: err.message });
  }
});

// Get Participant Roster for an Event
router.get('/events/:eventId/participants', async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = await Registration.find({ eventId, status: 'registered' })
      .populate('userId', 'name email department studentId avatar role position')
      .sort({ registeredAt: -1 });

    res.json({
      event,
      participants: registrations
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching participant roster' });
  }
});

// Update Participant Registration Status / Attendance
router.put('/registrations/:id/attendance', async (req, res) => {
  try {
    const { attendanceStatus, status } = req.body;
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration record not found' });
    }

    if (attendanceStatus) registration.attendanceStatus = attendanceStatus;
    if (status) registration.status = status;
    if (attendanceStatus === 'Present') registration.certificateIssued = true;

    await registration.save();
    res.json(registration);
  } catch (err) {
    res.status(500).json({ message: 'Error updating attendance' });
  }
});

// List all registered users (for user management)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Update user role & position (Strict protection for Root Super Admin)
router.put('/users/:id/role', authorizeRoles('admin'), async (req, res) => {
  try {
    const { role, position } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protection: Prevent demoting Root Super Admin
    if (ROOT_SUPER_ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
      return res.status(403).json({ message: 'Forbidden: Primary Super Admin account role cannot be modified or demoted.' });
    }

    if (role) targetUser.role = role;
    if (position) targetUser.position = position;

    await targetUser.save();
    res.json(targetUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Toggle User Status (active / deactivated) - Root Super Admin Protection
router.put('/users/:id/status', authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protection: Prevent deactivating Root Super Admin
    if (ROOT_SUPER_ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
      return res.status(403).json({ message: 'Forbidden: Primary Super Admin account cannot be deactivated.' });
    }

    targetUser.status = status;
    await targetUser.save();
    res.json(targetUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Admin Reset Password for User
router.post('/users/:id/reset-password', authorizeRoles('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protection: Only allow Root Super Admin to reset Root Super Admin password
    if (ROOT_SUPER_ADMIN_EMAILS.includes(targetUser.email.toLowerCase()) && req.user.email.toLowerCase() !== targetUser.email.toLowerCase()) {
      return res.status(403).json({ message: 'Forbidden: Only the Primary Owner can reset the Super Admin password.' });
    }

    const salt = await bcrypt.genSalt(10);
    targetUser.password = await bcrypt.hash(newPassword, salt);
    await targetUser.save();

    res.json({ message: `Password reset successfully for ${targetUser.name}` });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;

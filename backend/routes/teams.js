const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const TeammateListing = require('../models/TeammateListing');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Create a new team
router.post('/create', auth, async (req, res) => {
  try {
    const { name, eventId, maxMembers } = req.body;
    if (!name || !eventId) {
      return res.status(400).json({ message: 'Team name and event ID are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already registered for this event
    const existingReg = await Registration.findOne({ eventId, userId: req.user.id });
    if (existingReg) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    const code = `TEAM-${Math.floor(1000 + Math.random() * 9000)}`;

    const team = new Team({
      name,
      code,
      eventId,
      leaderId: req.user.id,
      members: [{ userId: req.user.id, role: 'Team Leader' }],
      maxMembers: maxMembers || 4
    });

    await team.save();

    // Register team leader for the event automatically
    const ticketCode = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketCode}`;

    const registration = new Registration({
      eventId,
      userId: req.user.id,
      ticketCode,
      qrCodeUrl
    });
    await registration.save();

    event.registeredCount += 1;
    await event.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('eventId')
      .populate('members.userId', 'name email avatar department studentId');

    res.status(201).json(populatedTeam);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ message: 'Error creating team', error: err.message });
  }
});

// Join an existing team via Team Code
router.post('/join', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Team code is required' });
    }

    const team = await Team.findOne({ code: code.toUpperCase().trim() }).populate('eventId');
    if (!team) {
      return res.status(404).json({ message: 'Invalid team code. Please check and try again.' });
    }

    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: 'Team is already full' });
    }

    // Check if user is already a member of this team
    const isAlreadyMember = team.members.some(m => m.userId.toString() === req.user.id);
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this team' });
    }

    // Check if user is already registered for this event
    const existingReg = await Registration.findOne({ eventId: team.eventId._id, userId: req.user.id });
    if (existingReg) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    team.members.push({ userId: req.user.id, role: 'Member' });
    await team.save();

    // Register student for event
    const ticketCode = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketCode}`;

    const registration = new Registration({
      eventId: team.eventId._id,
      userId: req.user.id,
      ticketCode,
      qrCodeUrl
    });
    await registration.save();

    const event = await Event.findById(team.eventId._id);
    if (event) {
      event.registeredCount += 1;
      await event.save();
    }

    const populatedTeam = await Team.findById(team._id)
      .populate('eventId')
      .populate('members.userId', 'name email avatar department studentId');

    res.json(populatedTeam);
  } catch (err) {
    console.error('Error joining team:', err);
    res.status(500).json({ message: 'Error joining team', error: err.message });
  }
});

// Get user's teams
router.get('/my', auth, async (req, res) => {
  try {
    const teams = await Team.find({ 'members.userId': req.user.id })
      .populate('eventId')
      .populate('members.userId', 'name email avatar department studentId')
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user teams' });
  }
});

// Get teammate listings (matchmaking board)
router.get('/listings', async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = { status: 'open' };
    if (eventId) filter.eventId = eventId;

    const listings = await TeammateListing.find(filter)
      .populate('eventId', 'title category date location')
      .populate('postedById', 'name email avatar department studentId role')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teammate listings' });
  }
});

// Post a teammate listing
router.post('/listings', auth, async (req, res) => {
  try {
    const { eventId, title, skillsNeeded, description, contactInfo } = req.body;
    if (!eventId || !title || !description || !contactInfo) {
      return res.status(400).json({ message: 'Event, title, description, and contact info are required' });
    }

    const listing = new TeammateListing({
      eventId,
      postedById: req.user.id,
      title,
      skillsNeeded: skillsNeeded || [],
      description,
      contactInfo
    });

    await listing.save();

    const populatedListing = await TeammateListing.findById(listing._id)
      .populate('eventId', 'title category date location')
      .populate('postedById', 'name email avatar department studentId role');

    res.status(201).json(populatedListing);
  } catch (err) {
    res.status(500).json({ message: 'Error posting teammate listing', error: err.message });
  }
});

// Close/Delete a teammate listing
router.delete('/listings/:id', auth, async (req, res) => {
  try {
    const listing = await TeammateListing.findOne({ _id: req.params.id, postedById: req.user.id });
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found or unauthorized' });
    }

    listing.status = 'closed';
    await listing.save();
    res.json({ message: 'Listing closed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error closing listing' });
  }
});

module.exports = router;

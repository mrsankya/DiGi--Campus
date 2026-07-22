const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

// Intelligent AI Event Text/WhatsApp Parser
router.post('/parse-text', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ message: 'Raw event text or WhatsApp message is required' });
    }

    const text = rawText.trim();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. Extract Title (first non-empty line or headline)
    let title = lines[0] ? lines[0].replace(/[*_~#]/g, '') : 'Campus Event Announcement';
    if (title.length > 80) {
      title = title.substring(0, 77) + '...';
    }

    // 2. Extract Category
    let category = 'Tech';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('cultural') || lowerText.includes('dance') || lowerText.includes('music') || lowerText.includes('fest') || lowerText.includes('drama')) {
      category = 'Cultural';
    } else if (lowerText.includes('sports') || lowerText.includes('cricket') || lowerText.includes('football') || lowerText.includes('chess') || lowerText.includes('tournament')) {
      category = 'Sports';
    } else if (lowerText.includes('academic') || lowerText.includes('lecture') || lowerText.includes('exam') || lowerText.includes('quiz')) {
      category = 'Academic';
    } else if (lowerText.includes('workshop') || lowerText.includes('bootcamp') || lowerText.includes('hands-on') || lowerText.includes('training')) {
      category = 'Workshop';
    } else if (lowerText.includes('seminar') || lowerText.includes('webinar') || lowerText.includes('talk') || lowerText.includes('conference')) {
      category = 'Seminar';
    }

    // 3. Extract Date (Matches YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or English dates like "15th August 2026")
    let date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default +7 days
    const dateMatch = text.match(/(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})|(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/);
    if (dateMatch) {
      const matched = dateMatch[0];
      const parsedDate = new Date(matched);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }
    }

    // 4. Extract Time
    let time = '10:00 AM';
    const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)|(\d{1,2}\s*(?:AM|PM|am|pm))/i);
    if (timeMatch) {
      time = timeMatch[0].toUpperCase();
    }

    // 5. Extract Location / Venue
    let location = 'Main Auditorium';
    let venue = 'Campus Ground';
    const venueMatch = text.match(/(?:venue|location|place|at|hall|auditorium):\s*([^\n,.]+)/i);
    if (venueMatch && venueMatch[1]) {
      location = venueMatch[1].trim();
      venue = venueMatch[1].trim();
    } else if (lowerText.includes('auditorium')) {
      location = 'Main Auditorium';
      venue = 'Academic Block A';
    } else if (lowerText.includes('seminar hall')) {
      location = 'Seminar Hall B';
      venue = 'Engineering Building';
    } else if (lowerText.includes('ground') || lowerText.includes('oat')) {
      location = 'Open Air Theatre (OAT)';
      venue = 'Campus Grounds';
    }

    // 6. Extract Organizer / Department
    let organizer = 'Student Club & Council';
    let department = 'General';
    const orgMatch = text.match(/(?:organizer|organized by|dept|department|club):\s*([^\n,.]+)/i);
    if (orgMatch && orgMatch[1]) {
      organizer = orgMatch[1].trim();
    }
    if (lowerText.includes('computer') || lowerText.includes('cs') || lowerText.includes('ai') || lowerText.includes('coding')) {
      department = 'Computer Science';
    } else if (lowerText.includes('ece') || lowerText.includes('electronics')) {
      department = 'Electronics & Telecom';
    } else if (lowerText.includes('mech') || lowerText.includes('mechanical')) {
      department = 'Mechanical Engineering';
    }

    // 7. Extract Capacity & Price
    let capacity = 150;
    const capMatch = text.match(/(?:capacity|seats|max seats|limit):\s*(\d+)/i);
    if (capMatch && capMatch[1]) {
      capacity = parseInt(capMatch[1], 10);
    }

    let price = 0;
    const priceMatch = text.match(/(?:fee|price|entry fee|cost|rs|inr):\s*(\d+)/i);
    if (priceMatch && priceMatch[1] && !lowerText.includes('free')) {
      price = parseInt(priceMatch[1], 10);
    }

    res.json({
      title,
      description: text,
      category,
      date,
      time,
      location,
      venue,
      organizer,
      department,
      capacity,
      price
    });
  } catch (err) {
    console.error('Error parsing event text:', err);
    res.status(500).json({ message: 'Error parsing event text', error: err.message });
  }
});

// Get all approved events
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, department, status, includePending } = req.query;
    const query = {};

    if (includePending !== 'true') {
      query.approvalStatus = { $ne: 'Rejected' };
      query.$or = [
        { approvalStatus: 'Approved' },
        { approvalStatus: { $exists: false } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$and = [
        {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { location: searchRegex },
            { organizer: searchRegex }
          ]
        }
      ];
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Error fetching events', error: err.message });
  }
});

// Admin Route: Get events pending approval
router.get('/pending/approval', auth, async (req, res) => {
  try {
    const pendingEvents = await Event.find({ approvalStatus: 'Pending' })
      .populate('createdById', 'name email department avatar studentId role')
      .sort({ createdAt: -1 });

    res.json(pendingEvents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending events' });
  }
});

// Get single event details
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching event details' });
  }
});

// Create new event (Student submissions set to Pending; Admin/Coordinator set to Approved)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, date, time, location, venue, organizer, department, image, capacity, price, isFeatured, agenda, speakers } = req.body;

    if (!title || !description || !category || !date || !time || !location || !venue || !organizer) {
      return res.status(400).json({ message: 'Please provide all required event fields' });
    }

    // Default status: Students submit for approval; Admins/Organizers auto-approve
    const isUserAdmin = req.user.role === 'admin' || req.user.role === 'coordinator';
    const approvalStatus = isUserAdmin ? 'Approved' : 'Pending';

    const newEvent = new Event({
      title,
      description,
      category,
      date: new Date(date),
      time,
      location,
      venue,
      organizer,
      department: department || 'General',
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      capacity: capacity || 100,
      price: price || 0,
      isFeatured: isFeatured || false,
      approvalStatus,
      agenda: agenda || [],
      speakers: speakers || [],
      createdById: req.user.id
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
});

// Admin Route: Update event approval status (Approved / Rejected)
router.put('/:id/approval', auth, async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    if (!['Approved', 'Rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { approvalStatus } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error updating event approval' });
  }
});

// Update event details
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router;

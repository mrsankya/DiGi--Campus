const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');

// AI DiGi Bot Chat Assistant Endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message prompt is required' });
    }

    const query = message.toLowerCase();

    // Fetch live events & announcements context
    const events = await Event.find().sort({ date: 1 }).limit(10);
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(5);

    let reply = "";

    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      reply = "👋 Hello! I am **DiGi Bot**, your AI Campus Assistant! I can help you find upcoming workshops, hackathons, cultural fests, download certificates, or answer event questions. What are you looking for today?";
    } 
    else if (query.includes('tech') || query.includes('hackathon') || query.includes('coding') || query.includes('ai')) {
      const techEvents = events.filter(e => e.category === 'technical' || e.title.toLowerCase().includes('ai') || e.title.toLowerCase().includes('code') || e.title.toLowerCase().includes('hackathon'));
      if (techEvents.length > 0) {
        reply = `🚀 Here are the upcoming **Technical & AI Events** on campus:\n\n` +
          techEvents.map(e => `• **${e.title}** (${new Date(e.date).toLocaleDateString()}) at ${e.location} - Seats: ${e.registeredCount}/${e.capacity}`).join('\n') +
          `\n\nClick on any event card on the home page to register and claim your ticket pass!`;
      } else {
        reply = "💻 We currently have technical events scheduled. Check the Events tab on the home page for details!";
      }
    }
    else if (query.includes('certificate') || query.includes('pass') || query.includes('ticket')) {
      reply = "📜 **Certificates & Pass Instructions**:\n\n1. Sign in to your account.\n2. Go to **My RSVPs / Student Dashboard**.\n3. Show your **QR Code Ticket Pass** at the event door.\n4. Once marked 'Present' by the coordinator, your official **Printable Certificate** unlocks instantly in your dashboard!";
    }
    else if (query.includes('location') || query.includes('where') || query.includes('venue') || query.includes('auditorium')) {
      const venues = Array.from(new Set(events.map(e => e.location))).filter(Boolean);
      reply = `📍 **Campus Venues & Locations**:\n\n` +
        (venues.length > 0 ? venues.map(v => `• ${v}`).join('\n') : '• Main Auditorium\n• Seminar Hall B\n• Innovation Lab') +
        `\n\nAll event venues are listed on each event details page.`;
    }
    else if (query.includes('admin') || query.includes('organizer') || query.includes('contact') || query.includes('host')) {
      reply = "👑 **Campus Administration & Coordinators**:\n\n• **Super Admin**: Mr. Sankya (`mr.sankya@digicampus.edu`)\n• **Event Office**: Student Activity Center, Building A\n\nYou can also contact event coordinators directly from the Event Details page.";
    }
    else if (query.includes('announcement') || query.includes('news') || query.includes('bulletin') || query.includes('notice')) {
      if (announcements.length > 0) {
        reply = `📢 **Latest Campus Bulletins**:\n\n` +
          announcements.map(a => `• **${a.title}** (${a.category}): ${a.content}`).join('\n\n');
      } else {
        reply = "📢 No urgent announcements posted today. Check back regularly!";
      }
    }
    else {
      // General intelligent summary of all upcoming events
      reply = `✨ Here are the upcoming events scheduled on campus:\n\n` +
        events.slice(0, 4).map(e => `• **${e.title}** (${e.category}) - ${new Date(e.date).toLocaleDateString()} at ${e.location}`).join('\n') +
        `\n\nIs there a specific category or topic you want to ask about?`;
    }

    res.json({ reply, timestamp: new Date() });
  } catch (err) {
    console.error('DiGi Bot error:', err);
    res.status(500).json({ message: 'DiGi Bot service unavailable', error: err.message });
  }
});

module.exports = router;

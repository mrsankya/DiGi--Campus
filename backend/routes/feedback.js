const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Helper to update Event average rating and total review count
async function recalculateEventRating(eventId) {
  const reviews = await Feedback.find({ eventId });
  const totalReviews = reviews.length;
  let averageRating = 0;

  if (totalReviews > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    averageRating = Math.round((sum / totalReviews) * 10) / 10;
  }

  await Event.findByIdAndUpdate(eventId, { averageRating, totalReviews });
  return { averageRating, totalReviews };
}

// Post / Update Review & Rating for an Event
router.post('/', auth, async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;

    if (!eventId || !rating || !comment) {
      return res.status(400).json({ message: 'Event ID, rating (1-5), and review comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Upsert review (Insert or Update if already reviewed)
    let feedback = await Feedback.findOne({ eventId, userId: req.user.id });

    if (feedback) {
      feedback.rating = Number(rating);
      feedback.comment = comment.trim();
      feedback.userName = user.name;
      feedback.userAvatar = user.avatar;
      await feedback.save();
    } else {
      feedback = new Feedback({
        eventId,
        userId: req.user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating: Number(rating),
        comment: comment.trim()
      });
      await feedback.save();

      // Award +25 Gamification XP Bonus for writing an event review!
      user.xpPoints = (user.xpPoints || 0) + 25;
      await user.save();
    }

    // Recalculate event ratings
    const stats = await recalculateEventRating(eventId);

    res.status(201).json({
      feedback,
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      xpPoints: user.xpPoints
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Error submitting review', error: err.message });
  }
});

// Get Reviews for a Specific Event
router.get('/event/:eventId', async (req, res) => {
  try {
    const reviews = await Feedback.find({ eventId: req.params.eventId })
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    let averageRating = 0;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = Math.round((sum / totalReviews) * 10) / 10;
    }

    res.json({
      reviews,
      averageRating,
      totalReviews
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Get Reviews submitted by current user
router.get('/my', auth, async (req, res) => {
  try {
    const reviews = await Feedback.find({ userId: req.user.id })
      .populate('eventId', 'title date category image location')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your reviews' });
  }
});

// Delete Review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Feedback.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const eventId = review.eventId;
    await Feedback.findByIdAndDelete(req.params.id);

    // Recalculate rating
    const stats = await recalculateEventRating(eventId);

    res.json({ message: 'Review deleted', ...stats });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true }
}, { timestamps: true });

// Prevent duplicate reviews per user per event
feedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);

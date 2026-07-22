const mongoose = require('mongoose');

const teammateListingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  postedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  skillsNeeded: [{ type: String }],
  description: { type: String, required: true },
  contactInfo: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

teammateListingSchema.index({ eventId: 1, status: 1 });

module.exports = mongoose.model('TeammateListing', teammateListingSchema);

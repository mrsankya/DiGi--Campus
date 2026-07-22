const mongoose = require('mongoose');

const agendaItemSchema = new mongoose.Schema({
  time: String,
  title: String,
  description: String
});

const speakerSchema = new mongoose.Schema({
  name: String,
  role: String,
  company: String,
  avatar: String
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['Tech', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar'] },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  venue: { type: String, required: true },
  organizer: { type: String, required: true },
  department: { type: String, default: 'General' },
  image: { type: String, required: true },
  bannerImage: { type: String },
  capacity: { type: Number, required: true, default: 100 },
  registeredCount: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], default: 'Upcoming' },
  approvalStatus: { type: String, enum: ['Approved', 'Pending', 'Rejected'], default: 'Approved' },
  agenda: [agendaItemSchema],
  speakers: [speakerSchema],
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketCode: { type: String, required: true, unique: true },
  qrCodeUrl: { type: String },
  status: { type: String, enum: ['registered', 'attended', 'cancelled', 'rejected'], default: 'registered' },
  attendanceStatus: { type: String, enum: ['Pending', 'Present', 'Absent'], default: 'Pending' },
  certificateIssued: { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index to optimize lookup
registrationSchema.index({ eventId: 1, userId: 1, status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);

const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, default: 'Member' },
  joinedAt: { type: Date, default: Date.now }
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [teamMemberSchema],
  maxMembers: { type: Number, default: 4 }
}, { timestamps: true });

teamSchema.index({ eventId: 1, code: 1 });

module.exports = mongoose.model('Team', teamSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'coordinator', 'admin'], default: 'student' },
  position: { type: String, default: 'Student Member' },
  department: { type: String, default: 'Computer Science' },
  studentId: { type: String },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  yearOfStudy: { type: String, default: '3rd Year' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  status: { type: String, enum: ['active', 'deactivated'], default: 'active' },
  savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, { timestamps: true });

userSchema.pre('save', function(next) {
  if (!this.studentId) {
    this.studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

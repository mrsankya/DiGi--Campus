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
  isEmailVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiresAt: { type: Date },
  xpPoints: { type: Number, default: 150 }, // Initial joining bonus XP
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, { timestamps: true });

userSchema.pre('save', function(next) {
  if (!this.studentId) {
    this.studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  // Auto calculate level based on XP
  if (this.xpPoints < 300) this.level = 1;
  else if (this.xpPoints < 700) this.level = 2;
  else if (this.xpPoints < 1500) this.level = 3;
  else if (this.xpPoints < 3000) this.level = 4;
  else this.level = 5;

  next();
});

module.exports = mongoose.model('User', userSchema);

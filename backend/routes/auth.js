const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendWelcomeEmail, sendLoginNotificationEmail, sendOtpEmail } = require('../utils/emailService');

// Register (Generates & Emails 6-Digit Verification OTP)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      // If previous registration was unverified, allow re-sent OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      existingUser.otpCode = newOtp;
      existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      if (name) existingUser.name = name;
      if (department) existingUser.department = department;

      await existingUser.save();

      sendOtpEmail({
        toEmail: existingUser.email,
        name: existingUser.name,
        otpCode: newOtp
      }).catch(e => console.error('Failed to send OTP email:', e.message));

      return res.status(200).json({
        requiresOtp: true,
        message: `Verification code sent to ${existingUser.email}`,
        userId: existingUser._id,
        email: existingUser.email
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const assignedRole = (role === 'organizer' || role === 'student' || role === 'coordinator') ? role : 'student';
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      department: department || 'Computer Science',
      isEmailVerified: false,
      otpCode,
      otpExpiresAt
    });

    await newUser.save();

    // Send Email OTP Code via Resend
    sendOtpEmail({
      toEmail: newUser.email,
      name: newUser.name,
      otpCode
    }).catch(e => console.error('Failed to send OTP email:', e.message));

    res.status(201).json({
      requiresOtp: true,
      message: `Verification code sent to ${newUser.email}`,
      userId: newUser._id,
      email: newUser.email
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// Verify Registration Email OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otpCode } = req.body;

    if (!userId || !otpCode) {
      return res.status(400).json({ message: 'User ID and OTP code are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (!user.otpCode || user.otpCode !== otpCode.trim()) {
      return res.status(400).json({ message: 'Invalid OTP verification code' });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ message: 'OTP code has expired. Please click Resend Code.' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Trigger Welcome Email upon successful OTP verification
    sendWelcomeEmail({
      toEmail: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      studentId: user.studentId
    }).catch(e => console.error('Failed to send welcome email:', e.message));

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        yearOfStudy: user.yearOfStudy,
        github: user.github,
        linkedin: user.linkedin
      }
    });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.status(500).json({ message: 'Error verifying OTP', error: err.message });
  }
});

// Resend OTP Code
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = newOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendOtpEmail({
      toEmail: user.email,
      name: user.name,
      otpCode: newOtp
    }).catch(e => console.error('Failed to send resend OTP email:', e.message));

    res.json({ message: `New OTP verification code sent to ${user.email}` });
  } catch (err) {
    res.status(500).json({ message: 'Error resending OTP' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email OTP verification is required (bypassed for admins or pre-existing accounts)
    if (user.isEmailVerified === false && user.role !== 'admin') {
      // Re-trigger OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = newOtp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      sendOtpEmail({
        toEmail: user.email,
        name: user.name,
        otpCode: newOtp
      }).catch(e => console.error('Failed to send login OTP email:', e.message));

      return res.status(403).json({
        requiresOtp: true,
        message: 'Your email address is not verified yet. An OTP code has been sent to your email.',
        userId: user._id,
        email: user.email
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    // Trigger async Security Notification on successful sign-in
    sendLoginNotificationEmail({
      toEmail: user.email,
      name: user.name,
      loginTime: new Date(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Web App Client'
    }).catch(e => console.error('Failed to send login notification email:', e.message));

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        department: user.department,
        studentId: user.studentId,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        yearOfStudy: user.yearOfStudy,
        github: user.github,
        linkedin: user.linkedin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// Google OAuth Login / Signup (Google handles verification automatically)
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar, role, department } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Google authentication payload missing email or name' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const randomPassword = await bcrypt.hash(`google_${Math.random()}_secret`, salt);

      user = new User({
        name,
        email: email.toLowerCase(),
        password: randomPassword,
        role: role || 'student',
        department: department || 'Computer Science',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isEmailVerified: true
      });

      await user.save();

      // Trigger Welcome Email for new Google user creation
      sendWelcomeEmail({
        toEmail: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        studentId: user.studentId
      }).catch(e => console.error('Failed to send Google welcome email:', e.message));
    } else {
      user.isEmailVerified = true;
      await user.save();

      sendLoginNotificationEmail({
        toEmail: user.email,
        name: user.name,
        loginTime: new Date(),
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Google Auth Client'
      }).catch(e => console.error('Failed to send Google login notification email:', e.message));
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        department: user.department,
        studentId: user.studentId,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        yearOfStudy: user.yearOfStudy,
        github: user.github,
        linkedin: user.linkedin
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ message: 'Google login failed', error: err.message });
  }
});

// Get Profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department, phone, bio, yearOfStudy, avatar, github, linkedin, studentId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (yearOfStudy) user.yearOfStudy = yearOfStudy;
    if (avatar) user.avatar = avatar;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (studentId) user.studentId = studentId;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

module.exports = router;

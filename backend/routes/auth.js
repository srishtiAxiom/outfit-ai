const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendOtpEmail = require('../utils/sendOtpEmail');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const { otpLimiter } = require('../middleware/security');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// STEP 1 of signup: Send OTP
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({ email: normalizedEmail, otp });

    await sendOtpEmail(normalizedEmail, otp);
    res.json({ success: true, message: 'OTP sent successfully' });

  } catch (err) {
    console.error('[send-otp]', err);
    res.status(500).json({ success: false, error: 'Failed to send OTP, please try again' });
  }
});

// STEP 2 of signup: Verify OTP + Register
router.post('/verify-otp-register', async (req, res) => {
  try {
    const { email, otp, password, name, gender } = req.body;

    if (!email || !otp || !password || !name) {
      return res.status(400).json({ success: false, error: 'email, otp, password and name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const record = await Otp.findOne({ email: normalizedEmail });
    if (!record) {
      return res.status(400).json({ success: false, error: 'OTP expired or not requested' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    await Otp.deleteOne({ email: normalizedEmail });

    const hashedPassword = await bcrypt.hash(password, 8); // ← 10→8
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      gender
    });

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (err) {
    console.error('[verify-otp-register]', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    res.status(500).json({ success: false, error: 'Registration failed, please try again' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const t1 = Date.now();
    const user = await User.findOne({ email: normalizedEmail });
    const t2 = Date.now();

    const dummyHash = '$2a$08$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
    const isMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash);
    const t3 = Date.now();

    console.log(`[login timing] DB: ${t2 - t1}ms | bcrypt: ${t3 - t2}ms | total: ${t3 - t1}ms`);

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ success: false, error: 'Login failed, please try again' });
  }
});
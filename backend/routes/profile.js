const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const Groq = require('groq-sdk');
const multer = require('multer');
const streamifier = require('streamifier');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// PUT /api/profile/measurements
router.put('/measurements', protect, async (req, res) => {
  try {
    const { height, weight, chest, waist, hips } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { measurements: { height, weight, chest, waist, hips } },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/profile/avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // 1. Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'outfit-ai/avatars', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
        (error, result) => error ? reject(error) : resolve(result)
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const avatarUrl = uploadResult.secure_url;

    // 2. Detect body type via Groq vision
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const visionRes = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` }
            },
            {
              type: 'text',
              text: `Analyze this person's visible body shape and provide:
1. Body type (one of: Ectomorph, Mesomorph, Endomorph)
2. Body shape (one of: Hourglass, Rectangle, Triangle, Inverted Triangle, Apple, Oval)
3. One short styling tip (max 15 words).

Respond ONLY in this JSON format (no extra text):
{"bodyType":"...","bodyShape":"...","tip":"..."}`
            }
          ]
        }
      ],
      max_tokens: 200,
    });

    let bodyType = '';
    try {
      const parsed = JSON.parse(visionRes.choices[0].message.content.trim());
      bodyType = `${parsed.bodyShape} / ${parsed.bodyType}`;

      // Save to user
      await User.findByIdAndUpdate(req.user._id, { avatarUrl, bodyType });

      res.json({ success: true, avatarUrl, bodyType, tip: parsed.tip });
    } catch {
      // Vision worked but JSON parse failed — still save avatar
      await User.findByIdAndUpdate(req.user._id, { avatarUrl });
      res.json({ success: true, avatarUrl, bodyType: '', tip: '' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/profile/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
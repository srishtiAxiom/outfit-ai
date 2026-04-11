const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Wardrobe = require('../models/Wardrobe');
const OutfitHistory = require('../models/OutfitHistory');
const User = require('../models/User');                    // ← NEW
const { protect } = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/recommend', protect, async (req, res) => {
  try {
    const { occasion, weather, temperature } = req.body;

    // ← UPDATED: fetch both at once
    const [wardrobeItems, user] = await Promise.all([
      Wardrobe.find({ user: req.user.id }),
      User.findById(req.user.id).select('measurements bodyType')
    ]);

    if (wardrobeItems.length === 0) {
      return res.status(400).json({ message: 'Please add some clothes to your wardrobe first' });
    }

    const wardrobeList = wardrobeItems.map(item =>
      `${item.name} (${item.category}, ${item.color}, ${item.occasion}, ${item.season})`
    ).join('\n');

    // ← NEW: build measurement context
    const m = user?.measurements || {};
    const measurementContext = (m.height || m.weight || m.chest)
      ? `\nUser body info: Height: ${m.height || 'N/A'}, Weight: ${m.weight || 'N/A'}, Chest: ${m.chest || 'N/A'}, Waist: ${m.waist || 'N/A'}, Hips: ${m.hips || 'N/A'}. Body type: ${user?.bodyType || 'N/A'}.`
      : '';

    // ← UPDATED prompt
    const prompt = `You are a professional fashion stylist AI. Based on the following wardrobe items and conditions, suggest the best outfit combination.

Wardrobe items:
${wardrobeList}

Conditions:
- Occasion: ${occasion}
- Weather: ${weather}
- Temperature: ${temperature}°C${measurementContext}

Please suggest a complete outfit by selecting items from the wardrobe list above. Explain why each piece works well together and for the occasion. If body measurements are provided, tailor fit and style advice accordingly. Be specific and friendly.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    });

    const recommendation = response.choices[0].message.content;

    await OutfitHistory.create({
      user: req.user.id,
      occasion,
      weather,
      temperature,
      recommendation,
    });

    res.json({ recommendation });

  } catch (error) {
    console.error('Groq error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
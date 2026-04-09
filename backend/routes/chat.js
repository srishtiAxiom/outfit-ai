const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const WardrobeItem = require("../models/WardrobeItem");
const OutfitHistory = require("../models/OutfitHistory");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { messages, weather } = req.body;
    // messages = array of { role: "user"|"assistant", content: string }

    const userId = req.user.id;

    // Fetch context
    const user = await User.findById(userId).select("-password");
    const wardrobe = await WardrobeItem.find({ user: userId });
    const history = await OutfitHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(10);

    const wardrobeText = wardrobe.length
      ? wardrobe.map(i => `- ${i.name} (${i.category}, ${i.color})`).join("\n")
      : "No wardrobe items yet.";

    const historyText = history.length
      ? history.map(h => `- ${h.outfitDescription} (${new Date(h.createdAt).toLocaleDateString()})`).join("\n")
      : "No outfit history yet.";

    const measurementsText = user.measurements
      ? Object.entries(user.measurements).map(([k, v]) => `${k}: ${v}`).join(", ")
      : "Not provided.";

    const weatherText = weather
      ? `${weather.description}, ${weather.temp}°C, ${weather.city}`
      : "Not available.";

    const systemPrompt = `You are Outfit AI, a personal fashion assistant. You help users decide what to wear based on their wardrobe, weather, outfit history, and body measurements.

Current Weather: ${weatherText}

User's Wardrobe:
${wardrobeText}

Recent Outfit History:
${historyText}

Body Measurements: ${measurementsText}

Be friendly, concise, and specific. Reference actual wardrobe items when suggesting outfits. If the user asks something unrelated to fashion, politely redirect.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});

module.exports = router;
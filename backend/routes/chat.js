const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const { protect: authMiddleware } = require("../middleware/auth");
const User = require("../models/User");
const WardrobeItem = require("../models/Wardrobe");
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

    const systemPrompt = `You are Outfit AI, a personal fashion assistant. You help users look their best by combining their existing wardrobe with fresh styling ideas.

Current Weather: ${weatherText}

User's Wardrobe:
${wardrobeText}

Recent Outfit History:
${historyText}

Body Measurements: ${measurementsText}

Guidelines:
- Prioritize combining items from the user's wardrobe creatively
- If the wardrobe is limited or missing something, suggest external clothing ideas, trends, or missing pieces they could buy
- Give styling tips like accessories, shoes, layering, and color combinations even if not in wardrobe
- Consider the weather and occasion when suggesting outfits
- Be friendly, specific, and inspiring — like a personal stylist
- If asked about fashion trends, celebrity styles, or shopping advice, answer freely
- Only redirect if the question is completely unrelated to fashion or lifestyle`;

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
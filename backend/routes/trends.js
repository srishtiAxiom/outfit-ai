// backend/routes/trends.js
const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const NodeCache = require('node-cache');
const { protect } = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Cache trends for 2 hours (fashion trends don't change by the minute)
const trendCache = new NodeCache({ stdTTL: 7200 });

// ─── Helper: fetch trending fashion data via Serper.dev ───────────────────────
async function fetchTrendingSearches(queries) {
  const results = [];

  for (const q of queries) {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q, num: 5, gl: 'us', hl: 'en' }),
    });

    if (!res.ok) throw new Error(`Serper error: ${res.status}`);
    const data = await res.json();

    // Extract organic results snippets
    const snippets = (data.organic || [])
      .slice(0, 4)
      .map((r) => `${r.title}: ${r.snippet}`)
      .join('\n');

    results.push({ query: q, snippets });
  }

  return results;
}

// ─── Helper: analyze trends with Groq ────────────────────────────────────────
async function analyzeTrends(searchResults, wardrobe) {
  const wardrobeSummary = wardrobe
    .map((item) => `${item.category} - ${item.color} - ${item.occasion} - ${item.season}`)
    .join('\n');

  const searchContext = searchResults
    .map((r) => `## Search: "${r.query}"\n${r.snippets}`)
    .join('\n\n');

  const prompt = `You are a fashion trend analyst. Based on current web search results and the user's wardrobe, provide a structured trend analysis.

## Current Web Trend Data:
${searchContext}

## User's Wardrobe:
${wardrobeSummary || 'No wardrobe items yet.'}

Respond ONLY with a valid JSON object in this exact structure:
{
  "trendingAesthetics": [
    {
      "name": "Aesthetic name (e.g. 'Quiet Luxury', 'Y2K Revival')",
      "description": "2-sentence description of this trend",
      "popularity": "hot|rising|established",
      "keyPieces": ["piece1", "piece2", "piece3"]
    }
  ],
  "wardrobeMatches": [
    {
      "trend": "Trend name",
      "matchingItems": ["item from user wardrobe that fits"],
      "outfitSuggestion": "How to style the match"
    }
  ],
  "shoppingGaps": [
    {
      "item": "Item to buy",
      "reason": "Why it fills a trend gap",
      "estimatedPrice": "$XX-$XX",
      "priority": "high|medium|low"
    }
  ],
  "trendOutfitPrompt": "A detailed Pollinations.AI image prompt for a trendy outfit based on the top trend (describe clothing, style, setting, lighting, photographic style)"
}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.2-11b-vision-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const text = completion.choices[0]?.message?.content || '';

  // Strip markdown fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// ─── GET /api/trends ──────────────────────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    // Check cache first — key per user so wardrobe matches are personalized
    const cacheKey = `trends_${req.user._id}`;
    const cached = trendCache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Fetch user's wardrobe for matching
    const Wardrobe = require('../models/Wardrobe');
    const wardrobe = await Wardrobe.find({ user: req.user._id }).lean();

    // Run parallel Serper searches for different fashion angles
    const queries = [
      'fashion trends 2025 style aesthetic',
      'trending outfits spring summer 2025',
      'popular clothing styles social media 2025',
    ];

    const searchResults = await fetchTrendingSearches(queries);
    const analysis = await analyzeTrends(searchResults, wardrobe);

    // Cache the result
    trendCache.set(cacheKey, analysis);

    res.json({ success: true, data: analysis, cached: false });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/trends/refresh ─────────────────────────────────────────────────
// Force a fresh analysis (bypasses cache)
router.post('/refresh', protect, async (req, res, next) => {
  try {
    const cacheKey = `trends_${req.user._id}`;
    trendCache.del(cacheKey);

    const Wardrobe = require('../models/Wardrobe');
    const wardrobe = await Wardrobe.find({ user: req.user._id }).lean();

    const queries = [
      'fashion trends 2025 style aesthetic',
      'trending outfits spring summer 2025',
      'popular clothing styles social media 2025',
    ];

    const searchResults = await fetchTrendingSearches(queries);
    const analysis = await analyzeTrends(searchResults, wardrobe);

    trendCache.set(cacheKey, analysis);

    res.json({ success: true, data: analysis, cached: false });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
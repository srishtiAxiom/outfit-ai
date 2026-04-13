// backend/routes/trends.js
const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const NodeCache = require('node-cache');
const { protect } = require('../middleware/auth');
const Wardrobe = require('../models/Wardrobe');
const User = require('../models/User');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Cache trends for 2 hours
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
      body: JSON.stringify({ q, num: 5, gl: 'in', hl: 'en' }),
    });

    if (!res.ok) throw new Error(`Serper error: ${res.status}`);
    const data = await res.json();

    const snippets = (data.organic || [])
      .slice(0, 4)
      .map((r) => `${r.title}: ${r.snippet}`)
      .join('\n');

    results.push({ query: q, snippets });
  }

  return results;
}

// ─── Helper: fetch shopping links for gap items via Serper ────────────────────
async function fetchShoppingLinks(items, gender) {
  const links = {};

  for (const item of items) {
    try {
      const res = await fetch('https://google.serper.dev/shopping', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: `buy ${gender || 'unisex'} ${item} india`, gl: 'in', hl: 'en', num: 3 }),
      });

      if (!res.ok) {
        console.warn(`[shopping] Serper error ${res.status} for "${item}"`);
        continue;
      }

      const data = await res.json();

      const results = data.shoppingResults || data.shopping || [];
      const first = results.find((r) => r.link);

      if (first) {
        links[item] = {
          url: first.link,
          store: first.source || first.merchant || 'Shop',
          price: first.price || null,
        };
      } else {
        const fallbackRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: `buy ${gender || 'unisex'} ${item} online india`, gl: 'in', hl: 'en', num: 3 }),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const organic = (fallbackData.organic || []).find((r) => r.link);
          if (organic) links[item] = { url: organic.link, store: 'Search', price: null };
        }
      }
    } catch (e) {
      console.error(`[shopping] exception for "${item}":`, e.message);
    }
  }

  return links;
}

// ─── Helper: analyze trends with Groq ────────────────────────────────────────
async function analyzeTrends(searchResults, wardrobe, gender, occasion) {
  const wardrobeSummary = wardrobe
    .map((item) => `${item.category} - ${item.color} - ${item.occasion} - ${item.season}`)
    .join('\n');

  const searchContext = searchResults
    .map((r) => `## Search: "${r.query}"\n${r.snippets}`)
    .join('\n\n');

  const prompt = `You are a fashion trend analyst for Indian users. Based on current web search results and the user's wardrobe, provide a structured trend analysis.

## User Gender: ${gender}
## Occasion: ${occasion}

## Current Web Trend Data:
${searchContext}

## User's Wardrobe:
${wardrobeSummary || 'No wardrobe items yet.'}

IMPORTANT: All prices must be in Indian Rupees (₹). Give realistic Indian market prices.
IMPORTANT: All suggestions must suit a ${gender} person dressing for a ${occasion} occasion in India.
IMPORTANT: The trendOutfitPrompt must describe a ${occasion} outfit for a ${gender} person.

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
      "estimatedPrice": "₹XXX-₹XXXX",
      "priority": "high|medium|low"
    }
  ],
  "trendOutfitPrompt": "A detailed Pollinations.AI image prompt for a trendy outfit based on the top trend (describe clothing, style, setting, lighting, photographic style)"
}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const text = completion.choices[0]?.message?.content || '';
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// ─── GET /api/trends ──────────────────────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const occasion = req.query.occasion || 'any';
    const cacheKey = `trends_${req.user._id}_${occasion}`;

    const cached = trendCache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const wardrobe = await Wardrobe.find({ user: req.user._id }).lean();
    const userProfile = await User.findById(req.user._id).select('gender').lean();
    const gender = userProfile?.gender || 'unspecified';

    const queries = [
      'fashion trends 2026 india style aesthetic',
      'trending outfits india spring summer 2026',
      'popular clothing styles india social media 2026',
    ];

    const searchResults = await fetchTrendingSearches(queries);
    const analysis = await analyzeTrends(searchResults, wardrobe, gender, occasion);

    if (analysis.shoppingGaps?.length > 0) {
      const itemNames = analysis.shoppingGaps.map((g) => g.item);
      // ✅ gender now passed
      const shoppingLinks = await fetchShoppingLinks(itemNames, gender);
      analysis.shoppingGaps = analysis.shoppingGaps.map((gap) => ({
        ...gap,
        shopLink: shoppingLinks[gap.item] || null,
      }));
    }

    trendCache.set(cacheKey, analysis);
    res.json({ success: true, data: analysis, cached: false });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/trends/refresh ─────────────────────────────────────────────────
router.post('/refresh', protect, async (req, res, next) => {
  try {
    const occasion = req.body.occasion || 'any';
    const cacheKey = `trends_${req.user._id}_${occasion}`;

    trendCache.del(cacheKey);

    const wardrobe = await Wardrobe.find({ user: req.user._id }).lean();
    const userProfile = await User.findById(req.user._id).select('gender').lean();
    const gender = userProfile?.gender || 'unspecified';

    const queries = [
      'fashion trends 2026 india style aesthetic',
      'trending outfits india spring summer 2026',
      'popular clothing styles india social media 2026',
    ];

    const searchResults = await fetchTrendingSearches(queries);
    const analysis = await analyzeTrends(searchResults, wardrobe, gender, occasion);

    if (analysis.shoppingGaps?.length > 0) {
      const itemNames = analysis.shoppingGaps.map((g) => g.item);
      // ✅ gender now passed
      const shoppingLinks = await fetchShoppingLinks(itemNames, gender);
      analysis.shoppingGaps = analysis.shoppingGaps.map((gap) => ({
        ...gap,
        shopLink: shoppingLinks[gap.item] || null,
      }));
    }

    trendCache.set(cacheKey, analysis);
    res.json({ success: true, data: analysis, cached: false });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
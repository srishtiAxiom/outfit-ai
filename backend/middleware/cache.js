const NodeCache = require('node-cache');
const crypto = require('crypto');

// checkperiod: sweep expired keys every 60s instead of waiting for next access
const weatherCache = new NodeCache({ stdTTL: 1800, checkperiod: 60 });
const wardrobeCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Log cache sizes periodically in dev (helps catch memory bloat on Render)
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    console.log(`[cache] stats — weather keys: ${weatherCache.keys().length}, wardrobe keys: ${wardrobeCache.keys().length}`);
  }, 5 * 60 * 1000); // every 5 min
}

// SHA-256 instead of MD5 — better practice, same performance for cache keys
const getTokenHash = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return 'anon';
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Weather cache middleware
const weatherCacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = `weather_${req.query.city || req.query.lat || 'default'}`;
  const cached = weatherCache.get(key);
  if (cached) {
    console.log(`[cache] HIT — ${key}`);
    return res.json(cached);
  }

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    // Only cache successful responses — don't poison cache with errors
    if (res.statusCode >= 200 && res.statusCode < 300 && data?.success !== false) {
      weatherCache.set(key, data);
      console.log(`[cache] SET — ${key}`);
    } else {
      console.warn(`[cache] SKIP SET — weather error response (status ${res.statusCode})`);
    }
    return originalJson(data);
  };
  next();
};

// Wardrobe cache middleware — GET only
const wardrobeCacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') return next();

  const hash = getTokenHash(req);
  const key = `wardrobe_${hash}`;

  const cached = wardrobeCache.get(key);
  if (cached) {
    console.log(`[cache] HIT — wardrobe_${hash.slice(0, 8)}...`);
    return res.json(cached);
  }

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    // Only cache successful array responses
    if (res.statusCode >= 200 && res.statusCode < 300 && Array.isArray(data)) {
      wardrobeCache.set(key, data);
      console.log(`[cache] SET — wardrobe_${hash.slice(0, 8)}...`);
    } else if (!Array.isArray(data)) {
      console.warn(`[cache] SKIP SET — wardrobe response was not an array`, typeof data);
    }
    return originalJson(data);
  };
  next();
};

// Invalidate wardrobe cache — accepts raw token or pre-hashed key
const invalidateWardrobe = (token) => {
  if (!token) return;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const key = `wardrobe_${hash}`;
  const deleted = wardrobeCache.del(key);
  if (deleted) {
    console.log(`[cache] INVALIDATED — wardrobe_${hash.slice(0, 8)}...`);
  }
};

// Helper — invalidate wardrobe from inside a route handler using req
// Usage: invalidateWardrobeFromReq(req)  ← call this in POST/DELETE wardrobe routes
const invalidateWardrobeFromReq = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  invalidateWardrobe(token);
};

module.exports = {
  weatherCacheMiddleware,
  wardrobeCacheMiddleware,
  invalidateWardrobe,
  invalidateWardrobeFromReq, // ← new, use this in wardrobe routes
};
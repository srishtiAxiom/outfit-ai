const NodeCache = require('node-cache');
const crypto = require('crypto');

const weatherCache = new NodeCache({ stdTTL: 1800 }); // 30 min
const wardrobeCache = new NodeCache({ stdTTL: 300 });  // 5 min

const getTokenHash = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return 'anon';
  return crypto.createHash('md5').update(token).digest('hex');
};

// Weather cache middleware — unchanged
const weatherCacheMiddleware = (req, res, next) => {
  const key = `weather_${req.query.city || req.query.lat || 'default'}`;
  const cached = weatherCache.get(key);
  if (cached) {
    console.log(`[cache] HIT — ${key}`);
    return res.json(cached);
  }
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    weatherCache.set(key, data);
    console.log(`[cache] SET — ${key}`);
    return originalJson(data);
  };
  next();
};

// Wardrobe cache middleware — GET only, array guard added
const wardrobeCacheMiddleware = (req, res, next) => {
  // ✅ FIX 1: Only cache GET requests
  // POST returns a single item {}, DELETE returns { message }
  // Caching those and returning them on the next GET caused .map() to crash
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
    // ✅ FIX 2: Only cache if the response is actually an array
    // Prevents edge cases (e.g. error objects) from poisoning the cache
    if (Array.isArray(data)) {
      wardrobeCache.set(key, data);
      console.log(`[cache] SET — wardrobe_${hash.slice(0, 8)}...`);
    } else {
      console.warn(`[cache] SKIP SET — wardrobe response was not an array`, typeof data);
    }
    return originalJson(data);
  };
  next();
};

// Invalidate wardrobe cache using token — unchanged
const invalidateWardrobe = (token) => {
  if (!token) return;
  const hash = crypto.createHash('md5').update(token).digest('hex');
  const key = `wardrobe_${hash}`;
  wardrobeCache.del(key);
  console.log(`[cache] INVALIDATED — wardrobe_${hash.slice(0, 8)}...`);
};

module.exports = {
  weatherCacheMiddleware,
  wardrobeCacheMiddleware,
  invalidateWardrobe
};
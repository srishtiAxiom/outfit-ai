const NodeCache = require('node-cache');
const crypto = require('crypto');

// TTL in seconds
const weatherCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
const wardrobeCache = new NodeCache({ stdTTL: 300 });  // 5 minutes

const getTokenHash = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return 'anon';
  return crypto.createHash('md5').update(token).digest('hex');
};

// Weather cache middleware
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

// Wardrobe cache middleware
const wardrobeCacheMiddleware = (req, res, next) => {
  const hash = getTokenHash(req);
  const key = `wardrobe_${hash}`;

  const cached = wardrobeCache.get(key);
  if (cached) {
    console.log(`[cache] HIT — wardrobe_${hash.slice(0, 8)}...`);
    return res.json(cached);
  }
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    wardrobeCache.set(key, data);
    console.log(`[cache] SET — wardrobe_${hash.slice(0, 8)}...`);
    return originalJson(data);
  };
  next();
};

// Invalidate wardrobe cache using token
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
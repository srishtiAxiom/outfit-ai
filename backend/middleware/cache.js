const NodeCache = require('node-cache');

// TTL in seconds
const weatherCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
const wardrobeCache = new NodeCache({ stdTTL: 300 });  // 5 minutes

// Generic cache middleware factory
const cacheMiddleware = (cacheStore, keyFn) => (req, res, next) => {
  const key = keyFn(req);
  const cached = cacheStore.get(key);
  if (cached) {
    console.log(`[cache] HIT — ${key}`);
    return res.json(cached);
  }
  // Intercept res.json to store response in cache
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cacheStore.set(key, data);
    console.log(`[cache] SET — ${key}`);
    return originalJson(data);
  };
  next();
};

// Invalidate wardrobe cache for a user (call after add/delete)
const invalidateWardrobe = (userId) => {
  wardrobeCache.del(`wardrobe_${userId}`);
  console.log(`[cache] INVALIDATED — wardrobe_${userId}`);
};

const weatherCacheMiddleware = cacheMiddleware(
  weatherCache,
  (req) => `weather_${req.query.city || req.query.lat}`
);

const wardrobeCacheMiddleware = cacheMiddleware(
  wardrobeCache,
  (req) => `wardrobe_${req.user?.id || req.user?._id}`
);

module.exports = {
  weatherCacheMiddleware,
  wardrobeCacheMiddleware,
  invalidateWardrobe
};
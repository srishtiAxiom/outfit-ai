const errorHandler = (err, req, res, next) => {
  // Always log full error in dev, just message in prod
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.path} —`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: Object.values(err.errors).map(e => e.message).join(', ')
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    });
  }

  // JWT errors — these would only land here if thrown outside of auth middleware
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Session expired, please log in again'
    });
  }

  // CORS error
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({
      success: false,
      error: err.message
    });
  }

  // Payload too large (express.json limit hit)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request payload too large'
    });
  }

  // Default — use statusCode first, then status, then 500
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? statusCode === 500 ? 'Something went wrong' : err.message
      : err.message
  });
};

module.exports = errorHandler;
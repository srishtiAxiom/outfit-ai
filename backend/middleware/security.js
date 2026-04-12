const helmet = require('helmet');
const cors = require('cors');

const allowedOrigins = [
  'https://outfit-ai-phi.vercel.app',
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000'] : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Custom NoSQL injection sanitizer (Express 5 compatible)
const mongoSanitize = (req, res, next) => {
  const stripDollar = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          stripDollar(obj[key]);
        }
      }
    }
  };
  if (req.body) stripDollar(req.body);
  if (req.params) stripDollar(req.params);
  next();
};

// Custom XSS sanitizer (Express 5 compatible)
const xssClean = (req, res, next) => {
  const escapeHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          obj[key] = escapeHtml(obj[key]);
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };

  if (req.body) sanitize(req.body);
  next();
};
const rateLimit = require('express-rate-limit');

// Global limiter — all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Strict limiter — auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // only 10 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' }
});

// AI limiter — outfit + chat routes (expensive calls)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,                   // 20 AI calls per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'AI request limit reached, please try again in an hour.' }
});
module.exports = { helmet, mongoSanitize, xssClean, corsOptions, globalLimiter, authLimiter, aiLimiter };
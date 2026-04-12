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

module.exports = { helmet, mongoSanitize, xssClean, corsOptions };
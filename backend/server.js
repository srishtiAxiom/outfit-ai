const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const compression = require('compression');
const responseTime = require('response-time');
const cron = require('node-cron');
const https = require('https');
const connectDB = require('./config/db');
const {
  helmet,
  mongoSanitize,
  xssClean,
  corsOptions,
  globalLimiter,
  authLimiter,
  aiLimiter,
  otpLimiter, // ← add this to security.js (see note below)
} = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const { weatherCacheMiddleware, wardrobeCacheMiddleware } = require('./middleware/cache');

dotenv.config();

// Unhandled rejection / exception guards (must be before anything else)
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
  process.exit(1);
});

connectDB();

const app = express();
app.set('trust proxy', 1);

// Security middleware (order matters)
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize);
app.use(xssClean);
app.use(globalLimiter);

// Performance middleware
app.use(compression());                  // gzip all JSON responses
app.use(responseTime());                 // adds X-Response-Time header to every response

// HTTP request logging (after response-time so timing is accurate)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/wardrobe', wardrobeCacheMiddleware, require('./routes/wardrobe'));
app.use('/api/outfit', aiLimiter, require('./routes/outfit'));
app.use('/api/upload', express.json({ limit: '50mb' }), require('./routes/upload')); // upload gets its own limit
app.use('/api/weather', weatherCacheMiddleware, require('./routes/weather'));
app.use('/api/history', require('./routes/history'));
app.use('/api/chat', aiLimiter, require('./routes/chat'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/trends', aiLimiter, require('./routes/trends'));

app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store');  // prevent proxy caching of health checks
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'AI Outfit API is running!' });
});

// 404 catch-all (must be after all routes, before errorHandler)
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Self-ping to prevent Render cold starts
cron.schedule('*/14 * * * *', () => {
  const url = process.env.BACKEND_URL || 'https://outfit-ai-9snk.onrender.com/health';
  https.get(url, (res) => {
    console.log(`[keep-alive] ping sent, status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.warn(`[keep-alive] ping failed: ${err.message}`);
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] running on port ${PORT} | env: ${process.env.NODE_ENV || 'development'}`);
});
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cron = require('node-cron');
const https = require('https');
const connectDB = require('./config/db');
const { helmet, mongoSanitize, xssClean, corsOptions, globalLimiter, authLimiter, aiLimiter } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const { weatherCacheMiddleware, wardrobeCacheMiddleware } = require('./middleware/cache');

dotenv.config();
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

// HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/wardrobe', wardrobeCacheMiddleware, require('./routes/wardrobe'));
app.use('/api/outfit', aiLimiter, require('./routes/outfit'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/weather', weatherCacheMiddleware, require('./routes/weather'));
app.use('/api/history', require('./routes/history'));
app.use('/api/chat', aiLimiter, require('./routes/chat'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/trends', aiLimiter, require('./routes/trends')); // ← NEW

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'AI Outfit API is running!' });
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
  console.log(`Server running on port ${PORT}`);
});
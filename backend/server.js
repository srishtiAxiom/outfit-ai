const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { helmet, mongoSanitize, xssClean, corsOptions } = require('./middleware/security');

dotenv.config();
connectDB();

const app = express();

// Security middleware (order matters)
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize);
app.use(xssClean);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wardrobe', require('./routes/wardrobe'));
app.use('/api/outfit', require('./routes/outfit'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/history', require('./routes/history'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/profile', require('./routes/profile'));

app.get('/', (req, res) => {
  res.json({ message: 'AI Outfit API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
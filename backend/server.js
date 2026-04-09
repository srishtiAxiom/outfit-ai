const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware FIRST
app.use(cors({
  origin: ['http://localhost:3000', 'https://outfit-ai-phi.vercel.app'],
  credentials: true
}));
app.use(express.json());

// ✅ Routes AFTER middleware
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wardrobe', require('./routes/wardrobe'));
app.use('/api/outfit', require('./routes/outfit'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/history', require('./routes/history'));
app.use('/api/chat', require('./routes/chat'));   // ✅ added here

app.get('/', (req, res) => {
  res.json({ message: 'AI Outfit API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
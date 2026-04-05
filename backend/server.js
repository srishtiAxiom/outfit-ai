const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://outfit-ai-phi.vercel.app'],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/wardrobe', require('./routes/wardrobe'));
app.use('/api/outfit', require('./routes/outfit'));

app.get('/', (req, res) => {
  res.json({ message: 'AI Outfit API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
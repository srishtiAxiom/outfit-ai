const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

router.get('/:city', protect, async (req, res) => {
  try {
    const { city } = req.params;
    const apiKey = process.env.WEATHER_API_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const data = response.data;
    res.json({
      city: data.name,
      temperature: Math.round(data.main.temp),
      weather: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      feelsLike: Math.round(data.main.feels_like),
    });
  } catch (error) {
    res.status(500).json({ message: 'City not found or weather service unavailable' });
  }
});

module.exports = router;
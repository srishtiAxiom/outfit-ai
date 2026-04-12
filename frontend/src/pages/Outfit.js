import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://outfit-ai-9snk.onrender.com';

const Outfit = () => {
  const [formData, setFormData] = useState({ occasion: '', weather: '', temperature: '' });
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [outfitImageUrl, setOutfitImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/api/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (data && !data.message) setUserProfile(data); })
      .catch(() => {});
  }, [token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const fetchWeather = async () => {
    if (!city) return;
    setWeatherLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/api/weather/${city}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeatherData(res.data);
      setFormData(prev => ({ ...prev, weather: res.data.weather, temperature: res.data.temperature }));
    } catch (err) {
      setError('City not found. Please try again!');
    }
    setWeatherLoading(false);
  };

  const generateOutfitImage = async (recommendationText) => {
    setImageLoading(true);
    setOutfitImageUrl('');

    const bodyType = userProfile?.bodyType || 'average';
    const occasion = formData.occasion || 'casual';
    const weather = formData.weather || 'clear';

    const lines = recommendationText.split('\n').slice(0, 4).join(' ');
    const cleanText = lines.replace(/[*#]/g, '').slice(0, 200);

    const prompt = `full body fashion illustration, ${bodyType} body type, ${occasion} outfit, ${weather} weather, ${cleanText}, stylish, modern fashion photography, white background, professional fashion editorial`;

    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=600&nologo=true&seed=${Date.now()}`;

    const img = new Image();
    img.onload = () => { setOutfitImageUrl(imageUrl); setImageLoading(false); };
    img.onerror = () => { setImageLoading(false); };
    img.src = imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation('');
    setOutfitImageUrl('');
    try {
      const res = await axios.post(
        `${API_URL}/api/outfit/recommend`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendation(res.data.recommendation);
      generateOutfitImage(res.data.recommendation);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const weatherEmoji = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️',
    Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️',
    Mist: '🌫️', Haze: '🌫️'
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 className="page-title">AI Outfit Recommendation ✨</h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px', color: '#6c63ff', fontSize: '18px' }}>🌤️ Get Live Weather</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Your City</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Delhi, Bangalore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
            />
          </div>
          <button onClick={fetchWeather} className="btn btn-primary" disabled={weatherLoading} style={{ whiteSpace: 'nowrap' }}>
            {weatherLoading ? 'Loading...' : '🌤️ Get Weather'}
          </button>
        </div>

        {weatherData && (
          <div style={{
            marginTop: '16px', background: 'linear-gradient(135deg, #6c63ff22, #a855f722)',
            borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{ fontSize: '48px' }}>{weatherEmoji[weatherData.weather] || '🌡️'}</div>
            <div>
              <h3 style={{ margin: 0, color: '#6c63ff' }}>{weatherData.city}</h3>
              <p style={{ margin: '4px 0', fontSize: '24px', fontWeight: '700' }}>{weatherData.temperature}°C</p>
              <p style={{ margin: 0, color: '#888', textTransform: 'capitalize' }}>
                {weatherData.description} • Feels like {weatherData.feelsLike}°C
              </p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ margin: 0, color: '#2ed573', fontWeight: '500' }}>✅ Auto-filled below!</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#6c63ff', fontSize: '20px' }}>Tell us about today</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Occasion</label>
              <select name="occasion" value={formData.occasion} onChange={handleChange} required>
                <option value="">Select occasion</option>
                <option value="casual">Casual Day Out</option>
                <option value="formal">Formal / Office</option>
                <option value="party">Party / Event</option>
                <option value="sports">Sports / Gym</option>
                <option value="traditional">Traditional / Festival</option>
                <option value="date">Date Night</option>
              </select>
            </div>
            <div className="form-group">
              <label>Weather</label>
              <select name="weather" value={formData.weather} onChange={handleChange} required>
                <option value="">Select weather</option>
                <option value="Clear">Sunny</option>
                <option value="Clouds">Cloudy</option>
                <option value="Rain">Rainy</option>
                <option value="Drizzle">Drizzle</option>
                <option value="Thunderstorm">Thunderstorm</option>
                <option value="Snow">Snowy</option>
                <option value="Mist">Misty</option>
              </select>
            </div>
            <div className="form-group">
              <label>Temperature (°C)</label>
              <input
                type="number" name="temperature"
                placeholder="e.g. 28" value={formData.temperature}
                onChange={handleChange} required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? '🤖 AI is thinking...' : '✨ Get Outfit Recommendation'}
            </button>
          </form>
        </div>

        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <p style={{ color: '#6c63ff', fontSize: '18px', fontWeight: '500' }}>AI is styling your outfit...</p>
              <p style={{ color: '#888', marginTop: '8px' }}>This may take a few seconds</p>
            </div>
          )}

          {recommendation && !loading && (
            <div>
              <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '32px' }}>✨</div>
                  <h2 style={{ color: '#6c63ff', fontSize: '20px' }}>Your Perfect Outfit</h2>
                </div>
                <div style={{
                  background: '#f8f7ff', borderRadius: '8px', padding: '16px',
                  lineHeight: '1.8', color: '#2d3436', whiteSpace: 'pre-wrap'
                }}>
                  {recommendation}
                </div>
                <button onClick={() => { setRecommendation(''); setOutfitImageUrl(''); }} className="btn btn-primary" style={{ marginTop: '16px' }}>
                  Get Another Recommendation
                </button>
              </div>

              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '28px' }}>🎨</div>
                  <h2 style={{ color: '#6c63ff', fontSize: '18px' }}>AI Outfit Preview</h2>
                </div>

                {imageLoading && (
                  <div style={{ padding: '40px 0' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
                    <p style={{ color: '#6c63ff', fontWeight: '500' }}>Generating outfit preview...</p>
                    <p style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>AI is visualizing your look</p>
                  </div>
                )}

                {outfitImageUrl && !imageLoading && (
                  <div>
                    <img
                      src={outfitImageUrl}
                      alt="AI outfit preview"
                      style={{
                        width: '100%', maxWidth: '300px', borderRadius: '12px',
                        border: '2px solid #6c63ff22', boxShadow: '0 4px 20px rgba(108,99,255,0.15)'
                      }}
                    />
                    <p style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>
                      AI-generated outfit visualization based on your recommendation
                    </p>
                  </div>
                )}

                {!outfitImageUrl && !imageLoading && (
                  <div style={{ padding: '20px 0', color: '#888' }}>
                    <p>Preview unavailable. Try again!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!recommendation && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>👗</div>
              <h3 style={{ color: '#2d3436', marginBottom: '8px' }}>Ready to style you!</h3>
              <p style={{ color: '#888' }}>Enter your city above to get live weather, then let AI create your perfect outfit!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Outfit;

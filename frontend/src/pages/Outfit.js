import React, { useState } from 'react';
import axios from 'axios';

const Outfit = () => {
  const [formData, setFormData] = useState({
    occasion: '',
    weather: '',
    temperature: ''
  });
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/outfit/recommend',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendation(res.data.recommendation);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 className="page-title">AI Outfit Recommendation ✨</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#6c63ff', fontSize: '20px' }}>
            Tell us about today
          </h2>
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
                <option value="sunny">Sunny</option>
                <option value="cloudy">Cloudy</option>
                <option value="rainy">Rainy</option>
                <option value="windy">Windy</option>
                <option value="cold">Cold</option>
                <option value="hot">Hot & Humid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Temperature (°C)</label>
              <input
                type="number"
                name="temperature"
                placeholder="e.g. 28"
                value={formData.temperature}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? '🤖 AI is thinking...' : '✨ Get Outfit Recommendation'}
            </button>
          </form>
        </div>

        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <p style={{ color: '#6c63ff', fontSize: '18px', fontWeight: '500' }}>
                AI is styling your outfit...
              </p>
              <p style={{ color: '#888', marginTop: '8px' }}>This may take a few seconds</p>
            </div>
          )}

          {recommendation && !loading && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px' }}>✨</div>
                <h2 style={{ color: '#6c63ff', fontSize: '20px' }}>Your Perfect Outfit</h2>
              </div>
              <div style={{
                background: '#f8f7ff',
                borderRadius: '8px',
                padding: '16px',
                lineHeight: '1.8',
                color: '#2d3436',
                whiteSpace: 'pre-wrap'
              }}>
                {recommendation}
              </div>
              <button
                onClick={() => setRecommendation('')}
                className="btn btn-primary"
                style={{ marginTop: '16px' }}
              >
                Get Another Recommendation
              </button>
            </div>
          )}

          {!recommendation && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>👗</div>
              <h3 style={{ color: '#2d3436', marginBottom: '8px' }}>Ready to style you!</h3>
              <p style={{ color: '#888' }}>Fill in the form and let AI create your perfect outfit from your wardrobe</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Outfit;
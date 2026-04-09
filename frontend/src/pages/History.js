import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://outfit-ai-9snk.onrender.com';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch history');
      }
      setLoading(false);
    };

    fetchHistory();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete');
    }
  };

  const occasionEmoji = {
    casual: '👕', formal: '👔', party: '🎉',
    sports: '⚽', traditional: '👘', date: '💕'
  };

  const weatherEmoji = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️',
    Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️',
    Mist: '🌫️', Haze: '🌫️'
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>Loading your outfit history...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 className="page-title">Outfit History 🕓</h1>

      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>👗</div>
          <h3 style={{ color: '#2d3436', marginBottom: '8px' }}>No outfit history yet!</h3>
          <p style={{ color: '#888' }}>Get your first AI outfit recommendation to see it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map(item => (
            <div key={item._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '32px' }}>{occasionEmoji[item.occasion] || '👗'}</span>
                  <div>
                    <h3 style={{ margin: 0, textTransform: 'capitalize', color: '#2d3436' }}>
                      {item.occasion} outfit
                    </h3>
                    <p style={{ margin: '4px 0 0', color: '#888', fontSize: '13px' }}>
                      {weatherEmoji[item.weather] || '🌡️'} {item.weather} • {item.temperature}°C • {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Delete
                </button>
              </div>
              <div style={{
                background: '#f8f7ff',
                borderRadius: '8px',
                padding: '16px',
                lineHeight: '1.8',
                color: '#2d3436',
                whiteSpace: 'pre-wrap',
                fontSize: '14px'
              }}>
                {item.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
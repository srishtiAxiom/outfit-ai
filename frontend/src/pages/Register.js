import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bodyType: '',
    skinTone: '',
    preferredStyle: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ name: res.data.name, email: res.data.email }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f2f5, #e8e0ff)',
      padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#6c63ff', fontSize: '28px' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '24px' }}>Join OutfitAI and dress smarter</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Body Type</label>
            <select name="bodyType" value={formData.bodyType} onChange={handleChange}>
              <option value="">Select body type</option>
              <option value="slim">Slim</option>
              <option value="athletic">Athletic</option>
              <option value="average">Average</option>
              <option value="plus">Plus Size</option>
            </select>
          </div>
          <div className="form-group">
            <label>Skin Tone</label>
            <select name="skinTone" value={formData.skinTone} onChange={handleChange}>
              <option value="">Select skin tone</option>
              <option value="fair">Fair</option>
              <option value="medium">Medium</option>
              <option value="olive">Olive</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="form-group">
            <label>Preferred Style</label>
            <select name="preferredStyle" value={formData.preferredStyle} onChange={handleChange}>
              <option value="">Select preferred style</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="streetwear">Streetwear</option>
              <option value="traditional">Traditional</option>
              <option value="sporty">Sporty</option>
            </select>
          </div>

          {error && <p className="error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6c63ff', fontWeight: '600' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
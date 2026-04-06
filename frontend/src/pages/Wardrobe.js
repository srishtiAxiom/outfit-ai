import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'https://outfit-ai-9snk.onrender.com';

const Wardrobe = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    color: '',
    occasion: '',
    season: '',
    imageUrl: ''
  });

  const token = localStorage.getItem('token');

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get('https://outfit-ai-9snk.onrender.com/api/wardrobe', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) {
      setError('Failed to fetch wardrobe items');
    }
  }, [token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setUploadLoading(true);
    try {
      const formDataImg = new FormData();
      formDataImg.append('image', file);
      const res = await axios.post(`${API_URL}/api/upload`, formDataImg, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err) {
      console.error('Image upload failed:', err);
    }
    setUploadLoading(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/wardrobe', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Item added successfully!');
      setFormData({ name: '', category: '', color: '', occasion: '', season: '', imageUrl: '' });
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://outfit-ai-9snk.onrender.com/api/wardrobe/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const categoryColors = {
    top: '#6c63ff',
    bottom: '#a855f7',
    shoes: '#f59e0b',
    accessory: '#10b981',
    outerwear: '#3b82f6'
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 className="page-title">My Wardrobe 👚</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#6c63ff', fontSize: '20px' }}>Add New Item</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Blue Denim Jacket"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="shoes">Shoes</option>
                <option value="accessory">Accessory</option>
                <option value="outerwear">Outerwear</option>
              </select>
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="color"
                placeholder="e.g. Navy Blue"
                value={formData.color}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Occasion</label>
              <select name="occasion" value={formData.occasion} onChange={handleChange} required>
                <option value="">Select occasion</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="party">Party</option>
                <option value="sports">Sports</option>
                <option value="traditional">Traditional</option>
              </select>
            </div>
            <div className="form-group">
              <label>Season</label>
              <select name="season" value={formData.season} onChange={handleChange} required>
                <option value="">Select season</option>
                <option value="summer">Summer</option>
                <option value="winter">Winter</option>
                <option value="rainy">Rainy</option>
                <option value="all">All Seasons</option>
              </select>
            </div>
            <div className="form-group">
              <label>Upload Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ padding: '8px 0' }}
              />
              {uploadLoading && <p style={{ color: '#6c63ff', fontSize: '13px' }}>Uploading image...</p>}
              {formData.imageUrl && <p style={{ color: '#2ed573', fontSize: '13px' }}>Image uploaded successfully!</p>}
            </div>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add to Wardrobe'}
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ marginBottom: '20px', color: '#2d3436', fontSize: '20px' }}>
            Your Items ({items.length})
          </h2>
          {items.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👗</div>
              <p style={{ color: '#888' }}>Your wardrobe is empty. Add some clothes!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {items.map(item => (
                <div key={item._id} className="card" style={{ padding: '16px' }}>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                    />
                  )}
                  <div style={{
                    display: 'inline-block',
                    background: categoryColors[item.category] || '#6c63ff',
                    color: 'white',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    marginBottom: '8px'
                  }}>
                    {item.category}
                  </div>
                  <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>{item.name}</h3>
                  <p style={{ color: '#888', fontSize: '13px' }}>{item.color} • {item.occasion} • {item.season}</p>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn btn-danger"
                    style={{ width: '100%', marginTop: '12px', padding: '6px', fontSize: '13px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;
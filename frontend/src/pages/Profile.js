import React, { useState, useEffect } from 'react';
import './Profile.css';

const API = process.env.REACT_APP_API_URL || 'https://outfit-ai-9snk.onrender.com';

export default function Profile() {
  const token = localStorage.getItem('token');

  const [user, setUser] = useState(null);
  const [measurements, setMeasurements] = useState({ height: '', weight: '', chest: '', waist: '', hips: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bodyType, setBodyType] = useState('');
  const [tip, setTip] = useState('');
  const [savingM, setSavingM] = useState(false);
  const [uploadingA, setUploadingA] = useState(false);
  const [toast, setToast] = useState('');

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    console.log('Fetching profile...');
    fetch(`${API}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        console.log('Response status:', r.status);
        return r.json();
      })
      .then(data => {
        console.log('Profile data:', data);
        if (!data || data.message || data.error) {
          console.log('Bad data, skipping:', data);
          return;
        }
        setUser(data);
        if (data.measurements) setMeasurements(prev => ({ ...prev, ...data.measurements }));
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
        if (data.bodyType) setBodyType(data.bodyType);
      })
      .catch(err => console.error('Profile fetch error:', err));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleMeasurementChange = e =>
    setMeasurements(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const saveMeasurements = async () => {
    setSavingM(true);
    const res = await fetch(`${API}/api/profile/measurements`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(measurements),
    });
    setSavingM(false);
    if (res.ok) showToast('✅ Measurements saved!');
    else showToast('❌ Failed to save.');
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setUploadingA(true);
    setBodyType('Analyzing...');
    setTip('');
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    const res = await fetch(`${API}/api/profile/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setUploadingA(false);
    if (data.success) {
      setBodyType(data.bodyType || '');
      setTip(data.tip || '');
      showToast('✅ Avatar uploaded & body type detected!');
    } else {
      setBodyType('');
      showToast('❌ Upload failed.');
    }
  };

  if (!user) return (
    <div style={{ textAlign: 'center', marginTop: '4rem', fontFamily: 'Poppins, sans-serif' }}>
      <p>Loading profile...</p>
    </div>
  );

  return (
    <div className="profile-page">
      {toast && <div className="profile-toast">{toast}</div>}

      <h1 className="profile-title">My Profile</h1>

      {/* Avatar Section */}
      <div className="profile-card">
        <h2>📸 Profile Photo & Body Type</h2>
        <div className="avatar-section">
          <div className="avatar-wrapper">
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="avatar-img" />
              : <div className="avatar-placeholder">👤</div>
            }
          </div>
          <div className="avatar-controls">
            <label className="upload-btn">
              Choose Photo
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>
            <button className="primary-btn" onClick={uploadAvatar} disabled={!avatarFile || uploadingA}>
              {uploadingA ? 'Uploading & Analyzing...' : '✨ Upload & Detect Body Type'}
            </button>
            {bodyType && bodyType !== 'Analyzing...' && (
              <div className="body-type-badge">🏷️ {bodyType}</div>
            )}
            {tip && <p className="body-tip">💡 {tip}</p>}
          </div>
        </div>
      </div>

      {/* Measurements Section */}
      <div className="profile-card">
        <h2>📏 Body Measurements</h2>
        <div className="measurements-grid">
          {['height', 'weight', 'chest', 'waist', 'hips'].map(field => (
            <div className="measure-field" key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                name={field}
                value={measurements[field]}
                onChange={handleMeasurementChange}
                placeholder={field === 'height' ? 'e.g. 175 cm' : field === 'weight' ? 'e.g. 70 kg' : 'e.g. 38 in'}
              />
            </div>
          ))}
        </div>
        <button className="primary-btn" onClick={saveMeasurements} disabled={savingM}>
          {savingM ? 'Saving...' : '💾 Save Measurements'}
        </button>
      </div>

      {/* Account Info */}
      {user && (
        <div className="profile-card">
          <h2>👤 Account Info</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import './Profile.css';

const API = process.env.REACT_APP_API_URL || 'https://outfit-ai-9snk.onrender.com';

export default function Profile() {
  const token = localStorage.getItem('token');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [measurements, setMeasurements] = useState({ height: '', weight: '', chest: '', waist: '', hips: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bodyType, setBodyType] = useState('');
  const [tip, setTip] = useState('');
  const [savingM, setSavingM] = useState(false);
  const [uploadingA, setUploadingA] = useState(false);
  const [toast, setToast] = useState('');

  // ── Gender state ──────────────────────────────────────────────────────────
  const [gender, setGender] = useState('unspecified');
  const [savingG, setSavingG] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No token found. Please log out and log back in.');
      setLoading(false);
      return;
    }
    fetch(`${API}/api/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (!data || data.message || data.error) {
          setError(data?.message || 'Failed to load profile. Please log out and log back in.');
          setLoading(false);
          return;
        }
        setUser(data);
        if (data.measurements) setMeasurements(prev => ({ ...prev, ...data.measurements }));
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
        if (data.bodyType) setBodyType(data.bodyType);
        if (data.gender) setGender(data.gender);   // ← load saved gender
        setLoading(false);
      })
      .catch(err => {
        console.error('Profile fetch error:', err);
        setError('Network error. Make sure the backend is running.');
        setLoading(false);
      });
  }, [token]);

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

  // ── Save gender via PUT /api/profile/update ───────────────────────────────
  const saveGender = async () => {
    setSavingG(true);
    const res = await fetch(`${API}/api/profile/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ gender }),
    });
    setSavingG(false);
    if (res.ok) showToast('✅ Gender preference saved!');
    else showToast('❌ Failed to save gender.');
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '4rem', fontFamily: 'Poppins, sans-serif' }}>
      <p>Loading profile...</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', marginTop: '4rem', fontFamily: 'Poppins, sans-serif' }}>
      <p style={{ color: 'red', marginBottom: '1rem' }}>⚠️ {error}</p>
      <button onClick={() => window.location.href = '/login'} style={{
        background: '#6c63ff', color: 'white', border: 'none',
        padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
      }}>
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="profile-page">
      {toast && <div className="profile-toast">{toast}</div>}

      <h1 className="profile-title">My Profile</h1>

      {/* ── Avatar & Body Type ── */}
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

      {/* ── Gender ── */}
      <div className="profile-card">
        <h2>⚧ Style Preference</h2>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
          Used to personalise trend suggestions and outfit recommendations.
        </p>
        <div className="gender-options">
          {[
            { value: 'female',     label: '♀ Female' },
            { value: 'male',       label: '♂ Male' },
            { value: 'non-binary', label: '⚧ Non-binary' },
            { value: 'unspecified', label: '— Prefer not to say' },
          ].map(opt => (
            <button
              key={opt.value}
              className={`gender-btn${gender === opt.value ? ' gender-btn--active' : ''}`}
              onClick={() => setGender(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button className="primary-btn" onClick={saveGender} disabled={savingG} style={{ marginTop: '16px' }}>
          {savingG ? 'Saving...' : '💾 Save Preference'}
        </button>
      </div>

      {/* ── Measurements ── */}
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

      {/* ── Account Info ── */}
      <div className="profile-card">
        <h2>👤 Account Info</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
}
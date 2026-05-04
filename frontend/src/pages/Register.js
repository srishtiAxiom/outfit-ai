import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API = 'https://outfit-ai-9snk.onrender.com';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    bodyType: '', skinTone: '', preferredStyle: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/api/auth/send-otp`, { email: formData.email });
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/api/auth/send-otp`, { email: formData.email });
      setOtp('');
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to resend OTP');
    }
    setLoading(false);
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/auth/verify-otp-register`, { ...formData, otp });
      login(res.data.token, { name: res.data.name, email: res.data.email });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  // JSX is identical to your original — no changes needed below
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f2f5, #e8e0ff)', padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>

        {step === 1 && (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#6c63ff', fontSize: '28px' }}>
              Create Account
            </h2>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '24px' }}>
              Join OutfitAI and dress smarter
            </p>
            <form onSubmit={handleSendOtp}>
              <div className="form-group"><label>Full Name</label>
                <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group"><label>Email</label>
                <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Create a password"
                    value={formData.password} onChange={handleChange} required style={{ paddingRight: '40px' }} />
                  <span onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '18px', userSelect: 'none' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </div>
              </div>
              <div className="form-group"><label>Body Type</label>
                <select name="bodyType" value={formData.bodyType} onChange={handleChange}>
                  <option value="">Select body type</option>
                  <option value="slim">Slim</option>
                  <option value="athletic">Athletic</option>
                  <option value="average">Average</option>
                  <option value="plus">Plus Size</option>
                </select>
              </div>
              <div className="form-group"><label>Skin Tone</label>
                <select name="skinTone" value={formData.skinTone} onChange={handleChange}>
                  <option value="">Select skin tone</option>
                  <option value="fair">Fair</option>
                  <option value="medium">Medium</option>
                  <option value="olive">Olive</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="form-group"><label>Preferred Style</label>
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
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#888' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#6c63ff', fontWeight: '600' }}>Login here</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>📧</div>
              <h2 style={{ color: '#6c63ff', fontSize: '24px', marginBottom: '8px' }}>Check your email</h2>
              <p style={{ color: '#888', marginBottom: '4px' }}>We sent a 6-digit code to</p>
              <p style={{ color: '#333', fontWeight: '600', marginBottom: '24px' }}>{formData.email}</p>
            </div>
            <form onSubmit={handleVerifyAndRegister}>
              <div className="form-group">
                <label>Verification Code</label>
                <input type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit code"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' }} autoFocus />
              </div>
              {error && <p className="error">{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}
                disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>
                Didn't receive the code?{' '}
                <span onClick={handleResend}
                  style={{ color: resendTimer > 0 ? '#bbb' : '#6c63ff', fontWeight: '600', cursor: resendTimer > 0 ? 'default' : 'pointer' }}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </span>
              </p>
              <p style={{ color: '#888', fontSize: '14px' }}>
                Wrong email?{' '}
                <span onClick={() => { setStep(1); setError(''); setOtp(''); }}
                  style={{ color: '#6c63ff', fontWeight: '600', cursor: 'pointer' }}>Go back</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
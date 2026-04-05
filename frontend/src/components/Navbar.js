import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      boxShadow: '0 2px 12px rgba(108,99,255,0.3)'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '700' }}>
          👗 OutfitAI
        </h1>
      </Link>

      {token && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
          <Link to="/wardrobe" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>My Wardrobe</Link>
          <Link to="/outfit" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Get Outfit</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>Hi, {user.name}!</span>
            <button onClick={logout} style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '6px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
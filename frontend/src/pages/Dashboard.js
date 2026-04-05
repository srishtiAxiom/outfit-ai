import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#2d3436' }}>
          Welcome back, {user.name}! 👋
        </h1>
        <p style={{ color: '#888', fontSize: '18px', marginTop: '8px' }}>
          What would you like to do today?
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <Link to="/wardrobe" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            textAlign: 'center',
            padding: '40px 24px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            border: '2px solid transparent'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>👚</div>
            <h2 style={{ color: '#6c63ff', marginBottom: '8px' }}>My Wardrobe</h2>
            <p style={{ color: '#888' }}>Add and manage your clothes collection</p>
          </div>
        </Link>

        <Link to="/outfit" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            textAlign: 'center',
            padding: '40px 24px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✨</div>
            <h2 style={{ color: '#6c63ff', marginBottom: '8px' }}>Get AI Outfit</h2>
            <p style={{ color: '#888' }}>Get personalized outfit recommendations from AI</p>
          </div>
        </Link>
      </div>

      <div className="card" style={{
        maxWidth: '900px',
        margin: '24px auto',
        background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
        color: 'white',
        textAlign: 'center',
        padding: '32px'
      }}>
        <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>How it works</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>1️⃣</div>
            <p>Add your clothes to your wardrobe</p>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>2️⃣</div>
            <p>Tell us the occasion and weather</p>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>3️⃣</div>
            <p>Get AI powered outfit recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
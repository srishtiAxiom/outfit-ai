// v2.0 - with history and weather
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import Outfit from './pages/Outfit';
import History from './pages/History';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import './App.css';
import ChatBubble from './components/ChatBubble.js';

const AppRoutes = () => {
  const { token } = useAuth();
  const [backendAwake, setBackendAwake] = useState(false);
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      setWaking(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/health`);
        if (res.ok) setBackendAwake(true);
      } catch {
        setBackendAwake(false);
      } finally {
        setWaking(false);
      }
    };
    checkBackend();
  }, []);

  return (
    <>
      {!backendAwake && waking && (
        <div style={{
          background: '#f59e0b',
          color: '#1c1917',
          textAlign: 'center',
          padding: '10px',
          fontSize: '14px',
          fontWeight: 500,
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 9999
        }}>
          ⏳ Server is waking up, please wait a moment...
        </div>
      )}
      <Navbar />
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/wardrobe" element={token ? <Wardrobe /> : <Navigate to="/login" />} />
        <Route path="/outfit" element={token ? <Outfit /> : <Navigate to="/login" />} />
        <Route path="/history" element={token ? <History /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
      <ChatBubble />
    </>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
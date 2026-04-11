// v2.0 - with history and weather
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const App = () => {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/wardrobe" element={token ? <Wardrobe /> : <Navigate to="/login" />} />
        <Route path="/outfit" element={token ? <Outfit /> : <Navigate to="/login" />} />
        <Route path="/history" element={token ? <History /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />  {/* ← NEW */}
      </Routes>
      <ChatBubble />
    </Router>
  );
};

export default App;

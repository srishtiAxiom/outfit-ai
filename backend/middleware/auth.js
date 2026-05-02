const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, malformed token' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('[auth] JWT_SECRET is not set in environment');
      return res.status(500).json({ success: false, error: 'Server misconfiguration' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure token has expected user fields
    if (!decoded?.id) {
      return res.status(401).json({ success: false, error: 'Not authorized, invalid token payload' });
    }

    req.user = decoded;
    return next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Session expired, please log in again' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Not authorized, invalid token' });
    }
    // Unexpected error
    console.error('[auth] token verification error:', error);
    return res.status(500).json({ success: false, error: 'Authentication error' });
  }
};

module.exports = { protect };
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.error("No token provided in the Authorization header.");
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request
    next(); // Proceed to next middleware or route handler
  } catch (err) {
    console.error('Error verifying token:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token. Please log in again.' });
    }
    return res.status(400).json({ message: 'Token verification failed. Please try again.' });
  }
};

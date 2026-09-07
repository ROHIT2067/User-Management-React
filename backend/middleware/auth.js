import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const secret = process.env.JWT_SECRET || process.env.SECRET || 'mysecret';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Requires administrator privileges' });
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error.message);
    return res.status(500).json({ message: 'Internal server error during authorization' });
  }
};

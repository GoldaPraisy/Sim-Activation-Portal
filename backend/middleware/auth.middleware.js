import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'demo_esim_jwt_secret_key_super_secure_telecom_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user is in users table or admin_users table
    let user = db.findById('users', decoded.id);
    if (!user) {
      user = db.findById('admin_users', decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account not found.'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'user'
    };

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      let user = db.findById('users', decoded.id) || db.findById('admin_users', decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role || 'user'
        };
      }
    } catch (e) {
      // Ignore invalid optional token
    }
  }
  next();
}

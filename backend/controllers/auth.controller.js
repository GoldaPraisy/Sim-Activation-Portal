import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { validatePhone } from '../utils/eidValidator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'demo_esim_jwt_secret_key_super_secure_telecom_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthController {
  /**
   * User Registration
   */
  static async register(req, res) {
    try {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields (name, email, phone, password) are required.'
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ success: false, message: phoneValidation.error });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      // Check if email already registered
      const existingUser = db.findOne('users', u => u.email === cleanEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = db.insert('users', {
        id: `usr-${uuidv4().slice(0, 8)}`,
        name: name.trim(),
        email: cleanEmail,
        phone: phoneValidation.cleanPhone,
        password_hash: passwordHash,
        role: 'user'
      });

      // Generate JWT Token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: 'user' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to eSIM Portal.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
    }
  }

  /**
   * User & Admin Login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email and password.'
        });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check Admin users first, then standard users
      let user = db.findOne('admin_users', a => a.email === cleanEmail);
      let isAdmin = false;

      if (user) {
        isAdmin = true;
      } else {
        user = db.findOne('users', u => u.email === cleanEmail);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const role = isAdmin ? 'admin' : (user.role || 'user');
      const token = jwt.sign(
        { id: user.id, email: user.email, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '9876543210',
          role
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error during login.' });
    }
  }

  /**
   * Get authenticated user profile
   */
  static async getMe(req, res) {
    return res.json({
      success: true,
      user: req.user
    });
  }

  /**
   * Forgot Password - simulated recovery
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = db.findOne('users', u => u.email === cleanEmail) || db.findOne('admin_users', a => a.email === cleanEmail);

      if (!user) {
        // Return success even if email not found to prevent user enumeration
        return res.json({
          success: true,
          message: 'If an account exists for this email, password reset instructions have been dispatched.'
        });
      }

      // Generate a demo reset token
      const resetToken = uuidv4().slice(0, 12);

      return res.json({
        success: true,
        message: 'Password reset link sent to your email address (Demo simulation mode active).',
        devResetToken: resetToken // Provided for smooth interactive testing
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
    }
  }

  /**
   * Reset Password
   */
  static async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Valid email and new password (min 6 characters) are required.'
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      let user = db.findOne('users', u => u.email === cleanEmail);
      let collection = 'users';

      if (!user) {
        user = db.findOne('admin_users', a => a.email === cleanEmail);
        collection = 'admin_users';
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'Account not found.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      db.update(collection, user.id, { password_hash: passwordHash });

      return res.json({
        success: true,
        message: 'Password has been successfully updated! You can now log in with your new credentials.'
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update password.' });
    }
  }
}

export default AuthController;

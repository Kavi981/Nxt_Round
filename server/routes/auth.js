const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Initiate Google OAuth flow
router.get('/google',
  (req, res, next) => {
    console.log('Starting Google OAuth flow...');
    console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
    console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      session: false // Disable session requirement
    })(req, res, next);
  });

// Google OAuth callback
router.get('/google/callback',
  (req, res, next) => {
    console.log('Google OAuth callback received');
    console.log('Query params:', req.query);
    passport.authenticate('google', { 
      failureRedirect: (process.env.CLIENT_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://nxt-round.vercel.app')) + '/',
      failureFlash: true,
      session: false // Disable session requirement
    })(req, res, next);
  },
  (req, res) => {
    console.log('OAuth successful, user:', req.user);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    
    // Redirect to client with token
    const clientUrl = process.env.CLIENT_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://nxt-round.vercel.app');
    res.redirect(`${clientUrl}/auth-callback?token=${token}`);
  });

// Get current user (authenticated via JWT)
router.get('/me', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const User = require('../models/User');
    
    User.findById(decoded.userId).select('-password')
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Token is not valid' });
        }
        
        res.json({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        });
      })
      .catch(err => {
        console.error('Error finding user:', err);
        res.status(401).json({ message: 'Token is not valid' });
      });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Logout user (client-side token removal)
router.get('/logout', (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
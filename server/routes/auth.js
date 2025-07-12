const express = require('express');
const passport = require('passport');

const router = express.Router();

// Initiate Google OAuth flow
router.get('/google',
  (req, res, next) => {
    console.log('Starting Google OAuth flow...');
    console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
    console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL + '/' }), // Redirect to home on failure
  (req, res) => {
    // Successful authentication, redirect to client dashboard or home
    res.redirect(process.env.CLIENT_URL + '/dashboard');
  });

// Get current user (authenticated via session)
router.get('/me', (req, res) => {
  if (req.user) {
    // User is authenticated via session
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar
    });
  } else {
    // User is not authenticated
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout user
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return next(err);
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ message: 'Logged out successfully' });
    });
  });
});


module.exports = router;
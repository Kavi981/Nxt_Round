const auth = (req, res, next) => {
  // Check if user is authenticated via Passport session
  if (req.isAuthenticated() && req.user) {
    // User is authenticated, proceed
    next();
  } else {
    // User is not authenticated
    res.status(401).json({ message: 'Authentication required' });
  }
};

const adminAuth = (req, res, next) => {
  // Check if user is authenticated and is an admin
  if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
    // User is authenticated and is admin, proceed
    next();
  } else {
    // User is not authorized
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { auth, adminAuth };
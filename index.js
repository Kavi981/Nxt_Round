const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo'); // Import connect-mongo

// Load environment variables
dotenv.config();

// Import Passport config
require('./config/passport');

// Import routes
const questionRoutes = require('./routes/questions');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/auth'); // Import auth routes for Google OAuth
const { router: activityRoutes } = require('./routes/activities');

// Initialize Express app
const app = express();  

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'https://nxt-round.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-questions', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-questions' }), // Use MongoStore
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust for cross-site cookies in production
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes); // Use auth routes for Google OAuth
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/activities', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL
  });
});

// Test OAuth configuration
app.get('/api/test-oauth', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'https://nxt-round.onrender.com/api/auth/google/callback',
    clientUrl: process.env.CLIENT_URL || 'https://nxt-round.vercel.app'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
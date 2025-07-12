const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');

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
    process.env.CLIENT_URL,
    'https://nxt-round.vercel.app',
    'https://nxt-round-git-main-nxt-round.vercel.app',
    'http://localhost:3000'
  ],
  credentials: false, // No longer need credentials for JWT
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Passport middleware (only initialize, no session)
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes); // Use auth routes for Google OAuth
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/activities', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
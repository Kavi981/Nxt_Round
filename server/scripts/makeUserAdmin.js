const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-questions', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const makeUserAdmin = async (userEmail) => {
  try {
    if (!userEmail) {
      console.log('Usage: node makeUserAdmin.js <user-email>');
      console.log('Example: node makeUserAdmin.js john.doe@gmail.com');
      return;
    }

    // Find user by email
    const user = await User.findOne({ email: userEmail.toLowerCase() });
    
    if (!user) {
      console.log(`User with email ${userEmail} not found.`);
      console.log('\nAvailable users:');
      const allUsers = await User.find({}, 'name email role');
      allUsers.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`);
      });
      return;
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`✅ User ${user.name} (${user.email}) is now an admin!`);
    
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Get email from command line arguments
const userEmail = process.argv[2];
makeUserAdmin(userEmail); 
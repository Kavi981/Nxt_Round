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

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com', // Change this to your email
      role: 'admin',
      isVerified: true
    });

    await adminUser.save();
    
    console.log('Admin user created successfully:');
    console.log(`Name: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log('\n⚠️  IMPORTANT: Change the email in this script to your actual email address!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser(); 
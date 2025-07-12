# Admin Setup Guide

## Overview
The project uses a role-based authentication system where users can have either `'student'` (default) or `'admin'` roles. Currently, there is no default admin user, so you need to set one up manually.

## 🔧 **Setting Up Admin Access**

### **Method 1: Create a New Admin User (Recommended)**

1. **Edit the admin creation script**:
   ```bash
   # Navigate to the server directory
   cd server
   
   # Edit the script to use your email
   nano scripts/createAdmin.js
   ```

2. **Update the email in the script**:
   ```javascript
   // Change this line to your actual email
   email: 'your-email@gmail.com', // Replace with your email
   ```

3. **Run the script**:
   ```bash
   npm run create-admin
   ```

4. **Sign in with Google OAuth** using the email you specified in the script.

### **Method 2: Promote an Existing User to Admin**

1. **First, sign in to the application** using Google OAuth to create your user account.

2. **Run the promotion script**:
   ```bash
   # Navigate to the server directory
   cd server
   
   # Promote your user to admin (replace with your email)
   npm run make-admin your-email@gmail.com
   ```

3. **Verify the change** by checking the console output.

### **Method 3: Manual Database Update**

1. **Connect to your MongoDB database**:
   ```bash
   # Using MongoDB shell
   mongosh
   use interview-questions
   ```

2. **Find your user**:
   ```javascript
   db.users.findOne({ email: "your-email@gmail.com" })
   ```

3. **Update the user role**:
   ```javascript
   db.users.updateOne(
     { email: "your-email@gmail.com" },
     { $set: { role: "admin" } }
   )
   ```

## 🔍 **Verifying Admin Access**

### **Check Current Admin Users**
```bash
cd server
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-questions')
  .then(async () => {
    const admins = await User.find({ role: 'admin' }, 'name email role');
    console.log('Current admin users:');
    admins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email})`);
    });
    mongoose.connection.close();
  });
"
```

### **Test Admin Access**
1. **Sign in** to the application with your admin account
2. **Navigate** to `/admin` in your browser
3. **Verify** you can see the admin dashboard

## 🛡️ **Admin Features Available**

Once you have admin access, you can:

### **Dashboard Overview**
- View real-time platform statistics
- Monitor user growth and activity
- See top companies by question count

### **User Management**
- View all registered users
- Search and filter users
- Change user roles (student/admin)
- Delete users and their content
- View user activity statistics

### **Company Management**
- View all companies with detailed stats
- Search and filter companies
- Approve/reject companies
- Delete companies and associated questions
- View company performance metrics

### **Question Management**
- Review pending questions
- Approve or reject questions
- Delete inappropriate content
- View question analytics

### **Analytics Dashboard**
- User growth charts
- Question creation trends
- Company performance analytics
- Activity tracking and statistics

## 🔒 **Security Considerations**

### **Admin Authentication**
- Admin access is protected by `adminAuth` middleware
- Only users with `role: 'admin'` can access admin routes
- Session-based authentication with Google OAuth

### **Best Practices**
1. **Use a secure email** for admin access
2. **Limit admin accounts** to trusted users only
3. **Regularly review** admin user list
4. **Monitor admin activities** through the activity tracking system
5. **Use strong passwords** for your Google account

### **Access Control**
- Admin routes are protected at both frontend and backend
- Role-based permissions are enforced
- Complete audit trail of admin actions

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Admin access required" error**:
   - Verify your user has `role: 'admin'` in the database
   - Check that you're properly authenticated via Google OAuth

2. **Can't access admin panel**:
   - Ensure you're signed in with the correct Google account
   - Verify the email matches the admin user in the database

3. **Script errors**:
   - Check MongoDB connection string in `.env` file
   - Ensure all dependencies are installed
   - Verify the email address is correct

### **Debug Commands**

```bash
# Check all users and their roles
cd server
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-questions')
  .then(async () => {
    const users = await User.find({}, 'name email role createdAt');
    console.log('All users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt}`);
    });
    mongoose.connection.close();
  });
"
```

## 📝 **Next Steps**

After setting up admin access:

1. **Explore the admin panel** at `/admin`
2. **Review pending content** that needs moderation
3. **Monitor user activity** and platform growth
4. **Set up additional admin users** if needed
5. **Configure monitoring** for platform health

The admin panel provides comprehensive tools for managing your interview questions platform effectively! 
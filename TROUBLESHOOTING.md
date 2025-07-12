# Troubleshooting Guide

## 🚨 **Common Issues and Solutions**

### **1. React Router Future Flag Warnings**

**Issue**: React Router warnings about future v7 changes
```
React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7
```

**Solution**: ✅ **FIXED** - Added future flags to BrowserRouter in `client/src/index.js`

### **2. Server Connection Refused**

**Issue**: 
```
GET http://localhost:3000/api/stats/overview net::ERR_CONNECTION_REFUSED
```

**Causes**:
- Backend server not running
- Wrong port configuration
- Firewall blocking connections

**Solutions**:

#### **Option A: Use the Start Scripts**
```bash
# On Windows
start-dev.bat

# On Mac/Linux
chmod +x start-dev.sh
./start-dev.sh
```

#### **Option B: Manual Start**
```bash
# Terminal 1 - Start Backend
cd server
npm install
npm run dev

# Terminal 2 - Start Frontend
cd client
npm install
npm start
```

#### **Option C: Check Ports**
```bash
# Check if ports are in use
netstat -an | grep :5000
netstat -an | grep :3000

# Kill processes if needed
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### **3. WebSocket Connection Failures**

**Issue**:
```
WebSocket connection to 'ws://localhost:3000/ws' failed
```

**Solution**: This is normal for React development server. The WebSocket is used for hot reloading.

### **4. Manifest.json 404 Error**

**Issue**: `Failed to load resource: manifest.json`

**Solution**: ✅ **FIXED** - Created `client/public/manifest.json`

### **5. MongoDB Connection Issues**

**Issue**: Backend can't connect to MongoDB

**Solutions**:

#### **Check MongoDB Status**
```bash
# Start MongoDB (if not running)
mongod

# Or on macOS with Homebrew
brew services start mongodb-community
```

#### **Check Connection String**
Make sure your `.env` file in the server directory has:
```env
MONGODB_URI=mongodb://localhost:27017/interview-questions
```

### **6. CORS Issues**

**Issue**: Frontend can't communicate with backend

**Solution**: The proxy is already configured in `client/package.json`:
```json
{
  "proxy": "http://localhost:5000"
}
```

### **7. Environment Variables**

**Issue**: Missing environment variables

**Solution**: Create `.env` file in server directory:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/interview-questions

# Session Secret
SESSION_SECRET=your-super-secret-session-key-change-this

# Google OAuth Credentials (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Client URL
CLIENT_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## 🔧 **Development Setup**

### **Prerequisites**
1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or Atlas)
3. **Git** (for version control)

### **Installation Steps**

1. **Clone and Install Dependencies**
```bash
git clone <your-repo>
cd interview-questions-platform
npm run install-all
```

2. **Set Up Environment**
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit environment variables
nano server/.env
```

3. **Start Development Servers**
```bash
# Option A: Use script
./start-dev.sh  # Mac/Linux
start-dev.bat   # Windows

# Option B: Manual
npm run dev
```

## 🚀 **Quick Start Commands**

### **Start Everything**
```bash
npm run dev
```

### **Start Individual Servers**
```bash
# Backend only
npm run server

# Frontend only
npm run client
```

### **Install Dependencies**
```bash
# All dependencies
npm run install-all

# Individual
npm run install-server
npm run install-client
```

## 🔍 **Debugging Tips**

### **Check Server Status**
```bash
# Backend health check
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000
```

### **Check Logs**
```bash
# Backend logs
cd server && npm run dev

# Frontend logs
cd client && npm start
```

### **Database Connection**
```bash
# MongoDB shell
mongosh
use interview-questions
db.users.find()
```

### **Network Issues**
```bash
# Check if ports are open
netstat -an | grep :5000
netstat -an | grep :3000

# Test API endpoints
curl http://localhost:5000/api/stats/overview
```

## 📱 **Access URLs**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin (requires admin access)

## 🆘 **Still Having Issues?**

1. **Check the console** for specific error messages
2. **Verify all dependencies** are installed
3. **Ensure MongoDB** is running
4. **Check environment variables** are set correctly
5. **Try clearing cache** and restarting servers

### **Common Commands**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset React cache
cd client && npm run build
```

The application should now run without the React Router warnings and connection issues! 
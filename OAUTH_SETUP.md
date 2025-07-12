# OAuth Setup Guide

## Prerequisites

1. **MongoDB**: Make sure MongoDB is running locally or you have a MongoDB Atlas connection string
2. **Google Cloud Console**: You'll need to create OAuth credentials

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret

## Step 2: Create Environment File

Create a `.env` file in the `server` directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/interview-questions

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-change-this

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-from-step-1
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-step-1
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Client URL (for CORS and redirects)
CLIENT_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Step 3: Start the Application

1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Start the development servers:
   ```bash
   npm run dev
   ```

## Step 4: Test OAuth Flow

1. Open http://localhost:3000 in your browser
2. Click "Login with Google" in the navbar
3. You should be redirected to Google's OAuth page
4. After authentication, you'll be redirected back to the dashboard

## Troubleshooting

### "No routes matched location '/api/auth/google'"
- This error occurs when the frontend tries to handle the OAuth route through React Router
- The fix is already implemented: the login function now redirects directly to the backend URL
- Make sure the backend server is running on port 5000

### "Cannot find module 'connect-mongo'"
- Run `npm install connect-mongo` in the server directory
- This dependency is needed for session storage

### "401 Unauthorized" errors
- Check that your Google OAuth credentials are correct
- Verify the redirect URI matches exactly
- Make sure the session secret is set

### CORS errors
- The backend is configured to allow requests from http://localhost:3000
- Check that the CLIENT_URL environment variable is set correctly

## Production Deployment

For production, update the environment variables:

```env
MONGODB_URI=your-production-mongodb-uri
SESSION_SECRET=your-production-session-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

Also update the Google OAuth redirect URI in Google Cloud Console to your production domain. 
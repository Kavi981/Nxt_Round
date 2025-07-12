# Deployment Guide for Render

## Environment Variables Required

Add these environment variables in your Render dashboard:

### Server Configuration
- `PORT`: 10000 (or your preferred port)
- `NODE_ENV`: production

### MongoDB Configuration
- `MONGODB_URI`: Your MongoDB connection string

### Session Configuration
- `SESSION_SECRET`: A secure random string for session encryption

### Client URL (for CORS)
- `CLIENT_URL`: Your frontend URL (e.g., https://your-app.onrender.com)

### Google OAuth Configuration (if using OAuth)
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Your OAuth callback URL



## Render Configuration

The `render.yaml` file is configured with:
- Build Command: `npm run build-all`
- Start Command: `npm start`
- Environment: Node.js

## Troubleshooting

1. **Module not found errors**: Make sure all dependencies are installed
2. **Port issues**: Ensure PORT environment variable is set
3. **MongoDB connection**: Verify MONGODB_URI is correct
4. **CORS issues**: Set CLIENT_URL to your frontend URL

## Local Development

To run locally:
```bash
npm run install-all
npm run dev
``` 
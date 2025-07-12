#!/bin/bash
echo "Current directory: $(pwd)"
echo "Listing server directory:"
ls -la server/
echo "Starting server..."
cd server && node index.js 
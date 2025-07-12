#!/bin/bash

# Start Development Servers Script
echo "🚀 Starting Interview Questions Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (optional check)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found in PATH. Make sure MongoDB is running."
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use. Please stop the service using port $1."
        return 1
    fi
    return 0
}

# Check if ports are available
echo "🔍 Checking port availability..."
if ! check_port 5000; then
    echo "   Backend port 5000 is in use. Please stop the service."
    exit 1
fi

if ! check_port 3000; then
    echo "   Frontend port 3000 is in use. Please stop the service."
    exit 1
fi

echo "✅ Ports are available"

# Install dependencies if needed
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing root dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "   Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "   Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo "✅ Dependencies installed"

# Start servers
echo "🌐 Starting servers..."

# Start backend server in background
echo "   Starting backend server on port 5000..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "   Starting frontend server on port 3000..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Servers started!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 
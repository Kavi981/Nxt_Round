@echo off
echo 🚀 Starting Interview Questions Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Install dependencies if needed
echo 📦 Installing dependencies...
if not exist "node_modules" (
    echo    Installing root dependencies...
    npm install
)

if not exist "server\node_modules" (
    echo    Installing server dependencies...
    cd server
    npm install
    cd ..
)

if not exist "client\node_modules" (
    echo    Installing client dependencies...
    cd client
    npm install
    cd ..
)

echo ✅ Dependencies installed

REM Start servers
echo 🌐 Starting servers...

REM Start backend server
echo    Starting backend server on port 5000...
cd server
start "Backend Server" cmd /k "npm run dev"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo    Starting frontend server on port 3000...
cd client
start "Frontend Server" cmd /k "npm start"
cd ..

echo ✅ Servers started!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo.
echo Press any key to exit...
pause >nul 
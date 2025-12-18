@echo off
REM Health Lock Development Environment Starter (Windows)
REM This script helps you quickly set up and start the development environment

echo 🤖 Health Lock Development Environment Setup
echo ============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 20+ first.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1 delims=v." %%i in ('node --version') do set NODE_MAJOR=%%i
if %NODE_MAJOR% lss 20 (
    echo ❌ Node.js version 20+ is required. Current version:
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js version check passed

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
)

REM Check environment status
echo 🔍 Checking development environment status...
npm run dev:status
if errorlevel 1 (
    echo ⚠️ Status check failed, but continuing...
)

REM Start the full setup
echo 🚀 Starting full development setup...
npm run dev:setup
if errorlevel 1 (
    echo ❌ Development setup failed
    pause
    exit /b 1
)

REM Start frontend
echo 🌐 Starting frontend development server...
cd frontend
start cmd /k "npm run dev"

REM Go back to root
cd ..

echo.
echo 🎉 Development environment is ready!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔗 Hardhat Node: http://localhost:8545
echo 📊 Status check: npm run dev:status
echo.
echo 💡 Tips:
echo   - Use MetaMask to connect to localhost:8545
echo   - FHEVM features will use demo mode for development
echo   - Close the terminal windows to stop services
echo.

pause

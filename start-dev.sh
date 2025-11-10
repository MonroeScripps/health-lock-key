#!/bin/bash

# Health Lock Development Environment Starter
# This script helps you quickly set up and start the development environment

set -e

echo "🤖 Health Lock Development Environment Setup"
echo "============================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Check environment status
echo "🔍 Checking development environment status..."
npm run dev:status

# Start the full setup
echo "🚀 Starting full development setup..."
npm run dev:setup

# Start frontend in background
echo "🌐 Starting frontend development server..."
cd frontend
npm run dev &

# Wait a moment for frontend to start
sleep 3

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔗 Hardhat Node: http://localhost:8545"
echo "📊 Status check: npm run dev:status"
echo ""
echo "💡 Tips:"
echo "  - Use MetaMask to connect to localhost:8545"
echo "  - FHEVM features will use demo mode for development"
echo "  - Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
wait

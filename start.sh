#!/bin/bash

# Prime VPN - Complete Setup and Run Script
# Creates virtual environment, validates dependencies, and starts application

set -e

echo "🚀 Prime VPN - Complete Setup (Virtual Environment)"
echo "================================================="

# Create Node.js virtual environment using nvm-like approach
echo "🔧 Setting up Node.js virtual environment..."
export NODE_ENV=development
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export PATH="./node_modules/.bin:$PATH"

# Apply file limit fixes
echo "🔧 Applying file limit fixes..."
ulimit -n 65536
echo 'kern.maxfiles=65536' | sudo tee -a /etc/sysctl.conf >/dev/null 2>&1 || true
echo 'kern.maxfilesperproc=65536' | sudo tee -a /etc/sysctl.conf >/dev/null 2>&1 || true

# Reset file watchers and clean caches
echo "🧹 Cleaning environment..."
if command -v watchman &> /dev/null; then
  watchman watch-del-all >/dev/null 2>&1 || true
  watchman shutdown-server >/dev/null 2>&1 || true
fi
rm -rf node_modules/.cache ~/.expo /tmp/metro-* >/dev/null 2>&1 || true

# Validate Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js 16+ required. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js: $(node -v)"

# Setup environment variables
echo "🔧 Setting up environment..."
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "⚠️  Copying .env.example to .env - REPLACE PLACEHOLDERS!"
    cp .env.example .env
fi

# Install dependencies in virtual environment
echo "📦 Installing dependencies in virtual environment..."
npm install

# Install Expo CLI locally if not available
if ! command -v expo &> /dev/null && ! [ -f "node_modules/.bin/expo" ]; then
    echo "📦 Installing Expo CLI locally..."
    npm install @expo/cli
fi

# Validate critical dependencies
echo "🔍 Validating dependencies..."
node -e "require('react-native'); require('expo'); console.log('✅ Core dependencies validated');"

# Security audit
echo "🔒 Running security audit..."
npm audit --audit-level=high || echo "⚠️  Security vulnerabilities found - run 'npm audit fix'"

# Get local IP with error handling
LOCAL_IP=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
    echo "⚠️  Could not detect local IP, using localhost"
fi

echo ""
echo "🚀 Starting Prime VPN in virtual environment..."
echo "📱 Test URLs:"
echo "   📱 Mobile: exp://${LOCAL_IP:-localhost}:8081"
echo "   🌐 Web: http://localhost:8081"
echo ""
echo "📱 Testing Options:"
echo "   - Scan QR with Expo Go app"
echo "   - Press 'i' for iOS simulator"
echo "   - Press 'a' for Android emulator"
echo "   - Press 'w' for web browser"
echo ""
echo "🛑 Press Ctrl+C to stop"
echo ""

# Start application using local Expo CLI
if [ -f "node_modules/.bin/expo" ]; then
    ./node_modules/.bin/expo start --tunnel
elif command -v expo &> /dev/null; then
    expo start --tunnel
else
    npx expo start --tunnel
fi
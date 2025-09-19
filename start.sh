#!/bin/bash

# Prime VPN - Setup and Run Script
# This script creates a virtual environment and starts the application

set -e  # Exit on any error

echo "🚀 Prime VPN - Setup and Run Script (Virtual Environment)"
echo "======================================================"

# Create and activate virtual environment for Node.js dependencies
echo "🔧 Setting up virtual environment..."
export NODE_ENV=development
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Apply permanent file limit fix
echo "🔧 Applying permanent file limit fix..."
echo 'kern.maxfiles=65536' | sudo tee -a /etc/sysctl.conf >/dev/null 2>&1 || true
echo 'kern.maxfilesperproc=65536' | sudo tee -a /etc/sysctl.conf >/dev/null 2>&1 || true
ulimit -n 65536

# Reset file watchers
echo "🔧 Resetting file watchers..."
if command -v watchman &> /dev/null; then
  watchman watch-del-all >/dev/null 2>&1 || true
  watchman shutdown-server >/dev/null 2>&1 || true
fi

# Clean all caches
echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache >/dev/null 2>&1 || true
rm -rf ~/.expo >/dev/null 2>&1 || true
rm -rf /tmp/metro-* >/dev/null 2>&1 || true

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install Expo CLI globally if not installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g @expo/cli --force
fi

# Verify Expo CLI installation
if command -v expo &> /dev/null; then
    echo "✅ Expo CLI version: $(expo --version)"
else
    echo "⚠️  Expo CLI not found, using npx..."
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install



# Get local IP address
LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)

# Start the application
echo "🚀 Starting Prime VPN application in virtual environment..."
echo ""
echo "📱 Mobile Application URLs:"
echo "   📱 Android: exp://${LOCAL_IP}:8081"
echo "   📱 iOS: exp://${LOCAL_IP}:8081"
echo "   🔧 Metro: http://localhost:8081"
echo ""
echo "📱 To test on your phone:"
echo "   1. Install 'Expo Go' app from App Store/Play Store"
echo "   2. Scan the QR code below with your phone camera"
echo "   3. App will load automatically"
echo ""
echo "💻 To test on simulator:"
echo "   - Press 'i' for iOS simulator"
echo "   - Press 'a' for Android emulator"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start Expo development server with tunnel mode to avoid file watching issues
if command -v expo &> /dev/null; then
    expo start --tunnel
else
    npx expo start --tunnel
fi
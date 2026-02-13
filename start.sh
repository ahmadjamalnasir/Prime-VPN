#!/bin/bash
set -e

echo "🚀 Prime VPN - Setup & Start (Local Environment)"
echo "==============================================="

# Environment setup
export NODE_ENV=development
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Validate Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
  echo "❌ Node.js 16+ required. Current: $(node -v)"
  exit 1
fi
echo "✅ Node.js: $(node -v)"

# Copy .env if missing
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "⚠️  Copying .env.example to .env"
  cp .env.example .env
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Align Expo packages
echo "📦 Aligning Expo dependencies..."
npx expo install || echo "✅ Expo dependencies aligned"

# Clean caches
echo "🧹 Clearing caches..."
rm -rf node_modules/.cache ~/.expo /tmp/metro-* 2>/dev/null || true
if command -v watchman &> /dev/null; then
  watchman watch-del-all >/dev/null 2>&1 || true
  watchman shutdown-server >/dev/null 2>&1 || true
fi

# Kill Metro port
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Detect local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "localhost")

# Start Expo
echo "🚀 Starting Prime VPN..."
echo "📱 Scan QR with Expo Go app or use simulators"
npx expo start --clear --tunnel

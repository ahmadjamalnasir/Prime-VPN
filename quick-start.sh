#!/bin/bash

# Prime VPN - Quick Start Script (Production Mode)
# Bypasses EMFILE errors and file watching issues

set -e

echo "🚀 Prime VPN - Quick Start (Production Mode)"
echo "============================================"

# Fix file limits
ulimit -n 65536

# Clean caches
echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf ~/.expo 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting in production mode (no file watching)..."
echo ""
echo "📱 Scan QR code with Expo Go app to test"
echo "💻 Press 'i' for iOS simulator, 'a' for Android"
echo ""

# Start in production mode to avoid file watching
npx expo start --no-dev --minify --tunnel
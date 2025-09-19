#!/bin/bash

# Prime VPN - Web Mode Runner
# Runs application in web browser for testing

set -e

echo "🌐 Prime VPN - Web Mode"
echo "======================"

# Fix file limits
ulimit -n 65536

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌐 Starting web version..."
echo "📱 App will open in browser at http://localhost:8081"
echo ""

# Start web version
npx expo start --web
#!/bin/bash

# Fix EMFILE Error - Permanent Solution
echo "🔧 Fixing EMFILE: too many open files error"

# Method 1: Increase file limits temporarily
echo "📈 Increasing file limits..."
ulimit -n 65536

# Method 2: Reset watchman (if installed)
if command -v watchman &> /dev/null; then
    echo "👁️ Resetting Watchman..."
    watchman watch-del-all
    watchman shutdown-server
fi

# Method 3: Clean all caches
echo "🧹 Cleaning all caches..."
rm -rf node_modules/.cache
rm -rf ~/.expo
rm -rf /tmp/metro-*
rm -rf /tmp/react-*

# Method 4: Restart Metro with tunnel mode
echo "🚇 Starting with tunnel mode..."
npx expo start --tunnel --clear

echo "✅ EMFILE fix applied!"
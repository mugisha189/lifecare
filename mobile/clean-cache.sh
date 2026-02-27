#!/bin/bash
echo "🧹 Cleaning all caches and rebuilding..."

# Kill any running Metro bundler
echo "1. Killing Metro bundler..."
pkill -f "expo start" || true
pkill -f "react-native" || true

# Clear watchman
echo "2. Clearing Watchman..."
watchman watch-del-all || true

# Clear Metro bundler cache
echo "3. Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/react-* || true

# Clear npm cache
echo "4. Clearing npm cache..."
npm cache clean --force

# Clear Expo cache
echo "5. Clearing Expo cache..."
rm -rf ~/.expo/cache
rm -rf .expo

# Clear node_modules and reinstall
echo "6. Removing node_modules..."
rm -rf node_modules

echo "7. Removing iOS build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

echo "8. Removing Android build artifacts..."
rm -rf android/build
rm -rf android/app/build
rm -rf android/.gradle

echo "9. Reinstalling dependencies..."
npm install

echo "10. Running patch-package..."
npx patch-package

echo "✅ All caches cleared! Now run: npx expo start --clear"

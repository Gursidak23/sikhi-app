#!/bin/bash
# Build script for Capacitor static export (fully offline APK)
# 1. Fetches all Gurbani/Nitnem/Hukamnama data from BaniDB API
# 2. Builds a client-side search index
# 3. Temporarily excludes server-only files (API routes, middleware, sitemap)
# 4. Replaces the dynamic shabad route with a static version
# 5. Builds the Next.js static export
# 6. Syncs to Capacitor Android

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "==> Sikhi Vidhya — Offline APK Build"
echo ""

# Step 1: Fetch all offline data from BaniDB
echo "==> Step 1/6: Fetching offline data from BaniDB..."
npx tsx scripts/fetch-offline-data.ts

# Step 2: Build search index
echo ""
echo "==> Step 2/6: Building offline search index..."
npx tsx scripts/build-search-index.ts

# Step 3: Temporarily move server-only files and dynamic routes
echo ""
echo "==> Step 3/6: Preparing for static export..."
mv src/app/api src/app/_api_backup 2>/dev/null || true
mv src/middleware.ts src/_middleware.ts.bak 2>/dev/null || true
mv src/app/sitemap.ts src/app/_sitemap.ts.bak 2>/dev/null || true

# Replace dynamic shabad routes with static page
mv "src/app/shabad/[[...id]]" src/app/_shabad_catchall_backup 2>/dev/null || true
mv "src/app/shabad/[id]" src/app/_shabad_id_backup 2>/dev/null || true
mkdir -p src/app/shabad
cat > src/app/shabad/page.tsx << 'SHABAD_PAGE'
'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
const ShabadPageClient = dynamic(() => import('../_shabad_catchall_backup/ShabadPageClient'), { ssr: false });
export default function ShabadPage() {
  return <Suspense><ShabadPageClient /></Suspense>;
}
SHABAD_PAGE

# Restore on exit (even if build fails)
restore() {
  echo "==> Restoring server-only files..."
  mv src/app/_api_backup src/app/api 2>/dev/null || true
  mv src/_middleware.ts.bak src/middleware.ts 2>/dev/null || true
  mv src/app/_sitemap.ts.bak src/app/sitemap.ts 2>/dev/null || true
  # Restore shabad dynamic routes
  rm -f src/app/shabad/page.tsx 2>/dev/null || true
  mv src/app/_shabad_catchall_backup "src/app/shabad/[[...id]]" 2>/dev/null || true
  mv src/app/_shabad_id_backup "src/app/shabad/[id]" 2>/dev/null || true
}
trap restore EXIT

# Step 4: Build Next.js static export
echo ""
echo "==> Step 4/6: Building Next.js static export..."
CAPACITOR_BUILD=true \
npx next build

echo "==> Static export complete! Output in ./out/"

# Create fallback for dynamic /shabad/{id} routes
mkdir -p out/shabad
cp out/shabad.html out/shabad/index.html

# Step 5: Sync to Capacitor Android
echo ""
echo "==> Step 5/6: Syncing to Capacitor Android..."
npx cap sync android

# Step 6: Build the APK
echo ""
echo "==> Step 6/6: Building debug APK..."

# Detect Android SDK location
if [ -n "$ANDROID_HOME" ]; then
  echo "   Using ANDROID_HOME=$ANDROID_HOME"
elif [ -d "$HOME/Library/Android/sdk" ]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  echo "   Found Android SDK at $ANDROID_HOME"
elif [ -d "/opt/homebrew/share/android-commandlinetools" ]; then
  export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
  echo "   Found Android SDK at $ANDROID_HOME"
else
  echo ""
  echo "   ❌ Android SDK not found. Set ANDROID_HOME or install with:"
  echo "      brew install --cask android-commandlinetools"
  echo "      sdkmanager 'platforms;android-36' 'build-tools;36.0.0'"
  echo ""
  echo "   Then run manually:"
  echo "      cd android && ./gradlew assembleDebug"
  exit 0
fi

cd android
./gradlew assembleDebug
cd ..

APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
  echo ""
  echo "========================================"
  echo "  APK built successfully!"
  echo "  Path: $APK_PATH"
  echo "  Size: $APK_SIZE"
  echo "========================================"
  echo ""
  echo "  Install on device:"
  echo "    adb install $APK_PATH"
  echo ""
  # Copy to project root for convenience
  cp "$APK_PATH" sikhi-vidhya-offline.apk
  echo "  Also copied to: sikhi-vidhya-offline.apk"
else
  echo ""
  echo "  ❌ APK not found at expected path."
  echo "  Check the Gradle output for errors."
fi

echo ""
echo "ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਿਹ"

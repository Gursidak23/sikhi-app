#!/bin/bash
# Build script for Capacitor static export
# Temporarily excludes server-only files (API routes, middleware, sitemap)
# and replaces the dynamic shabad route with a static version,
# then builds the Next.js static export and restores them.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "==> Preparing for Capacitor static export build..."

# Temporarily move server-only files and dynamic routes
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

echo "==> Building Next.js static export..."
CAPACITOR_BUILD=true \
npx next build

echo "==> Static export complete! Output in ./out/"

# Create fallback for dynamic /shabad/{id} routes
# Copy shabad.html to handle any /shabad/{id} path in the WebView
mkdir -p out/shabad
cp out/shabad.html out/shabad/index.html
# Create a catch-all fallback: for any /shabad/X path, serve the shabad page
# The client-side JS reads the ID from the URL

echo "==> Syncing to Capacitor Android..."
npx cap sync android

echo "==> Build finished. Run the following to build the APK:"
echo "    ANDROID_HOME=/opt/homebrew/share/android-commandlinetools cd android && ./gradlew assembleDebug"

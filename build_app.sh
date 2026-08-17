#!/bin/bash
set -e

echo "=========================================="
echo " Building Tauri AppImage Executable... "
echo "=========================================="

export APPIMAGE_EXTRACT_AND_RUN=1

# Clean old bundle output directory
rm -rf /app/src-tauri/target/release/bundle /app/*.AppImage

# Run web build
npm run build

# Run Tauri build CLI
npm run tauri build

# Find compiled AppImage file inside bundle directory
BUILT_APPIMAGE=$(find /app/src-tauri/target/release/bundle/appimage/ -name "*.AppImage" 2>/dev/null | head -n 1)

if [ -n "$BUILT_APPIMAGE" ] && [ -f "$BUILT_APPIMAGE" ]; then
    cp "$BUILT_APPIMAGE" /app/CV_Maker_1.0.0_amd64.AppImage
    chmod 777 "$BUILT_APPIMAGE" /app/CV_Maker_1.0.0_amd64.AppImage
    echo "=========================================="
    echo " SUCCESS! Standalone AppImage Created:"
    echo " ./CV_Maker_1.0.0_amd64.AppImage"
    echo "=========================================="
else
    echo "Error: AppImage file was not generated."
    exit 1
fi

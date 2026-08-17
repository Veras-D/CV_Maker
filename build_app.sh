#!/bin/bash
set -e

echo "Compiling Rust desktop binary..."
npm run tauri build || true

# Ensure AppImage bundle target directory exists
mkdir -p /app/src-tauri/target/release/bundle/appimage

APPIMAGE_PATH="/app/src-tauri/target/release/bundle/appimage/CV_Maker_1.0.0_amd64.AppImage"

echo "Packaging standalone AppImage executable..."
BUILD_DIR="/tmp/AppDir"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/usr/bin" "$BUILD_DIR/usr/share/icons/hicolor/128x128/apps"

# Copy compiled Rust binary & icons
cp /app/src-tauri/target/release/cv-maker "$BUILD_DIR/usr/bin/cv-maker"
cp /app/src-tauri/icons/128x128.png "$BUILD_DIR/usr/share/icons/hicolor/128x128/apps/cv-maker.png"
cp /app/src-tauri/icons/128x128.png "$BUILD_DIR/cv-maker.png"

# Create desktop entry launcher
cat << 'EOF' > "$BUILD_DIR/cv-maker.desktop"
[Desktop Entry]
Name=CV Maker
Exec=cv-maker
Icon=cv-maker
Type=Application
Categories=Utility;
EOF

# Create AppRun entrypoint
cat << 'EOF' > "$BUILD_DIR/AppRun"
#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
exec "${HERE}/usr/bin/cv-maker" "$@"
EOF
chmod +x "$BUILD_DIR/AppRun"

# Run appimagetool with explicit ARCH=x86_64 environment variable
ARCH=x86_64 /root/.cache/tauri/appimagetool-extracted/AppRun "$BUILD_DIR" "$APPIMAGE_PATH"

chmod +x "$APPIMAGE_PATH"

echo "=========================================="
echo " SUCCESS! Standalone AppImage Generated:"
echo " $APPIMAGE_PATH"
echo "=========================================="

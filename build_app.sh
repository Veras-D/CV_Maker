#!/bin/bash
set -e

echo "=========================================="
echo " Building Clean Standalone AppImage... "
echo "=========================================="

# 1. Clean up old bundle directory
rm -rf /app/src-tauri/target/release/bundle /app/CV_Maker_1.0.0_amd64.AppImage

# 2. Build React web application assets and compile Rust executable binary
npm run tauri build || cargo build --release --manifest-path /app/src-tauri/Cargo.toml

# 4. Prepare target AppImage directory
OUTPUT_DIR="/app/src-tauri/target/release/bundle/appimage"
mkdir -p "$OUTPUT_DIR"
APPIMAGE_PATH="$OUTPUT_DIR/CV_Maker_1.0.0_amd64.AppImage"
ROOT_APPIMAGE_PATH="/app/CV_Maker_1.0.0_amd64.AppImage"

# 5. Download appimagetool cleanly if not present
if [ ! -f /tmp/appimagetool ]; then
  echo "Downloading standalone appimagetool..."
  curl -sL -o /tmp/appimagetool https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
  chmod +x /tmp/appimagetool
fi

# Extract appimagetool
cd /tmp
./appimagetool --appimage-extract
cd /app

# 6. Assemble AppDir structure
BUILD_DIR="/tmp/AppDir"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/usr/bin" \
         "$BUILD_DIR/usr/lib" \
         "$BUILD_DIR/usr/share/icons/hicolor/128x128/apps" \
         "$BUILD_DIR/usr/share/applications"

# Copy binary & icons
cp /app/src-tauri/target/release/cv-maker "$BUILD_DIR/usr/bin/cv-maker"
cp /app/src-tauri/icons/128x128.png "$BUILD_DIR/usr/share/icons/hicolor/128x128/apps/cv-maker.png"
cp /app/src-tauri/icons/128x128.png "$BUILD_DIR/cv-maker.png"
cp /app/src-tauri/icons/128x128.png "$BUILD_DIR/.DirIcon"

# Write desktop launcher file inside usr/share/applications/
cat << 'EOF' > "$BUILD_DIR/usr/share/applications/cv-maker.desktop"
[Desktop Entry]
Name=CV Maker & Role Tracker
Exec=cv-maker
Icon=cv-maker
Type=Application
Terminal=false
Categories=Utility;
EOF

# Symlink desktop file to root of AppDir (Required by AppImage runtime)
cd "$BUILD_DIR"
ln -sf usr/share/applications/cv-maker.desktop cv-maker.desktop
cd /app

# Write AppRun entrypoint
cat << 'EOF' > "$BUILD_DIR/AppRun"
#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
export PATH="${HERE}/usr/bin:${PATH}"
export LD_LIBRARY_PATH="${HERE}/usr/lib:${LD_LIBRARY_PATH}"
exec "${HERE}/usr/bin/cv-maker" "$@"
EOF
chmod +x "$BUILD_DIR/AppRun"

# 7. Generate AppImage binary via appimagetool
echo "Generating AppImage binary..."
ARCH=x86_64 /tmp/squashfs-root/AppRun "$BUILD_DIR" "$APPIMAGE_PATH"

cp "$APPIMAGE_PATH" "$ROOT_APPIMAGE_PATH"
chmod 777 "$APPIMAGE_PATH" "$ROOT_APPIMAGE_PATH"

echo "=========================================="
echo " SUCCESS! Standalone AppImage Created:"
echo " ./CV_Maker_1.0.0_amd64.AppImage"
echo "=========================================="

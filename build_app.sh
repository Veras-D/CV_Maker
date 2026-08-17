#!/bin/bash
set -e

echo "=========================================="
echo " Building Clean Standalone AppImage... "
echo "=========================================="

# 1. Clean up old bundle directory
rm -rf /app/src-tauri/target/release/bundle

# 2. Build React web application assets
npm run build

# 3. Compile Tauri Rust executable binary directly
cargo build --release --manifest-path /app/src-tauri/Cargo.toml

# 4. Prepare target AppImage directory
OUTPUT_DIR="/app/src-tauri/target/release/bundle/appimage"
mkdir -p "$OUTPUT_DIR"
APPIMAGE_PATH="$OUTPUT_DIR/CV_Maker_1.0.0_amd64.AppImage"

# 5. Download and extract appimagetool cleanly at runtime
if [ ! -f /tmp/squashfs-root/AppRun ]; then
  echo "Downloading latest appimagetool binary..."
  curl -sL -o /tmp/appimagetool.AppImage https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
  chmod +x /tmp/appimagetool.AppImage
  cd /tmp
  ./appimagetool.AppImage --appimage-extract
  cd /app
fi

# 6. Assemble AppDir structure
BUILD_DIR="/tmp/AppDir"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/usr/bin" "$BUILD_DIR/usr/share/icons/hicolor/128x128/apps"

# Copy compiled executable binary & icon
cp /app/src-tauri/target/release/cv-maker "$BUILD_DIR/usr/bin/cv-maker"
cp /app/src-tauri/icons/128x128.png "$BUILD_DIR/usr/share/icons/hicolor/128x128/apps/cv-maker.png"
cp /app/src-tauri/icons/128x128.png "$BUILD_DIR/cv-maker.png"

# Write desktop launcher file
cat << 'EOF' > "$BUILD_DIR/cv-maker.desktop"
[Desktop Entry]
Name=CV Maker & Role Tracker
Exec=cv-maker
Icon=cv-maker
Type=Application
Categories=Utility;
EOF

# Write AppRun entrypoint
cat << 'EOF' > "$BUILD_DIR/AppRun"
#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
exec "${HERE}/usr/bin/cv-maker" "$@"
EOF
chmod +x "$BUILD_DIR/AppRun"

# 7. Generate final .AppImage file
ARCH=x86_64 /tmp/squashfs-root/AppRun "$BUILD_DIR" "$APPIMAGE_PATH"

chmod +x "$APPIMAGE_PATH"

echo "=========================================="
echo " SUCCESS! Single AppImage Generated:"
echo " $APPIMAGE_PATH"
echo "=========================================="

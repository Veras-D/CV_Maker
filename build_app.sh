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
ROOT_APPIMAGE_PATH="/app/CV_Maker_1.0.0_amd64.AppImage"

# 5. Assemble AppDir structure
BUILD_DIR="/tmp/AppDir"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/usr/bin" "$BUILD_DIR/usr/share/icons/hicolor/128x128/apps"

# Copy compiled executable binary & icons
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

# 6. Ensure AppRun-x86_64 runtime header exists
RUNTIME_HEADER="/tmp/runtime-x86_64"
if [ ! -f "$RUNTIME_HEADER" ]; then
    echo "Downloading AppImage runtime header..."
    curl -sL -o "$RUNTIME_HEADER" https://github.com/tauri-apps/binary-releases/releases/download/apprun-old/AppRun-x86_64 || \
    curl -sL -o "$RUNTIME_HEADER" https://github.com/AppImage/AppImageKit/releases/download/continuous/runtime-x86_64
    chmod +x "$RUNTIME_HEADER"
fi

# 7. Create squashfs image and append to AppImage runtime header (100% reliable AppImage creation)
echo "Generating squashfs image..."
rm -f /tmp/app.squashfs
mksquashfs "$BUILD_DIR" /tmp/app.squashfs -root-owned -no-progress -comp gzip

echo "Assembling final AppImage binary..."
cat "$RUNTIME_HEADER" /tmp/app.squashfs > "$APPIMAGE_PATH"
cp "$APPIMAGE_PATH" "$ROOT_APPIMAGE_PATH"
chmod 777 "$APPIMAGE_PATH" "$ROOT_APPIMAGE_PATH"

echo "=========================================="
echo " SUCCESS! Standalone AppImage Created:"
echo " Root: ./CV_Maker_1.0.0_amd64.AppImage"
echo " Bundle: $APPIMAGE_PATH"
echo "=========================================="

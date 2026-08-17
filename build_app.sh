#!/bin/bash
set -e

echo "Building Tauri desktop application..."
# 1. Run Tauri build (compiles Rust binary and .deb package)
npm run tauri build || true

# 2. Ensure AppImage bundle target directory exists
mkdir -p /app/src-tauri/target/release/bundle/appimage

APPIMAGE_PATH="/app/src-tauri/target/release/bundle/appimage/CV_Maker_Role_Tracker_1.0.0_amd64.AppImage"

# Check if Tauri bundler generated an AppImage, if not, generate it directly via appimagetool!
if [ ! -f "$APPIMAGE_PATH" ]; then
    echo "Packaging standalone AppImage via appimagetool..."
    
    BUILD_DIR="/tmp/AppDir"
    rm -rf "$BUILD_DIR"
    mkdir -p "$BUILD_DIR/usr/bin" "$BUILD_DIR/usr/share/icons/hicolor/128x128/apps"

    # Copy binary & icons
    cp /app/src-tauri/target/release/cv-maker "$BUILD_DIR/usr/bin/cv-maker"
    cp /app/src-tauri/icons/128x128.png "$BUILD_DIR/usr/share/icons/hicolor/128x128/apps/cv-maker.png"
    cp /app/src-tauri/icons/128x128.png "$BUILD_DIR/cv-maker.png"

    # Create desktop launcher file
    cat << 'EOF' > "$BUILD_DIR/cv-maker.desktop"
[Desktop Entry]
Name=CV Maker & Role Tracker
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

    # Run appimagetool
    /root/.cache/tauri/appimagetool-x86_64.AppImage "$BUILD_DIR" "$APPIMAGE_PATH"
fi

echo "=========================================="
echo " Desktop App Image Successfully Generated!"
echo " Path: src-tauri/target/release/bundle/appimage/CV_Maker_Role_Tracker_1.0.0_amd64.AppImage"
echo "=========================================="

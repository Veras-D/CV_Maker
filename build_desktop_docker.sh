#!/bin/bash
# Script to build Desktop Application binary using Docker (Zero Host Dependencies)
echo "=========================================="
echo " Building Tauri Desktop App inside Docker "
echo "=========================================="

DOCKER_CMD="docker compose"

# Check if current user can access docker socket without sudo
if ! docker info >/dev/null 2>&1; then
    echo "Notice: Docker requires elevated privileges on your system. Using sudo..."
    DOCKER_CMD="sudo docker compose"
fi

# Clean previous local testing data from host WebKit localStorage for a fresh test start
echo "Cleaning local app testing cache (~/.local/share/com.veras.cvmaker)..."
rm -rf "$HOME/.local/share/com.veras.cvmaker" "$HOME/.config/com.veras.cvmaker" "$HOME/.cache/com.veras.cvmaker" 2>/dev/null || true

# Clean old bundle folders using Docker container privileges
$DOCKER_CMD run --rm desktop-builder sh -c "rm -rf /app/src-tauri/target/release/bundle /app/CV_Maker_*_amd64.AppImage 2>/dev/null || true"

# Build standalone Desktop App image inside Docker
$DOCKER_CMD run --rm desktop-builder ./build_app.sh

# Fix host permissions on generated files
$DOCKER_CMD run --rm desktop-builder sh -c "chmod -R 777 /app/src-tauri/target/ /app/CV_Maker_*_amd64.AppImage 2>/dev/null || true"

APPIMAGE_FILE=$(ls ./CV_Maker_*_amd64.AppImage 2>/dev/null | head -n 1)

if [ -n "$APPIMAGE_FILE" ] && [ -f "$APPIMAGE_FILE" ]; then
    echo "=========================================="
    echo " SUCCESS! Desktop AppImage generated in root folder:"
    echo " $APPIMAGE_FILE"
    echo " (Local test storage was reset for a fresh start)"
    echo "=========================================="
else
    echo "Build complete. Check root directory for generated AppImage."
fi

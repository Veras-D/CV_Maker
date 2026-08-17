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

# Clean old bundle folders (deb, rpm, etc.) using Docker container privileges
$DOCKER_CMD run --rm desktop-builder rm -rf /app/src-tauri/target/release/bundle

# Build standalone Desktop App image inside Docker
$DOCKER_CMD run --build --rm desktop-builder

if [ $? -eq 0 ]; then
    echo "=========================================="
    echo " Build complete! Standalone AppImage generated in:"
    echo " src-tauri/target/release/bundle/appimage/CV_Maker_1.0.0_amd64.AppImage"
    echo "=========================================="
else
    echo "Build failed. Please check container logs."
fi

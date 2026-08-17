#!/bin/bash
# Script to build Desktop Application binary using Docker (Zero Host Dependencies)
echo "=========================================="
echo " Building Tauri Desktop App inside Docker "
echo "=========================================="

export COMPOSE_BAKE=false
DOCKER_CMD="docker compose"

# Check if current user can access docker socket without sudo
if ! docker info >/dev/null 2>&1; then
    echo "Notice: Docker requires elevated privileges on your system. Using sudo..."
    DOCKER_CMD="sudo docker compose"
fi

# Clean old bundle folders using Docker container privileges
$DOCKER_CMD run --rm desktop-builder rm -rf /app/src-tauri/target/release/bundle /app/CV_Maker_1.0.0_amd64.AppImage 2>/dev/null || true

# Build standalone Desktop App image inside Docker
$DOCKER_CMD run --build --rm desktop-builder

# Fix host permissions on generated files
$DOCKER_CMD run --rm desktop-builder chmod -R 777 /app/src-tauri/target/ /app/CV_Maker_1.0.0_amd64.AppImage 2>/dev/null || true

if [ -f "./CV_Maker_1.0.0_amd64.AppImage" ]; then
    echo "=========================================="
    echo " SUCCESS! Desktop AppImage generated in root folder:"
    echo " ./CV_Maker_1.0.0_amd64.AppImage"
    echo "=========================================="
else
    echo "Build complete. Please check output directory."
fi

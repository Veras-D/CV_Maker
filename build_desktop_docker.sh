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

# Force Docker to build the image layer with latest Rust image
$DOCKER_CMD run --privileged --build --rm desktop-builder

if [ $? -eq 0 ]; then
    echo "=========================================="
    echo " Build complete! Desktop app generated in:"
    echo " src-tauri/target/release/bundle/"
    echo "=========================================="
else
    echo "Build failed. Please check container logs."
fi

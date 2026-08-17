#!/bin/bash
# Script to build Desktop Application binary using Docker (Zero Host Dependencies)
echo "=========================================="
echo " Building Tauri Desktop App inside Docker "
echo "=========================================="

docker compose run --rm desktop-builder

echo "Build complete! Standalone desktop app binary generated in:"
echo "src-tauri/target/release/bundle/"

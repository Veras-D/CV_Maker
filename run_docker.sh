#!/bin/bash
# CV Studio Docker Runner Script
echo "=========================================="
echo " Starting CV Studio in Docker Container   "
echo "=========================================="

# Build and start container
docker compose up --build -d

echo "Application is running at: http://localhost:1420"

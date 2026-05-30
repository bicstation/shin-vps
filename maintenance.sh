#!/usr/bin/env bash

set -e

# ==================================================
# 🌌 SHIN CORE LINX
# Weekly Maintenance
# ==================================================

PROJECT_NAME="shin-prod"

echo ""
echo "============================================================"
echo "🧹 SHIN CORE LINX WEEKLY MAINTENANCE"
echo "📦 Project : ${PROJECT_NAME}"
echo "============================================================"
echo ""

# ==================================================
# Docker Status
# ==================================================

echo "📊 Current Docker Usage"
docker system df

echo ""

# ==================================================
# Remove Stopped Containers
# ==================================================

echo "🗑 Removing Stopped Containers"

docker container prune -af

echo "✅ Container Cleanup Complete"

echo ""

# ==================================================
# Remove Unused Networks
# ==================================================

echo "🌐 Removing Unused Networks"

docker network prune -af

echo "✅ Network Cleanup Complete"

echo ""

# ==================================================
# Remove Dangling Images
# ==================================================

echo "🖼 Removing Dangling Images"

docker image prune -af

echo "✅ Image Cleanup Complete"

echo ""

# ==================================================
# Builder Cache
# ==================================================

echo "🏗 Cleaning Builder Cache"

docker builder prune -af

echo "✅ Builder Cleanup Complete"

echo ""

# ==================================================
# Disk Usage After Cleanup
# ==================================================

echo "📊 Docker Usage After Cleanup"

docker system df

echo ""

# ==================================================
# Container Health
# ==================================================

echo "🩺 Container Status"

docker compose \
  -p ${PROJECT_NAME} \
  --env-file .env.production \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  ps

echo ""

# ==================================================
# Finished
# ==================================================

echo "============================================================"
echo "✅ Weekly Maintenance Complete"
echo "============================================================"s
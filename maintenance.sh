#!/usr/bin/env bash

set -euo pipefail

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
# Docker Status Before
# ==================================================

echo "📊 Docker Usage Before Cleanup"
docker system df

echo ""

# ==================================================
# Remove Stopped Containers
# ==================================================

echo "🗑 Removing Stopped Containers"
docker container prune -f
echo "✅ Container Cleanup Complete"
echo ""

# ==================================================
# Remove Unused Networks
# ==================================================

echo "🌐 Removing Unused Networks"
docker network prune -f
echo "✅ Network Cleanup Complete"
echo ""

# ==================================================
# Remove Unused Images
# ==================================================

echo "🖼 Removing Unused Images"
docker image prune -af
echo "✅ Image Cleanup Complete"
echo ""

# ==================================================
# Remove Builder Cache
# ==================================================

echo "🏗 Cleaning Builder Cache"
docker builder prune -af
echo "✅ Builder Cache Cleanup Complete"
echo ""

# ==================================================
# Docker Status After
# ==================================================

echo "📊 Docker Usage After Cleanup"
docker system df
echo ""

# ==================================================
# Container Health Check
# ==================================================

echo "🩺 Container Status"

docker compose 
-p ${PROJECT_NAME} 
--env-file .env.production 
-f docker-compose.yml 
-f docker-compose.prod.yml 
ps

echo ""

# ==================================================
# Running Containers
# ==================================================

echo "🚀 Running Containers"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
echo ""

# ==================================================
# Finished
# ==================================================

echo "============================================================"
echo "✅ Weekly Maintenance Complete"
echo "============================================================"

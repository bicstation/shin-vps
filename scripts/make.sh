#!/bin/bash
# ============================================================================
# SHIN CORE LINX
# Discover Experience V2
# Experience Dictionary Skeleton Generator
# ============================================================================

set -e

FILES=(
  "usage-ai"
  "usage-business"
  "usage-budget"
  "usage-creator"
  "usage-gaming"
  "usage-mobile"

  # Monitor
  "monitor-business"
  "monitor-color"
  "monitor-gaming"
  "monitor-portable"
  "monitor-ultrawide"

  # CPU
  "cpu-ai"
  "cpu-business"
  "cpu-budget"
  "cpu-gaming"

  # GPU
  "gpu-ai"
  "gpu-budget"
  "gpu-creator"
  "gpu-gaming"

  # Memory
  "memory-ddr4"
  "memory-ddr5"

  # Storage
  "storage-hdd"
  "storage-nvme"
  "storage-ssd"

  # Notebook
  "notebook-2in1"
  "notebook-business"
  "notebook-gaming"
  "notebook-lightweight"

  # Desktop
  "desktop-allinone"
  "desktop-gaming"
  "desktop-mini"
  "desktop-tower"

  # Keyboard
  "keyboard-gaming"
  "keyboard-wireless"

  # Mouse
  "mouse-gaming"
  "mouse-wireless"

  # Others
  "speaker-desktop"
  "webcam-streaming"
)

for file in "${FILES[@]}"; do

  if [ ! -f "${file}.ts" ]; then
    touch "${file}.ts"
    echo "Created ${file}.ts"
  else
    echo "Skip ${file}.ts"
  fi

done

echo
echo "Done."
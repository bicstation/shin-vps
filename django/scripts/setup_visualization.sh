#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VIS_DIR="${ROOT_DIR}/visualization"

echo "========================================"
echo " SHIN CORE LINX"
echo " Backend Visualization Setup"
echo "========================================"
echo

mkdir -p "${VIS_DIR}/common"
mkdir -p "${VIS_DIR}/generators"
mkdir -p "${VIS_DIR}/templates"
mkdir -p "${VIS_DIR}/output"
mkdir -p "${VIS_DIR}/logs"

mkdir -p "${VIS_DIR}/relation_map"
mkdir -p "${VIS_DIR}/runtime_dependency"
mkdir -p "${VIS_DIR}/tsv_dependency"
mkdir -p "${VIS_DIR}/authority_flow"
mkdir -p "${VIS_DIR}/traversal_flow"
mkdir -p "${VIS_DIR}/observatory"

cat > "${VIS_DIR}/README.md" <<'EOF'
# SHIN CORE LINX

## Backend Visualization Workspace

このディレクトリは Semantic Reality Visualization の標準ワークスペースです。

Commander Directive Addendum v1.1 に従い、
Graphviz を用いた Semantic Reality の継続的な可視化を行います。

Source of Truth:
master_data/
    ↓
Semantic Registry
    ↓
Authority Runtime
    ↓
Visualization
EOF

echo
echo "Visualization workspace created:"
echo

tree "${VIS_DIR}" || find "${VIS_DIR}" -type d | sort

echo
echo "Setup completed successfully."
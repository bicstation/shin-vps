#!/usr/bin/env bash

# ==================================================
#
# SHIN CORE LINX
#
# Observation Platform
#
# Bootstrap Script
#
# ==================================================

set -e

ROOT="/home/maya/shin-vps/django/observation"

echo ""
echo "=========================================="
echo " SHIN CORE LINX"
echo " Observation Platform Bootstrap"
echo "=========================================="
echo ""

# --------------------------------------------------
# Directories
# --------------------------------------------------

mkdir -p "$ROOT"

mkdir -p "$ROOT/cli"

mkdir -p "$ROOT/common"

mkdir -p "$ROOT/datasets"
mkdir -p "$ROOT/datasets/generated"

mkdir -p "$ROOT/generators"
mkdir -p "$ROOT/generators/manufacturer_series"

mkdir -p "$ROOT/output"
mkdir -p "$ROOT/output/markdown"
mkdir -p "$ROOT/output/json"

# --------------------------------------------------
# Root
# --------------------------------------------------

touch "$ROOT/README.md"

# --------------------------------------------------
# CLI
# --------------------------------------------------

touch "$ROOT/cli/__init__.py"
touch "$ROOT/cli/menu.py"
touch "$ROOT/cli/command.py"
touch "$ROOT/cli/run_all.py"

# --------------------------------------------------
# Common
# --------------------------------------------------

touch "$ROOT/common/__init__.py"
touch "$ROOT/common/paths.py"
touch "$ROOT/common/loader.py"
touch "$ROOT/common/writer.py"
touch "$ROOT/common/dataset.py"

# --------------------------------------------------
# Datasets
# --------------------------------------------------

touch "$ROOT/datasets/README.md"

# --------------------------------------------------
# Manufacturer Series Generator
# --------------------------------------------------

touch "$ROOT/generators/manufacturer_series/__init__.py"

touch "$ROOT/generators/manufacturer_series/generate.py"

touch "$ROOT/generators/manufacturer_series/loader.py"

touch "$ROOT/generators/manufacturer_series/collector.py"

touch "$ROOT/generators/manufacturer_series/builder.py"

touch "$ROOT/generators/manufacturer_series/writer.py"

# --------------------------------------------------
# Output
# --------------------------------------------------

touch "$ROOT/output/markdown/.gitkeep"

touch "$ROOT/output/json/.gitkeep"

# --------------------------------------------------
# Complete
# --------------------------------------------------

echo ""
echo "=========================================="
echo " Observation Platform Created"
echo "=========================================="
echo ""

tree "$ROOT"

echo ""
echo "Done."
echo ""
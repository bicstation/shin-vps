#!/usr/bin/env bash

set -e

BASE="/home/maya/shin-vps/django/visualization/cli"

mkdir -p "$BASE"

touch \
"$BASE/__init__.py" \
"$BASE/menu.py" \
"$BASE/command.py" \
"$BASE/api.py" \
"$BASE/evidence.py" \
"$BASE/observatory.py" \
"$BASE/runtime.py" \
"$BASE/structure.py" \
"$BASE/graph.py" \
"$BASE/projection.py" \
"$BASE/review.py"

echo
echo "======================================"
echo " SHIN CORE LINX"
echo " Visualization CLI"
echo "======================================"
echo
echo "CLI skeleton created."
echo
tree "$BASE"
#!/usr/bin/env bash

set -eu

BASE="/home/maya/shin-dev/shin-vps/django/research/rakuten_reality"

echo "Creating directories..."

mkdir -p "${BASE}/scripts"
mkdir -p "${BASE}/output/raw"
mkdir -p "${BASE}/output/observation"
mkdir -p "${BASE}/output/payload"

echo "Creating files..."

touch "${BASE}/scripts/config.py"
touch "${BASE}/scripts/client.py"
touch "${BASE}/scripts/observation_contract.py"
touch "${BASE}/scripts/observe.py"
touch "${BASE}/scripts/validator.py"
touch "${BASE}/scripts/mapper.py"
touch "${BASE}/scripts/exporter.py"
touch "${BASE}/scripts/formatter.py"
touch "${BASE}/scripts/orchestrator.py"
touch "${BASE}/scripts/fetch_rakuten.py"

echo
echo "Project structure"

find "${BASE}" -maxdepth 2 | sort

echo
echo "Done."
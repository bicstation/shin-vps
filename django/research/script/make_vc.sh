#!/usr/bin/env bash

set -eu

BASE="/home/maya/shin-vps/django/research/valuecommerce_reality"

echo "Creating directories..."

mkdir -p "${BASE}/scripts"
mkdir -p "${BASE}/sdk"
mkdir -p "${BASE}/compare"
mkdir -p "${BASE}/ecCode"

mkdir -p "${BASE}/output/raw"
mkdir -p "${BASE}/output/observation"
mkdir -p "${BASE}/output/payload"

echo "Creating files..."

touch "${BASE}/README.md"

touch "${BASE}/scripts/config.py"
touch "${BASE}/scripts/auth.py"
touch "${BASE}/scripts/client.py"
touch "${BASE}/scripts/fetch_products.py"

touch "${BASE}/scripts/observation_contract.py"
touch "${BASE}/scripts/observe.py"
touch "${BASE}/scripts/validator.py"
touch "${BASE}/scripts/mapper.py"
touch "${BASE}/scripts/importer.py"
touch "${BASE}/scripts/import_contract.py"
touch "${BASE}/scripts/exporter.py"
touch "${BASE}/scripts/formatter.py"
touch "${BASE}/scripts/orchestrator.py"

touch "${BASE}/ecCode/valuecommerce.md"

echo
echo "Project structure"

find "${BASE}" -maxdepth 2 | sort

echo
echo "Done."
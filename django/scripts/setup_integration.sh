#!/usr/bin/env bash

# ==========================================================
# SHIN CORE LINX
# Import Integration Framework
# Directory Generator
# ==========================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

ROOT="imports"

echo
echo "========================================"
echo " SHIN CORE LINX"
echo " Import Integration Framework"
echo "========================================"
echo
echo "Root : ${ROOT_DIR}"
echo

# ----------------------------------------------------------
# Directories
# ----------------------------------------------------------

DIRS=(
    "${ROOT}"

    "${ROOT}/contracts"

    "${ROOT}/integration"
    "${ROOT}/integration/normalizers"
    "${ROOT}/integration/builders"
    "${ROOT}/integration/identity"
    "${ROOT}/integration/repository"

    "${ROOT}/ark"
    "${ROOT}/ark/fetch"
    "${ROOT}/ark/formatter"
    "${ROOT}/ark/mapper"
    "${ROOT}/ark/output/raw"
    "${ROOT}/ark/output/payload"
    "${ROOT}/ark/output/import_contract"

    "${ROOT}/rakuten"
    "${ROOT}/tsukumo"
    "${ROOT}/amazon"
    "${ROOT}/valuecommerce"
)

for dir in "${DIRS[@]}"; do
    mkdir -p "${dir}"
done

# ----------------------------------------------------------
# Files
# ----------------------------------------------------------

FILES=(
    "${ROOT}/README.md"

    "${ROOT}/contracts/README.md"
    "${ROOT}/contracts/schema.py"
    "${ROOT}/contracts/validator.py"
    "${ROOT}/contracts/exceptions.py"

    "${ROOT}/integration/__init__.py"
    "${ROOT}/integration/adapter.py"
    "${ROOT}/integration/orchestrator.py"
    "${ROOT}/integration/results.py"

    "${ROOT}/integration/normalizers/__init__.py"
    "${ROOT}/integration/normalizers/pc_product.py"

    "${ROOT}/integration/builders/__init__.py"
    "${ROOT}/integration/builders/pc_product_builder.py"

    "${ROOT}/integration/identity/__init__.py"
    "${ROOT}/integration/identity/resolver.py"

    "${ROOT}/integration/repository/__init__.py"
    "${ROOT}/integration/repository/pc_product_repository.py"
)

for file in "${FILES[@]}"; do
    touch "${file}"
done

echo
echo "========================================"
echo " Framework Created"
echo "========================================"
echo

if command -v tree >/dev/null 2>&1; then
    tree "${ROOT}"
else
    find "${ROOT}" | sort
fi

echo
echo "Done."
echo
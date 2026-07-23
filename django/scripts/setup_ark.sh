#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMPORTS_DIR="${ROOT_DIR}/imports"

echo "========================================"
echo " SHIN CORE LINX"
echo " Importer Framework Setup"
echo "========================================"
echo

#
# Common
#
mkdir -p "${IMPORTS_DIR}/common"

#
# ARK Importer
#
mkdir -p "${IMPORTS_DIR}/ark/scripts"
mkdir -p "${IMPORTS_DIR}/ark/output/raw"
mkdir -p "${IMPORTS_DIR}/ark/output/payload"
mkdir -p "${IMPORTS_DIR}/ark/output/import_contract"
mkdir -p "${IMPORTS_DIR}/ark/tests"
mkdir -p "${IMPORTS_DIR}/ark/logs"

#
# README
#
cat > "${IMPORTS_DIR}/README.md" <<'EOF'
# SHIN CORE LINX

## Importer Framework

Importer は各 Reality Source から情報を取得し、
共通 Import Contract(JSON) を生成する責務を持ちます。

Importer の責務は JSON 出力までです。

Import JSON
    ↓
Backend Adapter
    ↓
PCProduct
    ↓
AI Observation
EOF

cat > "${IMPORTS_DIR}/common/README.md" <<'EOF'
# Common Import Contract

このディレクトリには、
各 Importer が共通で利用する Contract や共通ライブラリを配置します。
EOF

echo
echo "Importer workspace created:"
echo

tree "${IMPORTS_DIR}" || find "${IMPORTS_DIR}" -type d | sort

echo
echo "Setup completed successfully."
#!/usr/bin/env bash

BASE="/home/maya/shin-dev/shin-vps/django/acquisition"

mkdir -p "$BASE/common/contracts"
mkdir -p "$BASE/common/runtime"
mkdir -p "$BASE/common/services"
mkdir -p "$BASE/common/identity"
mkdir -p "$BASE/common/affiliate"
mkdir -p "$BASE/common/observation"
mkdir -p "$BASE/common/utils"

mkdir -p "$BASE/integration"

mkdir -p "$BASE/sources/scraping"
mkdir -p "$BASE/sources/api"
mkdir -p "$BASE/sources/ftp"
mkdir -p "$BASE/sources/file"
mkdir -p "$BASE/sources/manual"

mkdir -p "$BASE/docs"
mkdir -p "$BASE/tests"
mkdir -p "$BASE/examples"

echo "Done."
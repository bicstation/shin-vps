#!/usr/bin/env bash

set -euo pipefail

ROOT="/home/maya/shin-vps/django/acquisition/sources/scraping/frontier"

echo "=================================================="
echo "FRONTIER Runtime Cleanup"
echo "=================================================="

cd "$ROOT"

rename_if_exists() {

    local from="$1"
    local to="$2"

    if [[ -f "$from" ]]; then

        echo "MV  : $from -> $to"

        mv "$from" "$to"

    fi

}

remove_if_exists() {

    local target="$1"

    if [[ -e "$target" ]]; then

        echo "DEL : $target"

        rm -rf "$target"

    fi

}

#
# Runtime Rename
#

rename_if_exists discover_series.py discover_seed.py

rename_if_exists fetch_list.py acquire_listing.py

rename_if_exists discover_models.py observe_cards.py

rename_if_exists formatter_list.py formatter.py

#
# Legacy Runtime Remove
#

remove_if_exists formatter_seed.py

remove_if_exists formatter_product.py

remove_if_exists fetch_products.py

remove_if_exists payload

remove_if_exists import_contract

echo

echo "=================================================="
echo "Current Files"
echo "=================================================="

ls -la

echo

echo "=================================================="
echo "FRONTIER Runtime Structure"
echo "=================================================="

tree .

echo

echo "=================================================="
echo "✅ FRONTIER Runtime Cleanup Complete"
echo "=================================================="
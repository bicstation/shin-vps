# /home/maya/shin-vps/django/imports/common/config.py

#!/usr/bin/env python3
"""
SHIN CORE LINX
Importer Framework

Common Configuration
"""

from pathlib import Path

#
# Framework Root
#
IMPORTS_DIR = Path(__file__).resolve().parents[1]

#
# Importer Root
#
ARK_DIR = IMPORTS_DIR / "ark"

#
# Output Directories
#
RAW_DIR = ARK_DIR / "output" / "raw"
PAYLOAD_DIR = ARK_DIR / "output" / "payload"
CONTRACT_DIR = ARK_DIR / "output" / "import_contract"
LOG_DIR = ARK_DIR / "logs"

#
# Create Directories
#
for directory in (
    RAW_DIR,
    PAYLOAD_DIR,
    CONTRACT_DIR,
    LOG_DIR,
):
    directory.mkdir(parents=True, exist_ok=True)

#
# Network
#
TIMEOUT = 30

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/138.0 Safari/537.36"
)

#
# Import Contract
#
SCHEMA_VERSION = "1.0"
SOURCE = "ark"
# /home/maya/shin-dev/shin-vps/django/imports/common/tsv/tsv_loader.py

from pathlib import Path
import csv

BASE_DIR = Path(__file__).parent
MASTER_FILE = BASE_DIR / "identity_master.tsv"


def load_identity_master():
    """Load identity_master.tsv"""

    with MASTER_FILE.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as f:
        return list(csv.DictReader(f, delimiter="\t"))
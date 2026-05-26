# ============================================================================
# SHIN SATELLITE OPS｜RSS Registry Loader
# ============================================================================
# Purpose:
# Load RSS registry from CSV authority source
# ============================================================================

import csv
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent

CSV_PATH = BASE_DIR / "master_rss_sources.csv"


def load_rss_registry():

    rss_feeds = []

    if not CSV_PATH.exists():

        print("⚠ RSS CSV not found.")

        return rss_feeds

    with open(CSV_PATH, "r", encoding="utf-8") as f:

        reader = csv.DictReader(f)

        for row in reader:

            rss_feeds.append({

                "project": row.get("project", "").strip(),

                "rss_category": row.get("rss_category", "").strip(),

                "rss_url": row.get("rss_url", "").strip(),

                "source_name": row.get("source_name", "").strip(),

            })

    print(f"✅ RSS Registry Loaded: {len(rss_feeds)} feeds")

    return rss_feeds


RSS_FEEDS = load_rss_registry()
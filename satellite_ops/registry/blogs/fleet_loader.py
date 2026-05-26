import csv
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent

CSV_PATH = BASE_DIR / "master_fleet.csv"


def load_fleet():

    fleet = []

    with open(CSV_PATH, "r", encoding="utf-8") as f:

        reader = csv.DictReader(f)

        for row in reader:

            categories = [
                x.strip()
                for x in row.get("rss_category", "").split(",")
                if x.strip()
            ]

            fleet.append({

                "project": row.get("project", ""),
                "site_key": row.get("site_key", ""),
                "platform": row.get("platform", ""),
                "site_urls": row.get("site_urls", ""),

                "persona": row.get("persona", ""),

                "rss_categories": categories,

            })

    return fleet


BLOG_FLEET = load_fleet()
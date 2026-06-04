import csv
import psycopg2
from pathlib import Path

# =========================================================
# SHIN SATELLITE OPS
# Governance Importer
# master_fleet.csv -> satellite_blogs
# =========================================================

ROOT_DIR = Path(__file__).resolve().parents[3]

CSV_PATH = (
    ROOT_DIR
    / "satellite_ops"
    / "registry"
    / "blogs"
    / "master_fleet.csv"
)

DB_CONFIG = {
    "host": "shin-local-postgres-db-v3-1",
    "port": 5432,
    "dbname": "shin_governance",
    "user": "tiper_user",
    "password": "1492nabe",
}


def main():

    print("========================================")
    print("SHIN Governance Import")
    print("master_fleet.csv")
    print("========================================")

    print(f"[INFO] CSV_PATH: {CSV_PATH}")
    

    if not CSV_PATH.exists():
        print("[ERROR] CSV file not found")
        return

    try:

        # -------------------------------------------------
        # PostgreSQL Connection
        # -------------------------------------------------

        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        print("[INFO] PostgreSQL connected")

        # -------------------------------------------------
        # Clear existing rows
        # -------------------------------------------------

        cur.execute(
            """
            TRUNCATE TABLE satellite_blogs
            RESTART IDENTITY CASCADE;
            """
        )

        conn.commit()

        print("[INFO] satellite_blogs truncated")

        # -------------------------------------------------
        # Import CSV
        # -------------------------------------------------

        with open(CSV_PATH, "r", encoding="utf-8") as f:

            # reader = csv.DictReader(f)
            reader = csv.DictReader(f, delimiter="\t")

            count = 0

            for row in reader:

                cur.execute(
                    """
                    INSERT INTO satellite_blogs (
                        project,
                        site_key,
                        platform,
                        site_urls,
                        rss_category_raw
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        row.get("project"),
                        row.get("site_key"),
                        row.get("platform"),
                        row.get("site_urls"),
                        row.get("rss_category"),
                    ),
                )

                count += 1

        conn.commit()

        print(f"[SUCCESS] Imported rows: {count}")

        cur.close()
        conn.close()

        print("[DONE]")

    except Exception as e:

        print("[ERROR]")
        print(str(e))


if __name__ == "__main__":
    main()
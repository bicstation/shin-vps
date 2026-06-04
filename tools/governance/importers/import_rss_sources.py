import csv
import psycopg2
from pathlib import Path

# =========================================================
# SHIN SATELLITE OPS
# Governance Importer
# master_rss_sources.csv -> satellite_rss_sources
# =========================================================

ROOT_DIR = Path(__file__).resolve().parents[3]

CSV_PATH = (
    ROOT_DIR
    / "satellite_ops"
    / "registry"
    / "rss"
    / "master_rss_sources.csv"
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
    print("master_rss_sources.csv")
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
            TRUNCATE TABLE satellite_rss_sources
            RESTART IDENTITY CASCADE;
            """
        )

        conn.commit()

        print("[INFO] satellite_rss_sources truncated")

        # -------------------------------------------------
        # Import TSV
        # -------------------------------------------------

        with open(CSV_PATH, "r", encoding="utf-8") as f:

            reader = csv.DictReader(f, delimiter="\t")

            count = 0

            for row in reader:

                cur.execute(
                    """
                    INSERT INTO satellite_rss_sources (
                        project,
                        rss_category,
                        rss_url,
                        source_name
                    )
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        row.get("project"),
                        row.get("rss_category"),
                        row.get("rss_url"),
                        row.get("source_name"),
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
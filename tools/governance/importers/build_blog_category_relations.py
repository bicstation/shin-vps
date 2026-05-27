import psycopg2

# =========================================================
# SHIN SATELLITE OPS
# Build Blog Category Relations
# =========================================================

DB_CONFIG = {
    "host": "shin-local-postgres-db-v3-1",
    "port": 5432,
    "dbname": "shin_governance",
    "user": "tiper_user",
    "password": "1492nabe",
}


def main():

    print("========================================")
    print("SHIN Governance Relation Builder")
    print("satellite_blog_categories")
    print("========================================")

    try:

        # -------------------------------------------------
        # PostgreSQL Connection
        # -------------------------------------------------

        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        print("[INFO] PostgreSQL connected")

        # -------------------------------------------------
        # Clear Existing Relations
        # -------------------------------------------------

        cur.execute(
            """
            TRUNCATE TABLE satellite_blog_categories
            RESTART IDENTITY;
            """
        )

        conn.commit()

        print("[INFO] satellite_blog_categories truncated")

        # -------------------------------------------------
        # Load Blogs
        # -------------------------------------------------

        cur.execute(
            """
            SELECT id, rss_category_raw
            FROM satellite_blogs
            """
        )

        blogs = cur.fetchall()

        relation_count = 0

        # -------------------------------------------------
        # Build Relations
        # -------------------------------------------------

        for blog_id, rss_category_raw in blogs:

            if not rss_category_raw:
                continue

            categories = [
                c.strip()
                for c in rss_category_raw.split(",")
                if c.strip()
            ]

            for category in categories:

                cur.execute(
                    """
                    INSERT INTO satellite_blog_categories (
                        blog_id,
                        rss_category
                    )
                    VALUES (%s, %s)
                    """,
                    (
                        blog_id,
                        category,
                    ),
                )

                relation_count += 1

        conn.commit()

        print(f"[SUCCESS] Relations created: {relation_count}")

        cur.close()
        conn.close()

        print("[DONE]")

    except Exception as e:

        print("[ERROR]")
        print(str(e))


if __name__ == "__main__":
    main()
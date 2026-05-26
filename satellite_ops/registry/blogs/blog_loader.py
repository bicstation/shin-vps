from pathlib import Path
import csv


# =========================================================
# Base Directory
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[2]


# =========================================================
# Registry Path
# =========================================================

BLOG_CSV = (
    BASE_DIR
    / "registry"
    / "blogs"
    / "master_fleet.csv"
)


# =========================================================
# Blog Loader
# =========================================================

def load_blog(blog_name: str) -> dict:
    
    Load single blog definition from master_fleet.csv
    

    with open(
        BLOG_CSV,
        newline="",
        encoding="utf-8",
    ) as f:

        reader = csv.DictReader(f)

        for row in reader:

            if row["blog_name"] == blog_name:

                allowed_categories = [
                    x.strip()
                    for x in row.get(
                        "allowed_categories",
                        "",
                    ).split(",")
                    if x.strip()
                ]

                return {
                    "blog_name": row.get(
                        "blog_name",
                        "",
                    ),

                    "persona": row.get(
                        "persona",
                        "",
                    ),

                    "allowed_categories":
                        allowed_categories,

                    "platform": row.get(
                        "platform",
                        "console",
                    ),

                    "worldview": row.get(
                        "worldview",
                        "",
                    ),

                    "description": row.get(
                        "description",
                        "",
                    ),
                }

    raise ValueError(
        f"Blog not found: {blog_name}"
    )


# =========================================================
# Load All Blogs
# =========================================================

def load_all_blogs() -> list:
    
    Load all blogs from registry
    

    blogs = []

    with open(
        BLOG_CSV,
        newline="",
        encoding="utf-8",
    ) as f:

        reader = csv.DictReader(f)

        for row in reader:

            allowed_categories = [
                x.strip()
                for x in row.get(
                    "allowed_categories",
                    "",
                ).split(",")
                if x.strip()
            ]

            blogs.append({

                "blog_name": row.get(
                    "blog_name",
                    "",
                ),

                "persona": row.get(
                    "persona",
                    "",
                ),

                "allowed_categories":
                    allowed_categories,

                "platform": row.get(
                    "platform",
                    "console",
                ),

                "worldview": row.get(
                    "worldview",
                    "",
                ),

                "description": row.get(
                    "description",
                    "",
                ),
            })

    return blogs
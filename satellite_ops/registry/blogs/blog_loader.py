from pathlib import Path
import csv


# ============================================================================
# Base Directory
# ============================================================================

BASE_DIR = Path(__file__).resolve().parents[2]


# ============================================================================
# Registry Path
# ============================================================================

BLOG_CSV = (
    BASE_DIR
    / "registry"
    / "blogs"
    / "master_fleet.csv"
)


# ============================================================================
# Helpers
# ============================================================================

def _parse_categories(value: str) -> list:
    """
    Convert comma-separated categories into clean list.
    """

    if not value:
        return []

    return [
        x.strip()
        for x in value.split(",")
        if x.strip()
    ]

def _normalize_blog_row(row: dict) -> dict:
    """
    Normalize single blog row.
    """

    return {

        # ================================================================
        # Core
        # ================================================================

        "blog_name": row.get(
            "site_key",
            "",
        ),

        "platform": row.get(
            "platform",
            "console",
        ),

        # ================================================================
        # Dispatch Config
        # ================================================================

        "url": row.get(
            "site_urls",
            "",
        ),

        "user": row.get(
            "user",
            "",
        ),

        "api_key": row.get(
            "api_key",
            "",
        ),

        "endpoint": row.get(
            "endpoint",
            "",
        ),

        # ================================================================
        # Persona
        # ================================================================

        "persona": row.get(
            "persona",
            "",
        ),

        "worldview": row.get(
            "worldview",
            "",
        ),

        "description": row.get(
            "description",
            "",
        ),

        # ================================================================
        # RSS Categories
        # ================================================================

        "allowed_categories": _parse_categories(

            row.get(
                "rss_category",
                "",
            )
        ),
    }


# ============================================================================
# Load Single Blog
# ============================================================================

def load_blog(blog_name: str) -> dict:
    """
    Load single blog definition from master_fleet.csv
    """

    with open(
        BLOG_CSV,
        newline="",
        encoding="utf-8",
    ) as f:

        # reader = csv.DictReader(f)
        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            normalized = _normalize_blog_row(
                row
            )

            if (
                normalized["blog_name"]
                == blog_name
            ):

                return normalized

    raise ValueError(
        f"Blog not found: {blog_name}"
    )


# ============================================================================
# Load All Blogs
# ============================================================================

def load_all_blogs() -> list:
    """
    Load all blog definitions from registry.
    """

    blogs = []

    with open(
        BLOG_CSV,
        newline="",
        encoding="utf-8",
    ) as f:

        # reader = csv.DictReader(f)
        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            blogs.append(
                _normalize_blog_row(row)
            )

    return blogs
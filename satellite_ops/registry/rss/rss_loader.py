from pathlib import Path
import csv


# ============================================================================
# Base Directory
# ============================================================================

BASE_DIR = Path(__file__).resolve().parents[2]


# ============================================================================
# RSS Registry Path
# ============================================================================

RSS_CSV = (
    BASE_DIR
    / "registry"
    / "rss"
    / "master_rss_sources.csv"
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


def _normalize_rss_row(row: dict) -> dict:
    """
    Normalize RSS registry row.
    """

    return {

        "project": row.get(
            "project",
            "",
        ),

        "source_name": row.get(
            "source_name",
            "",
        ),

        "rss_url": row.get(
            "rss_url",
            "",
        ),

        "category": _parse_categories(
            row.get(
                "rss_category",
                "",
            )
        ),
    }


# ============================================================================
# Load RSS By Categories
# ============================================================================

def load_rss_by_categories(
    categories: list,
) -> list:
    """
    Load RSS sources matching categories.
    """

    matched_sources = []

    with open(
        RSS_CSV,
        newline="",
        encoding="utf-8",
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            normalized = _normalize_rss_row(
                row
            )

            if any(
                cat in normalized["category"]
                for cat in categories
            ):

                matched_sources.append(
                    normalized
                )

    return matched_sources


# ============================================================================
# Load All RSS Sources
# ============================================================================

def load_all_rss_sources() -> list:
    """
    Load all RSS sources.
    """

    sources = []

    with open(
        RSS_CSV,
        newline="",
        encoding="utf-8",
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t",
        )

        for row in reader:

            sources.append(
                _normalize_rss_row(row)
            )

    return sources
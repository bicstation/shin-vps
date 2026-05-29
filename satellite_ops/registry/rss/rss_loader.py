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

    if not value:
        return []

    return [
        x.strip()
        for x in value.split(",")
        if x.strip()
    ]


def _safe_int(
    value,
    default=0,
):

    try:
        return int(value)

    except (ValueError, TypeError):
        return default


def _is_description_row(
    row: dict,
) -> bool:

    return (
        row.get(
            "rss_key",
            "",
        )
        == "feed固有ID"
    )


# ============================================================================
# Normalize Row
# ============================================================================

def _normalize_rss_row(
    row: dict,
) -> dict:

    return {

        # ------------------------------------------------------------
        # Identity
        # ------------------------------------------------------------

        "project": row.get(
            "project",
            "",
        ),

        "rss_key": row.get(
            "rss_key",
            "",
        ),

        # ------------------------------------------------------------
        # Human
        # ------------------------------------------------------------

        "source_name": row.get(
            "source_name",
            "",
        ),

        "rss_url": row.get(
            "rss_url",
            "",
        ),

        # ------------------------------------------------------------
        # Semantic
        # ------------------------------------------------------------

        "rss_category": row.get(
            "rss_category",
            "",
        ),

        "category": _parse_categories(
            row.get(
                "rss_category",
                "",
            )
        ),

        # ------------------------------------------------------------
        # Runtime Authority
        # ------------------------------------------------------------

        "overlay_key": row.get(
            "overlay_key",
            "",
        ),

        "parser_key": row.get(
            "parser_key",
            "",
        ),

        "worldview": row.get(
            "worldview",
            "",
        ),

        "rewrite_mode": row.get(
            "rewrite_mode",
            "light",
        ),

        # ------------------------------------------------------------
        # Runtime Control
        # ------------------------------------------------------------

        "enabled": _safe_int(
            row.get(
                "enabled",
                "1",
            ),
            1,
        ),

        "priority": _safe_int(
            row.get(
                "priority",
                "50",
            ),
            50,
        ),

    }


# ============================================================================
# Load RSS By Categories
# ============================================================================

def load_rss_by_categories(
    categories: list,
) -> list:

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

            if _is_description_row(
                row
            ):
                continue

            normalized = (
                _normalize_rss_row(
                    row
                )
            )

            if not normalized.get(
                "enabled",
                1,
            ):
                continue

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

            if _is_description_row(
                row
            ):
                continue

            normalized = (
                _normalize_rss_row(
                    row
                )
            )

            if not normalized.get(
                "enabled",
                1,
            ):
                continue

            sources.append(
                normalized
            )

    return sources
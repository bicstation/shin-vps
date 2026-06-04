from pathlib import Path

import json

from collections import Counter
from datetime import datetime


# ============================================================================
# Base Directory
# ============================================================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parents[1]
)


# ============================================================================
# Summary Directory
# ============================================================================

SUMMARY_DIR = (
    BASE_DIR
    / "observatory"
    / "summary"
)


# ============================================================================
# Helpers
# ============================================================================

def _today_dir() -> Path:

    today = datetime.now().strftime(
        "%Y-%m-%d"
    )

    path = (
        SUMMARY_DIR
        / today
    )

    path.mkdir(
        parents=True,
        exist_ok=True,
    )

    return path


# ============================================================================
# Generate Summary
# ============================================================================

def generate_observation_summary(
    blog_name: str,
    rss_universe: list,
    articles: list,
) -> dict:
    """
    Discovery Phase Summary

    No scoring.
    No ranking.
    No AI analysis.
    """

    source_counter = Counter()

    for article in articles:

        source_counter.update(

            [
                article.get(
                    "source_name",
                    "unknown",
                )
            ]

        )

    return {

        "timestamp":
            datetime.now().isoformat(),

        "blog_name":
            blog_name,

        "rss_count":
            len(
                rss_universe
            ),

        "article_count":
            len(
                articles
            ),

        "source_distribution":

            dict(
                source_counter
            ),

        "top_sources":

            [

                source

                for source, count

                in source_counter.most_common(
                    5
                )

            ],

    }


# ============================================================================
# Save Summary
# ============================================================================

def save_observation_summary(
    blog_name: str,
    rss_universe: list,
    articles: list,
) -> Path:

    summary = (
        generate_observation_summary(
            blog_name=blog_name,
            rss_universe=rss_universe,
            articles=articles,
        )
    )

    timestamp = datetime.now().strftime(
        "%H%M%S"
    )

    output_file = (
        _today_dir()
        / f"{timestamp}_{blog_name}_summary.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            summary,
            f,
            ensure_ascii=False,
            indent=2,
        )

    return output_file
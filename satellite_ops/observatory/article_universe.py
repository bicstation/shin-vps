from pathlib import Path

import json
from datetime import datetime


# ============================================================================
# Observatory Base
# ============================================================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parents[1]
)

OBSERVATORY_DIR = (
    BASE_DIR
    / "observatory"
    / "article_universe"
)


# ============================================================================
# Helpers
# ============================================================================

def _today_dir() -> Path:

    today = datetime.now().strftime(
        "%Y-%m-%d"
    )

    path = (
        OBSERVATORY_DIR
        / today
    )

    path.mkdir(
        parents=True,
        exist_ok=True,
    )

    return path


# ============================================================================
# Save Observation
# ============================================================================

def save_article_universe(
    blog_name: str,
    persona: str,
    rss_universe: list,
    articles: list,
) -> Path:
    """
    Save Article Universe Observation.

    Parameters
    ----------
    blog_name:
        pc-compass

    persona:
        blog persona

    rss_universe:
        candidate rss list

    articles:
        [
            {
                "rss_key": "...",
                "source_name": "...",
                "title": "...",
                "url": "...",
            }
        ]
    """

    output_file = (
        _today_dir()
        / f"{blog_name}.json"
    )

    payload = {

        "timestamp":
            datetime.now().isoformat(),

        "blog_name":
            blog_name,

        "persona":
            persona,

        "rss_universe":
            rss_universe,

        "article_count":
            len(articles),

        "articles":
            articles,
    }

    with open(
        output_file,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            payload,
            f,
            ensure_ascii=False,
            indent=2,
        )

    return output_file


# ============================================================================
# Append Observation
# ============================================================================

def append_article(
    articles: list,
    rss_key: str,
    source_name: str,
    title: str,
    url: str,
) -> None:

    articles.append(

        {

            "rss_key":
                rss_key,

            "source_name":
                source_name,

            "title":
                title,

            "url":
                url,

        }

    )
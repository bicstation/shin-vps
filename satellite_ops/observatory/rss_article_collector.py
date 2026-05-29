import feedparser


# ============================================================================
# RSS Article Collector
# ============================================================================
# Purpose:
# Observation Layer
#
# RSS Universe
# ↓
# Latest Articles
#
# No rewrite
# No parser
# No dispatch
# ============================================================================


def collect_rss_articles(
    rss_url: str,
    limit: int = 5,
) -> list:

    feed = feedparser.parse(
        rss_url
    )

    articles = []

    for entry in feed.entries[:limit]:

        articles.append(

            {

                "title":
                    getattr(
                        entry,
                        "title",
                        "",
                    ),

                "url":
                    getattr(
                        entry,
                        "link",
                        "",
                    ),

            }

        )

    return articles
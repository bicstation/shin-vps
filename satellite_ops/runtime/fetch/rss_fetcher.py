# ============================================================================
# SHIN SATELLITE OPS｜RSS Fetcher
# ============================================================================

import feedparser

def fetch_rss_titles(feed_url, limit=5):

    feed = feedparser.parse(feed_url)
    topics = []

    for entry in feed.entries[:limit]:
        # topics.append({
        #     "title": entry.title,
        #     "summary": getattr(entry, "summary", ""),
        # })
        
        topics.append({
            "title": entry.title,
            "summary": getattr(
                entry,
                "summary",
                "",
            ),
            "link": getattr(
                entry,
                "link",
                "",
            ),
        })


    return topics


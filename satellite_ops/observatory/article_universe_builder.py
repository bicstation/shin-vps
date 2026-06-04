from satellite_ops.observatory.rss_article_collector import (
    collect_rss_articles,
)


def build_article_universe(
    rss_sources: list,
) -> list:

    articles = []

    for rss in rss_sources:

        try:

            rss_articles = (
                collect_rss_articles(
                    rss.get(
                        "rss_url",
                        "",
                    ),
                    limit=5,
                )
            )

            for article in rss_articles:

                articles.append(

                    {

                        "rss_key":
                            rss.get(
                                "rss_key",
                                "",
                            ),

                        "source_name":
                            rss.get(
                                "source_name",
                                "",
                            ),

                        "rss_url":
                            rss.get(
                                "rss_url",
                                "",
                            ),

                        "title":
                            article.get(
                                "title",
                                "",
                            ),

                        "url":
                            article.get(
                                "url",
                                "",
                            ),

                    }

                )

        except Exception as e:

            print(
                f"⚠ RSS Observation Error: {e}"
            )

            continue

    return articles
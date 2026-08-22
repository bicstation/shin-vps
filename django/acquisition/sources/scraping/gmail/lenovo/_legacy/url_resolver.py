# /home/maya/shin-vps/django/acquisition/sources/scraping/gmail/lenovo/url_resolver.py
import requests


# =========================================================
# URL RESOLVER
# =========================================================

def resolve_url(
    affiliate_url,
):
    """
    Affiliate tracking URL
    -> final product URL
    """

    if not affiliate_url:

        return ""


    try:

        response = requests.get(
            affiliate_url,
            allow_redirects=True,
            timeout=15,
            headers={
                "User-Agent":
                    "Mozilla/5.0"
            },
        )


        return (
            response
            .url
            .strip()
        )


    except Exception as e:

        print(
            "URL RESOLVE FAILED:",
            e,
        )

        return ""



# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    import sys


    if len(sys.argv) < 2:

        print(
            "usage:"
        )

        print(
            "python url_resolver.py <affiliate_url>"
        )

        exit(1)


    url = sys.argv[1]


    print()

    print("=" * 80)

    print(
        "LENOVO URL RESOLVER TEST"
    )

    print("=" * 80)


    print()

    print(
        "[INPUT]"
    )

    print(
        url
    )


    resolved = resolve_url(
        url
    )


    print()

    print(
        "[OUTPUT]"
    )

    print(
        resolved
    )


    print()

    print("=" * 80)
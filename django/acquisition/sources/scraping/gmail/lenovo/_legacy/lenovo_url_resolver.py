import requests



# =========================================================
# CONSTANT
# =========================================================

LENOVO_DOMAIN = (
    "lenovo.com"
)



# =========================================================
# URL RESOLVE
# =========================================================

def resolve_url(
    affiliate_url,
):

    if not affiliate_url:

        return ""


    try:

        response = requests.get(

            affiliate_url,

            allow_redirects=True,

            timeout=20,

            headers={

                "User-Agent":
                    "Mozilla/5.0"

            },

        )


        final_url = (
            response.url
        )


        if (
            LENOVO_DOMAIN
            in final_url
        ):

            return final_url


        return ""


    except Exception as e:

        print(
            "URL RESOLVE ERROR:",
            e,
        )

        return ""



# =========================================================
# RUNTIME TEST
# =========================================================

def run(
    affiliate_url,
):

    print()

    print("=" * 80)

    print(
        "LENOVO URL RESOLVER"
    )

    print("=" * 80)


    print()

    print(
        "[INPUT]"
    )

    print(
        affiliate_url
    )


    product_url = resolve_url(
        affiliate_url
    )


    print()

    print(
        "[OUTPUT]"
    )

    print(
        product_url
    )


    return product_url



if __name__ == "__main__":


    test_url = input(
        "affiliate url: "
    )


    run(
        test_url
    )
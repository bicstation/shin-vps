# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/gmail/lenovo/affiliate.py

#!/usr/bin/env python3

from __future__ import annotations


from acquisition.common.affiliate.affiliate import (
    generate_affiliate_url,
)


from acquisition.sources.scraping.lenovo.settings import (
    AFFILIATE,
)


# =========================================================
# AFFILIATE RUNTIME
# =========================================================

def build_affiliate_reality(
    sale,
):

    products = sale.get(
        "products",
        [],
    )


    for product in products:

        product_url = product.get(
            "url",
            "",
        )


        if not product_url:

            product["affiliate_url"] = ""

            continue


        product["affiliate_url"] = (
            generate_affiliate_url(
                product_url,
                AFFILIATE,
            )
        )


    return sale
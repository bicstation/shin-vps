#!/usr/bin/env python3

import json
import re

from pathlib import Path

from api.models import PCProduct


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

OUTPUT_DIR = (
    BASE_DIR
    /
    "output"
)


# =========================================================
# SALE REALITY
# =========================================================

def load_sale(
    sale_path: Path,
):

    with open(
        sale_path,
        encoding="utf-8",
    ) as f:

        return json.load(
            f
        )


# =========================================================
# PRODUCT IDENTIFIER
# =========================================================

def extract_product_identifier(
    url: str,
) -> str:

    if not url:

        return ""


    match = re.search(
        r"/([0-9A-Za-z]+JP)(?:[/?#&]|$)",
        url,
        flags=re.IGNORECASE,
    )


    if not match:

        return ""


    return match.group(
        1
    ).lower()


# =========================================================
# PC PRODUCT
# =========================================================

def find_pc_product(
    identifier: str,
):

    if not identifier:

        return None


    return (
        PCProduct.objects
        .filter(
            url__icontains=identifier
        )
        .first()
    )


# =========================================================
# MATCH PRODUCT
# =========================================================

def match_product(
    product: dict,
):

    url = product.get(
        "url",
        "",
    )


    identifier = (
        extract_product_identifier(
            url
        )
    )


    pc_product = (
        find_pc_product(
            identifier
        )
    )


    result = {

        "sale_product": {

            "name":
                product.get(
                    "name",
                    "",
                ),

            "product_no":
                product.get(
                    "product_no",
                    "",
                ),

            "url":
                url,

            "affiliate_url":
                product.get(
                    "affiliate_url",
                    "",
                ),

            "regular_price":
                product.get(
                    "regular_price",
                    0,
                ),

            "sale_price":
                product.get(
                    "sale_price",
                    0,
                ),

        },

        "identifier":
            identifier,

        "match":
            False,

        "pc_product":
            None,

    }


    if pc_product is None:

        return result


    result["match"] = True


    result["pc_product"] = {

        "id":
            pc_product.id,

        "unique_id":
            pc_product.unique_id,

        "name":
            pc_product.name,

        "url":
            pc_product.url,

        "image_url":
            pc_product.image_url,

    }


    return result


# =========================================================
# MATCH SALE
# =========================================================

def build_match_reality(
    sale: dict,
):

    products = sale.get(
        "products",
        [],
    )


    if not products:

        raise RuntimeError(
            "Sale products not found"
        )


    matches = []


    for product in products:

        match = match_product(
            product
        )


        matches.append(
            match
        )


    return {

        "source":
            sale.get(
                "source",
                {},
            ),

        "brand":
            sale.get(
                "brand",
                "",
            ),

        "coupon_code":
            sale.get(
                "coupon_code",
                "",
            ),

        "valid_period":
            sale.get(
                "valid_period",
                "",
            ),

        "matches":
            matches,

    }


# =========================================================
# APPLY MAPPING TO SALE
# =========================================================

def apply_match_reality(
    sale: dict,
    match_reality: dict,
):

    products = sale.get(
        "products",
        [],
    )


    matches = match_reality.get(
        "matches",
        [],
    )


    if len(products) != len(matches):

        raise RuntimeError(
            "Sale products and match products count mismatch"
        )


    for product, match in zip(
        products,
        matches,
    ):

        product[
            "identifier"
        ] = match.get(
            "identifier",
            "",
        )


        product[
            "match"
        ] = match.get(
            "match",
            False,
        )


        product[
            "pc_product"
        ] = match.get(
            "pc_product",
        )


    return sale


# =========================================================
# PERSIST SALE
# =========================================================

def persist_sale(
    sale_path: Path,
    sale: dict,
):

    with open(
        sale_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            sale,
            f,
            ensure_ascii=False,
            indent=2,
        )


    return sale_path


# =========================================================
# RUNTIME
# =========================================================

def run(
    sale_path: str | Path,
):

    sale_path = Path(
        sale_path
    )


    print()

    print("=" * 80)

    print(
        "LENOVO SALE PRODUCT MATCHER"
    )

    print("=" * 80)


    print()

    print(
        "SALE:",
        sale_path,
    )


    sale = load_sale(
        sale_path
    )


    match_reality = (
        build_match_reality(
            sale
        )
    )


    sale = apply_match_reality(
        sale,
        match_reality,
    )


    output_path = (
        persist_sale(
            sale_path,
            sale,
        )
    )


    matches = (
        match_reality.get(
            "matches",
            [],
        )
    )


    total = len(
        matches
    )


    matched = sum(

        1

        for item
        in matches

        if item.get(
            "match",
            False,
        )

    )


    image_count = sum(

        1

        for item
        in matches

        if (
            item.get(
                "match",
                False,
            )

            and

            item.get(
                "pc_product",
                {},
            ).get(
                "image_url",
                "",
            )
        )

    )


    print()

    print(
        "PRODUCT COUNT:",
        total,
    )


    print(
        "MATCHED:",
        matched,
    )


    print(
        "NOT MATCHED:",
        total - matched,
    )


    print(
        "IMAGES:",
        image_count,
    )


    for index, item in enumerate(
        matches,
        start=1,
    ):

        print()

        if item.get(
            "match",
            False,
        ):

            print(
                f"[{index}] ○ MATCH"
            )

        else:

            print(
                f"[{index}] × NOT MATCH"
            )


        print(
            "IDENTIFIER:",
            item.get(
                "identifier",
                "",
            ),
        )


        print(
            "SALE:",
            item.get(
                "sale_product",
                {},
            ).get(
                "name",
                "",
            ),
        )


        if item.get(
            "pc_product",
        ):

            print(
                "PCProduct:",
                item[
                    "pc_product"
                ].get(
                    "unique_id",
                    "",
                ),
            )


            print(
                "IMAGE:",
                item[
                    "pc_product"
                ].get(
                    "image_url",
                    "",
                ),
            )


    print()

    print(
        "OUTPUT:",
        output_path,
    )


    return output_path


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    import sys


    if len(sys.argv) != 2:

        raise SystemExit(
            "Usage: matcher.py <sale.json>"
        )


    run(
        sys.argv[1]
    )
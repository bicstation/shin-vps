#//home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/gmail/lenovo/lenovo_sale_product_matcher.py

import json
import re

from pathlib import Path

from django.core.exceptions import FieldError

from api.models import PCProduct


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

OUTPUT_DIR = BASE_DIR / "output"


# =========================================================
# SALE REALITY
# =========================================================

def resolve_sale_path():

    candidates = sorted(

        (
            path
            for path in OUTPUT_DIR.glob(
                "*/sale.json"
            )
            if path.is_file()
        ),

        key=lambda path:
            path.stat().st_mtime,

        reverse=True,

    )


    if not candidates:

        raise RuntimeError(
            "sale.json not found"
        )


    return candidates[0]


def load_sale(
    path,
):

    with open(
        path,
        encoding="utf-8",
    ) as f:

        return json.load(f)


# =========================================================
# LENOVO PRODUCT IDENTIFIER
# =========================================================

def extract_product_identifier(
    url,
):

    if not url:

        return ""


    match = re.search(
        r"/([0-9A-Za-z]+JP)(?:[/?#]|$)",
        url,
        flags=re.IGNORECASE,
    )


    if not match:

        return ""


    return match.group(1).lower()


# =========================================================
# PC PRODUCT MATCH
# =========================================================

def find_pc_product(
    identifier,
):

    if not identifier:

        return None


    try:

        product = (
            PCProduct.objects
            .filter(
                url__icontains=identifier
            )
            .first()
        )

    except FieldError as error:

        raise RuntimeError(
            "PCProduct.url field is unavailable"
        ) from error


    return product


# =========================================================
# MATCH PRODUCT
# =========================================================

def match_product(
    product,
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

    }


    return result


# =========================================================
# MATCH SALE
# =========================================================

def build_match_reality(
    sale,
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

        matches.append(
            match_product(
                product
            )
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
# PERSIST
# =========================================================

def persist_match_reality(
    sale_path,
    match_reality,
):

    output_path = (
        Path(sale_path).parent
        /
        "sale_product_matches.json"
    )


    with open(
        output_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            match_reality,
            f,
            ensure_ascii=False,
            indent=2,
        )


    return output_path


# =========================================================
# RUNTIME
# =========================================================

def run():

    print()

    print("=" * 80)

    print(
        "LENOVO SALE PRODUCT MATCHER"
    )

    print("=" * 80)


    # -----------------------------------------------------
    # SALE REALITY
    # -----------------------------------------------------

    sale_path = (
        resolve_sale_path()
    )


    print()

    print(
        "[1] SALE REALITY"
    )

    print(
        sale_path
    )


    sale = load_sale(
        sale_path
    )


    # -----------------------------------------------------
    # MATCH
    # -----------------------------------------------------

    print()

    print(
        "[2] PCProduct MATCH"
    )


    match_reality = (
        build_match_reality(
            sale
        )
    )


    # -----------------------------------------------------
    # RESULT
    # -----------------------------------------------------

    total = len(
        match_reality[
            "matches"
        ]
    )


    matched = sum(

        1

        for item
        in match_reality[
            "matches"
        ]

        if item["match"]

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


    for index, item in enumerate(

        match_reality[
            "matches"
        ],

        start=1,

    ):

        print()

        if item["match"]:

            print(
                f"[{index}] ○ MATCH"
            )

        else:

            print(
                f"[{index}] × NOT MATCH"
            )


        print(
            "SALE:",
            item[
                "sale_product"
            ][
                "name"
            ],
        )


        print(
            "IDENTIFIER:",
            item[
                "identifier"
            ],
        )


        if item["pc_product"]:

            print(
                "PCProduct:",
                item[
                    "pc_product"
                ][
                    "unique_id"
                ],
            )


    # -----------------------------------------------------
    # JSON
    # -----------------------------------------------------

    print()

    print(
        "[3] MATCH REALITY"
    )


    print(

        json.dumps(

            match_reality,

            ensure_ascii=False,

            indent=2,

        )

    )


    # -----------------------------------------------------
    # PERSIST
    # -----------------------------------------------------

    output_path = (
        persist_match_reality(
            sale_path,
            match_reality,
        )
    )


    print()

    print(
        "[4] PERSIST"
    )

    print(
        output_path
    )


    print()

    print("=" * 80)

    print(
        "LENOVO SALE PRODUCT MATCHER COMPLETE"
    )

    print("=" * 80)


    return match_reality


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    run()
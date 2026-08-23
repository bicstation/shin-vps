import json

from pathlib import Path


from django.acquisition.sources.scraping.gmail.lenovo._legacy.lenovo_mail_observer import (
    run as observe_mail,
)


from django.acquisition.sources.scraping.gmail.lenovo._legacy.lenovo_sale_parser import (
    build_sale_reality,
)


from django.acquisition.sources.scraping.gmail.lenovo._legacy.lenovo_sale_product_matcher import (
    build_match_reality,
)


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent


# =========================================================
# ACQUISITION RUNTIME
# =========================================================

def run():

    print()

    print("=" * 80)

    print(
        "LENOVO GMAIL ACQUISITION RUNTIME"
    )

    print("=" * 80)


    # =====================================================
    # 1. MAIL OBSERVATION
    # =====================================================

    print()

    print(
        "[1] MAIL OBSERVER"
    )


    observation_dir = (
        observe_mail()
    )


    observation_path = (
        Path(observation_dir)
        /
        "observation.json"
    )


    print(
        observation_path
    )


    with open(
        observation_path,
        encoding="utf-8",
    ) as f:

        observation = json.load(
            f
        )


    # =====================================================
    # 2. SALE PARSER
    # =====================================================

    print()

    print(
        "[2] SALE PARSER"
    )


    sale = build_sale_reality(
        observation
    )


    print(
        json.dumps(
            sale,
            ensure_ascii=False,
            indent=2,
        )
    )


    # =====================================================
    # 3. SALE PRODUCT MATCHER
    # =====================================================

    print()

    print(
        "[3] SALE PRODUCT MATCHER"
    )


    match_reality = (
        build_match_reality(
            sale
        )
    )


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


    # =====================================================
    # 4. PERSIST
    # =====================================================

    sale_output_path = (
        observation_path.parent
        /
        "sale.json"
    )


    with open(
        sale_output_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            sale,
            f,
            ensure_ascii=False,
            indent=2,
        )


    match_output_path = (
        observation_path.parent
        /
        "sale_product_matches.json"
    )


    with open(
        match_output_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            match_reality,
            f,
            ensure_ascii=False,
            indent=2,
        )


    print()

    print(
        "[4] PERSIST"
    )


    print(
        "SALE:",
        sale_output_path,
    )


    print(
        "MATCHES:",
        match_output_path,
    )


    print()

    print("=" * 80)

    print(
        "LENOVO GMAIL ACQUISITION COMPLETE"
    )

    print("=" * 80)


    return match_reality


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    run()
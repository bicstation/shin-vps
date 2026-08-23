#!/usr/bin/env python3

import json

from pathlib import Path


from .acquire import (
    build_service,
    search_target_mail,
    fetch_message,
)


from .observe import (
    save_observation,
)


from .parser import (
    build_sale_reality,
    persist_sale,
)


from .affiliate import (
    build_affiliate_reality,
)


from .matcher import (
    build_match_reality,
    apply_match_reality,
    persist_sale as persist_mapped_sale,
)


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
# LOAD
# =========================================================

def load_json(
    path: Path,
):

    with open(
        path,
        encoding="utf-8",
    ) as f:

        return json.load(
            f
        )


# =========================================================
# RUNTIME
# =========================================================

def main(
    *,
    force: bool = False,
):

    print()

    print("=" * 80)

    print(
        "LENOVO GMAIL ACQUISITION PIPELINE"
    )

    print("=" * 80)


    # =====================================================
    # 1. ACQUIRE
    # =====================================================

    print()

    print(
        "[1] ACQUIRE"
    )


    service = build_service()


    message = search_target_mail(
        service
    )


    raw = fetch_message(
        service,
        message[
            "id"
        ],
    )


    print()

    print(
        "MESSAGE:",
        message[
            "id"
        ],
    )


    # =====================================================
    # 2. OBSERVE
    # =====================================================

    print()

    print(
        "[2] OBSERVE"
    )


    observation_dir = (
        save_observation(
            message,
            raw,
        )
    )


    observation_path = (
        Path(
            observation_dir
        )
        /
        "observation.json"
    )


    print()

    print(
        "OBSERVATION:",
        observation_path,
    )


    # =====================================================
    # 3. PARSE
    # =====================================================

    print()

    print(
        "[3] PARSE"
    )


    observation = load_json(
        observation_path
    )


    sale = build_sale_reality(
        observation
    )


    print()

    print(
        "PRODUCTS:",
        len(
            sale.get(
                "products",
                [],
            )
        ),
    )


    # =====================================================
    # 4. AFFILIATE
    # =====================================================

    print()

    print(
        "[4] AFFILIATE"
    )


    sale = build_affiliate_reality(
        sale
    )


    sale_path = persist_sale(
        observation_path,
        sale,
    )


    affiliate_products = (
        sale.get(
            "products",
            [],
        )
    )


    affiliate_count = sum(

        1

        for product
        in affiliate_products

        if product.get(
            "affiliate_url",
            "",
        )

    )


    print()

    print(
        "PRODUCTS:",
        len(
            affiliate_products
        ),
    )


    print(
        "AFFILIATE:",
        affiliate_count,
    )


    print(
        "SALE:",
        sale_path,
    )


    # =====================================================
    # 5. MATCH
    # =====================================================

    print()

    print(
        "[5] MATCH"
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


    match_path = (
        persist_mapped_sale(
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


    matched_count = sum(

        1

        for item
        in matches

        if item.get(
            "match",
            False,
        )

    )


    print()

    print(
        "PRODUCTS:",
        len(matches),
    )


    print(
        "MATCHED:",
        matched_count,
    )


    print(
        "NOT MATCHED:",
        len(matches)
        -
        matched_count,
    )


    # =====================================================
    # 6. COMPLETE
    # =====================================================

    print()

    print("=" * 80)

    print(
        "LENOVO GMAIL ACQUISITION COMPLETE"
    )

    print("=" * 80)


    print()

    print(
        "OBSERVATION:",
        observation_path,
    )


    print(
        "SALE:",
        match_path,
    )


    return {

        "observation":
            observation_path,

        "sale":
            match_path,

        "products":
            len(matches),

        "matched":
            matched_count,

        "not_matched":
            len(matches)
            -
            matched_count,

    }


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    main()
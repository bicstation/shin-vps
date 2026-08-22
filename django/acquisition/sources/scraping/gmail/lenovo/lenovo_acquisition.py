import json

from pathlib import Path


from lenovo_mail_observer import (
    run as observe_mail,
)

from lenovo_sale_parser import (
    build_sale_reality,
)


from lenovo_url_resolver import (
    resolve_url,
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
    # 3. URL RESOLVER
    # =====================================================

    print()

    print(
        "[3] URL RESOLVER"
    )


    product_url = resolve_url(
        sale.get(
            "affiliate_url",
            "",
        )
    )


    sale["product_url"] = (
        product_url
    )


    print(
        product_url
    )



    # =====================================================
    # 4. PERSIST
    # =====================================================

    output_path = (
        observation_path.parent
        /
        "sale.json"
    )


    with open(
        output_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            sale,
            f,
            ensure_ascii=False,
            indent=2,
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
        "LENOVO GMAIL ACQUISITION COMPLETE"
    )

    print("=" * 80)



    return sale



if __name__ == "__main__":

    run()
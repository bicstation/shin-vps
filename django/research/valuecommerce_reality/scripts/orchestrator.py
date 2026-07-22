# =========================================================
# FILE:
# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/orchestrator.py
# =========================================================

from __future__ import annotations

from exporter import export_json
from fetch_products import fetch_products
from formatter import print_summary
from mapper import map_products
from observe import observe
from validator import validate
from api.services.feed.services.vc_import_service import (
    ValueCommerceImportService,
)

RAW_FILENAME = "thinkpad.json"
OBSERVATION_FILENAME = "thinkpad_observation.json"
MAPPING_FILENAME = "thinkpad_mapping.json"


def run(
    keyword: str = "ThinkPad",
    maker: str = "Lenovo",
    page: int = 1,
) -> None:
    """
    Execute the ValueCommerce Reality Research pipeline.
    """

    #
    # Phase 1
    # Fetch Reality
    #

    raw = fetch_products(
        keyword=keyword,
        page=page,
    )

    export_json(
        data=raw,
        directory="raw",
        filename=RAW_FILENAME,
    )

    #
    # Phase 2
    # Observe Reality
    #

    observation = observe(raw)

    export_json(
        data=observation,
        directory="observation",
        filename=OBSERVATION_FILENAME,
    )

    #
    # Phase 3
    # Validate Observation
    #

    valid, errors = validate(observation)

    if not valid:

        print("Validation failed")

        for error in errors:
            print(f"- {error}")

        return

    #
    # Phase 4
    # Identity Mapping
    #

    mapped_products = map_products(
        products=raw.get("items", []),
        maker=maker,
    )

    export_json(
        data=mapped_products,
        directory="mapping",
        filename=MAPPING_FILENAME,
    )
    
    #
    # Phase 5
    # Import PCProduct
    #

    service = ValueCommerceImportService()

    for contract in mapped_products:

        service.import_contract(
            contract,
        )

    #
    # Summary
    #

    print_summary(
        source="ValueCommerce ProductDB",
        product_count=len(mapped_products),
        filename=RAW_FILENAME,
    )

    print()
    print("Reality Research completed.")


if __name__ == "__main__":
    run()
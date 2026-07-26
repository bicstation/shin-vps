#!/usr/bin/env python3
"""
mapper.py

GEEKOM Mapper Runtime

ObservationDocument
        │
        ▼
Import Contract
        │
        ▼
ImportDocument

Reality First
Observation First
Translation Authority
"""

from __future__ import annotations

from api.models import (
    ObservationDocument,
    ImportDocument,
)


# ==========================================================
# Mapper
# ==========================================================

def map_observation(observation: dict) -> dict:

    images = observation.get("images", [])

    return {

        #
        # Source
        #

        "site": "GEEKOM",

        #
        # Product
        #

        "product_name": observation.get(
            "title",
            "",
        ),

        "product_url": observation.get(
            "url",
            "",
        ),

        "description": observation.get(
            "description",
            "",
        ),

        #
        # Media
        #

        "image_url": observation.get(
            "main_image",
            "",
        ),

        "images": images,

        #
        # Reality
        #

        "tables": observation.get(
            "tables",
            [],
        ),

        #
        # Observation
        #

        "observation": observation,

    }


# ==========================================================
# Runtime
# ==========================================================

def run():

    print("=" * 60)
    print("🗺️ GEEKOM MAPPER")
    print("=" * 60)

    documents = ObservationDocument.objects.filter(
        source_name="geekom",
        document_type="product",
    ).iterator()

    success = 0

    for document in documents:

        contract = map_observation(
            document.observation,
        )

        ImportDocument.objects.update_or_create(
            source_name=document.source_name,
            document_type=document.document_type,
            document_key=document.document_key,
            defaults={
                "contract": contract,
            },
        )

        success += 1

        print(f"✓ {document.document_key}")

    print("=" * 60)
    print(f"SUCCESS : {success}")
    print("=" * 60)


def main():

    run()


if __name__ == "__main__":
    main()
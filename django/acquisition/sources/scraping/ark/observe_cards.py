#!/usr/bin/env python3
"""
==============================================================================
SHIN CORE LINX

ARK Card Observation

Observation Runtime

AcquisitionDocument (cards)
        │
        ▼
Card HTML
        │
        ▼
Observation Runtime

Reality First
Observation First

Responsibilities

- Observe Published Product Cards
- Observe Published Reality
- Produce Observation Runtime

Not Responsibilities

- Formatter
- Mapper
- Semantic Runtime
- AI Runtime
- Product Integration

==============================================================================
"""

from __future__ import annotations

import json

from bs4 import BeautifulSoup

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)

from .settings import (
    SITE_NAME,
)


# ==============================================================================
# Runtime
# ==============================================================================

DOCUMENT_INPUT = "cards"

DOCUMENT_OUTPUT = "observation"


# ==============================================================================
# HTML Helper
# ==============================================================================

def select_text(
    soup: BeautifulSoup,
    selector: str,
) -> str:
    """
    Return text from the first matched element.
    """

    element = soup.select_one(
        selector,
    )

    if element is None:
        return ""

    return element.get_text(
        " ",
        strip=True,
    )


def select_attr(
    soup: BeautifulSoup,
    selector: str,
    attribute: str,
) -> str:
    """
    Return attribute from the first matched element.
    """

    element = soup.select_one(
        selector,
    )

    if element is None:
        return ""

    return element.get(
        attribute,
        "",
    )

# ==============================================================================
# Image Observation
# ==============================================================================

def observe_image(
    soup: BeautifulSoup,
) -> dict:
    """
    Observe product image reality.
    """

    # -------------------------------------------------------------------------
    # Detail URL
    # -------------------------------------------------------------------------

    raw_detail_url = select_attr(

        soup,

        ".parent_img a",

        "href",

    )

    #
    # Fallback
    #

    if not raw_detail_url:

        raw_detail_url = select_attr(

            soup,

            ".area-custom-btn a",

            "href",

        )

    # -------------------------------------------------------------------------
    # Image
    # -------------------------------------------------------------------------

    raw_image = (

        select_attr(

            soup,

            ".parent_img img",

            "data-src",

        )

        or

        select_attr(

            soup,

            ".parent_img img",

            "src",

        )

    )

    raw_image_alt = select_attr(

        soup,

        ".parent_img img",

        "alt",

    )

    # -------------------------------------------------------------------------
    # Product ID
    # -------------------------------------------------------------------------

    raw_pc_id = ""

    if raw_detail_url:

        if "pc_id=" in raw_detail_url:

            raw_pc_id = (

                raw_detail_url

                .split(

                    "pc_id=",

                    1,

                )[1]

                .split(

                    "&",

                    1,

                )[0]

            )

    # -------------------------------------------------------------------------
    # Runtime
    # -------------------------------------------------------------------------

    return {

        "raw_detail_url": raw_detail_url,

        "raw_pc_id": raw_pc_id,

        "raw_image": raw_image,

        "raw_image_alt": raw_image_alt,

    }

# ==============================================================================
# Title Observation
# ==============================================================================

def observe_title(
    soup: BeautifulSoup,
) -> dict:
    """
    Observe product title reality.
    """

    raw_category = ""

    raw_product_name = ""

    raw_model = ""

    title = soup.select_one(

        "h1.h4",

    )

    if title is None:

        return {

            "raw_category": raw_category,

            "raw_product_name": raw_product_name,

            "raw_model": raw_model,

        }

    paragraphs = title.select(

        "p",

    )

    # -------------------------------------------------------------------------
    # Category
    # -------------------------------------------------------------------------

    if len(

        paragraphs,

    ) >= 1:

        raw_category = paragraphs[0].get_text(

            " ",

            strip=True,

        )

    # -------------------------------------------------------------------------
    # Product Name
    # -------------------------------------------------------------------------

    if len(

        paragraphs,

    ) >= 2:

        raw_product_name = paragraphs[1].get_text(

            " ",

            strip=True,

        )

    # -------------------------------------------------------------------------
    # Model
    # -------------------------------------------------------------------------

    if len(

        paragraphs,

    ) >= 3:

        raw_model = paragraphs[2].get_text(

            " ",

            strip=True,

        )

    # -------------------------------------------------------------------------
    # Runtime
    # -------------------------------------------------------------------------

    return {

        "raw_category": raw_category,

        "raw_product_name": raw_product_name,

        "raw_model": raw_model,

    }

# ==============================================================================
# Description Observation
# ==============================================================================

def observe_description(
    soup: BeautifulSoup,
) -> dict:
    """
    Observe product description reality.
    """

    raw_description = select_text(

        soup,

        ".line_h_0 p",

    )

    # -------------------------------------------------------------------------
    # Runtime
    # -------------------------------------------------------------------------

    return {

        "raw_description": raw_description,

    }

# ==============================================================================
# Product Information Observation
# ==============================================================================

def observe_product_information(
    soup: BeautifulSoup,
) -> dict:
    """
    Observe product identity reality.
    """

    raw_product_no = ""

    raw_model = ""

    for small in soup.select(

        ".text-right small",

    ):

        value = small.get_text(

            " ",

            strip=True,

        )

        # ---------------------------------------------------------------------
        # Product Number
        # ---------------------------------------------------------------------

        if value.startswith(

            "商品番号:",

        ):

            raw_product_no = (

                value

                .replace(

                    "商品番号:",

                    "",

                )

                .strip()

            )

        # ---------------------------------------------------------------------
        # Model
        # ---------------------------------------------------------------------

        elif value.startswith(

            "型番:",

        ):

            raw_model = (

                value

                .replace(

                    "型番:",

                    "",

                )

                .strip()

            )

    # -------------------------------------------------------------------------
    # Runtime
    # -------------------------------------------------------------------------

    return {

        "raw_product_no": raw_product_no,

        "raw_model": raw_model,

    }

# ==============================================================================
# Commerce Observation
# ==============================================================================

def observe_commerce(
    soup: BeautifulSoup,
) -> dict:
    """
    Observe commerce reality.
    """

    # -------------------------------------------------------------------------
    # Price
    # -------------------------------------------------------------------------

    raw_price = select_text(

        soup,

        '[itemprop="price"]',

    )

    # -------------------------------------------------------------------------
    # Release Date
    # -------------------------------------------------------------------------

    raw_release_date = ""

    for small in soup.select(

        "table.table-condensed small",

    ):

        value = small.get_text(

            " ",

            strip=True,

        )

        if value.startswith(

            "リリース:",

        ):

            raw_release_date = (

                value

                .replace(

                    "リリース:",

                    "",

                )

                .strip()

            )

            break

    # -------------------------------------------------------------------------
    # Runtime
    # -------------------------------------------------------------------------

    return {

        "raw_price": raw_price,

        "raw_release_date": raw_release_date,

    }

# ==============================================================================
# Specifications Observation
# ==============================================================================

def observe_specifications(
    soup: BeautifulSoup,
) -> dict:
    """
    Observe specification table reality.
    """

    raw_specs = {}

    rows = soup.select(

        "table.table-condensed tr",

    )

    for row in rows:

        columns = row.find_all(

            "td",

        )

        #
        # Skip invalid rows
        #

        if len(

            columns,

        ) != 2:

            continue

        key = columns[0].get_text(

            " ",

            strip=True,

        )

        value = columns[1].get_text(

            " ",

            strip=True,

        )

        if not key:

            continue

        raw_specs[key] = value

    # -------------------------------------------------------------------------
    # Runtime
    # -------------------------------------------------------------------------

    return {

        "raw_specs": raw_specs,

    }

# ==============================================================================
# Card Observation
# ==============================================================================

def observe_card(
    *,
    document_key: str,
    card_html: str,
) -> dict:
    """
    Observe product card reality.
    """

    soup = BeautifulSoup(

        card_html,

        "html.parser",

    )

    # -------------------------------------------------------------------------
    # Observation
    # -------------------------------------------------------------------------

    image = observe_image(

        soup,

    )

    title = observe_title(

        soup,

    )

    description = observe_description(

        soup,

    )

    product = observe_product_information(

        soup,

    )

    commerce = observe_commerce(

        soup,

    )

    specifications = observe_specifications(

        soup,

    )

    # -------------------------------------------------------------------------
    # Runtime
    # -------------------------------------------------------------------------

    observation = {

        #
        # Runtime
        #

        "document_key": document_key,

        #
        # Category
        #

        "category": "",

        #
        # Product
        #

        "raw_category": title.get(

            "raw_category",

            "",

        ),

        "raw_product_name": title.get(

            "raw_product_name",

            "",

        ),

        #
        # h1 を優先
        #

        "raw_model": (

            title.get(

                "raw_model",

                "",

            )

            or

            product.get(

                "raw_model",

                "",

            )

        ),

        #
        # Description
        #

        "raw_description": description.get(

            "raw_description",

            "",

        ),

        #
        # Identity
        #

        "raw_product_no": product.get(

            "raw_product_no",

            "",

        ),

        "raw_pc_id": image.get(

            "raw_pc_id",

            "",

        ),

        #
        # Commerce
        #

        "raw_price": commerce.get(

            "raw_price",

            "",

        ),

        "raw_release_date": commerce.get(

            "raw_release_date",

            "",

        ),

        #
        # Media
        #

        "raw_image": image.get(

            "raw_image",

            "",

        ),

        "raw_image_alt": image.get(

            "raw_image_alt",

            "",

        ),

        "raw_detail_url": image.get(

            "raw_detail_url",

            "",

        ),

        #
        # Specifications
        #

        "raw_specs": specifications.get(

            "raw_specs",

            {},

        ),

        #
        # Reality
        #

        "raw_html": card_html,

    }

    return observation

# ==============================================================================
# Cache
# ==============================================================================

def exists(
    document_key: str,
) -> bool:

    return AcquisitionDocument.objects.filter(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

    ).exists()


# ==============================================================================
# Persistence
# ==============================================================================

def save_observation(
    *,
    document_key: str,
    runtime: dict,
):

    document, created = AcquisitionDocument.objects.update_or_create(

        source_type="scraping",

        source_name=SITE_NAME.lower(),

        document_type=DOCUMENT_OUTPUT,

        document_key=document_key,

        defaults={

            "content_type": "application/json",

            "content": json.dumps(

                runtime,

                ensure_ascii=False,

                indent=2,

            ),

        },

    )

    return document, created

# ==============================================================================
# Runtime
# ==============================================================================

def observe(
    *,
    force: bool = False,
) -> None:

    trace_pipeline(

        "CARD OBSERVATION",

    )

    print("=" * 70)

    print(

        f"👀 {SITE_NAME} CARD OBSERVATION"

    )

    print("=" * 70)

    documents = (

        AcquisitionDocument.objects

        .filter(

            source_type="scraping",

            source_name=SITE_NAME.lower(),

            document_type=DOCUMENT_INPUT,

        )

        .order_by(

            "document_key",

        )

    )

    success: list[str] = []

    failed: list[tuple[str, str]] = []

    for document in documents:

        document_key = document.document_key

        if (

            not force

            and

            exists(

                document_key,

            )

        ):

            success.append(

                document_key,

            )

            print(

                f"[CACHE] {document_key}"

            )

            continue

        print(

            document_key,

        )

        try:

            runtime = json.loads(

                document.content,

            )

            observations = []

            for card in runtime.get(

                "cards",

                [],

            ):

                observations.append(

                    observe_card(

                        document_key=document_key,

                        card_html=card["html"],

                    )

                )

            payload = {

                "document_key": document_key,

                "products": observations,

            }

            _, created = save_observation(

                document_key=document_key,

                runtime=payload,

            )

            success.append(

                document_key,

            )

            print(

                f"  Products : {len(observations)}"

            )

            print(

                f"  Saved : {'CREATED' if created else 'UPDATED'}"

            )

        except Exception as e:

            failed.append(

                (

                    document_key,

                    str(e),

                )

            )

            print(

                "  Status : ERROR"

            )

            print(

                f"  Reason : {e}"

            )

        print()

    print("=" * 70)

    print("RESULT")

    print("=" * 70)

    print(

        f"SUCCESS : {len(success)}"

    )

    print(

        f"FAILED  : {len(failed)}"

    )

    print("=" * 70)


# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    *,
    method: str = "default",
    mid: str | None = None,
    list_only: bool = False,
    force: bool = False,
) -> None:

    observe(

        force=force,

    )


if __name__ == "__main__":

    main()

# ==============================================================================
# Validation
# ==============================================================================

def validate_observation(
    observation: dict,
) -> None:
    """
    Validate observation runtime.
    """

    required = (

        "raw_product_name",

        "raw_detail_url",

        "raw_image",

    )

    for key in required:

        if not observation.get(

            key,

        ):

            print(

                f"⚠ Missing : {key}"

            )
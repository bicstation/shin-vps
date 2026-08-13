#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/geekom/discover_product.py

SHIN CORE LINX

Geekom Product Discovery Runtime

Collection Reality
        ↓
Product Card Reality
        ↓
Product Identity / Display Reality
        ↓
Product URL Discovery
        ↓
Product Reality Synchronization
        ↓
AcquisitionDocument

Responsibilities

- Load Collection AcquisitionDocument
- Discover Product Cards
- Discover Product URLs
- Observe Product Card Identity
- Observe Product Card Title
- Observe Product Card Image
- Observe Product Card Price
- Observe Product Card Compare-at Price
- Observe Product Card Badge
- Normalize observed card values
- Preserve Product Card Reality
- Synchronize Product Discovery Reality
- Register Product Discovery Reality
- Preserve existing Product Acquisition Reality

NOT

- HTTP Acquisition
- Product HTML Fetch
- Product Page Observation
- Description Extraction
- Specification Extraction
- SKU Extraction
- Mapping
- Integration
- Semantic Processing

Reality First
Observation First
Discovery Does Not Destroy Acquisition Reality
"""

from __future__ import annotations

import json
import re

from urllib.parse import (
    urljoin,
    urlparse,
)

from bs4 import BeautifulSoup

from api.models.acquisition_document import (
    AcquisitionDocument,
)

from .settings import (
    BASE_URL,
    SITE_NAME,
)


# ==========================================================
# Document Types
# ==========================================================

PRODUCT_DOCUMENT_TYPE = "product"

PRODUCT_DISCOVERY_DOCUMENT_TYPE = (
    "product_discovery"
)


# ==========================================================
# Collection Reality
# ==========================================================

def load_collections() -> list[dict[str, str]]:
    """
    Load Collection AcquisitionDocuments.

    No TSV is used.

    Collection Reality is already preserved
    by fetch_collection.py.
    """

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_type="scraping",
            source_name=SITE_NAME,
            document_type="collection",
        )
        .exclude(
            content="",
        )
        .order_by(
            "document_key",
        )
    )

    return [
        {
            "slug": document.document_key,
            "url": document.source_url,
            "content": document.content,
        }
        for document in documents
    ]


# ==========================================================
# Product URL
# ==========================================================

def normalize_product_url(
    href: str,
) -> str:
    """
    Normalize Product URL.

    Supports:

        /products/...
        /collections/.../products/...

    Query strings and fragments are removed.
    """

    href = (
        href
        .strip()
        .split("?")[0]
        .split("#")[0]
    )

    if not href:
        return ""

    url = urljoin(
        BASE_URL,
        href,
    )

    parsed = urlparse(
        url,
    )

    if (
        not parsed.path.startswith(
            "/products/"
        )
        and "/products/" not in parsed.path
    ):
        return ""

    return url


# ==========================================================
# Product Slug
# ==========================================================

def extract_product_slug(
    url: str,
) -> str:
    """
    Extract Product slug from Product URL.
    """

    path = (
        urlparse(url)
        .path
        .rstrip("/")
    )

    marker = "/products/"

    if marker not in path:
        return ""

    slug = (
        path.split(
            marker,
            1,
        )[1]
        .split(
            "/",
            1,
        )[0]
        .strip()
    )

    return slug


# ==========================================================
# Text Normalization
# ==========================================================

def normalize_text(
    value: str,
) -> str:
    """
    Normalize visible card text.

    This does not interpret meaning.

    It only removes surrounding whitespace
    and collapses repeated whitespace.
    """

    if not value:
        return ""

    return " ".join(
        value.split()
    )


# ==========================================================
# Price Normalization
# ==========================================================

def normalize_price(
    value: str,
) -> int | None:
    """
    Normalize an observed price to integer JPY.

    Examples:

        ¥87,999から
            ↓
        87999

        ¥109,999
            ↓
        109999

    No calculation.
    No price selection.
    No price interpretation.

    The value is only converted from
    displayed currency text to a numeric
    JPY representation.
    """

    if not value:
        return None

    text = normalize_text(
        value,
    )

    match = re.search(
        r"[¥￥]\s*([\d,]+)",
        text,
    )

    if not match:
        return None

    number = (
        match.group(1)
        .replace(",", "")
    )

    try:

        return int(number)

    except ValueError:

        return None


# ==========================================================
# Card Image
# ==========================================================

def normalize_image_url(
    src: str,
) -> str:
    """
    Normalize Product Card image URL.

    Shopify cards may provide:

        //geekom.jp/...

    Convert it to:

        https://geekom.jp/...
    """

    if not src:
        return ""

    src = src.strip()

    if src.startswith("//"):

        return (
            "https:"
            + src
        )

    return urljoin(
        BASE_URL,
        src,
    )


# ==========================================================
# Product Card Observation
# ==========================================================

def observe_product_card(
    card,
) -> dict[str, object]:
    """
    Observe Product Card Reality.

    This Runtime does not generate
    semantic meaning.

    It only preserves what the card
    explicitly exposes.

    Observed:

        - handle
        - url
        - title
        - image
        - price
        - compare_at_price
        - badge
    """

    # ======================================================
    # Handle
    # ======================================================

    handle = normalize_text(
        card.get(
            "handle",
            "",
        )
    )

    # ======================================================
    # Product URL
    # ======================================================

    link = card.select_one(
        'a[href*="/products/"]'
    )

    href = ""

    if link:

        href = link.get(
            "href",
            "",
        )

    url = normalize_product_url(
        href,
    )

    # ======================================================
    # Title
    # ======================================================

    title_node = card.select_one(
        ".product-card__title a"
    )

    if not title_node:

        title_node = card.select_one(
            ".product-card__title"
        )

    title = (
        normalize_text(
            title_node.get_text(
                " ",
                strip=True,
            )
        )
        if title_node
        else ""
    )

    # ======================================================
    # Primary Image
    # ======================================================

    image_node = card.select_one(
        ".product-card__image--primary"
    )

    if not image_node:

        image_node = card.select_one(
            "img"
        )

    image = ""

    if image_node:

        image = normalize_image_url(
            image_node.get(
                "src",
                "",
            )
        )

        # --------------------------------------------------
        # Prefer srcset first URL when src is absent
        # --------------------------------------------------

        if not image:

            srcset = image_node.get(
                "srcset",
                "",
            )

            if srcset:

                first = (
                    srcset
                    .split(",")[0]
                    .strip()
                    .split(" ")[0]
                )

                image = normalize_image_url(
                    first
                )

    # ======================================================
    # Sale Price
    # ======================================================

    sale_price_node = card.select_one(
        "sale-price"
    )

    sale_price_text = ""

    if sale_price_node:

        sale_price_text = normalize_text(
            sale_price_node.get_text(
                " ",
                strip=True,
            )
        )

    sale_price = normalize_price(
        sale_price_text,
    )

    # ======================================================
    # Compare-at Price
    # ======================================================

    compare_node = card.select_one(
        "compare-at-price"
    )

    compare_price_text = ""

    if compare_node:

        compare_price_text = normalize_text(
            compare_node.get_text(
                " ",
                strip=True,
            )
        )

    compare_at_price = normalize_price(
        compare_price_text,
    )

    # ======================================================
    # Badge
    # ======================================================

    badge_node = card.select_one(
        ".product-card__badge-list .badge"
    )

    badge = (
        normalize_text(
            badge_node.get_text(
                " ",
                strip=True,
            )
        )
        if badge_node
        else ""
    )

    # ======================================================
    # Return Card Reality
    # ======================================================

    return {
        "handle": handle,
        "url": url,
        "title": title,
        "image": image,
        "price": sale_price,
        "compare_at_price": compare_at_price,
        "badge": badge,
    }


# ==========================================================
# Product Discovery
# ==========================================================

def discover_products(
    html: str,
) -> tuple[
    int,
    dict[str, dict[str, object]],
]:
    """
    Discover Product Card Reality.

    Returns:

        (
            card_count,
            products,
        )

    Each Product contains the Reality
    explicitly exposed by the Product Card.

    No semantic classification is performed.
    """

    if not html:

        return (
            0,
            {},
        )

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    products: dict[
        str,
        dict[str, object],
    ] = {}

    # ======================================================
    # Product Cards
    # ======================================================

    cards = soup.find_all(
        "product-card",
    )

    card_count = len(
        cards,
    )

    # ======================================================
    # Product Card Loop
    # ======================================================

    for card in cards:

        observed = observe_product_card(
            card,
        )

        url = observed[
            "url"
        ]

        if not url:

            continue

        slug = extract_product_slug(
            str(url),
        )

        if not slug:

            continue

        observed[
            "slug"
        ] = slug

        # --------------------------------------------------
        # Preserve First Product Reality
        # --------------------------------------------------

        products.setdefault(
            slug,
            observed,
        )

    return (
        card_count,
        products,
    )


# ==========================================================
# Product Acquisition Document
# ==========================================================

def save_product(
    *,
    slug: str,
    url: str,
) -> None:
    """
    Register discovered Product as
    AcquisitionDocument.

    Product HTML is NOT fetched here.

    Discovery Runtime owns:

        - Product existence
        - Product URL

    Fetch Runtime owns:

        - Product HTML
        - Product Acquisition Reality

    IMPORTANT:

    Existing Product HTML must NEVER be
    overwritten by Product Discovery.
    """

    document, created = (
        AcquisitionDocument.objects
        .get_or_create(
            source_type="scraping",
            source_name=SITE_NAME,
            document_type=PRODUCT_DOCUMENT_TYPE,
            document_key=slug,
            defaults={
                "source_url": url,
                "content_type": "text/html",
                "content": "",
            },
        )
    )

    # ------------------------------------------------------
    # New Product
    # ------------------------------------------------------

    if created:

        return

    # ------------------------------------------------------
    # Existing Product
    #
    # Product HTML must survive Discovery.
    # ------------------------------------------------------

    update_fields = []

    if document.source_url != url:

        document.source_url = url

        update_fields.append(
            "source_url"
        )

    if not document.content_type:

        document.content_type = (
            "text/html"
        )

        update_fields.append(
            "content_type"
        )

    if update_fields:

        document.save(
            update_fields=update_fields,
        )


# ==========================================================
# Product Discovery Reality Document
# ==========================================================

def save_product_discovery(
    *,
    product: dict[str, object],
) -> None:
    """
    Preserve Product Card Reality.

    This Document is separate from the
    Product HTML AcquisitionDocument.

    Product Discovery Reality contains:

        - handle
        - slug
        - url
        - title
        - image
        - price
        - compare_at_price
        - badge

    The content is serialized JSON.

    No semantic interpretation is performed.
    """

    slug = str(
        product.get(
            "slug",
            "",
        )
    )

    if not slug:

        return

    url = str(
        product.get(
            "url",
            "",
        )
    )

    content = json.dumps(
        product,
        ensure_ascii=False,
        separators=(
            ",",
            ":",
        ),
    )

    AcquisitionDocument.objects.update_or_create(
        source_type="scraping",
        source_name=SITE_NAME,
        document_type=PRODUCT_DISCOVERY_DOCUMENT_TYPE,
        document_key=slug,
        defaults={
            "source_url": url,
            "content_type": "application/json",
            "content": content,
        },
    )


# ==========================================================
# Product Reality Synchronization
# ==========================================================

def synchronize_products(
    products: dict[str, dict[str, object]],
) -> None:
    """
    Synchronize Product Discovery Reality.

    The current Discovery result is treated
    as the authoritative Product URL set
    for this source.

    Products no longer discovered are removed
    from both Product and Product Discovery
    AcquisitionDocuments.

    Existing Product HTML is preserved.
    """

    discovered_slugs = {
        str(
            product["slug"]
        )
        for product in products.values()
    }

    # ======================================================
    # Existing Product Documents
    # ======================================================

    existing_products = (
        AcquisitionDocument.objects
        .filter(
            source_type="scraping",
            source_name=SITE_NAME,
            document_type=PRODUCT_DOCUMENT_TYPE,
        )
    )

    # ======================================================
    # Remove Stale Product Reality
    # ======================================================

    stale_products = (
        existing_products.exclude(
            document_key__in=discovered_slugs,
        )
    )

    stale_product_count = (
        stale_products.count()
    )

    if stale_product_count:

        print(
            f"🧹 STALE PRODUCTS : "
            f"{stale_product_count}"
        )

        for document in stale_products.order_by(
            "document_key",
        ):

            print(
                f"  DELETE : "
                f"{document.document_key}"
            )

        stale_products.delete()

    else:

        print(
            "🧹 STALE PRODUCTS : 0"
        )

    # ======================================================
    # Existing Product Discovery Documents
    # ======================================================

    existing_discovery = (
        AcquisitionDocument.objects
        .filter(
            source_type="scraping",
            source_name=SITE_NAME,
            document_type=(
                PRODUCT_DISCOVERY_DOCUMENT_TYPE
            ),
        )
    )

    # ======================================================
    # Remove Stale Discovery Reality
    # ======================================================

    stale_discovery = (
        existing_discovery.exclude(
            document_key__in=discovered_slugs,
        )
    )

    stale_discovery_count = (
        stale_discovery.count()
    )

    if stale_discovery_count:

        print(
            f"🧹 STALE DISCOVERY : "
            f"{stale_discovery_count}"
        )

        for document in stale_discovery.order_by(
            "document_key",
        ):

            print(
                f"  DELETE : "
                f"{document.document_key}"
            )

        stale_discovery.delete()

    else:

        print(
            "🧹 STALE DISCOVERY : 0"
        )

    # ======================================================
    # Register Current Product Reality
    # ======================================================

    for product in sorted(
        products.values(),
        key=lambda row: str(
            row["slug"]
        ),
    ):

        slug = str(
            product["slug"]
        )

        url = str(
            product["url"]
        )

        # --------------------------------------------------
        # Product Acquisition Document
        # --------------------------------------------------

        save_product(
            slug=slug,
            url=url,
        )

        # --------------------------------------------------
        # Product Discovery Reality
        # --------------------------------------------------

        save_product_discovery(
            product=product,
        )


# ==========================================================
# Product Card Reality Display
# ==========================================================

def print_product_reality(
    products: dict[str, dict[str, object]],
) -> None:
    """
    Display observed Product Card Reality.

    This is diagnostic output only.

    No semantic classification is performed.
    """

    print()

    print(
        "=" * 70
    )

    print(
        "👁️ PRODUCT CARD REALITY"
    )

    print(
        "=" * 70
    )

    for product in sorted(
        products.values(),
        key=lambda row: str(
            row["slug"]
        ),
    ):

        print()

        print(
            f"[{product['slug']}]"
        )

        print(
            f"  handle            : "
            f"{product['handle']}"
        )

        print(
            f"  title             : "
            f"{product['title']}"
        )

        print(
            f"  url               : "
            f"{product['url']}"
        )

        print(
            f"  image             : "
            f"{product['image']}"
        )

        print(
            f"  price             : "
            f"{product['price']}"
        )

        print(
            f"  compare_at_price  : "
            f"{product['compare_at_price']}"
        )

        print(
            f"  badge             : "
            f"{product['badge']}"
        )


# ==========================================================
# Runtime
# ==========================================================

def main() -> None:
    """
    Execute Geekom Product Discovery Runtime.

    Collection Document
            ↓
        HTML Reality
            ↓
      Product Cards
            ↓
    Card Reality Observation
            ↓
    Product Discovery Reality
            ↓
    ┌──────────────────────────────┐
    │ Product Discovery Document  │
    │                              │
    │ handle                       │
    │ slug                         │
    │ url                          │
    │ title                        │
    │ image                        │
    │ price                        │
    │ compare_at_price             │
    │ badge                        │
    └──────────────────────────────┘
            ↓
    Product AcquisitionDocument
            ↓
       Product Fetch Runtime

    Existing Product HTML
    is preserved.
    """

    print(
        "=" * 60
    )

    print(
        "🔎 GEEKOM PRODUCT DISCOVERY"
    )

    print(
        "=" * 60
    )

    collections = load_collections()

    print(
        f"Target : "
        f"{len(collections)} Collections"
    )

    print(
        "=" * 60
    )

    products: dict[
        str,
        dict[str, object],
    ] = {}

    total_cards = 0

    # ======================================================
    # Collection Loop
    # ======================================================

    for index, collection in enumerate(
        collections,
        start=1,
    ):

        collection_slug = collection[
            "slug"
        ]

        collection_url = collection[
            "url"
        ]

        html = collection[
            "content"
        ]

        print(
            f"[{index}/{len(collections)}] "
            f"{collection_slug}"
        )

        print(
            f"  URL : "
            f"{collection_url}"
        )

        if not html:

            print(
                "  ❌ Collection HTML is empty"
            )

            continue

        # --------------------------------------------------
        # Product Card Discovery
        # --------------------------------------------------

        card_count, discovered = (
            discover_products(
                html,
            )
        )

        total_cards += card_count

        print(
            f"  Cards    : "
            f"{card_count}"
        )

        print(
            f"  Products : "
            f"{len(discovered)}"
        )

        # --------------------------------------------------
        # Merge
        # --------------------------------------------------

        for product in discovered.values():

            slug = str(
                product["slug"]
            )

            products.setdefault(
                slug,
                product,
            )

    # ======================================================
    # Product Discovery Reality
    # ======================================================

    print()

    print(
        "=" * 60
    )

    print(
        "💾 PRODUCT DISCOVERY REALITY"
    )

    print(
        "=" * 60
    )

    print(
        f"Cards discovered   : "
        f"{total_cards}"
    )

    print(
        f"Products discovered: "
        f"{len(products)}"
    )

    # ======================================================
    # Card Reality
    # ======================================================

    print_product_reality(
        products,
    )

    # ======================================================
    # Synchronization
    # ======================================================

    print()

    print(
        "=" * 60
    )

    print(
        "🔄 PRODUCT REALITY SYNCHRONIZATION"
    )

    print(
        "=" * 60
    )

    synchronize_products(
        products,
    )

    # ======================================================
    # Current Product Reality
    # ======================================================

    print()

    print(
        "=" * 60
    )

    print(
        "📦 CURRENT PRODUCT REALITY"
    )

    print(
        "=" * 60
    )

    for product in sorted(
        products.values(),
        key=lambda row: str(
            row["slug"]
        ),
    ):

        print(
            f"  {product['slug']}"
        )

    # ======================================================
    # Result
    # ======================================================

    print()

    print(
        "=" * 60
    )

    print(
        f"CARDS    : "
        f"{total_cards}"
    )

    print(
        f"PRODUCTS : "
        f"{len(products)}"
    )

    print(
        "📦 Product Storage"
        " : AcquisitionDocument"
    )

    print(
        "👁️ Card Reality"
        " : Product Discovery Document"
    )

    print(
        "=" * 60
    )


# ==========================================================
# Standalone Execution
# ==========================================================

if __name__ == "__main__":
    main()
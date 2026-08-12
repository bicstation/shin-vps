#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/gmktec/discover_product.py

SHIN CORE LINX

GMKtec Product Discovery Runtime

Collection Reality
        ↓
Product Card Reality
        ↓
Product URL Discovery
        ↓
Product Reality Synchronization
        ↓
AcquisitionDocument
document_type = "product"

Responsibilities

- Load Collection AcquisitionDocument
- Discover Product Cards
- Discover Product URLs from Product Cards
- Normalize Product URLs
- Synchronize Product Discovery Reality
- Register Product Discovery Reality

NOT

- HTTP Acquisition
- Product HTML Fetch
- Product Observation
- Product Name Extraction
- Price Extraction
- Image Extraction
- Specification Extraction
- Mapping
- Integration
- Semantic Processing

Reality First
Observation First
"""


from __future__ import annotations


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
        AcquisitionDocument.objects.filter(
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
# Product Discovery
# ==========================================================


def discover_products(
    html: str,
) -> tuple[
    int,
    dict[str, dict[str, str]],
]:
    """
    Discover Product URLs from Product Cards.

    Returns:

        (
            card_count,
            products,
        )

    This Runtime observes only Product Card Reality.

    It does NOT extract:

        - product name
        - price
        - image
        - description
        - specifications
        - SKU
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
        dict[str, str],
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
    # Product URL Discovery
    # ======================================================

    for card in cards:

        # --------------------------------------------------
        # Find Product URL inside this card
        # --------------------------------------------------

        link = card.select_one(
            'a[href*="/products/"]'
        )

        if not link:
            continue

        href = link.get(
            "href",
            "",
        )

        url = normalize_product_url(
            href,
        )

        if not url:
            continue

        # --------------------------------------------------
        # Product URL Reality
        # --------------------------------------------------

        slug = extract_product_slug(
            url,
        )

        if not slug:
            continue

        # --------------------------------------------------
        # Preserve First Observation
        # --------------------------------------------------

        products.setdefault(
            slug,
            {
                "slug": slug,
                "url": url,
            },
        )

    return (
        card_count,
        products,
    )


# ==========================================================
# Product Document
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

    The next Runtime is responsible
    for acquiring Product HTML.
    """

    AcquisitionDocument.objects.update_or_create(
        source_type="scraping",
        source_name=SITE_NAME,
        document_type="product",
        document_key=slug,
        defaults={
            "source_url": url,
            "content_type": "text/html",
            "content": "",
        },
    )


# ==========================================================
# Product Reality Synchronization
# ==========================================================


def synchronize_products(
    products: dict[str, dict[str, str]],
) -> None:
    """
    Synchronize Product Discovery Reality.

    The current Discovery result is treated
    as the authoritative Product URL set
    for this source.

    Products no longer discovered are removed
    from AcquisitionDocument.

    Product HTML is not fetched here.
    """

    discovered_slugs = {
        product["slug"]
        for product in products.values()
    }

    existing = AcquisitionDocument.objects.filter(
        source_type="scraping",
        source_name=SITE_NAME,
        document_type="product",
    )

    # ======================================================
    # Remove Stale Product Reality
    # ======================================================

    stale = existing.exclude(
        document_key__in=discovered_slugs,
    )

    stale_count = stale.count()

    if stale_count:

        print(
            f"🧹 STALE PRODUCTS : "
            f"{stale_count}"
        )

        for document in stale.order_by(
            "document_key",
        ):

            print(
                f"  DELETE : "
                f"{document.document_key}"
            )

        stale.delete()

    else:

        print(
            "🧹 STALE PRODUCTS : 0"
        )

    # ======================================================
    # Register Current Product Reality
    # ======================================================

    for product in sorted(
        products.values(),
        key=lambda row: row["slug"],
    ):

        save_product(
            slug=product["slug"],
            url=product["url"],
        )


# ==========================================================
# Runtime
# ==========================================================


def main() -> None:
    """
    Execute GMKtec Product Discovery Runtime.

    Collection Document
            ↓
        HTML Reality
            ↓
      Product Cards
            ↓
        Product URL
            ↓
    Reality Synchronization
            ↓
      Product Document
    """

    print(
        "=" * 60
    )

    print(
        "🔎 GMKTEC PRODUCT DISCOVERY"
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
        dict[str, str],
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

            products.setdefault(
                product["slug"],
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

    print()

    # ======================================================
    # Synchronization
    # ======================================================

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

    for product in sorted(
        products.values(),
        key=lambda row: row["slug"],
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
        "📦 Storage : AcquisitionDocument"
    )

    print(
        "=" * 60
    )


# ==========================================================
# Standalone Execution
# ==========================================================


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/gmktec/discover_list.py

SHIN CORE LINX

GMKtec Product Discovery Runtime

Collection Reality
        ↓
Product URL Discovery
        ↓
Product URL Normalization
        ↓
AcquisitionDocument
document_type = "product"

Responsibilities

- Load Collection Reality
- Discover Product URLs
- Normalize Product URLs
- Register Product Discovery Reality
- Preserve Product URL as AcquisitionDocument

NOT

- HTTP Acquisition
- Product HTML Fetch
- Product Observation
- Product Parsing
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

import hashlib

from urllib.parse import (
    unquote,
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
# Runtime Constants
# ==========================================================

DOCUMENT_KEY_MAX_LENGTH = 200

DOCUMENT_KEY_HASH_LENGTH = 32


# ==========================================================
# Collection Runtime
# ==========================================================

def load_collections() -> list[dict[str, str]]:
    """
    Load discovered Collection Documents.

    Collection Discovery Reality is stored in
    AcquisitionDocument.

    No TSV is used.
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
    Normalize GMKtec Product URL.

    Supported source URLs:

        /products/...
        /collections/.../products/...

    All Product URLs are normalized to:

        https://jp.gmktec.com/products/<slug>

    Query strings and fragments are removed.

    Example:

        /collections/accessory/products/gmktec-adapter

            ↓

        https://jp.gmktec.com/products/gmktec-adapter
    """

    href = (
        href
        .strip()
        .split("?")[0]
        .split("#")[0]
    )

    if not href:
        return ""

    # ------------------------------------------------------
    # Build Absolute URL
    # ------------------------------------------------------

    absolute_url = urljoin(
        BASE_URL,
        href,
    )

    # ------------------------------------------------------
    # Extract Product Path
    # ------------------------------------------------------

    path = (
        urlparse(absolute_url)
        .path
        .rstrip("/")
    )

    marker = "/products/"

    if marker not in path:
        return ""

    # ------------------------------------------------------
    # Extract Product Slug
    # ------------------------------------------------------

    product_slug = (
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

    if not product_slug:
        return ""

    # ------------------------------------------------------
    # Canonical Product URL
    # ------------------------------------------------------

    return (
        BASE_URL.rstrip("/")
        + "/products/"
        + product_slug
    )


# ==========================================================
# Product Slug
# ==========================================================

def extract_product_slug(
    url: str,
) -> str:
    """
    Extract Product slug from canonical
    Product URL.
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
# Document Key
# ==========================================================

def build_document_key(
    *,
    slug: str,
    url: str,
) -> str:
    """
    Build a database-safe AcquisitionDocument key.

    Strategy:

        1. Decode URL-encoded slug.
        2. Use decoded slug when it fits the DB limit.
        3. If still too long, use a stable SHA-256
           derived from the canonical Product URL.

    The complete Product URL is preserved separately
    in AcquisitionDocument.source_url.

    Example:

        gmktec-evo-x3-amd-ryzen%E2%84%A2-...

            ↓

        gmktec-evo-x3-amd-ryzen™-...

    Long fallback:

        product_a81f0c2d...
    """

    decoded_slug = unquote(
        slug,
    ).strip()

    # ------------------------------------------------------
    # Normal Case
    # ------------------------------------------------------

    if (
        decoded_slug
        and len(decoded_slug)
        <= DOCUMENT_KEY_MAX_LENGTH
    ):

        return decoded_slug

    # ------------------------------------------------------
    # Long Slug Fallback
    # ------------------------------------------------------

    digest = hashlib.sha256(
        url.encode(
            "utf-8",
        )
    ).hexdigest()[
        :DOCUMENT_KEY_HASH_LENGTH
    ]

    return (
        "product_"
        + digest
    )


# ==========================================================
# Product Discovery
# ==========================================================

def discover_products(
    html: str,
) -> dict[str, dict[str, str]]:
    """
    Discover Product URLs from Collection HTML.

    This Runtime observes only Product URL Reality.

    It does NOT extract:

        - product name
        - price
        - image
        - specifications
    """

    if not html:
        return {}

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    products: dict[
        str,
        dict[str, str],
    ] = {}

    # ======================================================
    # Observe Every href
    # ======================================================

    for link in soup.find_all(
        "a",
        href=True,
    ):

        href = link.get(
            "href",
            "",
        )

        # --------------------------------------------------
        # Product URL Normalization
        # --------------------------------------------------

        url = normalize_product_url(
            href,
        )

        if not url:
            continue

        # --------------------------------------------------
        # Product Slug
        # --------------------------------------------------

        slug = extract_product_slug(
            url,
        )

        if not slug:
            continue

        # --------------------------------------------------
        # Document Identity
        # --------------------------------------------------

        document_key = build_document_key(
            slug=slug,
            url=url,
        )

        # --------------------------------------------------
        # Preserve First Observation
        # --------------------------------------------------

        products.setdefault(
            document_key,
            {
                "slug": slug,
                "document_key": document_key,
                "url": url,
            },
        )

    return products


# ==========================================================
# Product Document
# ==========================================================

def save_product(
    *,
    document_key: str,
    slug: str,
    url: str,
) -> None:
    """
    Register discovered Product as
    AcquisitionDocument.

    Product HTML is NOT fetched here.

    The next Fetch Runtime is responsible
    for acquiring Product HTML.

    Identity:

        document_key
            ↓
        Internal Runtime Identity

    Reality:

        source_url
            ↓
        Canonical Product URL
    """

    AcquisitionDocument.objects.update_or_create(
        source_type="scraping",
        source_name=SITE_NAME,
        document_type="product",
        document_key=document_key,
        defaults={
            "source_url": url,
            "content_type": "text/html",
            "content": "",
        },
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
        Product URL
            ↓
    Product URL Normalization
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

    # ======================================================
    # Collection Loop
    # ======================================================

    for index, collection in enumerate(
        collections,
        start=1,
    ):

        collection_slug = (
            collection["slug"]
        )

        html = collection["content"]

        print(
            f"[{index}/{len(collections)}] "
            f"{collection_slug}"
        )

        if not html:

            print(
                "  ❌ Collection HTML is empty"
            )

            continue

        # --------------------------------------------------
        # Product Discovery
        # --------------------------------------------------

        discovered = discover_products(
            html,
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
                product["document_key"],
                product,
            )

    # ======================================================
    # Save Product Discovery Reality
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

    for product in sorted(
        products.values(),
        key=lambda row: row["document_key"],
    ):

        save_product(
            document_key=(
                product["document_key"]
            ),
            slug=product["slug"],
            url=product["url"],
        )

        print(
            f"  {product['document_key']}"
        )

        print(
            f"    slug : "
            f"{product['slug']}"
        )

        print(
            f"    url  : "
            f"{product['url']}"
        )

    # ======================================================
    # Result
    # ======================================================

    print()

    print(
        "=" * 60
    )

    print(
        f"✅ TOTAL : "
        f"{len(products)} products"
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
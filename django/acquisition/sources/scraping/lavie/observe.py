from __future__ import annotations
import json
from bs4 import BeautifulSoup
from api.models.acquisition_document import AcquisitionDocument
from acquisition.common.trace.reality_trace import trace_pipeline
from .settings import (    SITE_NAME,    BASE_URL,)


# ==============================================================================
# Table Fallback Runtime
# ==============================================================================

def observe_table_specs(
    observation: dict,
) -> None:
    """
    Observe Specifications from observed tables.

    Reality Only.

    Table
        ↓
    Observable Dictionary

    No semantic.
    No inference.
    """

    #
    # Already observed
    #

    if observation.get(
        "specs",
    ):
        return

    #
    # Search Tables
    #

    for table in observation.get(
        "tables",
        [],
    ):

        specs = {}

        for row in table:

            if len(row) != 2:
                continue

            key = row[0].strip()

            value = row[1].strip()

            if not key:
                continue

            specs[key] = value

        if specs:

            observation["specs"] = specs

            return

# ==============================================================================
# Product Code
# ==============================================================================

import re


def extract_product_code(
    text: str,
) -> str:
    """
    Extract Product Code from published text.

    Preserve Reality.
    """

    if not text:

        return ""

    #
    # BN56C〈BN56C-T〉
    #

    m = re.search(
        r"([A-Z]{1,8}[0-9]{1,8}[A-Z0-9\-]*)",
        text,
    )

    if m:

        return m.group(1)

    return ""

# ==============================================================================
# Identity Observation Helpers
# ==============================================================================

def first_text(
    *values: str,
) -> str:
    """
    Return first non-empty text.
    """

    for value in values:

        if not value:
            continue

        value = value.strip()

        if value:

            return value

    return ""


def find_product_jsonld(
    observation: dict,
) -> dict:
    """
    Return first Product JSON-LD.
    """

    for item in observation.get(
        "jsonld_scripts",
        [],
    ):

        if not isinstance(
            item,
            dict,
        ):
            continue

        if item.get("@type") == "Product":

            return item

    return {}

# ==============================================================================
# Product Identity Runtime
# ==============================================================================

def observe_product_identity(
    soup: BeautifulSoup,
    observation: dict,
) -> None:
    """
    Observe Product Identity.

    Priority

        JSON-LD
            ↓
        Meta
            ↓
        Specification
            ↓
        Table
    """

    observe_jsonld_identity(
        observation,
    )

    observe_meta_identity(
        soup,
        observation,
    )

    observe_spec_identity(
        observation,
    )

    observe_table_identity(
        observation,
    )


    product = find_product_jsonld(
        observation,
    )

    #
    # H1
    #

    h1 = ""

    node = soup.select_one("h1")

    if node:

        h1 = node.get_text(
            " ",
            strip=True,
        )

    #
    # Product Name
    #

    observation["product_name"] = normalize_product_name(

        first_text(
            product.get(
                "name",
                "",
            ),

            h1,

            observation.get(
                "html_title",
                "",
            ),

        )

    )

    #
    # Series
    #

    series = product.get(
        "name",
        "",
    ).strip()

    if not series:

        url = observation.get(
            "canonical_url",
            "",
        )

        if "/products/" in url:

            try:

                series = (

                    url.rstrip("/")

                    .split("/")[-1]

                    .upper()

                )

            except Exception:

                series = ""

    observation["series_name"] = series
    
    #
    # Product Code
    #

    specs = observation.get(
        "specs",
        {},
    )

    product_code = first_text(

        specs.get(
            "型名",
            "",
        ),

        specs.get(
            "型番",
            "",
        ),

    )

    #
    # JSON-LD
    #

    if not product_code:

        product_code = extract_product_code(

            product.get(
                "name",
                "",
            )

        )

    #
    # Title
    #

    if not product_code:

        product_code = extract_product_code(

            observation.get(
                "html_title",
                "",
            )

        )

    observation["product_code"] = product_code

# ==============================================================================
# Identity Normalize
# ==============================================================================

def normalize_product_name(
    name: str,
) -> str:
    """
    Normalize Product Name.

    Preserve published identity.
    """

    if not name:

        return ""

    name = (
        name
        .replace("｜NEC LAVIE公式サイト", "")
        .replace("| NEC LAVIE公式サイト", "")
        .replace("｜NEC VersaPro公式サイト", "")
        .replace("| NEC VersaPro公式サイト", "")
        .strip()
    )

    return name

# ==============================================================================
# JSON-LD Observation
# ==============================================================================


def observe_jsonld(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe JSON-LD.

    Reality only.
    """

    scripts = []

    for node in soup.select(
        'script[type="application/ld+json"]',
    ):

        text = node.string

        if not text:

            text = node.get_text(
                strip=True,
            )

        if not text:
            continue

        try:

            scripts.append(
                json.loads(
                    text,
                )
            )

        except Exception:

            scripts.append(
                {
                    "raw": text,
                }
            )

    observation["jsonld_scripts"] = scripts

# ==============================================================================
# Observation Factory
# ==============================================================================

def create_observation() -> dict:
    """
    Create empty ObservationDocument.

    Observation only.

    No semantic.
    No formatting.
    """

    return {

        #
        # HTML
        #

        "html_title": "",

        "canonical_url": "",

        "meta_description": "",

        #
        # Product
        #

        "product_name": "",

        "series_name": "",

        #
        # Media
        #

        "main_image": "",

        "images": [],

        #
        # Specification
        #

        "specs": {},

        #
        # HTML Structure
        #

        "tables": [],

        #
        # Structured Data
        #

        "jsonld_scripts": [],
        
        #
        # Commerce
        #

        "price": "",
        "stock_status": "",

    }

def observe_price(
    soup: BeautifulSoup,
    observation: dict,
) -> None:
    """
    Observe Published Price.

    Reality Only.
    """

    node = soup.select_one(
        ".lavie_newprice"
    )

    if node is None:
        return

    price = node.get_text(
        strip=True,
    )

    observation["price"] = price

# ==============================================================================
# Basic Observation
# ==============================================================================

def observe_title(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe HTML title.
    """

    if soup.title is None:
        return

    observation["html_title"] = soup.title.get_text(
        " ",
        strip=True,
    )
    
    observe_price(
        soup,
        observation,
    )
    


def observe_url(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe canonical URL.
    """

    canonical = soup.select_one(
        'link[rel="canonical"]',
    )

    if canonical is None:
        return

    observation["canonical_url"] = canonical.get(
        "href",
        "",
    )


def observe_description(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe meta description.
    """

    meta = soup.select_one(
        'meta[name="description"]',
    )

    if meta is None:
        return

    observation["meta_description"] = meta.get(
        "content",
        "",
    )

# ==============================================================================
# JSON-LD Identity Runtime
# ==============================================================================

def observe_jsonld_identity(
    observation: dict,
) -> None:
    """
    Observe Product Identity from JSON-LD.

    Reality Only.

    Product JSON-LD
        ↓
    Observation Runtime

    No semantic.
    No inference.
    """

    product = find_product_jsonld(
        observation,
    )

    if not product:

        return

    #
    # Product Name
    #

    if not observation.get(
        "product_name",
    ):

        observation["product_name"] = first_text(

            product.get(
                "name",
                "",
            ),

        )

    #
    # Series
    #

    if not observation.get(
        "series_name",
    ):

        observation["series_name"] = first_text(

            product.get(
                "category",
                "",
            ),

        )

    #
    # Product Code
    #

    if not observation.get(
        "product_code",
    ):

        observation["product_code"] = extract_product_code(

            product.get(
                "name",
                "",
            ),

        )

# ==============================================================================
# Meta Identity Runtime
# ==============================================================================

def observe_meta_identity(
    soup: BeautifulSoup,
    observation: dict,
) -> None:
    """
    Observe Product Identity from Meta.

    Reality Only.

    Meta
        ↓
    Observation Runtime

    No semantic.
    No inference.
    """

    #
    # Product Name
    #

    if not observation.get(
        "product_name",
    ):

        observation["product_name"] = first_text(

            observation.get(
                "html_title",
                "",
            ),

        )

    #
    # Canonical URL
    #

    if not observation.get(
        "canonical_url",
    ):

        observe_url(
            soup,
            observation,
        )

# ==============================================================================
# Specification Identity Runtime
# ==============================================================================

def observe_spec_identity(
    observation: dict,
) -> None:
    """
    Observe Product Identity from Specifications.

    Reality Only.

    Specifications
        ↓
    Observation Runtime

    No semantic.
    No inference.
    """

    specs = observation.get(
        "specs",
        {},
    )

    #
    # Product Name
    #

    if not observation.get(
        "product_name",
    ):

        observation["product_name"] = first_text(

            specs.get(
                "製品名",
                "",
            ),

            specs.get(
                "商品名",
                "",
            ),

            specs.get(
                "名称",
                "",
            ),

        )

    #
    # Series
    #

    if not observation.get(
        "series_name",
    ):

        observation["series_name"] = first_text(

            specs.get(
                "シリーズ",
                "",
            ),

            specs.get(
                "シリーズ名",
                "",
            ),

            specs.get(
                "タイプ",
                "",
            ),

        )

    #
    # Product Code
    #

    if not observation.get(
        "product_code",
    ):

        observation["product_code"] = first_text(

            specs.get(
                "型番",
                "",
            ),

            specs.get(
                "型名",
                "",
            ),

            specs.get(
                "製品型番",
                "",
            ),

        )


# ==============================================================================
# Image Observation
# ==============================================================================

IMAGE_SKIP_KEYWORDS = (

    #
    # SNS
    #

    "facebook",
    "twitter",
    "line",

    #
    # Analytics
    #

    "analytics",
    "tracking",
    "gtm",
    "google",

    #
    # UI
    #

    "logo",
    "icon",
    "sprite",
    "banner",
    "loading",
    "spacer",
    "blank",

)


def observe_images(
    soup: BeautifulSoup,
    observation: dict,
) -> None:
    """
    Observe Product Images.

    Preserve Reality.

    Remove obvious UI / Tracking Images.
    """

    images = []

    seen = set()

    for img in soup.select("img[src]"):

        src = img.get(
            "src",
            "",
        ).strip()

        if not src:

            continue

        lower = src.lower()

        #
        # Skip obvious noise
        #

        if any(
            keyword in lower
            for keyword in IMAGE_SKIP_KEYWORDS
        ):
            continue

        #
        # Relative URL
        #

        if src.startswith("//"):

            src = "https:" + src

        elif src.startswith("/"):

            src = BASE_URL + src

        #
        # Unique
        #

        if src in seen:

            continue

        seen.add(
            src,
        )

        images.append(
            src,
        )

    observation["images"] = images

# ==============================================================================
# Main Image Observation
# ==============================================================================

def observe_main_image(
    soup: BeautifulSoup,
    observation: dict,
) -> None:
    """
    Observe Main Product Image.

    Reality Only.

    Observe only images that are explicitly presented
    as the product visual.

    No semantic.
    No guessing.
    """

    #
    # Product JSON-LD
    #

    product = find_product_jsonld(
        observation,
    )

    image = product.get(
        "image",
        "",
    )

    if isinstance(
        image,
        list,
    ):

        image = image[0] if image else ""

    if image:

        observation["main_image"] = image

        return

    #
    # Open Graph
    #

    node = soup.select_one(
        'meta[property="og:image"]'
    )

    if node:

        image = node.get(
            "content",
            "",
        ).strip()

        if image:

            observation["main_image"] = image

            return

    #
    # LAVIE Product Visual
    #

    node = soup.select_one(
        ".lavie_categoryMv__visual img"
    )

    if node:

        src = node.get(
            "src",
            "",
        ).strip()

        if src:

            if src.startswith("//"):

                src = "https:" + src

            elif src.startswith("/"):

                src = BASE_URL + src

            observation["main_image"] = src

            return

    #
    # No Product Image
    #

    observation["main_image"] = ""


# ==============================================================================
# Specification Observation
# ==============================================================================

def observe_consumer_specs(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe consumer specifications.

    Reality Source

        table.table_spec
    """

    specs = {}

    table = soup.select_one(
        "table.table_spec",
    )

    if table is None:
        return

    for tr in table.select("tr"):

        th = tr.select_one("th")
        td = tr.select_one("td")

        if th is None or td is None:
            continue

        key = th.get_text(
            " ",
            strip=True,
        )

        value = td.get_text(
            " ",
            strip=True,
        )

        if not key:
            continue

        specs[key] = value

    observation["specs"] = specs


def observe_business_specs(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe business specifications.

    Reality Source

        dl.spec-detail
    """

    specs = {}

    for row in soup.select(
        "dl.spec-detail div.inner",
    ):

        dt = row.select_one("dt")
        dd = row.select_one("dd")

        if dt is None or dd is None:
            continue

        key = dt.get_text(
            " ",
            strip=True,
        )

        value = dd.get_text(
            " ",
            strip=True,
        )

        if not key:
            continue

        specs[key] = value

    observation["specs"] = specs

# ==============================================================================
# Specification Observation
# ==============================================================================

def observe_specs(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe Specifications.

    Priority

        Consumer
            ↓
        Business
            ↓
        Table Fallback
    """

    #
    # Consumer
    #

    if soup.select_one(
        "table.table_spec",
    ):

        observe_consumer_specs(
            soup,
            observation,
        )

    #
    # Business
    #

    elif soup.select_one(
        "dl.spec-detail",
    ):

        observe_business_specs(
            soup,
            observation,
        )

    #
    # Table Fallback
    #

    observe_table_specs(
        observation,
    )


# ==============================================================================
# Table Identity Runtime
# ==============================================================================

def observe_table_identity(
    observation: dict,
) -> None:
    """
    Observe Product Identity from observed tables.

    Reality Only.

    Table
        ↓
    Product Identity

    No semantic.
    No inference.
    """

    specs = observation.get(
        "specs",
        {},
    )

    #
    # Product Code
    #

    if not observation.get(
        "product_code",
    ):

        observation["product_code"] = first_text(

            specs.get(
                "型名",
                "",
            ),

            specs.get(
                "型番",
                "",
            ),

            specs.get(
                "製品型番",
                "",
            ),

        )

    #
    # Series
    #

    if not observation.get(
        "series_name",
    ):

        observation["series_name"] = first_text(

            specs.get(
                "シリーズ",
                "",
            ),

            specs.get(
                "タイプ",
                "",
            ),

            specs.get(
                "シリーズ名",
                "",
            ),

        )


# ==============================================================================
# Table Observation
# ==============================================================================

def observe_tables(
    soup: BeautifulSoup,
    observation: dict,
):
    """
    Observe HTML tables.

    Reality only.
    """

    tables = []

    for table in soup.select("table"):

        rows = []

        for tr in table.select("tr"):

            cells = []

            for cell in tr.select("th, td"):

                text = cell.get_text(
                    " ",
                    strip=True,
                )

                cells.append(
                    text,
                )

            if cells:

                rows.append(
                    cells,
                )

        if rows:

            tables.append(
                rows,
            )

    observation["tables"] = tables

# ==============================================================================
# Observation
# ==============================================================================

def observe(
    html: str,
) -> dict:
    """
    Observe HTML.

    Reality only.

    No formatting.
    No semantic.
    """

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    observation = create_observation()

    #
    # Basic
    #

    observe_title(
        soup,
        observation,
    )

    observe_url(
        soup,
        observation,
    )

    observe_description(
        soup,
        observation,
    )

    #
    # Structured Data
    #

    observe_jsonld(
        soup,
        observation,
    )

    #
    # Media
    #

    observe_images(
        soup,
        observation,
    )

    observe_main_image(
        soup,
        observation,
    )

    #
    # Specifications
    #

    observe_specs(
        soup,
        observation,
    )

    observe_tables(
        soup,
        observation,
    )

    #
    # Product Identity
    #

    observe_product_identity(
        soup,
        observation,
    )

    observe_table_identity(
        observation,
    )
    
    #
    # Validation
    #

    validate_observation(
        observation,
    )

    return observation


# ==============================================================================
# Observation Validation
# ==============================================================================

def validate_observation(
    observation: dict,
) -> None:
    """
    Validate Observation Runtime.

    Reality only.

    No semantic.
    No inference.
    """

    print()

    print("=" * 70)
    print("OBSERVATION SUMMARY")
    print("=" * 70)

    print(
        f"Product : {observation.get('product_name') or '-'}"
    )
    
    print(
        f"Price   : {observation.get('price') or '-'}"
    )
    

    print(
        f"Series  : {observation.get('series_name') or '-'}"
    )

    print(
        f"Code    : {observation.get('product_code') or '-'}"
    )

    print(
        f"URL     : {observation.get('canonical_url') or '-'}"
    )

    print(
        f"Specs   : {len(observation.get('specs', {}))}"
    )

    print(
        f"Tables  : {len(observation.get('tables', []))}"
    )

    print(
        f"Images  : {len(observation.get('images', []))}"
    )

    print(
        f"JSONLD  : {len(observation.get('jsonld_scripts', []))}"
    )

    print("=" * 70)


# ==============================================================================
# Persistence
# ==============================================================================

def save_observation_document(
    *,
    document: AcquisitionDocument,
    observation: dict,
):
    """
    Save ObservationDocument.
    """

    obj, created = AcquisitionDocument.objects.update_or_create(

        source_type=document.source_type,
        source_name=document.source_name,
        document_type="observation",
        document_key=document.document_key,
        defaults={

            "source_url": document.source_url,
            "content_type": "application/json",
            "content": json.dumps(

                observation,
                ensure_ascii=False,
                indent=2,

            ),

        },

    )

    return obj, created

# ==============================================================================
# Runtime
# ==============================================================================

def run():
    """
    Observation Runtime.
    """

    print("=" * 70)
    print(f"👀 {SITE_NAME} OBSERVATION")
    print("=" * 70)

    documents = (
        AcquisitionDocument.objects
        .filter(
            source_name=SITE_NAME.lower(),
            document_type="product",
        )
        .order_by(
            "document_key",
        )
        .iterator()
    )

    success = 0
    failed = 0

    for document in documents:

        print(document.document_key)

        try:

            observation = observe(
                document.content,
            )

            _, created = save_observation_document(
                document=document,
                observation=observation,
            )

            success += 1

            print(
                f"  Specs  : {len(observation['specs'])}"
            )

            print(
                f"  Tables : {len(observation['tables'])}"
            )

            print(
                f"  Images : {len(observation['images'])}"
            )

            print(
                f"  Saved  : {'CREATED' if created else 'UPDATED'}"
            )

        except Exception as e:

            failed += 1

            print("  Status : ERROR")
            print(f"  Reason : {e}")

        print()

    print("=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"SUCCESS : {success}")
    print(f"FAILED  : {failed}")
    print("=" * 70)
    
    print( f"  Product: {observation['product_name'] or '-'}")
    print( f"  Series : {observation['series_name'] or '-'}" )
    print( f"  Code   : {observation['product_code'] or '-'}" )
    print( f"  Specs  : {len(observation['specs'])}" )
    print( f"  Tables : {len(observation['tables'])}" )
    print( f"  Images : {len(observation['images'])}" )
    print( f"  JSONLD : {len(observation['jsonld_scripts'])}"  )
    print( f"  Saved  : {'CREATED' if created else 'UPDATED'}" )
    
# ==============================================================================
# Entry Point
# ==============================================================================

def main():

    run()


if __name__ == "__main__":

    main()
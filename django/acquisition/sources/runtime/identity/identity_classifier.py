#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/runtime/identity/identity_classifier.py

SHIN CORE LINX
Identity Runtime Classifier
==============================================================================

Identity Runtime

Product Reality
        │
        ├── Product Name
        ├── Description
        └── Observation Runtime
                │
                ▼
        Searchable Reality
                │
                ▼
        Identity Authority
        identity.tsv
                │
                ▼
        Brand / Series / Collaboration / Model

Responsibilities

- Load Identity Authority TSV
- Resolve Brand
- Resolve Series
- Resolve Collaboration
- Resolve Model
- Search complete Product Reality
- Search complete Observation Runtime
- Resolve Identity from Reality
- Preserve Translation Authority

NOT

- HTTP Acquisition
- HTML Parsing
- Specification Parsing
- AI
- Semantic Runtime
- Semantic Classification
- External Data Acquisition
- Guessing

Reality First
Observation First
Translation Authority
Meaning Later
==============================================================================
"""

from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Any


# ============================================================================
# Runtime
# ============================================================================

BASE_DIR = Path(__file__).parent


# ============================================================================
# Identity Authority
# ============================================================================
#
# Unified Identity Authority
#
# Schema:
#
#     maker
#     keyword
#     brand
#     series
#     collaboration
#     priority
#
# All Identity Authority is represented by the maker column.
#
# There is NO distinction between:
#
#     Manufacturer
#     Shop
#     Acquisition Source
#
# All sources use the same Identity Runtime.
# ============================================================================

IDENTITY_TSV = (
    BASE_DIR / "identity.tsv"
)


# ============================================================================
# TSV Loader
# ============================================================================

def load_tsv(
    path: Path,
) -> list[dict]:
    """
    Load Identity Authority TSV.

    Priority is used for deterministic candidate ordering.

    Empty / invalid priority is treated as 0.

    Original TSV order is preserved for candidates having
    the same priority and keyword length.
    """

    if not path.exists():

        return []

    with path.open(
        encoding="utf-8",
        newline="",
    ) as fp:

        rows = list(
            csv.DictReader(
                fp,
                delimiter="\t",
            )
        )

    # ------------------------------------------------------------------------
    # Priority
    # ------------------------------------------------------------------------

    def priority_value(
        row: dict,
    ) -> int:

        value = row.get(
            "priority",
            0,
        )

        try:

            return int(
                value
                if value not in (
                    None,
                    "",
                )
                else 0
            )

        except (
            TypeError,
            ValueError,
        ):

            return 0

    rows.sort(
        key=priority_value,
        reverse=True,
    )

    return rows


# ============================================================================
# Identity Authority Runtime
# ============================================================================

IDENTITY = load_tsv(
    IDENTITY_TSV,
)


# ============================================================================
# Observation Text Builder
# ============================================================================

def build_observation_text(
    *,
    product_name: str,
    description: str = "",
    observation_runtime: Any = None,
) -> str:
    """
    Build the complete searchable Product Reality.

    Search sources:

        1. product_name
        2. description
        3. complete observation_runtime

    Observation Runtime is treated as already-observed Reality.

    This function does NOT:

    - interpret Observation
    - classify Observation
    - extract specifications
    - generate semantic meaning
    - infer missing information

    It only converts existing Reality into searchable text.
    """

    parts: list[str] = []

    # ------------------------------------------------------------------------
    # Product Name
    # ------------------------------------------------------------------------

    if product_name:

        parts.append(
            str(product_name)
        )

    # ------------------------------------------------------------------------
    # Description
    # ------------------------------------------------------------------------

    if description:

        parts.append(
            str(description)
        )

    # ------------------------------------------------------------------------
    # Complete Observation Runtime
    # ------------------------------------------------------------------------
    #
    # This is intentionally included in the same searchable Reality.
    #
    # Example:
    #
    #     product_name:
    #         Dell Pro Max タワー T2
    #
    #     observation:
    #         Dell Pro Max Tower T2
    #
    # This allows:
    #
    #     identity.tsv
    #         keyword = pro max
    #
    # to match Observation Reality directly.
    # ------------------------------------------------------------------------

    if observation_runtime is not None:

        observation_text = _flatten_observation(
            observation_runtime,
        )

        if observation_text:

            parts.append(
                observation_text
            )

    return " ".join(
        part
        for part in parts
        if part
    )


# ============================================================================
# Observation Flattening
# ============================================================================

def _flatten_observation(
    value: Any,
) -> str:
    """
    Convert complete Observation Runtime into searchable text.

    Dictionary keys and observable values are both preserved.

    Nested dictionaries and lists are recursively traversed.

    No semantic interpretation is performed.
    """

    parts: list[str] = []

    # ------------------------------------------------------------------------
    # Dictionary
    # ------------------------------------------------------------------------

    if isinstance(
        value,
        dict,
    ):

        for key, item in value.items():

            # --------------------------------------------------------------
            # Preserve observable key
            # --------------------------------------------------------------

            if key is not None:

                parts.append(
                    str(key)
                )

            # --------------------------------------------------------------
            # Preserve observable value
            # --------------------------------------------------------------

            flattened = _flatten_observation(
                item,
            )

            if flattened:

                parts.append(
                    flattened
                )

    # ------------------------------------------------------------------------
    # List / Tuple
    # ------------------------------------------------------------------------

    elif isinstance(
        value,
        (list, tuple),
    ):

        for item in value:

            flattened = _flatten_observation(
                item,
            )

            if flattened:

                parts.append(
                    flattened
                )

    # ------------------------------------------------------------------------
    # Scalar
    # ------------------------------------------------------------------------

    elif value is not None:

        parts.append(
            str(value)
        )

    return " ".join(
        part
        for part in parts
        if part
    )


# ============================================================================
# Text Normalization
# ============================================================================

def normalize_search_text(
    value: Any,
) -> str:
    """
    Normalize searchable text.

    Current Identity Authority uses literal substring matching.

    Normalization is intentionally conservative:

    - convert to string
    - trim
    - lowercase
    - normalize repeated whitespace

    No semantic normalization is performed.
    """

    if value is None:

        return ""

    text = str(
        value
    )

    text = text.strip().lower()

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text


# ============================================================================
# Identity Authority Matcher
# ============================================================================

def match_identity(
    runtime: list[dict],
    *,
    maker: str,
    text: str,
) -> dict:
    """
    Resolve Identity from the unified Identity Authority.

    Matching:

        1. maker must match
        2. keyword must exist in searchable Reality
        3. the row must provide a value for the field
        4. higher priority wins
        5. same priority -> longer keyword wins
        6. same priority and keyword length ->
           earlier TSV row wins

    Searchable Reality contains:

        Product Name
        Description
        Observation Runtime

    No source-specific branch exists.

    No inference.
    No guessing.
    No semantic interpretation.
    """

    normalized_maker = normalize_search_text(
        maker,
    )

    normalized_text = normalize_search_text(
        text,
    )

    # ------------------------------------------------------------------------
    # Independent candidates
    # ------------------------------------------------------------------------

    field_candidates: dict[
        str,
        list[
            tuple[
                int,
                int,
                int,
                str,
                str,
            ]
        ],
    ] = {

        "brand": [],

        "series": [],

        "collaboration": [],

    }

    # ------------------------------------------------------------------------
    # Authority Matching
    # ------------------------------------------------------------------------

    for index, row in enumerate(
        runtime,
    ):

        row_maker = normalize_search_text(
            row.get(
                "maker",
                "",
            )
        )

        if row_maker != normalized_maker:

            continue

        keyword = normalize_search_text(
            row.get(
                "keyword",
                "",
            )
        )

        if not keyword:

            continue

        # --------------------------------------------------------------
        # Literal substring matching
        # --------------------------------------------------------------

        if keyword not in normalized_text:

            continue

        # --------------------------------------------------------------
        # Priority
        # --------------------------------------------------------------

        value = row.get(
            "priority",
            0,
        )

        try:

            priority = int(
                value
                if value not in (
                    None,
                    "",
                )
                else 0
            )

        except (
            TypeError,
            ValueError,
        ):

            priority = 0

        # --------------------------------------------------------------
        # Each Identity field receives the matching row independently.
        # --------------------------------------------------------------

        for field in (
            "brand",
            "series",
            "collaboration",
        ):

            result = str(
                row.get(
                    field,
                    "",
                )
                or ""
            ).strip()

            if not result:

                continue

            field_candidates[field].append(

                (
                    priority,
                    len(keyword),
                    -index,
                    result,
                    keyword,
                )

            )

    # =========================================================================
    # Resolve One Field
    # =========================================================================

    def resolve_field(
        candidates: list[
            tuple[
                int,
                int,
                int,
                str,
                str,
            ]
        ],
    ) -> str:

        if not candidates:

            return ""

        candidates.sort(

            reverse=True,

            key=lambda item: (

                item[0],  # priority

                item[1],  # keyword length

                item[2],  # original TSV order

            ),

        )

        return candidates[0][3]

    # =========================================================================
    # Runtime Result
    # =========================================================================

    return {

        "brand": resolve_field(
            field_candidates["brand"],
        ),

        "series": resolve_field(
            field_candidates["series"],
        ),

        "collaboration": resolve_field(
            field_candidates["collaboration"],
        ),

    }


# ============================================================================
# Model Resolver
# ============================================================================

MODEL_PATTERNS = (

    #
    # 型番：W6PZMA5PAB
    #

    r"型番[:：]\s*([A-Za-z0-9/_\-]+)",

    #
    # Model: XXX
    #

    r"model[:：]?\s*([A-Za-z0-9/_\-]+)",

)


def resolve_model(
    *,
    text: str,
) -> str:
    """
    Resolve explicitly labeled model value.

    Only explicit model labels are accepted.

    No inference from arbitrary product text.
    """

    for pattern in MODEL_PATTERNS:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:

            return match.group(1)

    return ""


# ============================================================================
# Identity Runtime
# ============================================================================

def classify_identity(
    *,
    maker: str,
    product_name: str,
    description: str = "",
    observation_runtime: Any = None,
) -> dict:
    """
    Resolve Identity from complete Product Reality.

    Input:

        maker
        product_name
        description
        observation_runtime

    Search Reality:

        product_name
             +
        description
             +
        complete observation_runtime

    Authority:

        identity.tsv

    Output:

        brand
        series
        collaboration
        model

    All manufacturers and shops use the same Runtime.

    The maker value selects the corresponding Authority rows.

    No source-specific branching.
    No guessing.
    No inference.
    """

    # ------------------------------------------------------------------------
    # Build complete searchable Reality
    # ------------------------------------------------------------------------

    text = build_observation_text(

        product_name=product_name,

        description=description,

        observation_runtime=observation_runtime,

    )

    # ------------------------------------------------------------------------
    # Identity Authority
    # ------------------------------------------------------------------------

    identity = match_identity(

        IDENTITY,

        maker=maker,

        text=text,

    )

    # ------------------------------------------------------------------------
    # Model
    # ------------------------------------------------------------------------

    model = resolve_model(
        text=text,
    )

    # ------------------------------------------------------------------------
    # Runtime Result
    # ------------------------------------------------------------------------

    return {

        "brand": identity.get(
            "brand",
            "",
        ),

        "series": identity.get(
            "series",
            "",
        ),

        "collaboration": identity.get(
            "collaboration",
            "",
        ),

        "model": model,

    }
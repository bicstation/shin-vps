#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/runtime/identity/identity_classifier.py

SHIN CORE LINX
Identity Runtime Classifier

Identity Runtime

Observation Reality
        ↓
Identity Runtime
        ↓
Identity Authority
        ↓
Brand / Series / Collaboration / Model

Responsibilities

- Load Identity Authority TSV
- Resolve Brand
- Resolve Series
- Resolve Collaboration
- Resolve Model
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
# The Runtime does NOT distinguish between:
#
#     Manufacturer
#     Shop
#     Acquisition Source
#
# All Identity Authority is represented by the maker column.
#
# Examples:
#
#     sycom
#     lenovo
#     hp
#     dynabook
#
#     tsukumo
#     ark
#     mouse
#
# The same matcher is used for all of them.
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

    Priority is used only for deterministic candidate ordering.

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
    Build searchable Identity Runtime text.

    The complete Observation Runtime is included
    as searchable Reality.

    This function does NOT:

    - interpret Observation
    - classify Observation
    - extract specifications
    - generate semantic meaning
    - infer missing information

    It only converts already-observed values
    into searchable text.
    """

    parts: list[str] = []

    # ------------------------------------------------------------------------
    # Existing direct fields
    # ------------------------------------------------------------------------

    if product_name:

        parts.append(
            str(product_name)
        )

    if description:

        parts.append(
            str(description)
        )

    # ------------------------------------------------------------------------
    # Complete Observation Runtime
    # ------------------------------------------------------------------------

    if observation_runtime is not None:

        parts.append(
            _flatten_observation(
                observation_runtime,
            )
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
    Convert Observation Runtime into searchable text.

    No semantic interpretation is performed.

    Dictionary keys and observable values are both preserved
    as text.

    Nested structures are recursively traversed.
    """

    parts: list[str] = []

    if isinstance(
        value,
        dict,
    ):

        for key, item in value.items():

            # --------------------------------------------------------------
            # Preserve observable key
            # --------------------------------------------------------------

            parts.append(
                str(key)
            )

            # --------------------------------------------------------------
            # Preserve observable value
            # --------------------------------------------------------------

            parts.append(
                _flatten_observation(
                    item,
                )
            )

    elif isinstance(
        value,
        (list, tuple),
    ):

        for item in value:

            parts.append(
                _flatten_observation(
                    item,
                )
            )

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
# Identity Authority Matcher
# ============================================================================

def match_identity(
    runtime: list[dict],
    *,
    maker: str,
    text: str,
) -> dict:
    """
    Resolve complete Identity from the unified Identity Authority.

    Identity TSV schema:

        maker
        keyword
        brand
        series
        collaboration
        priority

    The matcher is used for ALL sources.

    There is no distinction between:

        - manufacturer
        - shop
        - acquisition source

    That distinction is represented only by the
    `maker` column in identity.tsv.

    Example:

        sycom    aqua-master    Aqua-Master    Aqua-Master

        tsukumo  blade 16       Razer          Blade 16

        ark      msi prestige   MSI            MSI Prestige

        mouse    daiv           DAIV           DAIV

        lenovo   ...            Lenovo         ...

    Matching remains literal substring matching.

    Candidate selection for each Identity field:

        1. Maker must match.
        2. Keyword must match.
        3. The row must provide a value for that field.
        4. Higher priority wins.
        5. Same priority -> longer keyword wins.
        6. Same priority and keyword length ->
           earlier TSV row wins.

    No semantic interpretation.
    No inference.
    No guessing.
    """

    maker = (
        str(maker)
        .strip()
        .lower()
    )

    text = (
        str(text)
        .lower()
    )

    # ------------------------------------------------------------------------
    # Candidates are maintained independently for each Identity field.
    #
    # This allows:
    #
    #     brand
    #     series
    #     collaboration
    #
    # to be resolved independently while using the same Authority.
    # ------------------------------------------------------------------------

    field_candidates: dict[
        str,
        list[
            tuple[
                int,
                int,
                int,
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

        row_maker = (
            str(
                row.get(
                    "maker",
                    "",
                )
            )
            .strip()
            .lower()
        )

        if row_maker != maker:

            continue

        keyword = (
            str(
                row.get(
                    "keyword",
                    "",
                )
            )
            .strip()
            .lower()
        )

        if not keyword:

            continue

        if keyword not in text:

            continue

        # --------------------------------------------------------------------
        # Priority
        # --------------------------------------------------------------------

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

        # --------------------------------------------------------------------
        # Each Identity field receives the matching row independently.
        #
        # Empty field values are NOT candidates.
        # --------------------------------------------------------------------

        for field in (
            "brand",
            "series",
            "collaboration",
        ):

            result = (
                str(
                    row.get(
                        field,
                        "",
                    )
                    or ""
                )
                .strip()
            )

            if not result:

                continue

            field_candidates[field].append(

                (
                    priority,
                    len(keyword),
                    -index,
                    result,
                )

            )

    # ------------------------------------------------------------------------
    # Resolve one field
    # ------------------------------------------------------------------------

    def resolve_field(
        candidates: list[
            tuple[
                int,
                int,
                int,
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

    # ------------------------------------------------------------------------
    # Runtime Result
    # ------------------------------------------------------------------------

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

    This resolver only accepts explicit
    model labels.

    It does NOT infer model numbers
    from arbitrary product text.
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
    Resolve Identity from complete Observation Reality.

    Input

        maker
        product_name
        description
        observation_runtime

    Output

        brand
        series
        collaboration
        model

    The Observation Runtime is used only as
    searchable Reality.

    No source-specific branching exists.

    All Identity resolution is performed through
    the unified identity.tsv Authority.

    The Runtime does not determine whether the source
    is a manufacturer or a shop.

    The maker value simply selects the corresponding
    Authority rows from identity.tsv.
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
    #
    # No source-specific branch.
    #
    # Examples:
    #
    #     SYCOM
    #         ↓
    #     identity.tsv
    #         ↓
    #     maker = sycom
    #
    #     TSUKUMO
    #         ↓
    #     identity.tsv
    #         ↓
    #     maker = tsukumo
    #
    #     Lenovo
    #         ↓
    #     identity.tsv
    #         ↓
    #     maker = lenovo
    #
    # The same Runtime is used in every case.
    # ------------------------------------------------------------------------

    identity = match_identity(

        IDENTITY,

        maker=maker,

        text=text,

    )

    # ------------------------------------------------------------------------
    # Runtime Result
    #
    # No fallback guessing.
    #
    # If no Authority row matches,
    # Identity remains empty.
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

        "model": resolve_model(

            text=text,

        ),

    }
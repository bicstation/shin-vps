#!/usr/bin/env python3
"""
FILE:
acquisition/sources/scraping/geekom/formatter.py

SHIN CORE LINX

Geekom Formatter Runtime

ObservationDocument
│
▼
Normalized Observation (Memory Only)

Responsibilities

- Normalize observed data structure
- Normalize text representation
- Preserve observable Reality
- Remove unnecessary structural noise

NOT

- HTTP Acquisition
- HTML Fetch
- Product Discovery
- Parse Specifications
- Generate Semantic Meaning
- Classify Reality
- Infer
- Guess
- Map to Import Contract
- Integration

Reality First
Observation First
Meaning Later
"""

from __future__ import annotations

import copy

from acquisition.common.trace.reality_trace import (
    trace,
)


# ==========================================================
# Text Normalization
# ==========================================================

def normalize_text(
    value: str,
) -> str:
    """
    Normalize observable text.

    This function performs only
    representation-level normalization.

    It MUST NOT:

    - interpret meaning
    - classify content
    - infer values
    - generate semantic labels
    """

    if not isinstance(
        value,
        str,
    ):
        return value

    # ------------------------------------------------------
    # Normalize line endings
    # ------------------------------------------------------

    value = value.replace(
        "\r\n",
        "\n",
    )

    value = value.replace(
        "\r",
        "\n",
    )

    # ------------------------------------------------------
    # Remove trailing whitespace
    #
    # Preserve line structure.
    # ------------------------------------------------------

    lines = [
        line.rstrip()
        for line in value.split("\n")
    ]

    # ------------------------------------------------------
    # Remove excessive empty lines
    #
    # Representation-level normalization only.
    # ------------------------------------------------------

    normalized_lines = []

    previous_empty = False

    for line in lines:

        empty = (
            line.strip() == ""
        )

        if (
            empty
            and previous_empty
        ):
            continue

        normalized_lines.append(
            line,
        )

        previous_empty = empty

    return "\n".join(
        normalized_lines,
    ).strip()


# ==========================================================
# List Normalization
# ==========================================================

def normalize_list(
    values: list,
) -> list:
    """
    Normalize observable list values.

    No semantic interpretation.
    """

    result = []

    for value in values:

        if isinstance(
            value,
            str,
        ):

            value = normalize_text(
                value,
            )

        elif isinstance(
            value,
            list,
        ):

            value = normalize_list(
                value,
            )

        elif isinstance(
            value,
            dict,
        ):

            value = normalize_dict(
                value,
            )

        result.append(
            value,
        )

    return result


# ==========================================================
# Dictionary Normalization
# ==========================================================

def normalize_dict(
    values: dict,
) -> dict:
    """
    Normalize Observation dictionary.

    Structure is preserved.

    Keys are NOT renamed.
    Meaning is NOT generated.
    """

    result = {}

    for key, value in values.items():

        # --------------------------------------------------
        # Preserve key exactly
        # --------------------------------------------------

        normalized_key = key

        # --------------------------------------------------
        # Normalize value
        # --------------------------------------------------

        if isinstance(
            value,
            str,
        ):

            normalized_value = normalize_text(
                value,
            )

        elif isinstance(
            value,
            list,
        ):

            normalized_value = normalize_list(
                value,
            )

        elif isinstance(
            value,
            dict,
        ):

            normalized_value = normalize_dict(
                value,
            )

        else:

            normalized_value = value

        result[
            normalized_key
        ] = normalized_value

    return result


# ==========================================================
# Observation Normalization
# ==========================================================

def normalize(
    observation: dict,
) -> dict:
    """
    Normalize ObservationDocument data.

    Input
    -----
    Observation Reality

    Output
    ------
    Normalized Observation

    The original Observation is never modified.

    This Runtime performs representation-level
    normalization only.

    It does NOT:

    - extract specifications
    - interpret tables
    - parse JSON-LD
    - identify CPU/GPU
    - convert prices
    - classify products
    - generate semantic meaning
    - infer missing information
    """

    trace(
        "Formatter Input",
        {
            "keys": list(
                observation.keys()
            )
            if isinstance(
                observation,
                dict,
            )
            else [],
        },
    )

    # ------------------------------------------------------
    # Defensive copy
    #
    # Never modify Observation Reality directly.
    # ------------------------------------------------------

    source = copy.deepcopy(
        observation,
    )

    # ------------------------------------------------------
    # Normalize
    # ------------------------------------------------------

    if isinstance(
        source,
        dict,
    ):

        normalized = normalize_dict(
            source,
        )

    else:

        normalized = source

    # ------------------------------------------------------
    # Trace
    # ------------------------------------------------------

    trace(
        "Formatter Output",
        {
            "keys": list(
                normalized.keys()
            )
            if isinstance(
                normalized,
                dict,
            )
            else [],
        },
    )

    return normalized


# ==========================================================
# Standalone Execution
# ==========================================================

def main() -> None:
    """
    Standalone Formatter Runtime entry point.

    This function intentionally does not read or write
    database documents.

    Formatter is currently a Memory-Only Runtime.

    ObservationDocument
            ↓
        normalize()
            ↓
    Normalized Observation
    """

    print(
        "=" * 60
    )

    print(
        "🧹 GEEKOM FORMATTER"
    )

    print(
        "=" * 60
    )

    print(
        "Formatter Runtime"
    )

    print(
        "Observation → Normalized Observation"
    )

    print(
        "=" * 60
    )


# ==========================================================
# Main
# ==========================================================

if __name__ == "__main__":
    main()
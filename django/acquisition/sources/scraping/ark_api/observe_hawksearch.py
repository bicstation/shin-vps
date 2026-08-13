#!/usr/bin/env python3

# ============================================================================
#
# FILE:
# acquisition/sources/scraping/hp/observe_hawksearch.py
#
# SHIN CORE LINX
#
# HP HawkSearch Observation Runtime
#
# Reality First
# Observation First
#
# ============================================================================
#
# DESIGN
#
# HawkSearch API が返す Product Document を Reality として扱う。
#
# 重要:
#
# 1. API Document の仕様を変更しない
# 2. 別 Document の仕様を組み合わせない
# 3. 欠落仕様を推測・補完しない
# 4. API unique_id は API が定義した仕様組み合わせの識別子として保持する
# 5. SHIN CORE LINX 内部では API unique_id を
#
#       unique_id_1
#       unique_id_2
#       ...
#
#    に対応付ける
# 6. 同じ API unique_id が Fetch 結果に複数回現れても、
#    unique_id を理由に最初から SKIP しない
# 7. 同じ API unique_id の Document が同一なら同じ Reality として扱う
# 8. 同じ API unique_id なのに Document が異なる場合は、
#    仕様を勝手に統合せず CONFLICT として報告する
# 9. Observation は「API が返した Reality の確認・保存」を担当する
#
# ============================================================================
#
# FLOW
#
# Seed
#   ↓
# HawkSearch Fetch
#   ↓
# HawkSearch Runtime
#   ↓
# HawkSearch Document
#   ↓
# API unique_id
#   ↓
# Internal Reality ID
#   unique_id_1
#   unique_id_2
#   ...
#   ↓
# AcquisitionDocument
#
# NOT
#
# - Specification merge
# - Cross-document composition
# - AI inference
# - Product selection
# - Semantic processing
# - unique_id based blind skip
#
# ============================================================================

from __future__ import annotations

import hashlib
import json
from collections import OrderedDict
from datetime import datetime, timezone
from typing import Any

from api.models import AcquisitionDocument


# ============================================================================
# Constants
# ============================================================================

SOURCE_NAME = "hp"
SITE_NAME = "HP"
DOCUMENT_TYPE = "product"

INTERNAL_ID_PREFIX = "unique_id_"


# ============================================================================
# Helpers
# ============================================================================

def first_value(value: Any) -> Any:
    """
    HawkSearch fields are commonly arrays.

    Read-only helper.
    The original Reality Document is never modified.
    """

    if isinstance(value, list):
        return value[0] if value else None

    return value


def get_source_unique_id(
    document: dict[str, Any],
) -> str | None:
    """
    Read the API-provided unique_id.

    SKU is only a fallback when unique_id is unavailable.
    """

    value = first_value(
        document.get("unique_id")
    )

    if value in (None, ""):
        value = first_value(
            document.get("sku")
        )

    if value in (None, ""):
        return None

    return str(value).strip()


def normalize_for_hash(value: Any) -> Any:
    """
    Normalize only for comparison.

    This does not alter the stored Reality.
    """

    if isinstance(value, dict):
        return {
            str(key): normalize_for_hash(item)
            for key, item in sorted(
                value.items(),
                key=lambda item: str(item[0]),
            )
        }

    if isinstance(value, list):
        return [
            normalize_for_hash(item)
            for item in value
        ]

    return value


def reality_fingerprint(
    document: dict[str, Any],
) -> str:
    """
    Fingerprint the complete API Document.

    Used only to detect whether the same API unique_id returned
    the same or a different Document.
    """

    normalized = normalize_for_hash(
        document
    )

    payload = json.dumps(
        normalized,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )

    return hashlib.sha256(
        payload.encode("utf-8")
    ).hexdigest()


# ============================================================================
# Document Extraction
# ============================================================================

def extract_document(
    runtime: dict[str, Any],
) -> dict[str, Any] | None:
    """
    Extract the HawkSearch Document.

    HP Fetch currently uses a flattened Product Runtime.

    Therefore the following Seed metadata is NOT required here:

        entry_name
        maker
        series
        slug
        runtime

    Supported runtime shapes:

    1. runtime["hawksearch_document"]

    2. runtime["hawksearch_result"]["Document"]

    3. runtime["response"]["Results"][n]["Document"]

    4. runtime["Results"][n]["Document"]
    """

    # ------------------------------------------------------------------------
    # Flattened Product Runtime
    # ------------------------------------------------------------------------

    document = runtime.get(
        "hawksearch_document"
    )

    if isinstance(
        document,
        dict,
    ):
        return document

    # ------------------------------------------------------------------------
    # Result wrapper
    # ------------------------------------------------------------------------

    result = runtime.get(
        "hawksearch_result"
    )

    if isinstance(
        result,
        dict,
    ):
        document = result.get(
            "Document"
        )

        if isinstance(
            document,
            dict,
        ):
            return document

    # ------------------------------------------------------------------------
    # Raw response
    # ------------------------------------------------------------------------

    response = runtime.get(
        "response"
    )

    if isinstance(
        response,
        dict,
    ):
        results = response.get(
            "Results"
        )

        if isinstance(
            results,
            list,
        ):
            for result in results:

                if not isinstance(
                    result,
                    dict,
                ):
                    continue

                document = result.get(
                    "Document"
                )

                if isinstance(
                    document,
                    dict,
                ):
                    return document

    # ------------------------------------------------------------------------
    # Direct Results compatibility
    # ------------------------------------------------------------------------

    results = runtime.get(
        "Results"
    )

    if isinstance(
        results,
        list,
    ):
        for result in results:

            if not isinstance(
                result,
                dict,
            ):
                continue

            document = result.get(
                "Document"
            )

            if isinstance(
                document,
                dict,
            ):
                return document

    return None


# ============================================================================
# Existing Reality Registry
# ============================================================================

def load_existing_registry() -> OrderedDict[str, dict[str, str]]:
    """
    Load the existing HP Reality registry.

    Returns:

        source_unique_id -> {
            "internal_reality_id": "unique_id_N",
            "fingerprint": "...",
        }

    Existing Reality is never merged with another source_unique_id.
    """

    registry: OrderedDict[
        str,
        dict[str, str],
    ] = OrderedDict()

    rows = (
        AcquisitionDocument.objects
        .filter(
            source_name=SOURCE_NAME,
            document_type=DOCUMENT_TYPE,
            document_key__startswith=INTERNAL_ID_PREFIX,
        )
        .order_by("id")
    )

    for row in rows:

        try:
            content = json.loads(
                row.content or "{}"
            )
        except (
            TypeError,
            ValueError,
        ):
            continue

        source_unique_id = content.get(
            "source_unique_id"
        )

        if not source_unique_id:
            continue

        fingerprint = (
            content
            .get("hawksearch", {})
            .get("fingerprint")
        )

        registry.setdefault(
            str(source_unique_id),
            {
                "internal_reality_id": (
                    row.document_key
                ),
                "fingerprint": (
                    fingerprint or ""
                ),
            },
        )

    return registry


def next_internal_index(
    registry: OrderedDict[str, dict[str, str]],
) -> int:
    """
    Find the next internal Reality number.
    """

    highest = 0

    for entry in registry.values():

        internal_id = entry.get(
            "internal_reality_id",
            "",
        )

        if not internal_id.startswith(
            INTERNAL_ID_PREFIX
        ):
            continue

        suffix = internal_id[
            len(INTERNAL_ID_PREFIX):
        ]

        try:
            highest = max(
                highest,
                int(suffix),
            )
        except ValueError:
            continue

    return highest + 1


# ============================================================================
# Observation Contract
# ============================================================================

def build_observation(
    *,
    runtime: dict[str, Any],
    document: dict[str, Any],
    internal_reality_id: str,
    observation_index: int,
) -> dict[str, Any]:
    """
    Build the Observation envelope.

    `reality` is the original HawkSearch Document.

    No specification is extracted and recombined here.
    """

    source_unique_id = (
        get_source_unique_id(
            document
        )
    )

    return {
        "source_name": SOURCE_NAME,
        "site_name": SITE_NAME,
        "document_type": DOCUMENT_TYPE,

        # SHIN internal Reality identity
        "internal_reality_id": (
            internal_reality_id
        ),

        # API Reality identity
        "source_unique_id": (
            source_unique_id
        ),

        "observation_index": (
            observation_index
        ),

        # Optional envelope metadata.
        # These fields are intentionally NOT validation requirements.
        "entry_name": runtime.get(
            "entry_name"
        ),
        "maker": runtime.get(
            "maker"
        ),
        "series": runtime.get(
            "series"
        ),
        "slug": runtime.get(
            "slug"
        ),
        "runtime": runtime.get(
            "runtime"
        ),

        "hawksearch": {
            "doc_id": (
                runtime.get("doc_id")
                if runtime.get("doc_id") is not None
                else runtime.get("DocId")
            ),
            "score": (
                runtime.get("score")
                if runtime.get("score") is not None
                else runtime.get("Score")
            ),
            "is_pin": (
                runtime.get("is_pin")
                if runtime.get("is_pin") is not None
                else runtime.get("IsPin")
            ),
            "is_visible": (
                runtime.get("is_visible")
                if "is_visible" in runtime
                else runtime.get("IsVisible")
            ),
            "is_custom_sort": (
                runtime.get("is_custom_sort")
                if "is_custom_sort" in runtime
                else runtime.get("IsCustomSort")
            ),
            "fingerprint": (
                reality_fingerprint(
                    document
                )
            ),
        },

        # ====================================================================
        # REALITY
        #
        # Exact API Document.
        #
        # DO NOT modify.
        # DO NOT merge with another Document.
        # ====================================================================

        "reality": document,

        "observed_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }


# ============================================================================
# Persistence
# ============================================================================

def save_observation(
    *,
    observation: dict[str, Any],
) -> tuple[
    AcquisitionDocument,
    bool,
]:
    """
    Save one internal Reality.

    The document key is the SHIN internal Reality ID.

    Existing identical Reality is updated.
    A different API unique_id is never merged into it.
    """

    internal_reality_id = (
        observation[
            "internal_reality_id"
        ]
    )

    reality = (
        observation.get(
            "reality"
        )
        or {}
    )

    source_url = (
        first_value(
            reality.get(
                "full_link"
            )
        )
        or first_value(
            reality.get(
                "url_key"
            )
        )
        or ""
    )

    content = json.dumps(
        observation,
        ensure_ascii=False,
        indent=2,
    )

    obj, created = (
        AcquisitionDocument.objects
        .update_or_create(
            source_name=SOURCE_NAME,
            document_type=DOCUMENT_TYPE,
            document_key=(
                internal_reality_id
            ),
            defaults={
                "source_url": source_url,
                "content": content,
            },
        )
    )

    return (
        obj,
        created,
    )


# ============================================================================
# Observation
# ============================================================================

def observe_runtimes(
    runtimes: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Observe every fetched HP Runtime.

    IMPORTANT:

    No unique_id-based blind SKIP.

    The API unique_id represents the API-defined combination.

    Therefore:

        API unique_id
             ↓
        one SHIN internal Reality ID

    If the same API unique_id is encountered again:

        same fingerprint
            → exact repeat
            → same internal Reality ID

        different fingerprint
            → API conflict
            → DO NOT merge
            → DO NOT overwrite the original Reality
            → report the conflict
    """

    registry = load_existing_registry()

    next_index = next_internal_index(
        registry
    )

    results_received = 0
    results_with_doc = 0
    results_without_doc = 0

    unique_api_ids: set[str] = set()

    exact_repeats = 0
    conflicts = 0

    reality_created = 0
    reality_updated = 0

    skipped = 0
    warnings = 0

    observations: list[
        dict[str, Any]
    ] = []

    # ------------------------------------------------------------------------
    # Process every Runtime
    # ------------------------------------------------------------------------

    for observation_index, runtime in enumerate(
        runtimes,
        start=1,
    ):

        if not isinstance(
            runtime,
            dict,
        ):
            warnings += 1

            print(
                "WARNING : HP Runtime is not a dict "
                f"(index={observation_index})"
            )

            continue

        results_received += 1

        document = extract_document(
            runtime
        )

        if not document:

            results_without_doc += 1
            warnings += 1

            print(
                "WARNING : HP Runtime has no "
                "HawkSearch Document "
                f"(index={observation_index})"
            )

            continue

        results_with_doc += 1

        source_unique_id = (
            get_source_unique_id(
                document
            )
        )

        if not source_unique_id:

            warnings += 1

            print(
                "WARNING : HP Document has no "
                "unique_id / sku "
                f"(index={observation_index})"
            )

            continue

        unique_api_ids.add(
            source_unique_id
        )

        fingerprint = (
            reality_fingerprint(
                document
            )
        )

        existing = registry.get(
            source_unique_id
        )

        # --------------------------------------------------------------------
        # Existing API unique_id
        # --------------------------------------------------------------------

        if existing:

            internal_reality_id = (
                existing[
                    "internal_reality_id"
                ]
            )

            existing_fingerprint = (
                existing.get(
                    "fingerprint"
                )
                or ""
            )

            # ---------------------------------------------------------------
            # Exact same API Reality
            # ---------------------------------------------------------------

            if (
                existing_fingerprint
                == fingerprint
            ):

                exact_repeats += 1

                observation = (
                    build_observation(
                        runtime=runtime,
                        document=document,
                        internal_reality_id=(
                            internal_reality_id
                        ),
                        observation_index=(
                            observation_index
                        ),
                    )
                )

                _, created = (
                    save_observation(
                        observation=(
                            observation
                        )
                    )
                )

                if created:
                    reality_created += 1
                else:
                    reality_updated += 1

                observations.append(
                    observation
                )

                continue

            # ---------------------------------------------------------------
            # Same API unique_id, different Document
            # ---------------------------------------------------------------

            conflicts += 1
            warnings += 1

            print()
            print(
                "⚠️ HP REALITY CONFLICT"
            )
            print(
                "API UNIQUE ID       :",
                source_unique_id,
            )
            print(
                "INTERNAL REALITY ID :",
                internal_reality_id,
            )
            print(
                "ACTION              : "
                "DO NOT MERGE / DO NOT OVERWRITE"
            )

            # We intentionally do not fabricate a new product Reality.
            # The API unique_id already identifies the API-defined combination.
            # The conflicting response is preserved only as an observation
            # result in memory for diagnostics.
            observations.append(
                {
                    "source_name": SOURCE_NAME,
                    "site_name": SITE_NAME,
                    "document_type": DOCUMENT_TYPE,
                    "internal_reality_id": (
                        internal_reality_id
                    ),
                    "source_unique_id": (
                        source_unique_id
                    ),
                    "observation_index": (
                        observation_index
                    ),
                    "conflict": True,
                    "existing_fingerprint": (
                        existing_fingerprint
                    ),
                    "received_fingerprint": (
                        fingerprint
                    ),
                    "reality": document,
                }
            )

            continue

        # --------------------------------------------------------------------
        # New API unique_id
        # --------------------------------------------------------------------

        internal_reality_id = (
            f"{INTERNAL_ID_PREFIX}"
            f"{next_index}"
        )

        next_index += 1

        observation = build_observation(
            runtime=runtime,
            document=document,
            internal_reality_id=(
                internal_reality_id
            ),
            observation_index=(
                observation_index
            ),
        )

        _, created = (
            save_observation(
                observation=observation
            )
        )

        if created:
            reality_created += 1
        else:
            reality_updated += 1

        registry[
            source_unique_id
        ] = {
            "internal_reality_id": (
                internal_reality_id
            ),
            "fingerprint": fingerprint,
        }

        observations.append(
            observation
        )

    return {
        "observations": observations,

        "results_received": (
            results_received
        ),

        "results_with_doc": (
            results_with_doc
        ),

        "results_without_doc": (
            results_without_doc
        ),

        "unique_api_ids": (
            len(unique_api_ids)
        ),

        "exact_repeats": (
            exact_repeats
        ),

        "conflicts": (
            conflicts
        ),

        "reality_created": (
            reality_created
        ),

        "reality_updated": (
            reality_updated
        ),

        "skipped": (
            skipped
        ),

        "warnings": (
            warnings
        ),
    }


# ============================================================================
# Display
# ============================================================================

def print_reality_summary(
    observations: list[
        dict[str, Any]
    ],
) -> None:
    """
    Display observed Reality.

    This is for verification only.
    It does not construct a specification.
    """

    print()
    print("=" * 70)
    print("HP REALITY OBSERVATIONS")
    print("=" * 70)

    for observation in observations:

        if observation.get(
            "conflict"
        ):
            continue

        reality = (
            observation.get(
                "reality"
            )
            or {}
        )

        image_values = (
            reality.get(
                "image_full_link"
            )
        )

        feature_values = (
            reality.get(
                "hp_topfeatureslist"
            )
        )

        print()
        print("-" * 70)

        print(
            "INTERNAL REALITY ID :",
            observation.get(
                "internal_reality_id"
            ),
        )

        print(
            "API UNIQUE ID       :",
            observation.get(
                "source_unique_id"
            ),
        )

        print(
            "SKU                 :",
            first_value(
                reality.get(
                    "sku"
                )
            ),
        )

        print(
            "NAME                :",
            first_value(
                reality.get(
                    "name"
                )
            ),
        )

        print(
            "PRICE               :",
            first_value(
                reality.get(
                    "price_sale_sid1"
                )
            ),
        )

        print(
            "IMAGES              :",
            len(
                image_values
                if isinstance(
                    image_values,
                    list,
                )
                else []
            ),
        )

        print(
            "FEATURES            :",
            len(
                feature_values
                if isinstance(
                    feature_values,
                    list,
                )
                else []
            ),
        )

    print()
    print("=" * 70)


# ============================================================================
# Entry Point
# ============================================================================

def main(
    *,
    runtimes: list[
        dict[str, Any]
    ] | None = None,
    list_only: bool = False,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Execute HP HawkSearch Observation Runtime.

    Extra kwargs are accepted for compatibility with import_products.py.
    """

    if runtimes is None:
        raise RuntimeError(
            "HP Observation Runtime requires fetched runtimes."
        )

    print()
    print("=" * 70)
    print("HP HAWKSEARCH OBSERVATION")
    print("=" * 70)

    result = observe_runtimes(
        runtimes
    )

    observations = result[
        "observations"
    ]

    print()
    print(
        f"RUNTIMES            : "
        f"{len(runtimes)}"
    )

    print(
        f"RESULTS RECEIVED    : "
        f"{result['results_received']}"
    )

    print(
        f"RESULTS WITH DOC    : "
        f"{result['results_with_doc']}"
    )

    print(
        f"RESULTS WITHOUT DOC : "
        f"{result['results_without_doc']}"
    )

    print(
        f"UNIQUE API IDS      : "
        f"{result['unique_api_ids']}"
    )

    print(
        f"EXACT REPEATS       : "
        f"{result['exact_repeats']}"
    )

    print(
        f"CONFLICTS           : "
        f"{result['conflicts']}"
    )

    print(
        f"REALITY CREATED     : "
        f"{result['reality_created']}"
    )

    print(
        f"REALITY UPDATED     : "
        f"{result['reality_updated']}"
    )

    print(
        f"SKIPPED             : "
        f"{result['skipped']}"
    )

    print(
        f"RUNTIME WARNINGS    : "
        f"{result['warnings']}"
    )

    if list_only:
        print_reality_summary(
            observations
        )

    print()
    print(
        "# HP HAWKSEARCH OBSERVATION COMPLETE"
    )

    return result


# ============================================================================
# Standalone Execution
# ============================================================================

if __name__ == "__main__":
    main()
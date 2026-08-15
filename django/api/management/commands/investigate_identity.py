#!/usr/bin/env python3
# ============================================================================
# FILE:
#     api/management/commands/investigate_identity.py
#
# SHIN CORE LINX
#
# Identity Investigation Runtime
#
# Purpose
#
# Investigate the current PCProduct Identity Reality.
#
# PCProduct
#     ↓
# maker
# brand
# series
#     ↓
# Identity State
#     ↓
# Investigation Report
#
# Additional Investigation
#
# Series Empty
#     ↓
# Reality Name
#     ↓
# Identity TSV
#     ↓
# ┌──────────────────────────────────────┐
# │ AUTHORITY_EXISTS_BUT_UNRESOLVED      │
# │ TSV_CANDIDATE                         │
# │ NO_CANDIDATE                          │
# └──────────────────────────────────────┘
#
# Responsibilities
#
# - Inspect PCProduct Identity Reality
# - Classify Brand / Series state
# - Aggregate results by maker
# - Display individual products
# - Optionally display Observation Reality
# - Support maker filtering
# - Support empty-state filtering
# - Inspect Identity TSV
# - Display possible TSV candidates
#
# NOT
#
# - Modify PCProduct
# - Execute Identity Runtime
# - Modify TSV
# - Generate semantic meaning
# - Infer Brand
# - Confirm Series
# - Guess missing Identity
# - AI
# - Integration
#
# READ ONLY
# ============================================================================

from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import re

from django.core.management.base import (
    BaseCommand,
)

from api.models import (
    PCProduct,
)


# ============================================================================
# Identity State
# ============================================================================

STATE_BOTH_FILLED = (
    "BOTH_FILLED"
)

STATE_BRAND_ONLY = (
    "BRAND_ONLY"
)

STATE_SERIES_ONLY = (
    "SERIES_ONLY"
)

STATE_BOTH_EMPTY = (
    "BOTH_EMPTY"
)


# ============================================================================
# TSV Investigation State
# ============================================================================

AUTHORITY_EXISTS_BUT_UNRESOLVED = (
    "AUTHORITY_EXISTS_BUT_UNRESOLVED"
)

TSV_CANDIDATE = (
    "TSV_CANDIDATE"
)

NO_CANDIDATE = (
    "NO_CANDIDATE"
)


# ============================================================================
# TSV
# ============================================================================

TSV_HEADER = (
    "maker",
    "keyword",
    "brand",
    "series",
    "collaboration",
    "priority",
)


# ============================================================================
# Helpers
# ============================================================================

def normalize_value(
    value,
) -> str:

    if value is None:

        return ""

    return str(
        value
    ).strip()


def normalize_match(
    value: str,
) -> str:

    value = normalize_value(
        value
    )

    value = value.lower()

    value = value.replace(
        "　",
        " ",
    )

    value = re.sub(
        r"\s+",
        " ",
        value,
    )

    return value.strip()


def classify_state(
    *,
    brand: str,
    series: str,
) -> str:

    has_brand = bool(
        normalize_value(
            brand
        )
    )

    has_series = bool(
        normalize_value(
            series
        )
    )

    if has_brand and has_series:

        return STATE_BOTH_FILLED

    if has_brand:

        return STATE_BRAND_ONLY

    if has_series:

        return STATE_SERIES_ONLY

    return STATE_BOTH_EMPTY

# ============================================================================
# TSV Discovery
# ============================================================================

IDENTITY_TSV = (
    Path(__file__).resolve().parents[3]
    / "acquisition"
    / "sources"
    / "runtime"
    / "identity"
    / "identity.tsv"
)


def find_identity_tsvs() -> list[Path]:
    """
    Return the canonical Identity Authority TSV.

    This Runtime is read-only.

    No TSV is modified.
    """

    if not IDENTITY_TSV.exists():

        raise FileNotFoundError(
            f"Identity Authority TSV not found: "
            f"{IDENTITY_TSV}"
        )

    return [
        IDENTITY_TSV
    ]

# ============================================================================
# TSV Reader
# ============================================================================

def load_identity_authority() -> list[dict]:
    """
    Load Identity Authority rows.

    The TSV is treated as Reality/Authority input.

    This function NEVER writes to the TSV.
    """

    rows = []

    for path in find_identity_tsvs():

        try:

            with path.open(
                "r",
                encoding="utf-8-sig",
            ) as fp:

                lines = fp.readlines()

        except (
            OSError,
            UnicodeError,
        ):

            continue

        if not lines:

            continue

        header = [
            normalize_value(
                value
            )
            for value in lines[0].rstrip(
                "\n\r"
            ).split("\t")
        ]

        index = {
            normalize_match(
                name
            ): position
            for position, name in enumerate(
                header
            )
        }

        required = {
            normalize_match(
                value
            )
            for value in TSV_HEADER
        }

        if not required.issubset(
            set(index.keys())
        ):

            continue

        for line in lines[1:]:

            if not line.strip():

                continue

            values = line.rstrip(
                "\n\r"
            ).split("\t")

            def get(
                name: str,
            ) -> str:

                position = index.get(
                    normalize_match(
                        name
                    )
                )

                if position is None:

                    return ""

                if position >= len(
                    values
                ):

                    return ""

                return normalize_value(
                    values[position]
                )

            keyword = get(
                "keyword"
            )

            if not keyword:

                continue

            rows.append(
                {
                    "source": str(
                        path
                    ),
                    "maker": get(
                        "maker"
                    ),
                    "keyword": keyword,
                    "brand": get(
                        "brand"
                    ),
                    "series": get(
                        "series"
                    ),
                    "collaboration": get(
                        "collaboration"
                    ),
                    "priority": get(
                        "priority"
                    ),
                }
            )

    return rows


# ============================================================================
# TSV Matching
# ============================================================================

def authority_matches(
    *,
    name: str,
    maker: str,
    brand: str,
    authority: list[dict],
) -> list[dict]:
    """
    Find existing Identity Authority keywords contained in Reality name.

    No identity is assigned here.

    This is investigation only.
    """

    normalized_name = normalize_match(
        name
    )

    normalized_maker = normalize_match(
        maker
    )

    normalized_brand = normalize_match(
        brand
    )

    matches = []

    for row in authority:

        row_maker = normalize_match(
            row.get(
                "maker",
                "",
            )
        )

        row_keyword = normalize_match(
            row.get(
                "keyword",
                "",
            )
        )

        row_brand = normalize_match(
            row.get(
                "brand",
                "",
            )
        )

        if not row_keyword:

            continue

        #
        # Maker restriction.
        #
        # If both sides have maker information,
        # require equality.
        #

        if (
            normalized_maker
            and row_maker
            and normalized_maker
            != row_maker
        ):

            continue

        #
        # Brand restriction.
        #
        # If the current product has a brand,
        # prefer Authority rows belonging to it.
        #

        if (
            normalized_brand
            and row_brand
            and normalized_brand
            != row_brand
        ):

            continue

        if (
            row_keyword
            not in normalized_name
        ):

            continue

        matches.append(
            row
        )

    #
    # Longest keyword first.
    #
    # This is investigation ordering only.
    # It does NOT execute Identity Runtime.
    #

    matches.sort(
        key=lambda row: (
            len(
                normalize_match(
                    row.get(
                        "keyword",
                        "",
                    )
                )
            ),
            _priority_value(
                row.get(
                    "priority",
                    "",
                )
            ),
        ),
        reverse=True,
    )

    return matches


def _priority_value(
    value: str,
) -> int:

    try:

        return int(
            normalize_value(
                value
            )
        )

    except (
        TypeError,
        ValueError,
    ):

        return 0


# ============================================================================
# Candidate Extraction
# ============================================================================

def extract_candidate_tokens(
    *,
    name: str,
    brand: str,
) -> list[str]:
    """
    Extract observable name tokens for investigation.

    This does NOT decide that a token is a Series.

    It only produces candidates that can be reviewed by a human.
    """

    normalized_name = normalize_value(
        name
    )

    normalized_brand = normalize_match(
        brand
    )

    if not normalized_name:

        return []

    #
    # Keep Japanese / Latin / numeric blocks.
    #
    # Examples:
    #
    #   dynabook X6
    #   ZenBook Pro
    #   VivoBook S
    #   ROG Zephyrus
    #

    tokens = re.findall(
        r"[A-Za-z0-9][A-Za-z0-9+._-]*",
        normalized_name,
    )

    if not tokens:

        return []

    results = []

    for index, token in enumerate(
        tokens
    ):

        normalized_token = normalize_match(
            token
        )

        if not normalized_token:

            continue

        #
        # Ignore the brand token itself.
        #

        if (
            normalized_brand
            and normalized_token
            == normalized_brand
        ):

            continue

        #
        # Ignore pure specifications.
        #

        if re.fullmatch(
            r"\d+(?:GB|TB|MB|型)?",
            token,
            flags=re.IGNORECASE,
        ):

            continue

        if re.fullmatch(
            r"(?:i[3579]|r[3579]|rtx\d+|gtx\d+)",
            normalized_token,
            flags=re.IGNORECASE,
        ):

            continue

        #
        # Candidate token.
        #

        candidate = token.strip()

        if candidate not in results:

            results.append(
                candidate
            )

        #
        # Brand + next token.
        #
        # Example:
        #
        #   dynabook X6
        #   ZenBook Pro
        #
        # This remains a candidate only.
        #

        if (
            index == 0
            and normalized_brand
            and normalized_token
            != normalized_brand
        ):

            candidate = (
                f"{brand} {token}"
            )

            if candidate not in results:

                results.append(
                    candidate
                )

    return results


def build_tsv_candidate(
    *,
    name: str,
    brand: str,
    authority: list[dict],
) -> dict:
    """
    Build a read-only TSV investigation result.

    Possible results:

        AUTHORITY_EXISTS_BUT_UNRESOLVED
        TSV_CANDIDATE
        NO_CANDIDATE
    """

    matches = authority_matches(
        name=name,
        maker="",
        brand=brand,
        authority=authority,
    )

    #
    # Existing Authority keyword matched.
    #

    if matches:

        series_matches = [
            row
            for row in matches
            if normalize_value(
                row.get(
                    "series",
                    "",
                )
            )
        ]

        if series_matches:

            return {
                "state":
                    AUTHORITY_EXISTS_BUT_UNRESOLVED,

                "matches":
                    series_matches,

                "candidates":
                    [],
            }

    #
    # No useful existing Authority match.
    #

    tokens = extract_candidate_tokens(
        name=name,
        brand=brand,
    )

    #
    # Remove candidates already represented
    # by an existing Authority keyword.
    #

    existing_keywords = {
        normalize_match(
            row.get(
                "keyword",
                "",
            )
        )
        for row in authority
    }

    candidates = []

    for token in tokens:

        normalized = normalize_match(
            token
        )

        if not normalized:

            continue

        if normalized in existing_keywords:

            continue

        if normalized not in {
            normalize_match(
                value
            )
            for value in candidates
        }:

            candidates.append(
                token
            )

    if candidates:

        return {
            "state":
                TSV_CANDIDATE,

            "matches":
                [],

            "candidates":
                candidates[:5],
        }

    return {
        "state":
            NO_CANDIDATE,

        "matches":
            [],

        "candidates":
            [],
    }


# ============================================================================
# Command
# ============================================================================

class Command(
    BaseCommand
):

    help = (
        "Investigate PCProduct Brand / Series Identity Reality."
    )

    # ========================================================================
    # Arguments
    # ========================================================================

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(
            "--maker",
            type=str,
            default="",
            help=(
                "Investigate only the specified maker."
            ),
        )

        parser.add_argument(
            "--empty",
            action="store_true",
            help=(
                "Show only products where Brand or Series is empty."
            ),
        )

        parser.add_argument(
            "--brand-empty",
            action="store_true",
            help=(
                "Show only products where Brand is empty."
            ),
        )

        parser.add_argument(
            "--series-empty",
            action="store_true",
            help=(
                "Show only products where Series is empty."
            ),
        )

        parser.add_argument(
            "--both-empty",
            action="store_true",
            help=(
                "Show only products where both Brand and Series are empty."
            ),
        )

        parser.add_argument(
            "--observation",
            action="store_true",
            help=(
                "Display Observation Runtime for each result."
            ),
        )

        parser.add_argument(
            "--candidates",
            action="store_true",
            help=(
                "Display read-only TSV investigation candidates "
                "for Series-empty products."
            ),
        )

        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help=(
                "Limit individual result output. "
                "0 means no limit."
            ),
        )

    # ========================================================================
    # Handle
    # ========================================================================

    def handle(
        self,
        *args,
        **options,
    ):

        maker_filter = normalize_value(
            options.get(
                "maker",
                "",
            )
        ).lower()

        show_empty = bool(
            options.get(
                "empty",
                False,
            )
        )

        show_brand_empty = bool(
            options.get(
                "brand_empty",
                False,
            )
        )

        show_series_empty = bool(
            options.get(
                "series_empty",
                False,
            )
        )

        show_both_empty = bool(
            options.get(
                "both_empty",
                False,
            )
        )

        show_observation = bool(
            options.get(
                "observation",
                False,
            )
        )

        show_candidates = bool(
            options.get(
                "candidates",
                False,
            )
        )

        limit = int(
            options.get(
                "limit",
                0,
            )
            or 0
        )

        # ====================================================================
        # Header
        # ====================================================================

        self.stdout.write("")
        self.stdout.write(
            "=" * 70
        )
        self.stdout.write(
            "🔎 IDENTITY INVESTIGATION"
        )
        self.stdout.write(
            "=" * 70
        )

        if maker_filter:

            self.stdout.write(
                f"Maker Filter : {maker_filter}"
            )

        else:

            self.stdout.write(
                "Maker Filter : ALL"
            )

        if show_series_empty:

            self.stdout.write(
                "Mode         : SERIES EMPTY"
            )

        elif show_brand_empty:

            self.stdout.write(
                "Mode         : BRAND EMPTY"
            )

        elif show_both_empty:

            self.stdout.write(
                "Mode         : BOTH EMPTY"
            )

        elif show_empty:

            self.stdout.write(
                "Mode         : EMPTY"
            )

        if show_candidates:

            self.stdout.write(
                "Candidate    : ENABLED (READ ONLY)"
            )

        # ====================================================================
        # Identity Authority
        # ====================================================================

        authority = []

        if show_candidates:

            authority = (
                load_identity_authority()
            )

            self.stdout.write(
                f"Authority    : "
                f"{len(authority)} rows"
            )

        # ====================================================================
        # Query
        # ====================================================================

        products = (
            PCProduct.objects
            .all()
            .order_by(
                "maker",
                "id",
            )
        )

        # ====================================================================
        # Maker Filter
        # ====================================================================

        if maker_filter:

            products = products.filter(
                maker__iexact=maker_filter,
            )

        # ====================================================================
        # Investigation
        # ====================================================================

        results = []

        summary = defaultdict(
            lambda: {
                STATE_BOTH_FILLED: 0,
                STATE_BRAND_ONLY: 0,
                STATE_SERIES_ONLY: 0,
                STATE_BOTH_EMPTY: 0,
                "total": 0,
            }
        )

        total = 0

        for product in products:

            brand = normalize_value(
                getattr(
                    product,
                    "brand",
                    "",
                )
            )

            series = normalize_value(
                getattr(
                    product,
                    "series",
                    "",
                )
            )

            maker = normalize_value(
                getattr(
                    product,
                    "maker",
                    "",
                )
            )

            state = classify_state(
                brand=brand,
                series=series,
            )

            # ----------------------------------------------------------------
            # Summary always reflects complete DB Reality.
            # ----------------------------------------------------------------

            summary[maker][
                state
            ] += 1

            summary[maker][
                "total"
            ] += 1

            total += 1

            # ----------------------------------------------------------------
            # Result Filter
            # ----------------------------------------------------------------

            include = True

            if show_empty:

                include = (
                    state
                    != STATE_BOTH_FILLED
                )

            if show_brand_empty:

                include = (
                    not bool(brand)
                )

            if show_series_empty:

                include = (
                    not bool(series)
                )

            if show_both_empty:

                include = (
                    state
                    == STATE_BOTH_EMPTY
                )

            if include:

                result = {
                    "product": product,
                    "maker": maker,
                    "brand": brand,
                    "series": series,
                    "state": state,
                }

                # ------------------------------------------------------------
                # Candidate Investigation
                # ------------------------------------------------------------

                if (
                    show_candidates
                    and not series
                ):

                    result[
                        "candidate"
                    ] = build_tsv_candidate(
                        name=normalize_value(
                            getattr(
                                product,
                                "name",
                                "",
                            )
                        ),
                        brand=brand,
                        authority=authority,
                    )

                else:

                    result[
                        "candidate"
                    ] = {
                        "state":
                            NO_CANDIDATE,
                        "matches":
                            [],
                        "candidates":
                            [],
                    }

                results.append(
                    result
                )

        # ====================================================================
        # Summary
        # ====================================================================

        self.stdout.write("")
        self.stdout.write(
            "=" * 70
        )
        self.stdout.write(
            "IDENTITY SUMMARY"
        )
        self.stdout.write(
            "=" * 70
        )

        self.stdout.write("")

        self.stdout.write(
            "Maker".ljust(18)
            + "Total".rjust(8)
            + "Both".rjust(10)
            + "Brand Only".rjust(14)
            + "Series Only".rjust(15)
            + "Both Empty".rjust(14)
        )

        self.stdout.write(
            "-" * 79
        )

        for maker in sorted(
            summary.keys(),
            key=lambda value: value.lower(),
        ):

            data = summary[
                maker
            ]

            self.stdout.write(
                maker.ljust(18)
                + str(
                    data["total"]
                ).rjust(8)
                + str(
                    data[STATE_BOTH_FILLED]
                ).rjust(10)
                + str(
                    data[STATE_BRAND_ONLY]
                ).rjust(14)
                + str(
                    data[STATE_SERIES_ONLY]
                ).rjust(15)
                + str(
                    data[STATE_BOTH_EMPTY]
                ).rjust(14)
            )

        self.stdout.write(
            "-" * 79
        )

        # ====================================================================
        # Global Summary
        # ====================================================================

        global_summary = {
            STATE_BOTH_FILLED: 0,
            STATE_BRAND_ONLY: 0,
            STATE_SERIES_ONLY: 0,
            STATE_BOTH_EMPTY: 0,
        }

        for data in summary.values():

            for state in global_summary:

                global_summary[
                    state
                ] += data[
                    state
                ]

        self.stdout.write(
            "TOTAL".ljust(18)
            + str(total).rjust(8)
            + str(
                global_summary[
                    STATE_BOTH_FILLED
                ]
            ).rjust(10)
            + str(
                global_summary[
                    STATE_BRAND_ONLY
                ]
            ).rjust(14)
            + str(
                global_summary[
                    STATE_SERIES_ONLY
                ]
            ).rjust(15)
            + str(
                global_summary[
                    STATE_BOTH_EMPTY
                ]
            ).rjust(14)
        )

        # ====================================================================
        # Result Count
        # ====================================================================

        self.stdout.write("")
        self.stdout.write(
            "=" * 70
        )
        self.stdout.write(
            "INVESTIGATION RESULTS"
        )
        self.stdout.write(
            "=" * 70
        )

        self.stdout.write(
            f"Matched : {len(results)}"
        )

        # ====================================================================
        # Individual Results
        # ====================================================================

        if not results:

            self.stdout.write(
                "No matching products."
            )

            self.stdout.write(
                "=" * 70
            )

            return

        output_results = results

        if limit > 0:

            output_results = results[
                :limit
            ]

        # ====================================================================
        # State Sections
        # ====================================================================

        states = (
            STATE_BOTH_EMPTY,
            STATE_BRAND_ONLY,
            STATE_SERIES_ONLY,
            STATE_BOTH_FILLED,
        )

        for state in states:

            state_results = [
                result
                for result in output_results
                if result["state"] == state
            ]

            if not state_results:

                continue

            self.stdout.write("")
            self.stdout.write(
                "=" * 70
            )
            self.stdout.write(
                state
            )
            self.stdout.write(
                "=" * 70
            )

            for index, result in enumerate(
                state_results,
                start=1,
            ):

                product = result[
                    "product"
                ]

                self.stdout.write("")
                self.stdout.write(
                    f"[{index}]"
                )

                self.stdout.write(
                    f"maker  : "
                    f"{result['maker']}"
                )

                self.stdout.write(
                    f"brand  : "
                    f"{result['brand']}"
                )

                self.stdout.write(
                    f"series : "
                    f"{result['series']}"
                )

                self.stdout.write(
                    f"state  : "
                    f"{result['state']}"
                )

                self.stdout.write(
                    f"id     : "
                    f"{product.id}"
                )

                self.stdout.write(
                    f"unique : "
                    f"{getattr(product, 'unique_id', '')}"
                )

                self.stdout.write(
                    f"name   : "
                    f"{getattr(product, 'name', '')}"
                )

                self.stdout.write(
                    f"model  : "
                    f"{getattr(product, 'model', '')}"
                )

                self.stdout.write(
                    f"url    : "
                    f"{getattr(product, 'url', '')}"
                )

                # ------------------------------------------------------------
                # Candidate Investigation
                # ------------------------------------------------------------

                candidate = result.get(
                    "candidate",
                    {},
                )

                candidate_state = (
                    candidate.get(
                        "state",
                        NO_CANDIDATE,
                    )
                )

                if (
                    show_candidates
                    and not result["series"]
                ):

                    self.stdout.write("")
                    self.stdout.write(
                        "-" * 70
                    )
                    self.stdout.write(
                        "IDENTITY TSV INVESTIGATION"
                    )
                    self.stdout.write(
                        "-" * 70
                    )

                    self.stdout.write(
                        f"Result : "
                        f"{candidate_state}"
                    )

                    # --------------------------------------------------------
                    # Existing Authority
                    # --------------------------------------------------------

                    if (
                        candidate_state
                        == AUTHORITY_EXISTS_BUT_UNRESOLVED
                    ):

                        self.stdout.write("")
                        self.stdout.write(
                            "Existing Authority Match:"
                        )

                        matches = candidate.get(
                            "matches",
                            [],
                        )

                        for row in matches[:5]:

                            self.stdout.write(
                                f"  keyword : "
                                f"{row.get('keyword', '')}"
                            )

                            self.stdout.write(
                                f"  brand   : "
                                f"{row.get('brand', '')}"
                            )

                            self.stdout.write(
                                f"  series  : "
                                f"{row.get('series', '')}"
                            )

                            self.stdout.write(
                                f"  priority: "
                                f"{row.get('priority', '')}"
                            )

                            self.stdout.write(
                                f"  source  : "
                                f"{row.get('source', '')}"
                            )

                            self.stdout.write("")

                        self.stdout.write(
                            "Action : "
                            "CHECK IDENTITY MATCHER"
                        )

                    # --------------------------------------------------------
                    # TSV Candidate
                    # --------------------------------------------------------

                    elif (
                        candidate_state
                        == TSV_CANDIDATE
                    ):

                        self.stdout.write("")
                        self.stdout.write(
                            "Possible TSV Candidates:"
                        )

                        for value in candidate.get(
                            "candidates",
                            [],
                        ):

                            self.stdout.write(
                                f"  → {value}"
                            )

                        self.stdout.write("")
                        self.stdout.write(
                            "Action : REVIEW TSV"
                        )

                    # --------------------------------------------------------
                    # No Candidate
                    # --------------------------------------------------------

                    else:

                        self.stdout.write("")
                        self.stdout.write(
                            "No reliable TSV candidate "
                            "was extracted."
                        )

                        self.stdout.write(
                            "Action : REVIEW REALITY"
                        )

                # ------------------------------------------------------------
                # Observation Reality
                # ------------------------------------------------------------

                if show_observation:

                    observation = getattr(
                        product,
                        "observation_runtime",
                        None,
                    )

                    self.stdout.write("")
                    self.stdout.write(
                        "OBSERVATION:"
                    )

                    self.stdout.write(
                        str(
                            observation
                        )
                    )

        # ====================================================================
        # Candidate Summary
        # ====================================================================

        if show_candidates:

            candidate_counts = {
                AUTHORITY_EXISTS_BUT_UNRESOLVED:
                    0,

                TSV_CANDIDATE:
                    0,

                NO_CANDIDATE:
                    0,
            }

            for result in results:

                if result["series"]:

                    continue

                state = (
                    result
                    .get(
                        "candidate",
                        {},
                    )
                    .get(
                        "state",
                        NO_CANDIDATE,
                    )
                )

                if state in candidate_counts:

                    candidate_counts[
                        state
                    ] += 1

            self.stdout.write("")
            self.stdout.write(
                "=" * 70
            )
            self.stdout.write(
                "TSV INVESTIGATION SUMMARY"
            )
            self.stdout.write(
                "=" * 70
            )

            self.stdout.write(
                f"Authority Exists / "
                f"Unresolved : "
                f"{candidate_counts[AUTHORITY_EXISTS_BUT_UNRESOLVED]}"
            )

            self.stdout.write(
                f"TSV Candidate             : "
                f"{candidate_counts[TSV_CANDIDATE]}"
            )

            self.stdout.write(
                f"No Candidate              : "
                f"{candidate_counts[NO_CANDIDATE]}"
            )

        # ====================================================================
        # Limit Notice
        # ====================================================================

        if limit > 0 and len(results) > limit:

            self.stdout.write("")
            self.stdout.write(
                f"Displayed : {limit}"
            )

            self.stdout.write(
                f"Remaining : "
                f"{len(results) - limit}"
            )

        # ====================================================================
        # Complete
        # ====================================================================

        self.stdout.write("")
        self.stdout.write(
            "=" * 70
        )
        self.stdout.write(
            "IDENTITY INVESTIGATION COMPLETE"
        )
        self.stdout.write(
            "=" * 70
        )
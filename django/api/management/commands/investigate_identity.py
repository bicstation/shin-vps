# /home/maya/shin-dev/shin-vps/django/api/management/commands/investigate_identity.py
#!/usr/bin/env python3
"""
FILE:
    api/management/commands/investigate_identity.py

SHIN CORE LINX

Identity Investigation Runtime

Purpose

Investigate the current PCProduct Identity Reality.

PCProduct
    ↓
maker
brand
series
    ↓
Identity State
    ↓
Investigation Report

Identity States

    BOTH_FILLED
    BRAND_ONLY
    SERIES_ONLY
    BOTH_EMPTY

Responsibilities

- Inspect PCProduct Identity Reality
- Classify Brand / Series state
- Aggregate results by maker
- Display individual products
- Optionally display Observation Reality
- Support maker filtering
- Support empty-state filtering

NOT

- Modify PCProduct
- Execute Identity Runtime
- Modify TSV
- Generate semantic meaning
- Infer Brand
- Infer Series
- Guess missing Identity
- AI
- Integration

READ ONLY
"""

from __future__ import annotations

from collections import defaultdict

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

                results.append(
                    {
                        "product": product,
                        "maker": maker,
                        "brand": brand,
                        "series": series,
                        "state": state,
                    }
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

        self.stdout.write(
            ""
        )

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
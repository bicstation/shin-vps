# -*- coding: utf-8 -*-

import csv

from api.models import (
    PCAttribute,
    AdultAttribute
)


# =========================================================
# TSV Sync
# =========================================================
def sync_attributes_from_tsv(path):

    created = 0

    updated = 0

    with open(
        path,
        newline="",
        encoding="utf-8"
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t"
        )

        for row in reader:

            # =============================================
            # Backward Compatibility
            # =============================================
            attr_type = (

                row.get("attr_type")

                or

                row.get("type")

                or

                ""
            ).strip()

            search_keywords = (

                row.get("search_keywords")

                or

                row.get("keywords")

                or

                ""
            ).strip()

            slug = (
                row.get("slug", "")
                .strip()
                .lower()
            )

            # =============================================
            # Safe Skip
            # =============================================
            if not slug:
                continue

            if not attr_type:
                continue

            # =============================================
            # is_adult
            # =============================================
            is_adult = (

                str(
                    row.get(
                        "is_adult",
                        "0"
                    )
                ).strip()

                == "1"
            )

            # =============================================
            # Target Model
            # =============================================
            model_class = (

                AdultAttribute

                if is_adult

                else PCAttribute
            )

            # =============================================
            # Safe Numeric
            # =============================================
            try:

                order = int(
                    float(
                        row.get(
                            "order",
                            0
                        )
                    )
                )

            except Exception:

                order = 0

            try:

                semantic_weight = float(

                    row.get(
                        "semantic_weight",
                        0
                    )

                    or 0
                )

            except Exception:

                semantic_weight = 0

            # =============================================
            # Update or Create
            # =============================================
            _, is_created = (

                model_class.objects
                .update_or_create(

                    slug=slug,

                    defaults={

                        # =====================
                        # Base
                        # =====================
                        "name":
                            row.get(
                                "name",
                                ""
                            ).strip(),

                        "attr_type":
                            attr_type,

                        "search_keywords":
                            search_keywords,

                        "order":
                            order,

                        # =====================
                        # Semantic Metadata
                        # =====================
                        "semantic_role":
                            row.get(
                                "semantic_role",
                                ""
                            ).strip(),

                        "semantic_weight":
                            semantic_weight,

                        "icon":
                            row.get(
                                "icon",
                                ""
                            ).strip(),

                        "color":
                            row.get(
                                "color",
                                ""
                            ).strip(),
                    }
                )
            )

            if is_created:

                created += 1

            else:

                updated += 1

    return {

        "created":
            created,

        "updated":
            updated,
    }
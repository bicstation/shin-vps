import csv
from api.models import PCAttribute

def sync_attributes_from_tsv(path):

    created = 0
    updated = 0

    with open(path, newline="", encoding="utf-8") as f:

        reader = csv.DictReader(
            f,
            delimiter="\t"
        )

        for row in reader:
            _, is_created = (
                PCAttribute.objects.update_or_create(
                    slug=row["slug"],
                    defaults={

                        # =========================
                        # Base
                        # =========================
                        "name": row["name"],
                        "attr_type": row["type"],
                        "search_keywords": row["keywords"],
                        "order": int(row["order"]),
                        "is_adult": row["is_adult"] == "1",

                        # =========================
                        # Semantic Metadata
                        # =========================
                        "semantic_role": row.get(
                            "semantic_role",
                            ""
                        ),

                        "semantic_weight": float(
                            row.get(
                                "semantic_weight",
                                0
                            ) or 0
                        ),

                        "icon": row.get(
                            "icon",
                            ""
                        ),

                        "color": row.get(
                            "color",
                            ""
                        ),
                    }
                )
            )

            if is_created:
                created += 1

            else:
                updated += 1

    return {
        "created": created,
        "updated": updated,
    }
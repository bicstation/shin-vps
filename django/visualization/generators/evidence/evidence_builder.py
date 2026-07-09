# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/visualization/generators/evidence/evidence_builder.py

"""
============================================================

SHIN CORE LINX

TSV Semantic Infrastructure Team

Semantic Evidence Builder

============================================================

Responsibilities

Evidence

        ↓

Markdown

============================================================
"""

# --------------------------------------------------
# Build Semantic Evidence Dataset
# --------------------------------------------------

def build_semantic_evidence_dataset(

    group,
    aliases,
    negative_aliases,
    products,
    find_product_evidence,

):

    lines = []

    lines.append("# Semantic Evidence Dataset")
    lines.append("")

    # --------------------------------------------------
    # Semantic Entity
    # --------------------------------------------------

    lines.append("Semantic Entity")
    lines.append(f"└── {group['group_slug']}")
    lines.append("")

    # --------------------------------------------------
    # Alias Evidence
    # --------------------------------------------------

    lines.append("Alias Evidence")

    if aliases:

        for alias in aliases:

            matches = find_product_evidence(
                alias,
                products,
            )

            lines.append(f"├── {alias}")
            lines.append(
                f"│   ├── Match : {len(matches)}"
            )

            if matches:

                for match in matches:

                    lines.append(
                        f"│   ├── {match['unique_id']}"
                    )

                    lines.append(
                        f"│   │   {match['name']}"
                    )

                    lines.append(
                        f"│   │   Source : {match['source']}"
                    )

            else:

                lines.append(
                    "│   └── No Evidence"
                )

    else:

        lines.append("└── -")

    lines.append("")

    # --------------------------------------------------
    # Negative Alias
    # --------------------------------------------------

    lines.append("Negative Alias")

    if negative_aliases:

        for alias in negative_aliases:

            lines.append(
                f"├── {alias}"
            )

    else:

        lines.append("└── -")

    lines.append("")

    # --------------------------------------------------
    # Products
    # --------------------------------------------------

    lines.append("Products")
    lines.append(
        f"└── Count : {products.count()}"
    )
    lines.append("")

    # --------------------------------------------------
    # Summary
    # --------------------------------------------------

    total_alias = len(aliases)

    matched_alias = 0

    for alias in aliases:

        if find_product_evidence(
            alias,
            products,
        ):

            matched_alias += 1

    no_evidence = (
        total_alias
        - matched_alias
    )

    coverage = 0

    if total_alias:

        coverage = (
            matched_alias
            / total_alias
            * 100
        )

    lines.append("Summary")

    lines.append(
        f"├── Total Alias : {total_alias}"
    )

    lines.append(
        f"├── Matched Alias : {matched_alias}"
    )

    lines.append(
        f"├── No Evidence : {no_evidence}"
    )

    lines.append(
        f"└── Coverage : {coverage:.2f}%"
    )

    lines.append("")

    return "\n".join(lines)
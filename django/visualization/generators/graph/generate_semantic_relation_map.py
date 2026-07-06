#!/usr/bin/env python3

"""
SHIN CORE LINX

Semantic Relation Map Generator

Commander Directive Phase 1

TSV
    ↓
Semantic Reality
    ↓
DOT
"""

from pathlib import Path
import csv
from collections import defaultdict


ROOT = Path(__file__).resolve().parents[2]

MASTER = ROOT / "master_data"

UNIVERSES = MASTER / "semantic_universes.tsv"
GROUPS = MASTER / "semantic_groups.tsv"

OUTPUT = ROOT / "visualization" / "relation_map"
OUTPUT.mkdir(parents=True, exist_ok=True)

DOT = OUTPUT / "semantic_relation_map.dot"


def load_universes():

    universes = {}

    with open(UNIVERSES, encoding="utf-8") as f:

        reader = csv.DictReader(f, delimiter="\t")

        for row in reader:

            if row["is_active"] != "1":
                continue

            universes[row["universe_slug"]] = row

    return dict(
        sorted(
            universes.items(),
            key=lambda x: int(x[1]["sort_order"])
        )
    )


def load_groups():

    groups = []

    with open(GROUPS, encoding="utf-8") as f:

        reader = csv.DictReader(f, delimiter="\t")

        for row in reader:

            if row["is_active"] != "1":
                continue

            groups.append(row)

    groups.sort(
        key=lambda x: (
            x["parent_group"],
            int(x["sort_order"])
        )
    )

    return groups


def group_by_universe(groups):

    grouped = defaultdict(list)

    for group in groups:

        grouped[group["parent_group"]].append(group)

    return grouped


def build_header(lines):

    lines.append("digraph SemanticReality {")
    lines.append("")
    lines.append("    rankdir=LR;")
    lines.append("")
    lines.append("    compound=true;")
    lines.append("")
    lines.append('    graph [')
    lines.append('        fontname="Helvetica",')
    lines.append('        fontsize=12,')
    lines.append('        splines=ortho')
    lines.append("    ];")
    lines.append("")
    lines.append('    node [')
    lines.append('        fontname="Helvetica"')
    lines.append("    ];")
    lines.append("")
    lines.append('    edge [')
    lines.append('        fontname="Helvetica"')
    lines.append("    ];")
    lines.append("")


def build_universe_clusters(lines, universes, grouped):

    for universe_slug, universe in universes.items():

        title = universe["universe_title"]

        lines.append(
            f'    subgraph cluster_{universe_slug} {{'
        )

        lines.append(
            f'        label="{title}";'
        )

        lines.append('        style="rounded";')
        lines.append('        color="gray70";')
        lines.append("")

        #
        # Universe
        #

        lines.append(
            f'        "{universe_slug}" ['
        )

        lines.append('            shape=folder,')

        lines.append(
            f'            label="{title}"'
        )

        lines.append("        ];")
        lines.append("")

        #
        # Groups
        #

        for group in grouped.get(universe_slug, []):

            slug = group["group_slug"]

            label = group["presentation_name"] or slug

            lines.append(
                f'        "{slug}" ['
            )

            lines.append("            shape=box,")

            lines.append(
                f'            label="{label}"'
            )

            lines.append("        ];")

            lines.append(
                f'        "{universe_slug}" -> "{slug}";'
            )

            lines.append("")

        lines.append("    }")
        lines.append("")


def build_footer(lines):

    lines.append("}")


def build_dot(universes, groups):

    grouped = group_by_universe(groups)

    lines = []

    build_header(lines)

    build_universe_clusters(
        lines,
        universes,
        grouped
    )

    build_footer(lines)

    return "\n".join(lines)


def main():

    universes = load_universes()

    groups = load_groups()

    dot = build_dot(
        universes,
        groups
    )

    DOT.write_text(
        dot,
        encoding="utf-8"
    )

    print()
    print("===========================================")
    print(" SHIN CORE LINX")
    print(" Semantic Relation Map Generator")
    print("===========================================")
    print()
    print("Generated:")
    print(DOT)
    print()


if __name__ == "__main__":
    main()
# -*- coding: utf-8 -*-
# =========================================================
# FILE:
# api/services/semantic/v2/compiler/workflow_compiler.py
# =========================================================

from pathlib import Path

import csv


# =========================================================
# TSV
# =========================================================

WORKFLOW_MAPPING_TSV = (

    Path(__file__)

    .resolve()

    .parents[5]

    /

    "master_data"

    /

    "semantic_workflow_mappings.tsv"

)


# =========================================================
# LOAD TSV
# =========================================================

def load_workflow_mappings():

    rows = []

    if not WORKFLOW_MAPPING_TSV.exists():

        return rows

    with open(

        WORKFLOW_MAPPING_TSV,

        "r",

        encoding="utf-8",

    ) as fp:

        reader = csv.DictReader(

            fp,

            delimiter="\t",

        )

        for row in reader:

            rows.append(row)

    return rows


# =========================================================
# WORKFLOW RUNTIME
# =========================================================

def build_workflow_runtime():

    mappings = (

        load_workflow_mappings()

    )

    workflows = {}

    groups = {}

    relations = []

    for row in mappings:

        group_slug = str(

            row.get(

                "group_slug",

                ""

            )

        ).strip()

        workflow_slug = str(

            row.get(

                "workflow_slug",

                ""

            )

        ).strip()

        try:

            weight = int(

                row.get(

                    "weight",

                    0

                )

            )

        except Exception:

            weight = 0

        if not group_slug:

            continue

        if not workflow_slug:

            continue

        workflows.setdefault(

            workflow_slug,

            []

        )

        workflows[

            workflow_slug

        ].append({

            "group_slug":

                group_slug,

            "weight":

                weight,

        })

        groups.setdefault(

            group_slug,

            []

        )

        groups[

            group_slug

        ].append({

            "workflow_slug":

                workflow_slug,

            "weight":

                weight,

        })

        relations.append({

            "group_slug":

                group_slug,

            "workflow_slug":

                workflow_slug,

            "weight":

                weight,

        })

    return {

        "runtime":

            "workflow_v2",

        "workflow_count":

            len(workflows),

        "group_count":

            len(groups),

        "relation_count":

            len(relations),

        "workflows":

            workflows,

        "groups":

            groups,

        "relations":

            relations,

        "ready":

            True,
    }


# =========================================================
# LOOKUP
# =========================================================

def get_workflow_groups(

    workflow_slug,

):

    runtime = (

        build_workflow_runtime()

    )

    return (

        runtime

        .get(

            "workflows",

            {}

        )

        .get(

            workflow_slug,

            []

        )

    )


def get_group_workflows(

    group_slug,

):

    runtime = (

        build_workflow_runtime()

    )

    return (

        runtime

        .get(

            "groups",

            {}

        )

        .get(

            group_slug,

            []

        )

    )


# =========================================================
# DEBUG
# =========================================================

if __name__ == "__main__":

    runtime = (

        build_workflow_runtime()

    )

    print()

    print("=" * 60)
    print("WORKFLOW V2")
    print("=" * 60)

    print()

    print(

        "Workflows:",

        runtime["workflow_count"]

    )

    print(

        "Groups:",

        runtime["group_count"]

    )

    print(

        "Relations:",

        runtime["relation_count"]

    )
# /home/maya/shin-vps/django/visualization/cli/run_all.py

# /home/maya/shin-vps/django/visualization/cli/run_all.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Run All

============================================================

Execute All Visualization Generators

        ↓

Visualization Build

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from visualization.generators.evidence.generate_evidence import (
    main as evidence_main,
)

from visualization.generators.observatory.generate_observatory import (
    main as observatory_main,
)

from visualization.generators.runtime.generate_runtime import (
    main as runtime_main,
)

from visualization.generators.structures.generate_structure import (
    main as structure_main,
)

from visualization.generators.graph.generate_graph import (
    main as graph_main,
)

from visualization.generators.projection.generate_projection import (
    main as projection_main,
)

from visualization.generators.api.generate_api import (
    main as api_main,
)

from visualization.generators.review.generate_review import (
    main as review_main,
)

# --------------------------------------------------
# Run All
# --------------------------------------------------

def run_all():

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Visualization Build")
    print("========================================")
    print()

    generators = [

        ("Evidence", evidence_main),
        ("Observatory", observatory_main),
        ("Runtime", runtime_main),
        ("Structure", structure_main),
        ("Graph", graph_main),
        ("Projection", projection_main),
        ("API", api_main),
        ("Review", review_main),

    ]

    total = len(generators)

    for index, (name, command) in enumerate(generators, start=1):

        print(f"[{index}/{total}] {name}")
        command()
        print()

    print("========================================")
    print(" Visualization Build Completed")
    print("========================================")
    print()
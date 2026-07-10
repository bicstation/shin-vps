# /home/maya/shin-vps/django/visualization/cli/command.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Command Dispatcher

============================================================

Selection

        ↓

Generator

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from visualization.generators.evidence.generate_evidence import (
    main as generate_evidence,
)

from visualization.generators.observatory.generate_observatory import (
    main as generate_observatory,
)

from visualization.generators.runtime.generate_runtime import (
    main as generate_runtime,
)

from visualization.generators.structures.generate_structure import (
    main as generate_structure,
)

from visualization.generators.graph.generate_graph import (
    main as generate_graph,
)

from visualization.generators.projection.generate_projection import (
    main as generate_projection,
)

from visualization.generators.api.generate_api import (
    main as generate_api,
)

from visualization.generators.review.generate_review import (
    main as generate_review,
)

from visualization.cli.run_all import (
    run_all,
)

# --------------------------------------------------
# Command Table
# --------------------------------------------------

COMMANDS = {

    "1": generate_evidence,

    "2": generate_observatory,

    "3": generate_runtime,

    "4": generate_structure,

    "5": generate_graph,

    "6": generate_projection,

    "7": generate_api,

    "8": generate_review,

    "9": run_all,

}

# --------------------------------------------------
# Execute Command
# --------------------------------------------------

def execute_command(

    selection,

):

    if selection == "0":

        print()
        print("Goodbye.")
        print()

        return False

    command = COMMANDS.get(

        selection,

    )

    if command is None:

        print()
        print("Invalid Selection.")
        print()

        return True

    print()

    command()

    return True
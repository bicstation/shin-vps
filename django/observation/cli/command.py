# /home/maya/shin-vps/django/observation/cli/command.py

"""
============================================================

SHIN CORE LINX

Observation Platform

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

from observation.generators.manufacturer_series.generate import (
    main as generate_manufacturer_series,
)

from observation.cli.run_all import (
    run_all,
)

# --------------------------------------------------
# Command Table
# --------------------------------------------------

COMMANDS = {

    "1": generate_manufacturer_series,

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
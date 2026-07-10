# /home/maya/shin-vps/django/visualization/djvisual.py
#!/usr/bin/env python3

# /home/maya/shin-vps/django/visualization/djvisual.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

CLI Entry Point

============================================================

Python Environment
        ↓
Django Setup
        ↓
CLI Menu
        ↓
Command Dispatcher

============================================================

Reality is NOT modified.

This is the only entry point of
Visualization Platform.

============================================================
"""

# --------------------------------------------------
# Version
# --------------------------------------------------

VERSION = "1.0"

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

import os
import sys

# --------------------------------------------------
# Root
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[1]

if str(ROOT) not in sys.path:

    sys.path.insert(

        0,

        str(ROOT),

    )

# --------------------------------------------------
# Django
# --------------------------------------------------

os.environ.setdefault(

    "DJANGO_SETTINGS_MODULE",

    "tiper_api.settings",

)

import django

django.setup()

# --------------------------------------------------
# CLI
# --------------------------------------------------

from visualization.cli.menu import (

    show_menu,

)

from visualization.cli.command import (

    execute_command,

)

# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    print()

    print("========================================")
    print(" SHIN CORE LINX")
    print(" Visualization Platform")
    print("========================================")
    print()

    print("Version :", VERSION)

    print()

    while True:

        selection = show_menu()

        if not execute_command(

            selection,

        ):

            break

# --------------------------------------------------
# Entry Point
# --------------------------------------------------

if __name__ == "__main__":

    main()
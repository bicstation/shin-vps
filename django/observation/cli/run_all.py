# /home/maya/shin-vps/django/observation/cli/run_all.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Run All

============================================================

Execute All Observation Generators

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from observation.generators.manufacturer_series.generate import (

    main as generate_manufacturer_series,

)

# --------------------------------------------------
# Run All
# --------------------------------------------------

def run_all():

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Observation Platform")
    print(" Run All")
    print("========================================")
    print()

    print("[1/1] Manufacturer Series")
    print()

    generate_manufacturer_series()

    print()
    print("========================================")
    print(" Observation Build Completed")
    print("========================================")
    print()
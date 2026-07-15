# /home/maya/shin-vps/django/observation/cli/menu.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Main Menu

============================================================

Display Main Menu

        ↓

Return Selection

============================================================
"""

# --------------------------------------------------
# Show Menu
# --------------------------------------------------

def show_menu():

    print()
    print("========================================")
    print(" SHIN CORE LINX")
    print(" Observation Platform")
    print("========================================")
    print()

    print(" 1. Manufacturer Series")
    print()
    print(" 9. Run All")
    print()
    print(" 0. Exit")
    print()

    return input(

        "Select > "

    ).strip()
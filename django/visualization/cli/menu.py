# /home/maya/shin-vps/django/visualization/cli/menu.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

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
    print(" Visualization Platform")
    print("========================================")
    print()

    print(" 1. Evidence")
    print(" 2. Observatory")
    print(" 3. Runtime")
    print(" 4. Structure")
    print(" 5. Graph")
    print(" 6. Projection")
    print(" 7. API")
    print(" 8. Review")
    print(" 9. Run All")
    print()
    print(" 0. Exit")
    print()

    return input(

        "Select > "

    ).strip()
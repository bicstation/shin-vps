"""
============================================================

SHIN CORE LINX

Visualization Platform

Evidence CLI

============================================================

Evidence Menu

============================================================
"""

# --------------------------------------------------
# Show Evidence Menu
# --------------------------------------------------

def show_evidence_menu():

    print()
    print("========================================")
    print(" Evidence")
    print("========================================")
    print()

    print(" 1. Generate Evidence")
    print(" 2. Generate All Evidence")
    print()
    print(" 0. Back")
    print()

    return input(
        "Evidence > "
    ).strip()
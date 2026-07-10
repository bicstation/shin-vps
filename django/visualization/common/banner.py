# /home/maya/shin-dev/shin-vps/django/visualization/common/banner.py

"""
============================================================

SHIN CORE LINX
Visualization Platform
Console Banner

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from visualization.common.constants import (

    PROJECT_NAME,
    PLATFORM_NAME,
    VERSION,
    SEPARATOR,

)

# --------------------------------------------------
# Banner
# --------------------------------------------------

def print_banner():

    print()
    print(SEPARATOR)
    print(f" {PROJECT_NAME}")
    print(f" {PLATFORM_NAME}")
    print(SEPARATOR)
    print()

# --------------------------------------------------
# Generator Banner
# --------------------------------------------------

def print_generator_banner(

    title,

):

    print()
    print(SEPARATOR)
    print(f" {PROJECT_NAME}")
    print(f" {title}")
    print(SEPARATOR)
    print()

# --------------------------------------------------
# Version
# --------------------------------------------------

def print_version():

    print(

        f"Version : {VERSION}"

    )

# --------------------------------------------------
# Section
# --------------------------------------------------

def print_section(

    title,

):

    print()
    print(title)
    print("-" * len(title))

# --------------------------------------------------
# Complete
# --------------------------------------------------

def print_complete():

    print()
    print("Completed.")
    print()


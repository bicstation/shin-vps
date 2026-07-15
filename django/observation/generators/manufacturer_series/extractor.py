# /home/maya/shin-vps/django/observation/generators/manufacturer_series/extractor.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Manufacturer Series Extractor

============================================================

Product Name

        ↓

Series Extraction

============================================================

Temporary Observation Dictionary

No Semantic.

No Evaluation.

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

import re

# --------------------------------------------------
# Temporary Observation Dictionary
# --------------------------------------------------

SERIES_DICTIONARY = [

    "ExpertBook",
    "ThinkBook",
    "Alienware",
    "EliteBook",
    "Chromebook",
    "Workstation",

    "Dell Pro Max",
    "Dell Pro",

    "Vivobook",
    "Zenbook",
    "ProBook",
    "Precision",
    "OmniBook",
    "Pavilion",
    "ProArt",
    "Victus",
    "ThinkPad",
    "Legion",

    "ROG",
    "TUF",
    "LOQ",
    "OMEN",
    "ZBook",

    # dynabook / Fujitsu Code Series
    "XZ",
    "CZ",
    "SZ",
    "RA",
    "AZ",
    "XA",
    "XP",
    "WA",
    "WU",
    "FMV",

]

# --------------------------------------------------
# Extract Series
# --------------------------------------------------

def extract_series(

    product_name,

):

    """
    Extract Series from Product Name.

    Long Series
        → Partial Match

    Short Code
        → Pattern Match
    """

    if not product_name:

        return "Unknown"

    name = product_name.strip()

    #
    # Long Series
    #

    for series in sorted(

        SERIES_DICTIONARY,

        key=len,

        reverse=True,

    ):

        #
        # Short codes are handled later.
        #

        if len(series) <= 3:

            continue

        if series.lower() in name.lower():

            return series

    #
    # Short Code Series
    #
    # Example
    #
    #   RA/ZA
    #   XZ/HA
    #   XP/ZA
    #   WA-K3
    #

    for code in [

        "XZ",
        "CZ",
        "SZ",
        "RA",
        "AZ",
        "XA",
        "XP",
        "WA",
        "WU",

    ]:

        pattern = rf"\b{re.escape(code)}([/-]|$)"

        if re.search(

            pattern,

            name,

            flags=re.IGNORECASE,

        ):

            return code

    #
    # FMV
    #

    if re.search(

        r"\bFMV\b",

        name,

        flags=re.IGNORECASE,

    ):

        return "FMV"

    return "Unknown"
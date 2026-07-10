# /home/maya/shin-vps/django/visualization/generators/review/review_analyzer.py

# /home/maya/shin-vps/django/visualization/generators/review/review_analyzer.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Review Analyzer

============================================================

Review Source

        ↓

Review Object

============================================================
"""

# --------------------------------------------------
# Analyze Review
# --------------------------------------------------

def analyze_review(

    review_source,

):

    """
    Review Source を評価し、
    Review Object を生成する。
    """

    return {

        "universe": review_source["universe"],

        "entity": review_source["entity"],

        "status": "OK",

        "summary": review_source,

        "issues": [],

        "proposals": [],

    }


# --------------------------------------------------
# Analyze Coverage
# --------------------------------------------------

def analyze_coverage(

    coverage,

):

    if coverage >= 95:

        return "Excellent"

    if coverage >= 80:

        return "Good"

    if coverage >= 60:

        return "Warning"

    return "Critical"


# --------------------------------------------------
# Analyze Runtime
# --------------------------------------------------

def analyze_runtime(

    ready,

):

    return "Ready" if ready else "Not Ready"


# --------------------------------------------------
# Analyze Alias
# --------------------------------------------------

def analyze_alias(

    alias_count,

):

    if alias_count == 0:

        return "No Alias"

    return "Available"


# --------------------------------------------------
# Analyze Products
# --------------------------------------------------

def analyze_products(

    product_count,

):

    if product_count == 0:

        return "Empty"

    return "Available"
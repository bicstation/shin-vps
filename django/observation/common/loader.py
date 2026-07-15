# /home/maya/shin-vps/django/observation/common/loader.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Common Loader

============================================================

Reality

        ↓

Python Objects

============================================================

Common Loader

Loads Reality only.

No Observation.

No Semantic.

No Evaluation.

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from api.models import PCProduct

# --------------------------------------------------
# Load Products
# --------------------------------------------------

def load_products():

    """
    Load all active products.

    Returns
    -------
    QuerySet[PCProduct]
    """

    return (

        PCProduct.objects

        .filter(

            is_active=True,

        )

        .order_by(

            "id",

        )

    )
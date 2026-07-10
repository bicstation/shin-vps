# /home/maya/shin-vps/django/visualization/generators/projection/projection_collector.py

# /home/maya/shin-vps/django/visualization/generators/projection/projection_collector.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Projection Collector

============================================================

Reality

        ↓

Projection Object

============================================================
"""

# --------------------------------------------------
# Collect Projection
# --------------------------------------------------

def collect_projection(

    products,

):

    projections = []

    for product in products:

        projection = {

            "unique_id": getattr(
                product,
                "unique_id",
                "",
            ),

            "name": getattr(
                product,
                "name",
                "",
            ),

            "brand": getattr(
                product,
                "brand",
                "",
            ),

            "category": getattr(
                product,
                "category",
                "",
            ),

            "price": getattr(
                product,
                "price",
                None,
            ),

            "image": getattr(
                product,
                "image",
                "",
            ),

            "url": getattr(
                product,
                "url",
                "",
            ),

        }

        projections.append(

            projection,

        )

    return projections


# --------------------------------------------------
# Collect Product Projection
# --------------------------------------------------

def collect_product_projection(

    product,

):

    if product is None:

        return None

    return {

        "unique_id": getattr(
            product,
            "unique_id",
            "",
        ),

        "name": getattr(
            product,
            "name",
            "",
        ),

        "brand": getattr(
            product,
            "brand",
            "",
        ),

        "category": getattr(
            product,
            "category",
            "",
        ),

        "price": getattr(
            product,
            "price",
            None,
        ),

        "image": getattr(
            product,
            "image",
            "",
        ),

        "url": getattr(
            product,
            "url",
            "",
        ),

    }


# --------------------------------------------------
# Collect Summary
# --------------------------------------------------

def collect_summary(

    projections,

):

    return {

        "product_count": len(

            projections,

        ),

    }
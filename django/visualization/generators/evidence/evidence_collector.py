# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/visualization/generators/evidence/evidence_collector.py

"""
============================================================

SHIN CORE LINX

TSV Semantic Infrastructure Team

Semantic Evidence Collector

============================================================

Responsibilities

Evidence Search

Product Matching

============================================================
"""


# --------------------------------------------------
# Find Product Evidence
# --------------------------------------------------

def find_product_evidence(

    alias,
    products,

):

    matches = []

    alias_lower = alias.lower()

    for product in products:

        name = (

            product.name
            or ""

        )

        if alias_lower in name.lower():

            matches.append(

                {

                    "unique_id":
                        product.unique_id,

                    "name":
                        name,

                    "source":
                        "Product Name",

                }

            )

    return matches
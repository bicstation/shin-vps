# /home/maya/shin-dev/shin-vps/django/api/utils/semantic_payload.py

from collections import defaultdict


# =========================================================
# normalize attribute
# =========================================================
def normalize_semantic_attribute(attr):

    if not attr:
        return None

    return {

        # =================================================
        # Identity
        # =================================================
        "id":
            getattr(attr, "id", 0),

        # =================================================
        # Semantic Structure
        # =================================================
        "type":
            getattr(attr, "attr_type", None)
            or "unknown",

        "slug":
            getattr(attr, "slug", None)
            or "unknown",

        # =================================================
        # Display
        # =================================================
        "name":
            getattr(attr, "name", None)
            or "",

        # =================================================
        # Semantic Metadata
        # =================================================
        "semantic_role":
            getattr(
                attr,
                "semantic_role",
                None
            )
            or "secondary",

        "semantic_weight":
            float(

                getattr(
                    attr,
                    "semantic_weight",
                    0
                ) or 0

            ),

        # =================================================
        # UI Metadata
        # =================================================
        "icon":
            getattr(attr, "icon", None)
            or "",

        "color":
            getattr(attr, "color", None)
            or "default",
    }


# =========================================================
# grouped attributes
# =========================================================
def build_grouped_attributes(attributes):

    grouped = defaultdict(list)

    for attr in attributes:

        attr_type = (

            attr.get("type")
            or "unknown"

        )

        grouped[attr_type].append(
            attr
        )

    return dict(grouped)


# =========================================================
# semantic payload
# =========================================================
def build_semantic_payload(product):

    # =====================================================
    # Raw Attributes
    # =====================================================
    raw_attributes = (
        product.attributes.all()
    )

    normalized_attributes = []

    # =====================================================
    # Normalize All Attributes
    # =====================================================
    for attr in raw_attributes:

        normalized = (
            normalize_semantic_attribute(
                attr
            )
        )

        if normalized:

            normalized_attributes.append(
                normalized
            )

    # =====================================================
    # Grouped Attributes
    # =====================================================
    grouped_attributes = (
        build_grouped_attributes(
            normalized_attributes
        )
    )

    # =====================================================
    # Final Payload
    # =====================================================
    return {

        # -------------------------------------------------
        # Semantic Version
        # -------------------------------------------------
        "semantic_schema_version": 1,

        # -------------------------------------------------
        # Flat Attributes
        # -------------------------------------------------
        "attributes":
            normalized_attributes,

        # -------------------------------------------------
        # Grouped Attributes
        # -------------------------------------------------
        "grouped_attributes":
            grouped_attributes,
    }
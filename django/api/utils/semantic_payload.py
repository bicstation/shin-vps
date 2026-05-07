# /home/maya/shin-dev/shin-vps/next-bicstation/app/api/utils/semantic_payload.py

from collections import defaultdict

# =========================================
# normalize attribute
# =========================================
def normalize_semantic_attribute(attr):

    if not attr:
        return None

    return {

        "id":
            getattr(attr, "id", 0),

        "type":
            getattr(attr, "attr_type", None)
            or "unknown",

        "name":
            getattr(attr, "name", None)
            or "",

        "slug":
            getattr(attr, "slug", None)
            or "unknown",

        "semantic_role":
            getattr(attr, "semantic_role", None)
            or "secondary",

        "semantic_weight":
            float(
                getattr(
                    attr,
                    "semantic_weight",
                    0
                ) or 0
            ),

        "icon":
            getattr(attr, "icon", None)
            or "",

        "color":
            getattr(attr, "color", None)
            or "default",
    }


# =========================================
# grouped attributes
# =========================================
def build_grouped_attributes(attributes):

    grouped = defaultdict(list)

    for attr in attributes:

        attr_type = (
            attr.get("type")
            or "unknown"
        )

        grouped[attr_type].append(attr)

    return dict(grouped)


# =========================================
# semantic payload
# =========================================
def build_semantic_payload(product):

    raw_attributes = (
        product.attributes.all()
    )

    normalized_attributes = []

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

    grouped_attributes = (
        build_grouped_attributes(
            normalized_attributes
        )
    )

    return {

        "semantic_schema_version": 1,

        "attributes":
            normalized_attributes,

        "grouped_attributes":
            grouped_attributes,
    }
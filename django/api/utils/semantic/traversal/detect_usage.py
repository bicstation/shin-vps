# =========================================================
# FILE:
# api/utils/semantic/traversal/detect_usage.py
# =========================================================


# =========================================================
# DETECT USAGE RUNTIME
# =========================================================

def detect_usage_runtime(

    specs,

    semantic_master,

    trace_runtime=False,

):

    semantic_groups = []

    # =====================================================
    # SOURCE
    # =====================================================

    semantic_attributes = []

    for value in specs.values():

        if isinstance(value, list):

            semantic_attributes.extend(
                value
            )

    semantic_attributes = list(
        set(semantic_attributes)
    )

    # =====================================================
    # GROUP MAPPINGS
    # =====================================================

    group_mappings = semantic_master.get(
        "group_mappings",
        []
    )

    # =====================================================
    # TRAVERSAL
    # =====================================================

    for row in group_mappings:

        group_slug = str(
            row.get(
                "group_slug",
                ""
            )
        ).strip()

        attribute_slug = str(
            row.get(
                "attribute_slug",
                ""
            )
        ).strip()

        if (

            attribute_slug

            in

            semantic_attributes

        ):

            semantic_groups.append(
                group_slug
            )

    # =====================================================
    # UNIQUE
    # =====================================================

    semantic_groups = list(
        set(semantic_groups)
    )

    return semantic_groups
# =========================================================
# FILE:
# api/utils/semantic/authority/aliases.py
# =========================================================


# =========================================================
# RESOLVE ALIAS RUNTIME
# =========================================================

def resolve_alias_runtime(

    normalized_tokens,

    semantic_master,

    trace_runtime=False,

):

    semantic_attributes = []

    # =====================================================
    # MASTER
    # =====================================================

    aliases = semantic_master.get(
        "aliases",
        []
    )

    negative_aliases = semantic_master.get(
        "negative_aliases",
        []
    )

    # =====================================================
    # NEGATIVE MAP
    # =====================================================

    blocked_attributes = set()

    for row in negative_aliases:

        alias = str(
            row.get(
                "alias",
                ""
            )
        ).lower().strip()

        attribute_slug = str(
            row.get(
                "attribute_slug",
                ""
            )
        ).lower().strip()

        if (

            alias

            in

            normalized_tokens

        ):

            blocked_attributes.add(
                attribute_slug
            )

    # =====================================================
    # POSITIVE ALIAS
    # =====================================================

    for row in aliases:

        alias = str(
            row.get(
                "alias",
                ""
            )
        ).lower().strip()

        attribute_slug = str(
            row.get(
                "attribute_slug",
                ""
            )
        ).lower().strip()

        if not alias:

            continue

        # =================================================
        # EXACT MATCH
        # =================================================

        if (

            alias

            in

            normalized_tokens

        ):

            if (

                attribute_slug

                not in

                blocked_attributes

            ):

                semantic_attributes.append(
                    attribute_slug
                )

    # =====================================================
    # UNIQUE
    # =====================================================

    semantic_attributes = list(
        set(semantic_attributes)
    )

    return semantic_attributes
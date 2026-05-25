# =========================================================
# FILE:
# api/utils/semantic/authority/aliases.py
# =========================================================

import re


# =========================================================
# CLEAN TOKEN
# =========================================================

def clean_token(

    token,

):

    token = str(
        token
    ).lower().strip()

    # =====================================================
    # SPACE NORMALIZE
    # =====================================================

    token = re.sub(
        r"\s+",
        " ",
        token,
    )

    # =====================================================
    # DASH NORMALIZE
    # =====================================================

    token = token.replace(
        "-",
        " ",
    )

    # =====================================================
    # RETURN
    # =====================================================

    return token


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
    # CLEAN TOKENS
    # =====================================================

    normalized_tokens = [

        clean_token(token)

        for token in normalized_tokens

        if token
    ]

    # =====================================================
    # NEGATIVE MAP
    # =====================================================

    blocked_attributes = set()

    for row in negative_aliases:

        alias = clean_token(

            row.get(
                "alias",
                ""
            )
        )

        attribute_slug = clean_token(

            row.get(
                "slug",
                ""
            )
        )

        # =================================================
        # VALIDATION
        # =================================================

        if not alias:

            continue

        if not attribute_slug:

            continue

        # =================================================
        # NEGATIVE MATCH
        # =================================================

        for token in normalized_tokens:

            if alias in token:

                blocked_attributes.add(
                    attribute_slug
                )

    # =====================================================
    # POSITIVE ALIAS
    # =====================================================

    for row in aliases:

        alias = clean_token(

            row.get(
                "alias",
                ""
            )
        )

        attribute_slug = clean_token(

            row.get(
                "slug",
                ""
            )
        )

        # =================================================
        # VALIDATION
        # =================================================

        if not alias:

            continue

        if not attribute_slug:

            continue

        # =================================================
        # TOKEN MATCH
        # =================================================

        for token in normalized_tokens:

            # =============================================
            # EXACT MATCH
            # =============================================

            if token == alias:

                if (

                    attribute_slug

                    not in

                    blocked_attributes

                ):

                    semantic_attributes.append(
                        attribute_slug
                    )

                continue

            # =============================================
            # SUBSTRING MATCH
            # =============================================

            if alias in token:

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

    semantic_attributes = sorted(

        list(
            set(
                semantic_attributes
            )
        )
    )

    # =====================================================
    # RESULT
    # =====================================================

    return semantic_attributes
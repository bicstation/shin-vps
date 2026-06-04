# =========================================================
# FILE:
# api/utils/semantic/authority/normalization.py
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
# NORMALIZE RUNTIME
# =========================================================

def normalize_runtime(

    specs,

    semantic_master,

    trace_runtime=False,

):

    normalized_tokens = []

    # =====================================================
    # RAW TOKENS
    # =====================================================

    raw_tokens = []

    for key, value in specs.items():
        
        # =================================================
        # STRING
        # =================================================

        if isinstance(value, str):

            raw_tokens.extend(
                value.split()
            )

        # =================================================
        # LIST
        # =================================================

        elif isinstance(value, list):

            raw_tokens.extend(value) 

        # =================================================
        # LIST
        # =================================================

        if isinstance(value, list):

            raw_tokens.extend(value)

        # =================================================
        # STRING
        # =================================================

        elif isinstance(value, str):

            raw_tokens.append(value)

    # =====================================================
    # CLEAN TOKENS
    # =====================================================

    raw_tokens = [

        clean_token(token)

        for token in raw_tokens

        if token
    ]

    # =====================================================
    # RULES
    # =====================================================

    normalization_rules = semantic_master.get(

        "normalization_rules",

        []
    )

    # =====================================================
    # NORMALIZE
    # =====================================================

    for token in raw_tokens:

        normalized = token

        # =================================================
        # APPLY RULES
        # =================================================

        for rule in normalization_rules:

            raw_token = clean_token(

                rule.get(
                    "raw_token",
                    "",
                )
            )

            normalized_token = clean_token(

                rule.get(
                    "normalized_token",
                    "",
                )
            )

            if not raw_token:

                continue

            # =============================================
            # EXACT MATCH
            # =============================================

            if normalized == raw_token:

                normalized = (
                    normalized_token
                )

                break

            # =============================================
            # SUBSTRING MATCH
            # =============================================

            if raw_token in normalized:

                normalized = (
                    normalized.replace(

                        raw_token,

                        normalized_token,
                    )
                )

        # =================================================
        # FINAL CLEAN
        # =================================================

        normalized = clean_token(
            normalized
        )

        # =================================================
        # EMPTY FILTER
        # =================================================

        if not normalized:

            continue

        # =================================================
        # NOISE FILTER
        # =================================================

        if normalized in [

            "gb",
            "tb",
            "ssd",
            "hdd",
        ]:

            continue

        # =================================================
        # APPEND
        # =================================================

        normalized_tokens.append(
            normalized
        )

    # =====================================================
    # UNIQUE
    # =====================================================

    normalized_tokens = sorted(

        list(
            set(
                normalized_tokens
            )
        )
    )

    return normalized_tokens
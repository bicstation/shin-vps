# =========================================================
# FILE:
# api/utils/semantic/authority/normalization.py
# =========================================================

import re


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

    for value in specs.values():

        if isinstance(value, list):

            raw_tokens.extend(value)

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

        normalized = str(
            token
        ).lower().strip()

        # =================================================
        # APPLY RULES
        # =================================================

        for rule in normalization_rules:

            raw_token = str(
                rule.get(
                    "raw_token",
                    ""
                )
            ).lower().strip()

            normalized_token = str(
                rule.get(
                    "normalized_token",
                    ""
                )
            ).lower().strip()

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

        normalized_tokens.append(
            normalized
        )

    # =====================================================
    # UNIQUE
    # =====================================================

    normalized_tokens = list(
        set(normalized_tokens)
    )

    return normalized_tokens
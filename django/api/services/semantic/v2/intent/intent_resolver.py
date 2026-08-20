# -*- coding: utf-8 -*-
# api/services/semantic/v2/intent/intent_resolver.py

from api.services.semantic.v2.intent.intent_sources import (
    get_intent_aliases,
)

from api.services.semantic.v2.intent.unknown_logger import (
    log_unknown_term,
)


# ==========================================================
# NORMALIZE
# ==========================================================

def normalize_message(
    message,
):

    return (
        message
        .lower()
        .strip()
    )


# ==========================================================
# RESOLVE
# ==========================================================

def resolve_intent(

    message,

):

    normalized = (
        normalize_message(
            message
        )
    )

    aliases = (
        get_intent_aliases()
    )

    matched_groups = []

    # ------------------------------------------------------
    # Alias Match
    # ------------------------------------------------------

    for alias in aliases:

        slug = alias.get(
            "slug"
        )

        if not slug:
            continue

        keyword = (
            alias.get(
                "alias",
                ""
            )
            .lower()
            .strip()
        )

        if (
            keyword
            and
            keyword in normalized
        ):

            if slug not in matched_groups:

                matched_groups.append(
                    slug
                )

    # ------------------------------------------------------
    # Resolve
    # ------------------------------------------------------

    if matched_groups:

        return {

            "intent":
                matched_groups[0],

            "confidence":
                1.0,

            "matched_groups":
                matched_groups,

            "unknown_terms":
                [],
        }

    # ------------------------------------------------------
    # Unknown
    # ------------------------------------------------------

    log_unknown_term(

        term=normalized,

        message=message,

    )

    return {

        "intent":
            None,

        "confidence":
            0.0,

        "matched_groups":
            [],

        "unknown_terms": [
            normalized
        ],

        "message": (

            f"「{normalized}」を"
            "解釈できませんでした。"
            "Intent Dictionaryへの"
            "登録候補として記録しました。"
        ),
    }
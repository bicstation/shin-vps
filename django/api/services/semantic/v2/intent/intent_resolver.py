# -*- coding: utf-8 -*-
# api/services/semantic/v2/intent/intent_resolver.py

from api.services.semantic.v2.intent.intent_sources import (
    get_intent_aliases,
    get_intent_slug_metadata,
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
# INTENT METADATA LOOKUP
# ==========================================================

def find_intent_metadata(
    slug,
    metadata_rows,
):

    for row in metadata_rows:

        if (
            row.get("slug")
            == slug
        ):

            return row

    return None


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

    slug_metadata = (
        get_intent_slug_metadata()
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

        intent = (
            matched_groups[0]
        )

        intent_metadata = (
            find_intent_metadata(
                slug=intent,
                metadata_rows=slug_metadata,
            )
        )

        return {

            "intent":
                intent,

            "intent_metadata":
                intent_metadata,

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

        "intent_metadata":
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
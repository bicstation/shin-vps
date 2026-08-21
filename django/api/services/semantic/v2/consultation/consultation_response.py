# -*- coding: utf-8 -*-
# api/services/semantic/v2/consultation/consultation_response.py

"""
Consultation Response

Responsibility:
- Requirement Runtimeで解決されたgroup_slug[]を受け取る
- Semantic Slug Metadata Authorityから表示名を取得する
- Concierge向けの簡単なResponseを生成する

No semantic interpretation.
No Gemini processing.
No matching logic.
No Finder processing.
"""

from api.services.semantic.v2.authority.slug_metadata import (
    get_slug,
)


# ==========================================================
# RESPONSE
# ==========================================================

def build_consultation_response(
    groups=None,
):

    groups = (
        groups or []
    )

    names = []

    for slug in groups:

        if not isinstance(
            slug,
            str,
        ):
            continue

        metadata = get_slug(
            slug
        )

        if not metadata:
            continue

        name = (
            metadata.get(
                "name",
                ""
            )
            .strip()
        )

        if name:
            names.append(
                name
            )

    # ------------------------------------------------------
    # Remove Duplicates
    # ------------------------------------------------------

    names = list(
        dict.fromkeys(
            names
        )
    )

    # ------------------------------------------------------
    # No Group
    # ------------------------------------------------------

    if not names:

        return (
            "ご希望の条件を確認して、"
            "条件に合うPCを探してみます。"
        )

    # ------------------------------------------------------
    # Response
    # ------------------------------------------------------

    if len(names) == 1:

        subject = (
            f"{names[0]}ですね。"
        )

    else:

        subject = (
            f"{'、'.join(names)}ですね。"
        )

    return (
        subject
        +
        "条件に合うPCを探してみます。"
    )
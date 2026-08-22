# -*- coding: utf-8 -*-
# api/services/semantic/v2/requirement/requirement_parser.py

"""
Requirement Parser

Responsibility:
- Gemini ResponseからJSONを取得する
- groups配列を取り出す
- constraintsを取り出す
- Runtimeで扱える形式へ変換する

No semantic interpretation.
No matching logic.
No scoring logic.
No Authority validation.
"""


import json


# ==========================================================
# PARSE
# ==========================================================

def parse_requirement_response(
    response,
):

    candidates = (
        response.get(
            "candidates",
            []
        )
    )

    if not candidates:

        return {
            "groups": [],
            "constraints": {
                "max_price": None,
            },
        }

    content = (
        candidates[0]
        .get(
            "content",
            {}
        )
    )

    parts = (
        content.get(
            "parts",
            []
        )
    )

    # ------------------------------------------------------
    # Find JSON Response
    # ------------------------------------------------------

    for part in parts:

        if part.get(
            "thought",
            False,
        ):

            continue

        text = (
            part.get(
                "text",
                ""
            )
            .strip()
        )

        if not text:

            continue

        try:

            data = json.loads(
                text
            )

        except (
            json.JSONDecodeError
        ):

            continue

        # --------------------------------------------------
        # Groups
        # --------------------------------------------------

        groups = (
            data.get(
                "groups",
                []
            )
        )

        if not isinstance(
            groups,
            list,
        ):

            groups = []

        # --------------------------------------------------
        # Constraints
        # --------------------------------------------------

        constraints = (
            data.get(
                "constraints",
                {}
            )
        )

        if not isinstance(
            constraints,
            dict,
        ):

            constraints = {}

        max_price = (
            constraints.get(
                "max_price",
                None
            )
        )

        # --------------------------------------------------
        # Result
        # --------------------------------------------------

        return {

            "groups":
                groups,

            "constraints": {

                "max_price":
                    max_price,

            },

        }

    # ------------------------------------------------------
    # Parse Failed
    # ------------------------------------------------------

    return {

        "groups": [],

        "constraints": {

            "max_price": None,

        },

    }
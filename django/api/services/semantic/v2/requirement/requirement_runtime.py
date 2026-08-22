# -*- coding: utf-8 -*-
# api/services/semantic/v2/requirement/requirement_runtime.py

from api.services.semantic.v2.requirement.requirement_resolver import (
    resolve_requirements,
)


# ==========================================================
# REQUIREMENT RUNTIME
# ==========================================================

def build_requirement_runtime(
    message: str,
    previous_requirement=None,
):

    message = (
        message or ""
    ).strip()

    result = (
        resolve_requirements(
            message,
            previous_requirement=previous_requirement,
        )
    )

    constraints = (
        result.get(
            "constraints",
            {}
        )
    )

    if not isinstance(
        constraints,
        dict,
    ):

        constraints = {}

    return {

        "message":
            message,

        "groups":
            result.get(
                "groups",
                []
            ),

        "constraints":
            constraints,

        "ready":
            result.get(
                "ready",
                False
            ),
    }
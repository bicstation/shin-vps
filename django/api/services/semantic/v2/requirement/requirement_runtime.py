# /home/maya/shin-vps/django/api/services/semantic/v2/requirement/requirement_runtime.py
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
):

    message = (
        message or ""
    ).strip()

    result = (
        resolve_requirements(
            message
        )
    )

    return {

        "message":
            message,

        "groups":
            result.get(
                "groups",
                []
            ),

        "ready":
            result.get(
                "ready",
                False
            ),
    }
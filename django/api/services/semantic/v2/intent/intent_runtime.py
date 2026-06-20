# -*- coding: utf-8 -*-
# api/services/semantic/v2/intent/intent_runtime.py

from api.services.semantic.v2.intent.intent_resolver import (
    resolve_intent,
)


# ==========================================================
# INTENT RUNTIME
# ==========================================================

def build_intent_runtime(

    message: str,

):

    message = (
        message or ""
    ).strip()

    result = (
        resolve_intent(
            message
        )
    )

    return {

        "message":
            message,

        "intent":

            result.get(
                "intent"
            ),

        "confidence":

            result.get(
                "confidence",
                0.0
            ),

        "matched_groups":

            result.get(
                "matched_groups",
                []
            ),

        "unknown_terms":

            result.get(
                "unknown_terms",
                []
            ),

        "ready":
            True,
    }
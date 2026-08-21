# -*- coding: utf-8 -*-
# api/services/semantic/v2/requirement/requirement_resolver.py

from api.services.ai.clients.gemini_client import (
    GeminiClient,
)

from api.services.ai.runtime.ai_runtime import (
    AIRuntime,
)

from api.services.semantic.v2.requirement.requirement_sources import (
    get_requirement_groups,
)

from api.services.semantic.v2.requirement.requirement_prompt import (
    build_requirement_prompt,
)

from api.services.semantic.v2.requirement.requirement_parser import (
    parse_requirement_response,
)


# ==========================================================
# RESOLVE
# ==========================================================

def resolve_requirements(
    message,
):

    # ------------------------------------------------------
    # Semantic Group Authority
    # ------------------------------------------------------

    groups = (
        get_requirement_groups()
    )

    # ------------------------------------------------------
    # Prompt
    # ------------------------------------------------------

    prompt = (
        build_requirement_prompt(
            message=message,
            groups=groups,
        )
    )

    # ------------------------------------------------------
    # Gemini
    # ------------------------------------------------------

    client = GeminiClient(
        model_name=(
            AIRuntime.DEFAULT_SUMMARY_MODEL
        )
    )

    result = client.generate(
        prompt=prompt,
        response_mime_type=(
            "application/json"
        ),
    )

    # ------------------------------------------------------
    # Response
    # ------------------------------------------------------

    response = (
        result.get(
            "response",
            {}
        )
    )

    # ------------------------------------------------------
    # Parse
    # ------------------------------------------------------

    parsed = (
        parse_requirement_response(
            response
        )
    )

    resolved_groups = (
        parsed.get(
            "groups",
            []
        )
    )

    # ------------------------------------------------------
    # Authority Validation
    # ------------------------------------------------------

    valid_slugs = {

        group.get(
            "group_slug"
        )

        for group in groups

        if group.get(
            "group_slug"
        )

    }

    resolved_groups = [

        slug

        for slug
        in resolved_groups

        if (
            isinstance(
                slug,
                str,
            )
            and
            slug in valid_slugs
        )

    ]

    # ------------------------------------------------------
    # Remove Duplicates
    # ------------------------------------------------------

    resolved_groups = list(
        dict.fromkeys(
            resolved_groups
        )
    )

    # ------------------------------------------------------
    # Result
    # ------------------------------------------------------

    return {

        "groups":
            resolved_groups,

        "ready":
            True,

    }
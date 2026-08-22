# -*- coding: utf-8 -*-
# api/services/semantic/v2/consultation/consultation_runtime.py

from api.services.semantic.v2.requirement.requirement_runtime import (
    build_requirement_runtime,
)

from api.services.semantic.v2.consultation.consultation_response import (
    build_consultation_response,
)

from api.services.semantic.v2.finder.finder_runtime import (
    build_finder_runtime,
)


# ==========================================================
# CONSULTATION RUNTIME
# ==========================================================

def build_consultation_runtime(
    message,
    previous_requirement=None,
):

    requirement = build_requirement_runtime(
        message,
        previous_requirement=previous_requirement,
    )

    response = build_consultation_response(
        requirement["groups"]
    )

    # ------------------------------------------------------
    # Constraints
    # ------------------------------------------------------

    constraints = requirement.get(
        "constraints",
        {}
    )

    if not isinstance(
        constraints,
        dict,
    ):

        constraints = {}

    # ------------------------------------------------------
    # Finder
    # ------------------------------------------------------

    finder = build_finder_runtime(
        selected_groups=
            requirement["groups"],

        max_price=
            constraints.get(
                "max_price"
            ),

        limit=5,
    )

    # ------------------------------------------------------
    # Result
    # ------------------------------------------------------

    return {

        "response":
            response,

        "requirement":
            requirement,

        **finder,

    }
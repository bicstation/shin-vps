# /home/maya/shin-vps/django/api/services/semantic/v2/consultation/consultation_runtime.py

from api.services.semantic.v2.requirement.requirement_runtime import (
    build_requirement_runtime,
)

from api.services.semantic.v2.consultation.consultation_response import (
    build_consultation_response,
)

from api.services.semantic.v2.finder.finder_runtime import (
    build_finder_runtime,
)


def build_consultation_runtime(message):

    requirement = build_requirement_runtime(
        message
    )

    response = build_consultation_response(
        requirement["groups"]
    )

    finder = build_finder_runtime(
        selected_groups=
            requirement["groups"],
        limit=5,
    )

    return {

        "response":
            response,

        "requirement":
            requirement,

        **finder,

    }
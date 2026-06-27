# -*- coding: utf-8 -*-
# api/services/semantic/v2/traversal/traversal_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
    build_traversal_runtime as build_builder_runtime,
)


# ==========================================================
# TRAVERSAL RUNTIME
# ==========================================================

def build_traversal_runtime():

    authority = (
        build_authority_runtime()
    )

    runtime = (
        build_builder_runtime()
    )

    return {

        # --------------------------------------------------
        # Traversal Runtime
        # --------------------------------------------------

        **runtime,

        # --------------------------------------------------
        # Authority
        # --------------------------------------------------

        "semantic_schema_version":

            authority.get(
                "semantic_schema_version"
            ),

        "authority_version":

            authority.get(
                "authority_version"
            ),

        "semantic_authority":

            authority.get(
                "semantic_authority"
            ),
    }
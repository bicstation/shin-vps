# -*- coding: utf-8 -*-
# api/services/semantic/v2/semantic_orchestrator.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_discovery_meaning,
)

from api.services.semantic.v2.traversal.traversal_runtime import (
    build_traversal_runtime,
)

from api.services.semantic.v2.finder.finder_runtime import (
    build_finder_runtime,
)


# ==========================================================
# SEMANTIC ORCHESTRATOR
# ==========================================================

def build_semantic_orchestrator():

    # ======================================================
    # AUTHORITY
    # ======================================================

    authority = (
        build_authority_runtime()
    )

    # ======================================================
    # MEANING
    # ======================================================

    meaning = (
        build_discovery_meaning()
    )

    # ======================================================
    # TRAVERSAL
    # ======================================================

    traversal = (
        build_traversal_runtime()
    )

    # ======================================================
    # FINDER
    # ======================================================

    finder = (
        build_finder_runtime()
    )

    # ======================================================
    # RESULT
    # ======================================================

    return {

        "runtime":
            "semantic_orchestrator_v2",

        "authority":
            authority,

        "meaning":
            meaning,

        "traversal":
            traversal,

        "finder":
            finder,

        "ready":
            True,
    }
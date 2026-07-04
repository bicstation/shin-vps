# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/services/semantic/v2/ranking/ranking_universe_runtime.py

from api.services.semantic.v2.authority.authority_runtime import (
    build_authority_runtime,
)

from api.services.semantic.v2.ranking.ranking_topology_runtime import (
    build_ranking_topology_runtime,
)

from api.services.semantic.v2.ranking.ranking_runtime import (
    build_ranking_runtime,
)

from api.services.semantic.v2.meaning.meaning_runtime import (
    build_ranking_meaning,
)

from api.services.semantic.v2.seo.seo_runtime import (
    build_ranking_seo,
)


# ==========================================================
# RANKING UNIVERSE
# ==========================================================

def build_ranking_universe_runtime():

    authority = (
        build_authority_runtime()
    )

    topology = (
        build_ranking_topology_runtime()
    )

    ranking = (
        build_ranking_runtime(
            group_slug="all",
            limit=20,
        )
    )

    meaning = (
        build_ranking_meaning()
    )

    seo = (
        build_ranking_seo(
            meaning=meaning,
            group_name="All Products",
            product_count=ranking.get(
                "data",
                {}
            ).get(
                "product_count",
                0,
            ),
        )
    )

    # ------------------------------------------------------
    # SUMMARY
    # ------------------------------------------------------

    summary = {

        "category_count":

            len(
                topology.get(
                    "categories",
                    []
                )
            ),

        "product_count":

            ranking.get(
                "data",
                {}
            ).get(
                "product_count",
                0
            ),
    }

    # ------------------------------------------------------
    # PAYLOAD
    # ------------------------------------------------------

    return {

        # ==============================================
        # TOPOLOGY
        # ==============================================

        "topology":

            topology.get(
                "categories",
                []
            ),

        # ==============================================
        # RANKING
        # ==============================================

        "ranking":

            ranking.get(
                "data",
                {}
            ),

        # ==============================================
        # MEANING
        # ==============================================

        "meaning":
            meaning,

        # ==============================================
        # SEO
        # ==============================================

        "seo":
            seo,

        # ==============================================
        # SUMMARY
        # ==============================================

        "summary":
            summary,

        # ==============================================
        # AUTHORITY
        # ==============================================

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

        "ready":
            True,
    }
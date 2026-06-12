# =========================================================
# FILE:
# api/services/feed/semantic/services/semantic_service.py
# =========================================================

from api.services.feed.semantic.builders.semantic_builder import (
    SemanticBuilder,
)

from api.services.feed.semantic.builders.semantic_runtime_builder import (
    SemanticRuntimeBuilder,
)


class SemanticService:

    def __init__(self):

        self.semantic_builder = (
            SemanticBuilder()
        )

        self.runtime_builder = (
            SemanticRuntimeBuilder()
        )

    def build(

        self,

        product,

    ):

        semantic_payload = (
            self.semantic_builder.build(
                product
            )
        )

        runtime_payload = (
            self.runtime_builder.build(
                semantic_payload
            )
        )

        return {

            "semantic": semantic_payload,

            "runtime": runtime_payload,

        }
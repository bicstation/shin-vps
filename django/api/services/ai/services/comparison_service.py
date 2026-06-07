# =========================================================
# FILE:
# api/services/ai/services/comparison_service.py
# =========================================================

from api.services.ai.clients.gemini_client import (
    GeminiClient,
)

from api.services.ai.parsers.comparison_parser import (
    ComparisonParser,
)

from api.services.ai.prompts.comparison_prompt import (
    ComparisonPrompt,
)


class ComparisonService:

    def __init__(self):

        self.client = (
            GeminiClient()
        )

        self.parser = (
            ComparisonParser()
        )

        self.prompt_builder = (
            ComparisonPrompt()
        )

    # =====================================================
    # GENERATE
    # =====================================================

    def generate(

        self,

        product_a,

        product_b,

    ):

        prompt = (

            self.prompt_builder.build(

                product_a,

                product_b,

            )

        )

        result = (

            self.client.generate(
                prompt
            )

        )

        if not result:

            return None

        return (

            self.parser.parse(
                result
            )

        )
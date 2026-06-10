# =========================================================
# FILE:
# api/services/ai/services/pc_spec_service.py
# =========================================================

from api.services.ai.clients.gemini_client import (
    GeminiClient,
)

from api.services.ai.parsers.pc_spec_parser import (
    PCSpecParser,
)

from api.services.ai.prompts.pc_spec_prompt import (
    PCSpecPrompt,
)

from api.services.ai.constants.models import (
    DEFAULT_SPEC_MODEL,
)


class PCSpecService:

    def __init__(

        self,

        model_name=None,

    ):

        self.client = GeminiClient(

            model_name=(
                model_name
                or DEFAULT_SPEC_MODEL
            )

        )

        self.parser = (
            PCSpecParser()
        )

        self.prompt_builder = (
            PCSpecPrompt()
        )

    # =====================================================
    # GENERATE
    # =====================================================

    def generate(

        self,

        product,

    ):

        prompt = (

            self.prompt_builder.build(
                product
            )

        )

        result_bundle = (

            self.client.generate(
                prompt
            )

        )

        if not result_bundle:

            return None

        spec_result = (

            self.parser.parse(

                result_bundle[
                    "response"
                ]

            )

        )

        return {

            "spec_result":
                spec_result,

            "attempts":
                result_bundle[
                    "attempts"
                ],

            "elapsed":
                result_bundle.get(
                    "elapsed",
                    0,
                ),

            "model":
                result_bundle[
                    "model"
                ],

            "api_key_index":
                result_bundle[
                    "api_key_index"
                ],

        }
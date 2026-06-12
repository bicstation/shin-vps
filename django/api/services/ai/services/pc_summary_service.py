# =========================================================
# FILE:
# api/services/ai/services/pc_summary_service.py
# =========================================================

from api.services.ai.clients.gemini_client import (
    GeminiClient,
)

from api.services.ai.parsers.summary_parser import (
    SummaryParser,
)

from api.services.ai.prompts.pc_summary_prompt import (
    PCSummaryPrompt,
)

from api.services.ai.runtime.ai_runtime import (
    AIRuntime,
)


class PCSummaryService:

    # =====================================================
    # INIT
    # =====================================================

    def __init__(

        self,
        model_name=None,

    ):

        self.client = GeminiClient(

            model_name=(

                model_name

                or

                AIRuntime.DEFAULT_SUMMARY_MODEL

            )

        )

        self.parser = (
            SummaryParser()
        )

        self.prompt_builder = (
            PCSummaryPrompt()
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

        summary_result = (

            self.parser.parse(

                result_bundle[
                    "response"
                ]

            )

        )

        return {

            "summary_result":
                summary_result,

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
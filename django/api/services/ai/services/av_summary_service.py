# =========================================================
# FILE:
# api/services/ai/services/av_summary_service.py
# =========================================================

from api.services.ai.clients.gemini_client import (
    GeminiClient,
)

from api.services.ai.parsers.summary_parser import (
    SummaryParser,
)

from api.services.ai.prompts.av_summary_prompt import (
    AVSummaryPrompt,
)


class AVSummaryService:

    def __init__(self):

        self.client = (
            GeminiClient()
        )

        self.parser = (
            SummaryParser()
        )

        self.prompt_builder = (
            AVSummaryPrompt()
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
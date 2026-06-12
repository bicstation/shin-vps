# =========================================================
# FILE:
# api/services/ai/parsers/summary_parser.py
# =========================================================

import json
import re

from api.services.ai.models.summary_result import (
    SummaryResult,
)


class SummaryParser:

    # =====================================================
    # PARSE
    # =====================================================

    def parse(

        self,

        gemini_result,

    ):

        candidates = (
            gemini_result.get(
                "candidates",
                []
            )
        )

        if not candidates:

            raise Exception(
                "Gemini candidates missing"
            )

        parts = (
            candidates[0]
            .get(
                "content",
                {}
            )
            .get(
                "parts",
                []
            )
        )

        full_text = "\n".join(

            part.get(
                "text",
                ""
            )

            for part in parts

        )

        json_blocks = re.findall(

            r"\{[\s\S]*?\}",

            full_text,

        )

        if not json_blocks:

            raise Exception(
                "Summary JSON not found"
            )

        data = None

        for block in reversed(

            json_blocks

        ):

            try:

                data = json.loads(
                    block
                )

                break

            except Exception:

                continue

        if not data:

            raise Exception(
                "Summary JSON parse failed"
            )

        return SummaryResult(

            summary=data.get(
                "summary",
                ""
            ),

            target_user=data.get(
                "target_user",
                ""
            ),

            strengths=data.get(
                "strengths",
                []
            ),

            weaknesses=data.get(
                "weaknesses",
                []
            ),

            usage_tags=data.get(
                "usage_tags",
                []
            ),

            raw_response=data,

        )
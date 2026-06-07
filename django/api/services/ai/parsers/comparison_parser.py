# =========================================================
# FILE:
# api/services/ai/parsers/comparison_parser.py
# =========================================================

import json
import re

from api.services.ai.models.comparison_result import (
    ComparisonResult,
)


class ComparisonParser:

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

        full_text = (

            candidates[0]

            .get(
                "content",
                {}
            )

            .get(
                "parts",
                [{}]
            )[0]

            .get(
                "text",
                ""
            )

        )

        json_match = re.search(

            r"\{[\s\S]*\}",

            full_text,

        )

        if not json_match:

            raise Exception(
                "Comparison JSON not found"
            )

        try:

            data = json.loads(
                json_match.group(0)
            )

        except Exception as e:

            raise Exception(

                f"Comparison JSON "
                f"Parse Error: {e}"

            )

        return ComparisonResult(

            summary=data.get(
                "summary",
                ""
            ),

            winner=data.get(
                "winner",
                ""
            ),

            reasons=data.get(
                "reasons",
                []
            ),

            strengths_a=data.get(
                "strengths_a",
                []
            ),

            strengths_b=data.get(
                "strengths_b",
                []
            ),

            weaknesses_a=data.get(
                "weaknesses_a",
                []
            ),

            weaknesses_b=data.get(
                "weaknesses_b",
                []
            ),

            recommended_for_a=data.get(
                "recommended_for_a",
                []
            ),

            recommended_for_b=data.get(
                "recommended_for_b",
                []
            ),

            raw_response=data,

        )
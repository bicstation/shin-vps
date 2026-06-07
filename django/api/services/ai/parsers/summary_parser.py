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
            part.get("text", "")
            for part in parts
        )


        json_match = re.search(
            r"\{[\s\S]*\}",
            full_text,
        )
        
        # print( "========== RAW ==========" )
        # print(json_match.group(0))
        # print( "=========================" )
        
        if not json_match:
            raise Exception(
                "Summary JSON not found"
            )

        try:
            data = json.loads(
                json_match.group(0)
            )

        except Exception as e:

            raise Exception(
                f"Summary JSON "
                f"Parse Error: {e}"
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
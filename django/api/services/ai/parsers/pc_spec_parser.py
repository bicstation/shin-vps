# =========================================================
# FILE:
# api/services/ai/parsers/pc_spec_parser.py
# =========================================================

import json
import re

from api.services.ai.exceptions.parse_error import ( ParseError, )
from api.services.ai.models.pc_spec_result import ( PCSpecResult, )


class PCSpecParser:

    # =====================================================
    # PARSE
    # =====================================================

    def parse(
        self,
        gemini_result,
    ):

        candidates = gemini_result.get(
            "candidates",
            [],
        )

        if not candidates:
            raise ParseError(
                "Gemini candidates missing"
            )

        full_text = (
            candidates[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )

        print(
            "\n==================== GEMINI RAW ===================="
        )
        print(full_text)
        print(
            "====================================================\n"
        )

        full_text = re.sub(
            r"```(?:json)?",
            "",
            full_text,
            flags=re.IGNORECASE,
        ).replace(
            "```",
            "",
        )

        json_blocks = re.findall(
            r"\{[\s\S]*?\}",
            full_text,
        )

        if not json_blocks:
            raise ParseError(
                "Spec JSON not found"
            )

        spec_data = None

        for block in reversed(
            json_blocks
        ):

            try:

                spec_data = json.loads(
                    block
                )

                break

            except Exception:

                continue

        if spec_data is None:

            raise ParseError(
                "Spec JSON parse failed"
            )

        return PCSpecResult(

            cpu_model=spec_data.get(
                "cpu_model",
                "",
            ).strip(),

            gpu_model=spec_data.get(
                "gpu_model",
                "",
            ).strip(),

            memory_gb=self.safe_int(
                spec_data.get(
                    "memory_gb",
                    0,
                )
            ),

            storage_gb=self.safe_int(
                spec_data.get(
                    "storage_gb",
                    0,
                )
            ),

            display_info=spec_data.get(
                "display_info",
                "",
            ).strip(),

            is_ai_pc=bool(
                spec_data.get(
                    "is_ai_pc",
                    False,
                )
            ),

            raw_response=spec_data,

        )

    # =====================================================
    # SAFE INT
    # =====================================================

    def safe_int(
        self,
        value,
        default=0,
    ):

        try:

            return int(

                re.sub(
                    r"[^0-9]",
                    "",
                    str(value),
                )

            )

        except Exception:

            return default
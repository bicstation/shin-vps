# =========================================================
# FILE:
# api/services/ai/models/summary_result.py
# =========================================================

from dataclasses import dataclass
from dataclasses import field


@dataclass
class SummaryResult:

    summary: str = ""

    target_user: str = ""

    strengths: list = field(
        default_factory=list
    )

    weaknesses: list = field(
        default_factory=list
    )

    usage_tags: list = field(
        default_factory=list
    )

    raw_response: dict = field(
        default_factory=dict
    )

    # =====================================================
    # DICT
    # =====================================================

    def to_dict(self):

        return {

            "summary":
                self.summary,

            "target_user":
                self.target_user,

            "strengths":
                self.strengths,

            "weaknesses":
                self.weaknesses,

            "usage_tags":
                self.usage_tags,
        }
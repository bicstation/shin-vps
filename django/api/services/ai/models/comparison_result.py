# =========================================================
# FILE:
# api/services/ai/models/comparison_result.py
# =========================================================

from dataclasses import dataclass
from dataclasses import field


@dataclass
class ComparisonResult:

    summary: str = ""

    winner: str = ""

    reasons: list = field(
        default_factory=list
    )

    strengths_a: list = field(
        default_factory=list
    )

    strengths_b: list = field(
        default_factory=list
    )

    weaknesses_a: list = field(
        default_factory=list
    )

    weaknesses_b: list = field(
        default_factory=list
    )

    recommended_for_a: list = field(
        default_factory=list
    )

    recommended_for_b: list = field(
        default_factory=list
    )

    raw_response: dict = field(
        default_factory=dict
    )
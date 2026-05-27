# ============================================================================
# SHIN SATELLITE OPS｜Noise Filter
# ============================================================================

import re


# ============================================================================
# Noise Patterns
# ============================================================================

NOISE_PATTERNS = [

    r"Yahoo!ニュースのすべての機能.*",

    r"この記事に関する.*",

    r"おすすめ記事.*",

    r"関連記事.*",

    r"続きを読む.*",

    r"広告.*",

    r"スポンサー.*",

    r"PR.*",
]


# ============================================================================
# Filter Noise
# ============================================================================

def filter_noise(
    text: str,
) -> str:
    """
    Remove lightweight RSS/article noise.
    """

    if not text:

        return ""

    cleaned = text

    for pattern in NOISE_PATTERNS:

        cleaned = re.sub(

            pattern,

            "",

            cleaned,

            flags=re.IGNORECASE,
        )

    # ========================================================================
    # Remove Empty Lines
    # ========================================================================

    lines = []

    for line in cleaned.splitlines():

        line = line.strip()

        if not line:

            continue

        lines.append(
            line
        )

    return "\n".join(
        lines
    )
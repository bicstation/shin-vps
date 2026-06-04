# ============================================================================
# SHIN SATELLITE OPS｜Lightweight Rewrite Runtime
# ============================================================================

from satellite_ops.runtime.rewrite.adapters.gemma4_adapter import (
    rewrite_with_gemma4,
)


# ============================================================================
# Rewrite Prompt
# ============================================================================

REWRITE_PROMPT = """
以下の記事を、
自然な軽量ブログ風に、
2〜4段落程度で軽く言い換えてください。

重要：

- 長文化しない
- 解説しない
- 考察しない
- 分析しない
- AIっぽい締め禁止
- 「今後注目されそうです」禁止
- 「議論が広がりそうです」禁止
- 「今後の展開が注目されます」禁止

必要なのは：

- 軽い repost atmosphere
- 自然な雑談感
- 軽量 paragraph rhythm
- RSS転載臭の軽減

記事の流れや出来事は、
最低限維持してください。

本文：
"""


    # ============================================================================
    # Lightweight Rewrite Runtime
    # ============================================================================

def rewrite_lightly(


    text: str,
    persona: str = "",
    source_type: str = "",
    overlay: str = "",


    ) -> str:
    """
    Lightweight rewrite runtime.

    Purpose:
    - reduce RSS repost feeling
    - soften machine tone
    - preserve lightweight atmosphere
    """

    if not text:
        return ""

    # ========================================================================
    # Build Prompt
    # ========================================================================

    prompt = f"""


    {REWRITE_PROMPT}

    {text}
    """


    # ========================================================================
    # Rewrite
    # ========================================================================

    rewritten = rewrite_with_gemma4(

        article_text=prompt,

        source_type=source_type,

        overlay=overlay,

    )

    # ========================================================================
    # Fallback
    # ========================================================================

    if not rewritten:
        return text

    rewritten = rewritten.strip()

    # ========================================================================
    # Over Compression Protection
    # ========================================================================

    if len(rewritten) < 80:
        return text[:400]

    # ========================================================================
    # Paragraph Rhythm Stabilization
    # ========================================================================

    if "\n\n" not in rewritten:

        rewritten = rewritten.replace(
            "。 ",
            "。\n\n",
        )

    # ========================================================================
    # AI Closing Suppression
    # ========================================================================

    BLOCK_ENDINGS = [

        "今後注目されそうです。",

        "議論が広がりそうです。",

        "今後の展開が注目されます。",

        "注目を集めそうです。",

        "話題になりそうです。",
    ]

    for ending in BLOCK_ENDINGS:

        rewritten = rewritten.replace(
            ending,
            "",
        )

    return rewritten.strip()

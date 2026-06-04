# ============================================================================
# SHIN SATELLITE OPS｜Gemma Rewrite Adapter
# ============================================================================
# Purpose:
# Lightweight LLM rewrite runtime
#
# Philosophy:
# - NOT article generation
# - NOT semantic authority
# - ONLY atmosphere translation
# - operational continuity first
# ============================================================================

import os
import requests

from pathlib import Path

# ============================================================================

# Environment Runtime

# ============================================================================

OLLAMA_HOST = os.getenv(
"OLLAMA_HOST",
"http://localhost:11434"
)

OLLAMA_MODEL = os.getenv(
"OLLAMA_MODEL",
"gemma2:2b"
)

# ============================================================================
# Overlay Runtime
# ============================================================================

BASE_DIR = (
Path(__file__)
.resolve()
.parent
.parent
)

OVERLAY_DIR = (
BASE_DIR / "overlays"
)


# ============================================================================
# Base Prompt
# ============================================================================

PROMPT_TEMPLATE = """
以下の記事を、

「2文だけ」

軽く自然な人間っぽい空気へ変換してください。

重要:

* 必ず2文以内
* 情報追加禁止
* 存在しない人物禁止
* hallucination禁止
* opinion禁止
* SEO禁止
* clickbait禁止
* RSS転載臭だけを減らす
* 軽い人間入口にする
  """

# ============================================================================
# Load Overlay
# ============================================================================

def load_overlay(
source_type: str,
) -> str:


    try:

        if not source_type:
            return ""

        overlay_path = (
            OVERLAY_DIR /
            f"{source_type}.txt"
        )

        if not overlay_path.exists():

            print(
                f"⚠ overlay not found: {overlay_path}"
            )

            return ""

        return overlay_path.read_text(
            encoding="utf-8"
        ).strip()

    except Exception as e:

        print(
            f"⚠ Overlay Load Error: {e}"
        )

        return ""


# ============================================================================
# Rewrite Runtime
# ============================================================================

def rewrite_with_gemma4(

article_text="",
source_type="",
overlay="",

):

    source_type = (
        source_type
        .strip()
        .lower()
    )

    if not article_text:

        return ""

    # ========================================================================
    # System Overlay
    # ========================================================================

    system_overlay = load_overlay(
        source_type
    )

    # ========================================================================
    # Final Overlay
    # ========================================================================

    final_overlay = f"""


    {system_overlay}

    {overlay}

    """


    # ========================================================================
    # Final Prompt
    # ========================================================================

    prompt = f"""


    {PROMPT_TEMPLATE}

    {final_overlay}

    記事:
    {article_text[:500]}

    """


    # ========================================================================
    # Payload
    # ========================================================================

    payload = {

        "model": OLLAMA_MODEL,

        "prompt": prompt,

        "stream": False,
    }

    try:

        response = requests.post(

            f"{OLLAMA_HOST}/api/generate",

            json=payload,

            timeout=120,
        )

        response.raise_for_status()

        data = response.json()

        print("\n🧪 Gemma RAW Response\n")

        print(data)

        rewritten = data.get(
            "response",
            ""
        ).strip()

        return rewritten

    except Exception as e:

        print(
            f"❌ Gemma Rewrite Error: {e}"
        )

        return ""
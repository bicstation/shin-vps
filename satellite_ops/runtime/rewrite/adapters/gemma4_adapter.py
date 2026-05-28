# ============================================================================
# SHIN SATELLITE OPS｜Gemma 4 Rewrite Adapter
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
# Source Prompt Overlays
# ============================================================================

SOURCE_PROMPT_OVERLAYS = {

"techcrunch": """
* 翻訳口調禁止
* 「〜して頂きたいです」を禁止
* 日本語ニュース調を維持
* 過度に丁寧な翻訳を避ける
* 英語記事を自然な日本語ニュース風にする
""",


"yahoo": """
* 関連記事を無視
* 世論調査を無視
* ノイズを拾わない
""",


"ascii": """
* 過度に会話口調へしない
* ITニュースの温度感を維持
""",
}

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
# Rewrite Runtime
# ============================================================================

def rewrite_with_gemma4(
article_text="",
source_type="",
overlay="",

):


    if not article_text:
        return ""


    # ========================================================================
    # Prompt Overlay
    # ========================================================================

    system_overlay = SOURCE_PROMPT_OVERLAYS.get(
  
    source_type,
    ""

    )

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
            f"❌ Gemma4 Rewrite Error: {e}"
        )

        return ""


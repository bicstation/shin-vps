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

import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:1b"
# MODEL_NAME = "gemma2:2b"

PROMPT_TEMPLATE = """
以下の記事を、

「2文だけ」

軽く自然な人間っぽい空気へ変換してください。

重要:

- 必ず2文以内
- 情報追加禁止
- 存在しない人物禁止
- hallucination禁止
- opinion禁止
- SEO禁止
- clickbait禁止
- RSS転載臭だけを減らす
- 軽い人間入口にする

記事:
{article_text}
"""


def rewrite_with_gemma4(article_text=""):


    if not article_text:
        return ""

    prompt = PROMPT_TEMPLATE.format(
        article_text=article_text[:500]
    )

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
    }

    try:

        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=120,
        )
        
        response.raise_for_status()

        data = response.json()
        
        print("\n🧪 Gemma RAW Response\n")
        print(data)

        rewritten = data.get("response", "").strip()

        return rewritten

    except Exception as e:

        print(f"❌ Gemma4 Rewrite Error: {e}")

        return ""


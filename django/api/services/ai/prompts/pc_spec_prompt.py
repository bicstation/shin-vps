# =========================================================
# FILE:
# api/services/ai/prompts/pc_spec_prompt.py
# =========================================================

class PCSpecPrompt:

    # =====================================================
    # BUILD
    # =====================================================

    def build(
        self,
        product,
    ):

        description = (
            product.description
            or ""
        )[:2000]

        return f"""
PC製品仕様を抽出してください。

MAKER:
{product.maker}

NAME:
{product.name}

MODEL:
{product.model}

PRODUCT_NO:
{product.product_no}

URL:
{product.url}

DESCRIPTION:
{description}

商品名・型番・メーカーを用いて、
一意に特定できるメーカー公開仕様を採用してください。

メーカー公開仕様で確認できた内容は推測ではありません。

メーカー公開仕様で確認できない項目のみ、
空文字("") または 0 を返してください。

存在しない仕様を作成してはいけません。

JSONのみ返してください。

{{
  "cpu_model": "",
  "gpu_model": "",
  "memory_gb": 0,
  "storage_gb": 0,
  "display_info": "",
  "is_ai_pc": false
}}
"""
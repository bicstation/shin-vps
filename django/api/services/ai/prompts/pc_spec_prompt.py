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

DESCRIPTION:
{description}

商品名・型番を優先し、
一意に特定できるメーカー公開仕様を採用してください。

不明な項目は空文字または0を返してください。

JSONのみ返してください。

メーカー仕様が取得できない場合は、
SKUを推測してはいけません。

推測は禁止です。

不明なら
"" または 0 を返してください。


{{
  "cpu_model": "",
  "gpu_model": "",
  "memory_gb": 0,
  "storage_gb": 0,
  "display_info": "",
  "is_ai_pc": false
}}
"""
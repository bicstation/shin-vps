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


AI PC 判定

AI PC は公開仕様および公開されているCPUシリーズ・NPU情報から判定してください。

以下は AI PC と判定してください。

・Intel Core Ultra
・AMD Ryzen AI
・Snapdragon X

これは推測ではありません。
公開CPUシリーズによる判定です。

容量の正規化ルール

memory_gb および storage_gb は GB の整数で返してください。

■ メモリ
・16GB → 16
・32GB → 32
・64GB → 64

■ ストレージ
・256GB → 256
・512GB → 512
・1TB → 1000
・2TB → 2000
・4TB → 4000

TBは必ず1000GB換算としてください。
1024GB換算は行わないでください。

容量以外の情報（DDR5、LPDDR5X、NVMe、PCIe Gen4など）は容量値に含めないでください。


display_info

ノートPCや一体型PCでディスプレイ仕様
（サイズ・解像度・リフレッシュレート等）が公開されている場合のみ抽出してください。

デスクトップPCで内蔵ディスプレイが存在しない場合は
"display_info": ""


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
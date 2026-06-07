# =========================================================
# FILE:
# api/services/ai/prompts/pc_summary_prompt.py
# =========================================================


class PCSummaryPrompt:

    # =====================================================
    # BUILD
    # =====================================================

    def build(

        self,

        product,

    ):

        return f"""
PCスペック情報から要約を作成せよ。

==================================================
OUTPUT FORMAT
==================================================

JSONのみ返答せよ。

必須キー:

summary
target_user
strengths
weaknesses
usage_tags

==================================================
PRODUCT
==================================================

NAME:
{product.name}

CPU:
{product.cpu_model}

GPU:
{product.gpu_model}

MEMORY:
{product.memory_gb}

STORAGE:
{product.storage_gb}

DISPLAY:
{product.display_info}

AI PC:
{product.is_ai_pc}

==================================================
TASK
==================================================

以下を分析せよ。

1.
製品の特徴

2.
どのようなユーザーに向いているか

3.
強み

4.
弱み

5.
利用シーン

==================================================
RULES
==================================================

summary:
150文字以内

target_user:
100文字以内

strengths:
文字列配列

weaknesses:
文字列配列

usage_tags:
文字列配列

JSON以外の文章は禁止。

説明文禁止。

思考過程禁止。

Markdown禁止。

コードブロック禁止。

JSONのみ返答せよ。
"""
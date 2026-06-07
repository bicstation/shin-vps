# =========================================================
# FILE:
# api/services/ai/prompts/comparison_prompt.py
# =========================================================


class ComparisonPrompt:

    # =====================================================
    # BUILD
    # =====================================================

    def build(

        self,

        product_a,

        product_b,

    ):

        return f"""
2つの製品を比較せよ。

返答はJSONのみ。

{{
    "summary":"",
    "winner":"",
    "reasons":[],
    "strengths_a":[],
    "strengths_b":[],
    "weaknesses_a":[],
    "weaknesses_b":[],
    "recommended_for_a":[],
    "recommended_for_b":[]
}}

==================================================
PRODUCT A
==================================================

NAME:
{product_a.name}

CPU:
{getattr(product_a, "cpu_model", "")}

GPU:
{getattr(product_a, "gpu_model", "")}

MEMORY:
{getattr(product_a, "memory_gb", 0)}

STORAGE:
{getattr(product_a, "storage_gb", 0)}

DISPLAY:
{getattr(product_a, "display_info", "")}

==================================================
PRODUCT B
==================================================

NAME:
{product_b.name}

CPU:
{getattr(product_b, "cpu_model", "")}

GPU:
{getattr(product_b, "gpu_model", "")}

MEMORY:
{getattr(product_b, "memory_gb", 0)}

STORAGE:
{getattr(product_b, "storage_gb", 0)}

DISPLAY:
{getattr(product_b, "display_info", "")}

==================================================
RULES
==================================================

winner は以下のいずれか。

"product_a"

または

"product_b"

または

"tie"

比較結果として以下を返せ。

1.
総評

2.
どちらが優れているか

3.
その理由

4.
製品Aの強み

5.
製品Bの強み

6.
製品Aの弱み

7.
製品Bの弱み

8.
どのようなユーザーへ向くか

JSON以外の文章は禁止。
"""

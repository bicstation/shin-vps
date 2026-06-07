# =========================================================
# FILE:
# api/services/ai/prompts/av_summary_prompt.py
# =========================================================


class AVSummaryPrompt:

    # =====================================================
    # BUILD
    # =====================================================

    def build(

        self,

        product,

    ):

        return f"""
AV作品情報から要約を作成せよ。

返答はJSONのみ。

{{
    "summary":"",
    "target_user":"",
    "strengths":[],
    "weaknesses":[],
    "usage_tags":[]
}}

タイトル:
{product.title}

メーカー:
{product.maker_name}

レーベル:
{product.label_name}

シリーズ:
{product.series_name}

ジャンル:
{product.genre_names}

女優:
{product.actress_names}

商品説明:
{product.description}

以下の観点で分析せよ。

1.
どのような作品か

2.
どのようなユーザーに向いているか

3.
魅力となるポイント

4.
注意点

5.
検索やレコメンドで利用できるタグ

返答は必ずJSONのみ。
"""
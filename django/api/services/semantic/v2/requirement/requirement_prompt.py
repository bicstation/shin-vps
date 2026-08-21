# /home/maya/shin-vps/django/api/services/semantic/v2/requirement/requirement_prompt.py

# -*- coding: utf-8 -*-
# api/services/semantic/v2/requirement/requirement_prompt.py

"""
Requirement Prompt

Responsibility:
- Requirement Runtime用のGemini Promptを生成する
- Semantic Group候補をGeminiへ提示する
- Natural Language → group_slug[] の解析Contractを定義する

No semantic interpretation.
No Gemini execution.
No response parsing.
No validation.
"""


# ==========================================================
# BUILD PROMPT
# ==========================================================

def build_requirement_prompt(
    message,
    groups,
):

    return f"""
あなたはPC購入相談の要求解析器です。

ユーザーの自然な日本語から、
ユーザーが明示的に表現しているPCに関する要求を抽出してください。

以下に提示するSemantic Group候補だけを使用してください。

Semantic Group候補:

{groups}

重要なルール:

1. 候補に存在しないgroup_slugを生成しない。
2. ユーザーが述べていない条件を推測しない。
3. ユーザーの文章に複数の要求が含まれている場合は、すべて抽出する。
4. 1つのgroupに限定しない。
5. group_slugだけを返す。
6. JSONのみを返す。
7. 理由や説明を返さない。
8. ハードウェア性能をユーザーが明示していない場合、推測してCPU・GPU等のGroupを追加しない。
9. 価格が記述されているだけの場合、それを自動的にusage-budgetへ変換しない。
10. ユーザーの文章に存在しない条件を、一般的なPC知識から補完しない。
11. 同じgroup_slugを重複して返さない。

ユーザー入力:

「{message}」

出力形式:

{{
  "groups": []
}}
"""
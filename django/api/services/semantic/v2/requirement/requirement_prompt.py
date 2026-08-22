# -*- coding: utf-8 -*-
# api/services/semantic/v2/requirement/requirement_prompt.py

"""
Requirement Prompt

Responsibility:
- Requirement Runtime用のGemini Promptを生成する
- Semantic Group候補をGeminiへ提示する
- Natural Language → group_slug[] / constraints の解析Contractを定義する

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
    previous_requirement=None,
):

    return f"""
あなたはPC購入相談の要求解析器です。

ユーザーの自然な日本語から、
現在のPC購入Requirementを解析してください。

==================================================
CURRENT REQUIREMENT
==================================================

以下は、これまでの会話から確定している
現在のRequirementです。

これは今回のユーザー発話ではありません。

Previous Requirement:

{previous_requirement}

==================================================
CURRENT USER MESSAGE
==================================================

以下が今回のユーザーが新しく発話した内容です。

「{message}」

今回のユーザー発話から、
現在のRequirementに反映すべきPCに関する要求を解析してください。

==================================================
SEMANTIC GROUP AUTHORITY
==================================================

以下に提示するSemantic Group候補だけを使用してください。

Semantic Group候補:

{groups}

==================================================
IMPORTANT RULES
==================================================

1. 候補に存在しないgroup_slugを生成しない。

2. ユーザーが述べていない条件を推測しない。

3. ユーザーの文章に複数の要求が含まれている場合は、
   すべて抽出する。

4. 1つのgroupに限定しない。

5. Previous Requirementは、
   これまでの会話から確定している現在の条件として扱う。

6. Previous Requirementを、
   今回ユーザーが発話した内容として扱わない。

7. 今回のユーザー発話によって、
   Previous Requirementに追加すべき条件が明示された場合は、
   現在のRequirementに含める。

8. Previous Requirementに存在する条件を、
   ユーザーが今回明示的に否定・変更していない場合は、
   維持する。

9. ユーザーが明示的に条件を否定・変更した場合は、
   現在のRequirementから該当する条件を削除または変更する。

10. ハードウェア性能をユーザーが明示していない場合、
    推測してCPU・GPU・メモリ・ストレージ等のGroupを追加しない。

11. ユーザーがCPU、GPU、メモリ、ストレージなどの
    ハードウェア条件を明示した場合は、
    Semantic Group Authorityに提示された候補の中から、
    その条件に最も適合する既存Groupを選択する。

12. CPU、GPU、メモリ、ストレージの具体的な製品名、
    型番、容量、世代、性能値などを
    新しいgroup_slugとして生成しない。
    必ず提示された既存Semantic Groupへ分類する。

13. 例えば、
    「Core i9」「Core Ultra 9」など、
    高性能CPUを明示している場合は、
    候補にcpu-highendが存在するならcpu-highendへ分類する。

14. 「RTX 5070」「RTX 5080」「RTX 5090」など、
    高性能GPUを明示している場合は、
    候補にgpu-highendが存在するならgpu-highendへ分類する。

15. 「32GB」「64GB」など大容量メモリを明示している場合は、
    候補にmemory-highendが存在するならmemory-highendへ分類する。

16. 「1TB」「2TB」など大容量ストレージを明示している場合は、
    候補にstorage-highendが存在するならstorage-highendへ分類する。

17. ハードウェア条件について、
    Semantic Group Authorityに適合するGroupが存在しない場合は、
    勝手なGroupを生成せず、
    その条件についてGroupを追加しない。

18. 価格・予算をSemantic Groupへ変換しない。

19. 価格・予算は、Semantic Groupとは別の
    Query Constraintとして扱う。

20. 「15万円以内」「15万円まで」「15万円以下」
    「予算15万円」など、明確な価格上限が示されている場合は、
    max_priceへ数値として抽出する。

21. 日本円の価格表現は円単位の整数へ変換する。

    例:
    15万円 → 150000
    20万円 → 200000
    25万円 → 250000

22. 「15万円以内」のように上限が明示されている場合のみ、
    max_priceを設定する。

23. 「20万円くらい」「20万円前後」など、
    明確な上限ではない価格表現については、
    max_priceへ勝手に変換しない。

24. 「できるだけ安く」「なるべく安く」
    「コスパ重視」など、明確な価格上限が存在しない表現については、
    max_priceを設定しない。

25. 価格が記述されているだけの場合、
    usage-budgetへ変換しない。

26. ユーザーの文章に存在しない条件を、
    一般的なPC知識から補完しない。

27. 同じgroup_slugを重複して返さない。

28. 使用できるgroup_slugは、
    提示されたSemantic Group候補だけに限定する。

29. 最終的なgroupsには、
    現在のRequirementとして有効なgroup_slugだけを返す。

30. Previous Requirementに存在するmax_priceは、
    今回ユーザーが価格条件を変更・否定していない場合は維持する。

31. ユーザーが新しい価格上限を明示した場合は、
    Previous Requirementのmax_priceを新しい値へ更新する。

32. ユーザーが価格条件を明示的に解除した場合は、
    max_priceをnullにする。

33. 理由や説明を返さない。

34. JSONのみを返す。

==================================================
OUTPUT
==================================================

以下の形式だけを返してください。

{{
  "groups": [],
  "constraints": {{
    "max_price": null
  }}
}}

groups:
現在のRequirementとして有効なSemantic Group。

constraints.max_price:
現在有効な価格上限。
明確な価格上限が存在しない場合はnull。

JSON以外の文章を返さないでください。
"""
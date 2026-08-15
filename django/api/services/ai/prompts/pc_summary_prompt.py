# =========================================================
# FILE:
# api/services/ai/prompts/pc_summary_prompt.py
# =========================================================

import json


class PCSummaryPrompt:

    # =====================================================
    # BUILD
    # =====================================================

    def build(

        self,

        product,

    ):

        # =================================================
        # Observation Runtime
        # =================================================

        observation = (
            getattr(
                product,
                "observation_runtime",
                {}
            )
            or {}
        )

        # -------------------------------------------------
        # Observation is stored as JSON string
        # -------------------------------------------------

        if isinstance(
            observation,
            str,
        ):

            try:

                observation = json.loads(
                    observation
                )

            except (
                json.JSONDecodeError,
                TypeError,
            ):

                observation = {}

        # -------------------------------------------------
        # Safety
        # -------------------------------------------------

        if not isinstance(
            observation,
            dict,
        ):

            observation = {}

        # =================================================
        # Observation Metadata
        # =================================================

        observation_source = (
            observation.get(
                "source",
                "",
            )
        )

        observation_source_url = (
            observation.get(
                "source_url",
                "",
            )
        )

        observation_document_key = (
            observation.get(
                "document_key",
                "",
            )
        )

        observation_format = (
            observation.get(
                "format",
                "",
            )
        )

        observation_raw_text = (
            observation.get(
                "raw_text",
                "",
            )
        )

        # =================================================
        # Observation Specifications
        # =================================================

        specifications = (
            observation.get(
                "specifications",
                [],
            )
        )

        if not isinstance(
            specifications,
            list,
        ):

            specifications = []

        observation_specs = []

        for specification in specifications:

            if not isinstance(
                specification,
                dict,
            ):

                continue

            label = (
                specification.get(
                    "label",
                    "",
                )
            )

            value = (
                specification.get(
                    "value",
                    "",
                )
            )

            if not label and not value:

                continue

            observation_specs.append(

                f"- {label}: {value}"

            )

        observation_specs_text = (
            "\n".join(
                observation_specs
            )
        )

        # =================================================
        # Prompt
        # =================================================

        return f"""
PC製品の公開Reality、正規化された製品Reality、
およびSpecification Runtimeの結果から、
人間向けの製品要約を作成せよ。

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
product_points

==================================================
REALITY AUTHORITY
==================================================

情報を判断するときは以下の優先順位を守れ。

1.
Observation Runtimeに保存された公開Reality

2.
PCProductに保存された正規化済みReality

3.
Specification Runtimeで取得された仕様

入力情報に存在しない事実を推測してはならない。

ObservationとPCProductの内容が異なる場合は、
公開元から取得したObservation Realityを
優先して判断せよ。

ただし、情報間に明確な矛盾が存在する場合は、
矛盾を勝手に解消せず、
確認できる事実だけを使用せよ。

==================================================
OBSERVATION REALITY
==================================================

SOURCE:
{observation_source}

SOURCE URL:
{observation_source_url}

DOCUMENT KEY:
{observation_document_key}

FORMAT:
{observation_format}

--------------------------------------------------
PUBLISHED SPECIFICATIONS
--------------------------------------------------

{observation_specs_text}

--------------------------------------------------
RAW PUBLISHED TEXT
--------------------------------------------------

{observation_raw_text}

==================================================
PC PRODUCT REALITY
==================================================

MAKER:
{getattr(product, "maker", "")}

BRAND:
{getattr(product, "brand", "")}

SERIES:
{getattr(product, "series", "")}

COLLABORATION:
{getattr(product, "collaboration", "")}

NAME:
{getattr(product, "name", "")}

MODEL:
{getattr(product, "model", "")}

PRODUCT NO:
{getattr(product, "product_no", "")}

DESCRIPTION:
{getattr(product, "description", "")}

PRICE:
{getattr(product, "price", "")}

PRODUCT TYPE:
{getattr(product, "product_type", "")}

STOCK STATUS:
{getattr(product, "stock_status", "")}

==================================================
SPECIFICATION REALITY
==================================================

CPU:
{getattr(product, "cpu_model", "")}

GPU:
{getattr(product, "gpu_model", "")}

MEMORY:
{getattr(product, "memory_gb", 0)}

STORAGE:
{getattr(product, "storage_gb", 0)}

DISPLAY:
{getattr(product, "display_info", "")}

RAM TYPE:
{getattr(product, "ram_type", "")}

OS:
{getattr(product, "os_support", "")}

WEIGHT:
{getattr(product, "weight_kg", "")}

NPU:
{getattr(product, "npu_tops", "")}

AI PC:
{getattr(product, "is_ai_pc", False)}

==================================================
TASK
==================================================

以下を分析せよ。

1.
製品の特徴

2.
どのようなユーザーに向いているか

3.
製品の強み

4.
製品の弱み

5.
利用シーン

6.
この製品を選ぶ3つのポイント

==================================================
SUMMARY
==================================================

summary:

製品全体の特徴を150文字以内でまとめよ。

公開されたObservation Realityを最優先し、
PCProductおよびSpecification Runtimeの情報を
補助的に使用すること。

入力された情報だけを根拠として記述すること。

==================================================
TARGET USER
==================================================

target_user:

どのようなユーザーに向いている製品なのかを
100文字以内で説明せよ。

Observation RealityおよびSpecification Realityを
根拠として使用すること。

根拠のないユーザー像を生成してはならない。

==================================================
STRENGTHS
==================================================

strengths:

製品の強みを文字列配列で返せ。

Observation Reality、
PCProduct Reality、
Specification Realityから
確認できる内容だけを使用すること。

==================================================
WEAKNESSES
==================================================

weaknesses:

製品の弱みまたは注意点を文字列配列で返せ。

明確な根拠がない場合、
無理に弱みを生成してはならない。

入力情報から確認できる制約や注意点のみを使用せよ。

==================================================
USAGE TAGS
==================================================

usage_tags:

製品の利用シーンを表す文字列配列で返せ。

Observation RealityおよびSpecification Realityから
合理的に確認できる用途だけを使用すること。

スペックだけから過度に用途を拡張してはならない。

==================================================
PRODUCT POINTS
==================================================

product_points:

必ず3件の文字列配列で返せ。

これは個別製品ページに表示する、

「このPCを選ぶ3つのポイント」

として使用する。

単なるスペックの羅列ではなく、

「なぜこの製品を選ぶのか」

が伝わる短いポイントにすること。

==================================================
PRODUCT POINTS RULES
==================================================

product_pointsは必ず3件。

各ポイントは製品固有の特徴を表現すること。

Observation Reality、
PCProduct Reality、
Specification Realityを根拠として使用すること。

入力情報に存在しない性能・機能・用途を
推測してはならない。

ベンチマーク結果を生成してはならない。

他製品との比較を生成してはならない。

価格について、
入力情報に存在しない
「お得」「コスパが高い」などの評価を
生成してはならない。

「最高」
「最強」
「圧倒的」
など、入力情報から確認できない評価は禁止。

「高性能」
「快適」
「おすすめ」
などの抽象的な表現だけで
1ポイントを構成してはならない。

可能な限り3つの異なる観点から選択すること。

同じスペックを別の表現で
重複させないこと。

製品固有性を優先すること。

ブランド、
シリーズ、
製品用途、
ディスプレイ、
CPU、
GPU、
メモリ、
ストレージ、
OS、
重量、
ポート、
ネットワーク、
キーボード、
カメラ、
バッテリーなど、

入力されたRealityから確認できる
製品固有の情報を必要に応じて使用せよ。

ただし、
入力情報に存在しない特徴を
製品名や一般知識から補完してはならない。

製品ページにそのまま表示できる、
短く分かりやすい文章にすること。

==================================================
PRODUCT POINTS QUALITY
==================================================

3つのポイントは、
可能な限り異なる価値を持たせること。

例えば、

・処理性能
・携帯性
・接続性

のように、
同じ情報を繰り返さないこと。

ただし、
実際の製品Realityに存在しない観点を
無理に作ってはならない。

3つとも同じCPUやメモリの説明になることを
避けること。

==================================================
IMPORTANT
==================================================

AI PCであることは、
AI PCがtrueの場合のみ扱え。

ブランドやシリーズについても、
入力されたRealityに存在する場合のみ使用せよ。

Observationに存在しない情報を
製品名やブランド名から推測してはならない。

空の情報を推測で補完してはならない。

Observation Realityに記載された
公開情報を最優先すること。

==================================================
NO GUESSING
==================================================

推測禁止。

入力情報にない事実は禁止。

存在しない仕様を補完してはならない。

メーカーを製品名から勝手に推測してはならない。

ブランドを製品名から勝手に推測してはならない。

シリーズを製品名から勝手に推測してはならない。

用途をスペックから過度に拡張してはならない。

比較対象が存在しない状態で、
他製品より優れているという表現をしてはならない。

AI PCであるという理由だけから、
特定のAIソフトウェアやAI機能への対応を
推測してはならない。

==================================================
FINAL RULES
==================================================

summary:
文字列

target_user:
文字列

strengths:
文字列配列

weaknesses:
文字列配列

usage_tags:
文字列配列

product_points:
必ず3件の文字列配列

product_pointsの件数は必ず3件にすること。

JSON以外の文章は禁止。

説明文禁止。

思考過程禁止。

Markdown禁止。

コードブロック禁止。

JSONのみ返答せよ。
"""
# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/gmail/lenovo/test_sale_ai.py

import json
import sys
from pathlib import Path

from api.services.ai.clients.gemini_client import GeminiClient
from api.services.ai.runtime.ai_runtime import AIRuntime


BASE_DIR = Path(__file__).resolve().parent

OUTPUT_DIR = BASE_DIR / "output"

TARGET_PRODUCT = (
    "ThinkBook 14 Gen 9 "
    "IPL FIFA World Cup 26 Edition"
)


# =========================================================
# OBSERVATION PATH
# =========================================================

def resolve_observation_path():

    if len(sys.argv) > 1:

        path = Path(
            sys.argv[1]
        )

        if not path.is_absolute():

            path = (
                BASE_DIR
                / path
            )

        return path

    candidates = sorted(
        (
            path
            for path in OUTPUT_DIR.glob(
                "*/observation.json"
            )
            if path.is_file()
        ),
        key=lambda path: path.parent.name,
        reverse=True,
    )

    if not candidates:

        raise RuntimeError(
            "observation.json not found"
        )

    return candidates[0]


# =========================================================
# TARGET PRODUCT TEXT
# =========================================================

def extract_product_text(text):

    index = text.find(
        TARGET_PRODUCT
    )

    if index == -1:

        raise RuntimeError(
            "Target product not found: "
            f"{TARGET_PRODUCT}"
        )

    next_product_markers = [

        "ThinkBook 16 Gen 9 "
        "IPL FIFA World Cup 26 Edition",

        "ThinkPad X1 Carbon Gen 14 "
        "Aura Edition FIFA World Cup 26 Edition",
    ]

    end = len(text)

    for marker in next_product_markers:

        marker_index = text.find(
            marker,
            index + len(TARGET_PRODUCT),
        )

        if marker_index != -1:

            end = min(
                end,
                marker_index,
            )

    return text[
        index:end
    ].strip()


# =========================================================
# CAMPAIGN EVIDENCE
# =========================================================

def extract_campaign_evidence(text):

    campaign_start_markers = [

        "《注目キャンペーン》",

        "＜アフィリエイター様限定 "
        "Lenovo FIFAモデル割引クーポン＞",
    ]

    campaign_start = None

    for marker in campaign_start_markers:

        index = text.find(
            marker
        )

        if index != -1:

            if (
                campaign_start is None
                or index < campaign_start
            ):

                campaign_start = index

    if campaign_start is None:

        return ""

    product_index = text.find(
        TARGET_PRODUCT
    )

    if product_index == -1:

        return ""

    return text[
        campaign_start:product_index
    ].strip()


# =========================================================
# TARGET PRODUCT LINKS
# =========================================================

def extract_product_links(observation):

    links = []

    for link in observation.get(
        "links",
        [],
    ):

        link_text = link.get(
            "text",
            "",
        )

        href = link.get(
            "href",
            "",
        )

        if not href:

            continue

        if TARGET_PRODUCT in link_text:

            links.append(
                {
                    "order": link.get(
                        "order",
                        0,
                    ),
                    "text": link_text,
                    "href": href,
                    "attributes": link.get(
                        "attributes",
                        {},
                    ),
                }
            )

    return links


# =========================================================
# IMAGE EVIDENCE
# =========================================================

def extract_image_evidence(observation):

    images = []

    for image in observation.get(
        "images",
        [],
    ):

        src = image.get(
            "src",
            "",
        )

        if not src:

            continue

        images.append(
            {
                "order": image.get(
                    "order",
                    0,
                ),
                "src": src,
                "attributes": image.get(
                    "attributes",
                    {},
                ),
            }
        )

    return images


# =========================================================
# BUILD REALITY EVIDENCE
# =========================================================

def build_reality_evidence(observation):

    text = (
        observation.get(
            "content",
            {},
        ).get(
            "text",
            "",
        )
    )

    if not text:

        raise RuntimeError(
            "Observation content.text is empty"
        )

    product_text = extract_product_text(
        text
    )

    campaign_text = (
        extract_campaign_evidence(
            text
        )
    )

    product_links = (
        extract_product_links(
            observation
        )
    )

    image_evidence = (
        extract_image_evidence(
            observation
        )
    )

    return {
        "target_product": TARGET_PRODUCT,

        "campaign_text": campaign_text,

        "product_text": product_text,

        "product_links": product_links,

        "image_evidence": image_evidence,
    }


# =========================================================
# BUILD PROMPT
# =========================================================

def build_prompt(evidence):

    evidence_json = json.dumps(
        evidence,
        ensure_ascii=False,
        indent=2,
    )

    return f"""
あなたはSale Realityを解析するAI Runtimeです。

以下は、Lenovoから取得したGmail Observationから
コードによって切り出されたReality Evidenceです。

このReality Evidenceに実際に存在する情報だけを使用してください。

推測は禁止です。
価格の計算は禁止です。
商品情報の補完は禁止です。
URLの生成は禁止です。
画像URLの生成は禁止です。

対象商品は1商品だけです。

対象商品：

{TARGET_PRODUCT}

以下を抽出してください。

- brand
- campaign_title
- coupon_code
- valid_from
- valid_until
- product_name
- cpu
- memory_gb
- storage
- display
- gpu
- regular_price
- sale_price
- product_url
- image_url

========================================================
重要
========================================================

product_url は、
REALITY EVIDENCE の product_links に存在する
href のみ使用してください。

hrefを加工してはいけません。

image_url は、
REALITY EVIDENCE の image_evidence に存在する
src のみ使用してください。

srcを生成してはいけません。

対象商品と明確に対応していることを
Evidenceから確認できない画像は採用しないでください。

確認できない場合は
image_url を "" にしてください。

========================================================
値が確認できない場合
========================================================

文字列：

""

数値：

0

を返してください。

価格はメールに記載された価格を
そのまま数値化してください。

割引率から価格を計算してはいけません。

========================================================
対象商品制約
========================================================

今回の対象商品以外の商品は
絶対に返さないでください。

========================================================
OUTPUT
========================================================

JSONのみ返してください。

説明文は禁止です。
コメントは禁止です。
Markdownは禁止です。
```jsonは禁止です。

必ず以下のJSON構造だけを返してください。

{{
  "brand": "",
  "campaign_title": "",
  "coupon_code": "",
  "valid_from": "",
  "valid_until": "",
  "product_name": "",
  "cpu": "",
  "memory_gb": 0,
  "storage": "",
  "display": "",
  "gpu": "",
  "regular_price": 0,
  "sale_price": 0,
  "product_url": "",
  "image_url": ""
}}

REALITY EVIDENCE
====================================================
{evidence_json}
====================================================
"""


# =========================================================
# EXTRACT GEMINI TEXT
# =========================================================

def extract_gemini_text(result):

    candidates = result.get(
        "candidates",
        [],
    )

    if not candidates:

        raise RuntimeError(
            "Gemini candidates missing"
        )

    parts = (
        candidates[0]
        .get(
            "content",
            {},
        )
        .get(
            "parts",
            [],
        )
    )

    texts = []

    for part in parts:

        if part.get(
            "thought",
            False,
        ):

            continue

        text = part.get(
            "text",
            "",
        )

        if text:

            texts.append(
                text
            )

    raw_text = "\n".join(
        texts
    ).strip()

    if not raw_text:

        raise RuntimeError(
            "Gemini output text empty"
        )

    return raw_text


# =========================================================
# PARSE SALE JSON
# =========================================================

def parse_sale_json(raw_text):

    cleaned = raw_text.strip()

    if cleaned.startswith(
        "```json"
    ):

        cleaned = cleaned[
            len("```json"):
        ].strip()

    elif cleaned.startswith(
        "```"
    ):

        cleaned = cleaned[
            len("```"):
        ].strip()

    if cleaned.endswith(
        "```"
    ):

        cleaned = cleaned[
            :-3
        ].strip()

    try:

        return json.loads(
            cleaned
        )

    except json.JSONDecodeError as e:

        raise RuntimeError(
            f"Sale JSON parse failed: {e}"
        )


# =========================================================
# MAIN
# =========================================================

def main():

    print()
    print("=" * 80)
    print("LENOVO SALE AI TEST")
    print("=" * 80)

    # =====================================================
    # OBSERVATION
    # =====================================================

    observation_path = (
        resolve_observation_path()
    )

    if not observation_path.exists():

        raise RuntimeError(
            "observation.json not found: "
            f"{observation_path}"
        )

    print()
    print("[1] OBSERVATION")

    print(
        f"    {observation_path}"
    )

    with open(
        observation_path,
        "r",
        encoding="utf-8",
    ) as f:

        observation = json.load(
            f
        )

    print("    OK")

    # =====================================================
    # REALITY EVIDENCE
    # =====================================================

    print()
    print("[2] REALITY EVIDENCE")

    evidence = (
        build_reality_evidence(
            observation
        )
    )

    print(
        f"    target  : "
        f"{TARGET_PRODUCT}"
    )

    print(
        f"    links   : "
        f"{len(evidence['product_links'])}"
    )

    print(
        f"    images  : "
        f"{len(evidence['image_evidence'])}"
    )

    print()
    print(
        "    product evidence:"
    )

    print(
        evidence["product_text"]
    )

    # =====================================================
    # PROMPT
    # =====================================================

    prompt = build_prompt(
        evidence
    )

    print()
    print("[3] GEMINI")

    client = GeminiClient(
        model_name=(
            AIRuntime.DEFAULT_SPEC_MODEL
        ),
    )

    result = client.generate(
        prompt,
    )

    print("    OK")

    # =====================================================
    # RAW RESULT
    # =====================================================

    print()
    print("[4] RAW RESULT")

    print(
        json.dumps(
            result,
            ensure_ascii=False,
            indent=2,
        )
    )

    # =====================================================
    # AI OUTPUT
    # =====================================================

    raw_text = extract_gemini_text(
        result
    )

    print()
    print("[5] AI OUTPUT")

    print("-" * 80)
    print(raw_text)
    print("-" * 80)

    # =====================================================
    # PARSE
    # =====================================================

    sale_data = parse_sale_json(
        raw_text
    )

    # =====================================================
    # PERSIST
    # =====================================================

    sale_output_path = (
        observation_path.parent
        / "sale.json"
    )

    print()
    print("[6] PERSIST")

    with open(
        sale_output_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            sale_data,
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(
        f"    {sale_output_path}"
    )

    # =====================================================
    # COMPLETE
    # =====================================================

    print()
    print("=" * 80)
    print("LENOVO SALE AI TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
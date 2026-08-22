# /home/maya/shin-vps/django/acquisition/sources/scraping/gmail/lenovo/lenovo_sale_parser.py

import json
import re

from pathlib import Path


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

OUTPUT_DIR = BASE_DIR / "output"


# =========================================================
# TARGET
# =========================================================

TARGET_PRODUCT = (
    "ThinkBook 14 Gen 9 IPL FIFA World Cup 26 Edition"
)


PRODUCT_END_MARKERS = (

    "ThinkBook 16 Gen 9 IPL FIFA World Cup 26 Edition",

    "ThinkPad X1 Carbon Gen 14 Aura Edition FIFA World Cup 26 Edition",

)


# =========================================================
# OBSERVATION
# =========================================================

def resolve_observation_path():

    candidates = sorted(

        (
            path
            for path in OUTPUT_DIR.glob(
                "*/observation.json"
            )
            if path.is_file()
        ),

        key=lambda path:
            path.parent.name,

        reverse=True,

    )


    if not candidates:

        raise RuntimeError(
            "observation.json not found"
        )


    return candidates[0]



def load_observation(
    path,
):

    with open(
        path,
        encoding="utf-8",
    ) as f:

        return json.load(f)



# =========================================================
# CONTENT
# =========================================================

def get_content(
    observation,
):

    content = observation.get(
        "content",
        {},
    )


    html = content.get(
        "html",
        "",
    )


    text = content.get(
        "text",
        "",
    )


    if html:

        return html


    if text:

        return text


    raise RuntimeError(
        "Observation content is empty"
    )



# =========================================================
# HTML NORMALIZATION
# =========================================================

def normalize_content(
    content,
):

    # HTMLの場合でも検索用には
    # タグを単純に除去する。
    #
    # URL自体は text 側に存在する場合があるため、
    # URLの取得は後段で行う。

    content = re.sub(
        r"<br\s*/?>",
        "\n",
        content,
        flags=re.IGNORECASE,
    )


    content = re.sub(
        r"</p\s*>",
        "\n",
        content,
        flags=re.IGNORECASE,
    )


    content = re.sub(
        r"<[^>]+>",
        "",
        content,
    )


    return content



# =========================================================
# PRODUCT BLOCK
# =========================================================

def extract_product_block(
    content,
):

    start = content.find(
        TARGET_PRODUCT
    )


    if start == -1:

        raise RuntimeError(
            "Target product not found: "
            f"{TARGET_PRODUCT}"
        )


    end = len(content)


    for marker in PRODUCT_END_MARKERS:

        index = content.find(
            marker,
            start + len(TARGET_PRODUCT),
        )


        if index != -1:

            end = min(
                end,
                index,
            )


    block = content[
        start:end
    ].strip()


    return block



# =========================================================
# PRODUCT NAME
# =========================================================

def extract_product_name(
    block,
):

    match = re.search(
        re.escape(
            TARGET_PRODUCT
        ),
        block,
    )


    if not match:

        return ""


    return match.group(0)



# =========================================================
# PRODUCT NO
# =========================================================

def extract_product_no(
    block,
):

    match = re.search(

        r"製品型番[：:]\s*([A-Za-z0-9]+)",

        block,

    )


    if not match:

        return ""


    return match.group(1)



# =========================================================
# SPEC
# =========================================================

def extract_spec(
    block,
    label,
):

    match = re.search(

        rf"{re.escape(label)}[：:]\s*(.+)",

        block,

    )


    if not match:

        return ""


    return match.group(1).strip()



# =========================================================
# PRICE
# =========================================================

def extract_price(
    block,
    label,
):

    match = re.search(

        rf"{re.escape(label)}[：:]\s*[￥¥]\s*([\d,]+)",

        block,

    )


    if not match:

        return 0


    return int(

        match.group(1)
        .replace(
            ",",
            "",
        )

    )



# =========================================================
# SALE PRICE
# =========================================================

def extract_sale_price(
    block,
):

    match = re.search(

        r"クーポン適応価格[：:]\s*[￥¥]\s*([\d,]+)",

        block,

    )


    if match:

        return int(

            match.group(1)
            .replace(
                ",",
                "",
            )

        )


    return 0



# =========================================================
# AFFILIATE URL
# =========================================================

def extract_affiliate_url(
    block,
):

    urls = re.findall(

        r"https?://[^\s<>\"]+",

        block,

    )


    if not urls:

        return ""


    return urls[0].rstrip(
        ".,"
    )



# =========================================================
# COUPON CODE
# =========================================================

def extract_coupon_code(
    content,
):

    patterns = (

        r"クーポンコード[：:]\s*([A-Za-z0-9_-]+)",

        r"クーポン[：:]\s*([A-Za-z0-9_-]+)",

    )


    for pattern in patterns:

        match = re.search(
            pattern,
            content,
        )


        if match:

            return match.group(1)


    return ""



# =========================================================
# VALID PERIOD
# =========================================================

def extract_valid_period(
    content,
):

    patterns = (

        r"適応期間[：:]\s*([^\n]+)",

        r"適用期間[：:]\s*([^\n]+)",

        r"期間[：:]\s*([^\n]+)",

    )


    for pattern in patterns:

        match = re.search(
            pattern,
            content,
        )


        if match:

            return match.group(1).strip()


    return ""



# =========================================================
# SALE REALITY
# =========================================================

def build_sale_reality(
    observation,
):

    content = get_content(
        observation
    )


    normalized = normalize_content(
        content
    )


    # -----------------------------------------------------
    # 最初に対象商品範囲を確定
    # -----------------------------------------------------

    product_block = (
        extract_product_block(
            normalized
        )
    )


    # -----------------------------------------------------
    # 商品範囲から商品Realityを取得
    # -----------------------------------------------------

    product = {

        "name":
            extract_product_name(
                product_block
            ),

        "product_no":
            extract_product_no(
                product_block
            ),

        "cpu":
            extract_spec(
                product_block,
                "プロセッサー",
            ),

        "memory":
            extract_spec(
                product_block,
                "メモリー",
            ),

        "storage":
            extract_spec(
                product_block,
                "ストレージ",
            ),

        "display":
            extract_spec(
                product_block,
                "ディスプレイ",
            ),

        "gpu":
            extract_spec(
                product_block,
                "グラフィックカード",
            ),

        "regular_price":
            extract_price(
                product_block,
                "販売価格",
            ),

        "sale_price":
            extract_sale_price(
                product_block
            ),

        "affiliate_url":
            extract_affiliate_url(
                product_block
            ),

    }


    # -----------------------------------------------------
    # Sale Reality
    # -----------------------------------------------------

    return {

        "source": {

            "type":
                "gmail",

            "message_id":
                observation
                .get(
                    "identity",
                    {},
                )
                .get(
                    "message_id",
                    "",
                ),

        },


        "brand":
            "Lenovo",


        "coupon_code":
            extract_coupon_code(
                normalized
            ),


        "valid_period":
            extract_valid_period(
                normalized
            ),


        "product":
            product,


        "raw_text":
            product_block,

    }



# =========================================================
# PERSIST
# =========================================================

def persist_sale_reality(
    observation_path,
    sale,
):

    output_path = (
        Path(observation_path).parent
        /
        "sale.json"
    )


    with open(
        output_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            sale,
            f,
            ensure_ascii=False,
            indent=2,
        )


    return output_path



# =========================================================
# RUNTIME
# =========================================================

def run():

    print()

    print("=" * 80)

    print(
        "LENOVO SALE PARSER"
    )

    print("=" * 80)


    # -----------------------------------------------------
    # Observation
    # -----------------------------------------------------

    observation_path = (
        resolve_observation_path()
    )


    print()

    print(
        "[1] OBSERVATION"
    )

    print(
        observation_path
    )


    observation = load_observation(
        observation_path
    )


    # -----------------------------------------------------
    # Parse
    # -----------------------------------------------------

    print()

    print(
        "[2] PRODUCT BLOCK"
    )


    sale = build_sale_reality(
        observation
    )


    print()

    print(
        sale["raw_text"]
    )


    # -----------------------------------------------------
    # Reality
    # -----------------------------------------------------

    print()

    print(
        "[3] SALE REALITY"
    )


    print(

        json.dumps(

            sale,

            ensure_ascii=False,

            indent=2,

        )

    )


    # -----------------------------------------------------
    # Persist
    # -----------------------------------------------------

    output_path = (
        persist_sale_reality(
            observation_path,
            sale,
        )
    )


    print()

    print(
        "[4] PERSIST"
    )

    print(
        output_path
    )


    print()

    print("=" * 80)

    print(
        "LENOVO SALE PARSER COMPLETE"
    )

    print("=" * 80)


    return sale



# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    run()
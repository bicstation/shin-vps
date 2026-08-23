import json
import re

from pathlib import Path


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

OUTPUT_DIR = BASE_DIR / "output"


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
        r"</div\s*>",
        "\n",
        content,
        flags=re.IGNORECASE,
    )


    content = re.sub(
        r"<[^>]+>",
        "",
        content,
    )


    content = (
        content
        .replace(
            "\r\n",
            "\n",
        )
        .replace(
            "\r",
            "\n",
        )
    )


    return content


# =========================================================
# PRODUCT BLOCKS
# =========================================================

def find_processor_lines(
    lines,
):

    positions = []


    for index, line in enumerate(
        lines
    ):

        if re.match(
            r"^\s*・?プロセッサー[：:]",
            line,
        ):

            positions.append(
                index
            )


    return positions


def find_product_name(
    lines,
    processor_index,
):

    index = (
        processor_index - 1
    )


    while (
        index >= 0
        and
        not lines[index].strip()
    ):

        index -= 1


    if index < 0:

        return (
            "",
            -1,
        )


    name = (
        lines[index]
        .strip()
    )


    # -----------------------------------------------------
    # 装飾引用符だけ除去
    # -----------------------------------------------------

    name = name.strip(
        "「」"
    )


    return (
        name,
        index,
    )


def extract_product_blocks(
    content,
):

    lines = content.splitlines()


    processor_positions = (
        find_processor_lines(
            lines
        )
    )


    if not processor_positions:

        raise RuntimeError(
            "No product blocks found"
        )


    products = []


    for index, processor_index in enumerate(
        processor_positions
    ):

        # -------------------------------------------------
        # 商品名
        # -------------------------------------------------

        product_name, name_index = (
            find_product_name(
                lines,
                processor_index,
            )
        )


        if not product_name:

            continue


        # -------------------------------------------------
        # 商品ブロック開始
        # -------------------------------------------------

        start_index = (
            name_index
        )


        # -------------------------------------------------
        # 商品ブロック終了
        #
        # 次の商品名の直前まで
        # -------------------------------------------------

        if (
            index + 1
            <
            len(processor_positions)
        ):

            next_processor_index = (
                processor_positions[
                    index + 1
                ]
            )


            _, next_name_index = (
                find_product_name(
                    lines,
                    next_processor_index,
                )
            )


            if next_name_index >= 0:

                end_index = (
                    next_name_index
                )

            else:

                end_index = (
                    next_processor_index
                )

        else:

            end_index = len(
                lines
            )


        block = "\n".join(
            lines[
                start_index:end_index
            ]
        ).strip()


        if block:

            products.append(
                block
            )


    if not products:

        raise RuntimeError(
            "Product blocks could not be extracted"
        )


    return products


# =========================================================
# PRODUCT NAME
# =========================================================

def extract_product_name(
    block,
):

    for line in block.splitlines():

        line = line.strip()


        if not line:

            continue


        line = line.strip(
            "「」"
        )


        # -------------------------------------------------
        # 商品名としてプロセッサー行を返さない
        # -------------------------------------------------

        if re.match(
            r"^・?プロセッサー[：:]",
            line,
        ):

            continue


        return line


    return ""


# =========================================================
# PRODUCT NO
# =========================================================

def extract_product_no(
    block,
):

    patterns = (

        r"製品型番[：:]\s*([A-Za-z0-9_-]+)",

        r"型番[：:]\s*([A-Za-z0-9_-]+)",

    )


    for pattern in patterns:

        match = re.search(
            pattern,
            block,
        )


        if match:

            return match.group(1)


    return ""


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


    return (
        match.group(1)
        .strip()
    )


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

    patterns = (

        r"クーポン適応価格[：:]\s*[￥¥]\s*([\d,]+)",

        r"クーポン適用価格[：:]\s*[￥¥]\s*([\d,]+)",

    )


    for pattern in patterns:

        match = re.search(
            pattern,
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
# URL
# =========================================================

def extract_url(
    block,
):

    urls = re.findall(

        r"https?://[^\s<>\"]+",

        block,

    )


    if not urls:

        return ""


    return (
        urls[0]
        .rstrip(
            ".,"
        )
    )


# =========================================================
# COUPON CODE
# =========================================================

def extract_coupon_code(
    content,
):

    patterns = (

        r"特別クーポンコード.*?([A-Za-z0-9_-]{6,})",

        r"クーポンコード.*?([A-Za-z0-9_-]{6,})",

    )


    for pattern in patterns:

        match = re.search(
            pattern,
            content,
            flags=re.DOTALL,
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

            return (
                match.group(1)
                .strip()
            )


    return ""


# =========================================================
# PRODUCT REALITY
# =========================================================

def build_product_reality(
    product_block,
):

    return {

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

        "url":
            extract_url(
                product_block
            ),

    }


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
    # メール内の商品ブロックをすべて抽出
    # -----------------------------------------------------

    product_blocks = (
        extract_product_blocks(
            normalized
        )
    )


    # -----------------------------------------------------
    # 商品Realityをすべて構築
    # -----------------------------------------------------

    products = []


    for product_block in product_blocks:

        product = (
            build_product_reality(
                product_block
            )
        )


        if not product["name"]:

            continue


        products.append(
            product
        )


    if not products:

        raise RuntimeError(
            "No product reality found"
        )


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


        "products":
            products,

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
        "[2] PRODUCT BLOCKS"
    )


    sale = build_sale_reality(
        observation
    )


    print()

    print(
        "PRODUCT COUNT:",
        len(
            sale["products"]
        ),
    )


    for index, product in enumerate(
        sale["products"],
        start=1,
    ):

        print()

        print(
            f"[PRODUCT {index}]"
        )

        print(
            product["name"]
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
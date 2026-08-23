#!/usr/bin/env python3

import html
import json
import re

from html.parser import HTMLParser
from pathlib import Path


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent


# =========================================================
# HTML TEXT EXTRACTOR
# =========================================================

class MailHTMLTextParser(
    HTMLParser
):

    BLOCK_TAGS = {
        "br",
        "p",
        "div",
        "li",
        "tr",
        "td",
        "th",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
    }


    def __init__(self):

        super().__init__(
            convert_charrefs=True
        )

        self.parts = []


    def handle_starttag(
        self,
        tag,
        attrs,
    ):

        if tag.lower() in self.BLOCK_TAGS:

            self.parts.append(
                "\n"
            )


    def handle_endtag(
        self,
        tag,
    ):

        if tag.lower() in self.BLOCK_TAGS:

            self.parts.append(
                "\n"
            )


    def handle_data(
        self,
        data,
    ):

        self.parts.append(
            data
        )


    def get_text(self):

        return "".join(
            self.parts
        )


# =========================================================
# TEXT
# =========================================================

def normalize_text(
    value,
):

    if not value:

        return ""


    value = html.unescape(
        value
    )


    value = value.replace(
        "\r\n",
        "\n",
    )


    value = value.replace(
        "\r",
        "\n",
    )


    value = re.sub(
        r"[ \t]+",
        " ",
        value,
    )


    value = re.sub(
        r"\n[ \t]+",
        "\n",
        value,
    )


    value = re.sub(
        r"[ \t]+\n",
        "\n",
        value,
    )


    value = re.sub(
        r"\n{3,}",
        "\n\n",
        value,
    )


    return value.strip()


# =========================================================
# HTML → TEXT
# =========================================================

def html_to_text(
    value,
):

    if not value:

        return ""


    parser = (
        MailHTMLTextParser()
    )


    parser.feed(
        value
    )


    parser.close()


    return normalize_text(
        parser.get_text()
    )


# =========================================================
# URL
# =========================================================

def clean_url(
    url,
):

    if not url:

        return ""


    url = html.unescape(
        url
    )


    url = url.replace(
        "&amp;",
        "&",
    )


    return url.rstrip(
        ".,);>\"'"
    )


def extract_product_identifier(
    url,
):

    if not url:

        return ""


    match = re.search(
        r"/([0-9A-Za-z]+JP)"
        r"(?:[/?#&]|$)",
        url,
        flags=re.IGNORECASE,
    )


    if not match:

        return ""


    return match.group(
        1
    ).lower()


def is_lenovo_product_url(
    url,
):

    if not url:

        return False


    url = clean_url(
        url
    )


    if "lenovo.com" not in url.lower():

        return False


    if "/p/" not in url.lower():

        return False


    return bool(
        extract_product_identifier(
            url
        )
    )


# =========================================================
# REALITY HTML PRODUCT URLS
# =========================================================

def extract_lenovo_product_urls(
    html_content,
):

    if not html_content:

        return []


    # -----------------------------------------------------
    # Reality:
    # 生HTMLそのものからURL文字列を取得する。
    #
    # HTML DOM構造を推測しない。
    # href の位置も仮定しない。
    # -----------------------------------------------------

    content = html.unescape(
        html_content
    )


    urls = re.findall(
        r'https?://[^"\'<>\s]+',
        content,
        flags=re.IGNORECASE,
    )


    result = []

    seen = set()


    for url in urls:

        url = clean_url(
            url
        )


        if not is_lenovo_product_url(
            url
        ):

            continue


        identifier = (
            extract_product_identifier(
                url
            )
        )


        if not identifier:

            continue


        if identifier in seen:

            continue


        seen.add(
            identifier
        )


        result.append(
            url
        )


    return result


# =========================================================
# COUPON CODE
# =========================================================

def extract_coupon_code(
    content,
):

    patterns = (

        r"特別クーポンコード\s*[：:]\s*([A-Za-z0-9_-]{6,})",

        r"クーポンコード\s*[：:]\s*([A-Za-z0-9_-]{6,})",

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

            return (
                match.group(
                    1
                )
                .strip()
            )


    return ""


# =========================================================
# VALID PERIOD
# =========================================================

def extract_valid_period(
    text,
):

    match = re.search(

        r"""
        (
            \d{4}/\d{1,2}/\d{1,2}
            \s+
            \d{1,2}:\d{2}
            \s*
            [～~\-]
            \s*
            \d{4}/\d{1,2}/\d{1,2}
            \s+
            \d{1,2}:\d{2}
        )
        """,

        text,

        flags=re.VERBOSE,

    )


    if not match:

        return ""


    return match.group(
        1
    )


# =========================================================
# PRICE
# =========================================================

def parse_price(
    value,
):

    if not value:

        return 0


    value = re.sub(
        r"[^\d]",
        "",
        value,
    )


    if not value:

        return 0


    return int(
        value
    )


# =========================================================
# PRODUCT NAME
# =========================================================

def clean_product_name(
    name,
):

    name = normalize_text(
        name
    )


    name = re.sub(
        r"^[・•●\s]+",
        "",
        name,
    )


    name = re.sub(
        r"^[「『\"]+",
        "",
        name,
    )


    name = re.sub(
        r"[」』\"]+$",
        "",
        name,
    )


    return name.strip()


# =========================================================
# PRODUCT BLOCK
# =========================================================

def extract_product_blocks(
    text,
):

    lines = [
        line.strip()
        for line
        in text.split("\n")
    ]


    lines = [
        line
        for line
        in lines
        if line
    ]


    products = []


    index = 0


    while index < len(lines):

        line = lines[index]


        # -------------------------------------------------
        # PROCESSOR MARKER
        # -------------------------------------------------

        if not re.match(
            r"^[・•●]?\s*プロセッサー[：:]",
            line,
        ):

            index += 1

            continue


        # -------------------------------------------------
        # PRODUCT NAME
        # -------------------------------------------------

        product_name = ""


        previous_index = (
            index - 1
        )


        while previous_index >= 0:

            candidate = (
                lines[
                    previous_index
                ]
            )


            if candidate:

                if not candidate.startswith(
                    (
                        "・プロセッサー",
                        "・メモリー",
                        "・ストレージ",
                        "・ディスプレイ",
                        "・グラフィックカード",
                    )
                ):

                    product_name = (
                        clean_product_name(
                            candidate
                        )
                    )

                    break


            previous_index -= 1


        # -------------------------------------------------
        # FIELDS
        # -------------------------------------------------

        cpu = ""
        memory = ""
        storage = ""
        display = ""
        gpu = ""

        regular_price = 0
        sale_price = 0


        # -------------------------------------------------
        # CURRENT PRODUCT RANGE
        # -------------------------------------------------

        cursor = index


        while cursor < len(lines):

            current = lines[
                cursor
            ]


            # -------------------------------------------------
            # NEXT PRODUCT
            # -------------------------------------------------

            if (
                cursor > index
                and
                re.match(
                    r"^[・•●]?\s*プロセッサー[：:]",
                    current,
                )
            ):

                break


            # -------------------------------------------------
            # CPU
            # -------------------------------------------------

            match = re.match(
                r"^[・•●]?\s*プロセッサー[：:]\s*(.+)$",
                current,
            )


            if match:

                cpu = normalize_text(
                    match.group(
                        1
                    )
                )


            # -------------------------------------------------
            # MEMORY
            # -------------------------------------------------

            match = re.match(
                r"^[・•●]?\s*メモリー[：:]\s*(.+)$",
                current,
            )


            if match:

                memory = normalize_text(
                    match.group(
                        1
                    )
                )


            # -------------------------------------------------
            # STORAGE
            # -------------------------------------------------

            match = re.match(
                r"^[・•●]?\s*ストレージ[：:]\s*(.+)$",
                current,
            )


            if match:

                storage = normalize_text(
                    match.group(
                        1
                    )
                )


            # -------------------------------------------------
            # DISPLAY
            # -------------------------------------------------

            match = re.match(
                r"^[・•●]?\s*ディスプレイ[：:]\s*(.+)$",
                current,
            )


            if match:

                display = normalize_text(
                    match.group(
                        1
                    )
                )


            # -------------------------------------------------
            # GPU
            # -------------------------------------------------

            match = re.match(
                r"^[・•●]?\s*グラフィックカード[：:]\s*(.+)$",
                current,
            )


            if match:

                gpu = normalize_text(
                    match.group(
                        1
                    )
                )


            # -------------------------------------------------
            # PRICE
            # -------------------------------------------------

            if "販売価格" in current:

                match = re.search(
                    r"販売価格[：:]\s*￥?\s*([\d,]+)",
                    current,
                )


                if match:

                    regular_price = (
                        parse_price(
                            match.group(
                                1
                            )
                        )
                    )


                match = re.search(
                    r"クーポン適応価格[：:]\s*￥?\s*([\d,]+)",
                    current,
                )


                if not match:

                    match = re.search(
                        r"クーポン適用価格[：:]\s*￥?\s*([\d,]+)",
                        current,
                    )


                if match:

                    sale_price = (
                        parse_price(
                            match.group(
                                1
                            )
                        )
                    )


            cursor += 1


        # -------------------------------------------------
        # PRODUCT
        # -------------------------------------------------

        if product_name:

            products.append({

                "name":
                    product_name,

                "product_no":
                    "",

                "cpu":
                    cpu,

                "memory":
                    memory,

                "storage":
                    storage,

                "display":
                    display,

                "gpu":
                    gpu,

                "regular_price":
                    regular_price,

                "sale_price":
                    sale_price,

            })


        index = max(
            cursor,
            index + 1,
        )


    return products


# =========================================================
# PRODUCTS
# =========================================================

def extract_products(
    text,
    html_content,
):

    products = (
        extract_product_blocks(
            text
        )
    )


    # -----------------------------------------------------
    # Reality URL
    # -----------------------------------------------------

    urls = (
        extract_lenovo_product_urls(
            html_content
        )
    )


    # -----------------------------------------------------
    # Reality validation
    #
    # URLを生成しない。
    # URLをDBから補完しない。
    # URLを商品名から推測しない。
    # -----------------------------------------------------

    if len(urls) != len(products):

        raise RuntimeError(
            "Lenovo product URL Reality mismatch: "
            f"products={len(products)}, "
            f"urls={len(urls)}"
        )


    for product, url in zip(
        products,
        urls,
    ):

        product[
            "url"
        ] = url


    return products


# =========================================================
# BRAND
# =========================================================

def extract_brand(
    headers,
    text,
):

    subject = headers.get(
        "Subject",
        "",
    )


    if "レノボ" in subject:

        return "Lenovo"


    if "Lenovo" in text:

        return "Lenovo"


    return "Lenovo"


# =========================================================
# SALE REALITY
# =========================================================

def build_sale_reality(
    observation,
):

    headers = observation.get(
        "headers",
        {},
    )


    content = observation.get(
        "content",
        {},
    )


    text = normalize_text(
        content.get(
            "text",
            "",
        )
    )


    html_content = content.get(
        "html",
        "",
    )


    # -----------------------------------------------------
    # SOURCE TEXT
    # -----------------------------------------------------

    if text:

        source_text = text

    else:

        source_text = html_to_text(
            html_content
        )


    source_text = normalize_text(
        source_text
    )


    # -----------------------------------------------------
    # PRODUCTS
    # -----------------------------------------------------

    products = extract_products(
        source_text,
        html_content,
    )


    if not products:

        raise RuntimeError(
            "Lenovo sale products not found"
        )


    # -----------------------------------------------------
    # SOURCE
    # -----------------------------------------------------

    message_id = (
        observation
        .get(
            "identity",
            {},
        )
        .get(
            "message_id",
            "",
        )
    )


    return {

        "source": {

            "type":
                "gmail",

            "message_id":
                message_id,

        },

        "brand":
            extract_brand(
                headers,
                source_text,
            ),

        "coupon_code":
            extract_coupon_code(
                source_text
            ),

        "valid_period":
            extract_valid_period(
                source_text
            ),

        "products":
            products,

        "product_url":
            "",

    }


# =========================================================
# LOAD OBSERVATION
# =========================================================

def load_observation(
    observation_path: Path,
):

    with open(
        observation_path,
        encoding="utf-8",
    ) as f:

        return json.load(
            f
        )


# =========================================================
# PERSIST
# =========================================================

def persist_sale(
    observation_path,
    sale,
):

    observation_path = Path(
        observation_path
    )


    output_path = (
        observation_path.parent
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

def run(
    observation_path,
):

    observation_path = Path(
        observation_path
    )


    print()

    print("=" * 80)

    print(
        "LENOVO SALE PARSER"
    )

    print("=" * 80)


    observation = load_observation(
        observation_path
    )


    sale = build_sale_reality(
        observation
    )


    output_path = persist_sale(
        observation_path,
        sale,
    )


    print()

    print(
        "PRODUCTS:",
        len(
            sale[
                "products"
            ]
        ),
    )


    for index, product in enumerate(
        sale[
            "products"
        ],
        start=1,
    ):

        print()

        print(
            f"[{index}]",
            product[
                "name"
            ],
        )

        print(
            "URL:",
            product[
                "url"
            ],
        )

        print(
            "IDENTIFIER:",
            extract_product_identifier(
                product[
                    "url"
                ]
            ),
        )


    print()

    print(
        "COUPON:",
        sale[
            "coupon_code"
        ],
    )


    print(
        "VALID:",
        sale[
            "valid_period"
        ],
    )


    print()

    print(
        "OUTPUT:",
        output_path,
    )


    return sale


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    import sys


    if len(sys.argv) != 2:

        raise SystemExit(
            "Usage: parser.py <observation.json>"
        )


    run(
        sys.argv[1]
    )
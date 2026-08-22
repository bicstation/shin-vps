import json
import re
from html.parser import HTMLParser
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"

TARGET_PRODUCT = "ThinkBook 14 Gen 9"
PRODUCT_END = "ご購入はこちら"


# =========================================================
# OBSERVATION
# =========================================================

def resolve_observation_path():

    candidates = sorted(
        OUTPUT_DIR.glob("*/observation.json"),
        key=lambda p: p.parent.name,
        reverse=True,
    )

    if not candidates:
        raise RuntimeError(
            "observation.json not found"
        )

    return candidates[0]


# =========================================================
# HTML PRODUCT PARSER
# =========================================================

class ProductHTMLParser(HTMLParser):

    def __init__(self):

        super().__init__()

        self.target_found = False
        self.finished = False

        self.text_parts = []
        self.links = []

        self.current_link = None


    def handle_starttag(
        self,
        tag,
        attrs,
    ):

        if self.finished:
            return

        if tag != "a":
            return

        attrs = dict(attrs)

        self.current_link = {
            "href": attrs.get(
                "href",
                "",
            ).strip(),

            "text": [],
        }


    def handle_endtag(
        self,
        tag,
    ):

        if tag != "a":
            return

        if not self.current_link:
            return

        self.links.append(
            {
                "href":
                    self.current_link["href"],

                "text":
                    " ".join(
                        self.current_link["text"]
                    ).strip(),
            }
        )

        self.current_link = None


    def handle_data(
        self,
        data,
    ):

        if self.finished:
            return

        text = data.strip()

        if not text:
            return


        # -------------------------------------------------
        # TARGET SEARCH
        # -------------------------------------------------

        if not self.target_found:

            if TARGET_PRODUCT in text:

                self.target_found = True

                self.text_parts.append(
                    text
                )

                if self.current_link:

                    self.current_link[
                        "text"
                    ].append(text)

            return


        # -------------------------------------------------
        # PRODUCT BLOCK
        # -------------------------------------------------

        self.text_parts.append(
            text
        )

        if self.current_link:

            self.current_link[
                "text"
            ].append(text)


        # -------------------------------------------------
        # PRODUCT END
        # -------------------------------------------------

        if PRODUCT_END in text:

            self.finished = True



# =========================================================
# PRODUCT BLOCK
# =========================================================

def extract_product_block(
    html,
):

    parser = ProductHTMLParser()

    parser.feed(
        html
    )

    if not parser.target_found:

        raise RuntimeError(
            f"Target product not found: {TARGET_PRODUCT}"
        )

    return (
        "\n".join(
            parser.text_parts
        ).strip(),

        parser.links,
    )



# =========================================================
# PRODUCT NAME
# =========================================================

def extract_product_name(
    product_block,
):

    lines = [
        line.strip()
        for line in product_block.splitlines()
        if line.strip()
    ]

    if not lines:

        return ""

    return lines[0]



# =========================================================
# PRODUCT NO
# =========================================================

def extract_product_no(
    product_block,
):

    match = re.search(
        r"製品型番[：:]\s*([A-Za-z0-9]+)",
        product_block,
    )

    if not match:

        return ""

    return match.group(1)



# =========================================================
# SALE PRICE
# =========================================================

def extract_sale_price(
    product_block,
):

    match = re.search(
        r"[￥¥]\s*([\d,]+)",
        product_block,
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
# PRODUCT URL
# =========================================================

def extract_product_url(
    links,
):

    for link in links:

        text = (
            link
            .get(
                "text",
                "",
            )
            .strip()
        )

        if text == PRODUCT_END:

            return (
                link
                .get(
                    "href",
                    "",
                )
                .strip()
            )

    return ""



# =========================================================
# SALE REALITY
# =========================================================

def build_sale_reality(
    observation,
):

    html = (
        observation
        .get(
            "content",
            {},
        )
        .get(
            "html",
            "",
        )
    )

    if not html:

        raise RuntimeError(
            "Observation content.html is empty"
        )


    product_block, links = (
        extract_product_block(
            html
        )
    )


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


        "product_name":
            extract_product_name(
                product_block
            ),


        "product_no":
            extract_product_no(
                product_block
            ),


        "sale_price":
            extract_sale_price(
                product_block
            ),


        "product_url":
            extract_product_url(
                links
            ),


        "links":
            links,


        "raw_text":
            product_block,
    }



# =========================================================
# MAIN
# =========================================================

def main():

    print()

    print("=" * 80)

    print(
        "LENOVO SALE REALITY PARSER TEST"
    )

    print("=" * 80)



    observation_path = (
        resolve_observation_path()
    )


    print()

    print("[1] OBSERVATION")

    print(
        f"    {observation_path}"
    )


    with open(
        observation_path,
        encoding="utf-8",
    ) as f:

        observation = json.load(
            f
        )


    print("    OK")



    print()

    print("[2] PRODUCT BLOCK")


    sale = build_sale_reality(
        observation
    )


    print(
        sale["raw_text"]
    )



    print()

    print("[3] PRODUCT LINKS")


    for index, link in enumerate(
        sale["links"],
        1,
    ):

        print()

        print(
            f"    [{index}]"
        )

        print(
            "    text :",
            link["text"],
        )

        print(
            "    href :",
            link["href"],
        )



    print()

    print("[4] SALE REALITY")


    output_sale = {

        key: value

        for key, value in sale.items()

        if key != "links"
    }


    print(
        json.dumps(
            output_sale,
            ensure_ascii=False,
            indent=2,
        )
    )



    output_path = (
        observation_path.parent
        / "sale.json"
    )


    with open(
        output_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            output_sale,
            f,
            ensure_ascii=False,
            indent=2,
        )



    print()

    print("[5] PERSIST")

    print(
        f"    {output_path}"
    )


    print()

    print("=" * 80)

    print(
        "LENOVO SALE REALITY PARSER COMPLETE"
    )

    print("=" * 80)



if __name__ == "__main__":

    main()
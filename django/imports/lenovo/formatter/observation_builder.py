# /home/maya/shin-vps/django/imports/lenovo/formatter/observation_builder.py
"""
Observation Builder

ProductへObservationを付与する。
"""

from typing import Dict, List


def build_description(specs: Dict[str, str]) -> str:
    """
    SpecificationsをDescriptionへ変換
    """

    lines = []

    for key, value in specs.items():

        value = str(value).strip()

        if not value:
            continue

        lines.append(f"{key}: {value}")

    return "\n".join(lines)


def build(product: Dict) -> Dict:
    """
    ProductからObservationを生成する。
    """

    specs = product.get("specs", {})

    return {
        "raw_title": product.get("product_name", ""),
        "feature": "",
        "description": build_description(specs),
        "specifications": specs,
    }


def attach(products: List[Dict]) -> List[Dict]:
    """
    Product一覧へObservationを追加する。
    """

    for product in products:
        product["observation"] = build(product)

    return products


if __name__ == "__main__":

    sample_products = [
        {
            "product_name": "ThinkPad X1 Carbon",
            "specs": {
                "CPU": "Intel Core Ultra 7",
                "Memory": "32GB",
                "Storage": "1TB SSD",
            },
        }
    ]

    attach(sample_products)

    from pprint import pprint

    pprint(sample_products)
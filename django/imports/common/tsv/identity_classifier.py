# /home/maya/shin-dev/shin-vps/django/imports/common/tsv/identity_classifier.py

from .tsv_loader import load_identity_master


def classify_identity(
    maker: str,
    product_name: str = "",
    description: str = "",
) -> dict:

    maker = maker.strip().upper()
    text = f"{product_name} {description}".lower()

    for rule in load_identity_master():

        if rule["maker"].strip().upper() != maker:
            continue

        keyword = rule["keyword"].strip().lower()

        if keyword in text:
            print(
                f"[MATCH] {product_name} -> "
                f"{rule['brand']} / {rule['series']}"
            )

            return {
                "brand": rule["brand"],
                "series": rule["series"],
                "collaboration": rule["collaboration"],
            }

    return {
        "brand": "",
        "series": "",
        "collaboration": "",
    }
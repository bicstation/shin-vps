# /home/maya/shin-dev/shin-vps/django/api/utils/semantic/normalizer.py
# =========================================================
# SHIN CORE LINX｜Semantic Normalizer
# /api/utils/semantic/normalizer.py
# =========================================================

import re

from api.utils.semantic.loader import (
    load_normalization_rules
)


# =========================================================
# Rules Cache
# =========================================================

NORMALIZATION_RULES = (
    load_normalization_rules()
)


# =========================================================
# Basic Cleanup
# =========================================================

def basic_cleanup(text):

    if not text:
        return ""

    text = text.lower()

    # 全角スペース除去
    text = text.replace("　", " ")

    # 改行除去
    text = text.replace("\n", " ")

    # 連続空白圧縮
    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# =========================================================
# Apply Normalization Rules
# =========================================================

def apply_normalization_rules(text):

    for rule in NORMALIZATION_RULES:

        raw_token = (
            rule.get("raw_token", "")
            .strip()
            .lower()
        )

        normalized_token = (
            rule.get(
                "normalized_token",
                ""
            )
            .strip()
            .lower()
        )

        if not raw_token:
            continue

        text = text.replace(
            raw_token,
            normalized_token
        )

    return text


# =========================================================
# Public API
# =========================================================

def normalize_text(text):

    text = basic_cleanup(text)

    text = apply_normalization_rules(
        text
    )

    # 最後に再cleanup
    text = basic_cleanup(text)

    return text
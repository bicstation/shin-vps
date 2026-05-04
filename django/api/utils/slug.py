# api/utils/slug.py

import re

def normalize_slug(text: str) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)  # 英数字以外 → -
    text = re.sub(r'-+', '-', text)          # 連続-圧縮
    return text.strip('-')                   # 前後-削除
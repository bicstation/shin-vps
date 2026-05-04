# api/utils/slug_utils.py

import re

def normalize_slug(text: str) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')
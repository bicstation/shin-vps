import re

def normalize_gpu(name: str) -> str:
    if not name:
        return ""

    text = name.lower()

    # RTX（3000 / 4000 / 5000系対応 + Ti / SUPER）
    match = re.search(r'rtx\s*(\d{3,4})(?:\s*(ti|super))?', text)
    if match:
        number = match.group(1)
        suffix = match.group(2)

        if suffix:
            return f"rtx-{number}-{suffix}"
        return f"rtx-{number}"

    # RTXシリーズ（型番不明）
    match = re.search(r'rtx\s*(\d{2})', text)
    if match:
        return f"rtx-{match.group(1)}-series"

    # GTX
    match = re.search(r'gtx\s*(\d{3,4})', text)
    if match:
        return f"gtx-{match.group(1)}"

    # Intel Arc
    if "arc" in text:
        return "intel-arc"

    # 内蔵GPU
    if "intel" in text or "iris" in text:
        return "intel-integrated"

    return "other"
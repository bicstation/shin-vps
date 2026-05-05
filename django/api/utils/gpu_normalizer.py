import re

def normalize_gpu(name: str) -> str:
    if not name:
        return ""

    text = name.lower()

    # RTX（Ti / SUPER含む）
    match = re.search(r'rtx[\s\-]*(\d{3,4})(?:[\s\-]*(ti|super))?', text)
    if match:
        number = match.group(1)
        suffix = match.group(2)

        if suffix:
            return f"gpu-rtx-{number}-{suffix}"
        return f"gpu-rtx-{number}"

    # RTX Aシリーズ（ワークステーション）
    match = re.search(r'rtx[\s\-]*a(\d{3,4})', text)
    if match:
        return f"gpu-rtx-a{match.group(1)}"

    # GTX
    match = re.search(r'gtx[\s\-]*(\d{3,4})', text)
    if match:
        return f"gpu-gtx-{match.group(1)}"

    # Intel Arc
    if "arc" in text:
        return "gpu-intel-arc"

    # Intel 内蔵
    if "intel" in text or "iris" in text:
        return "gpu-intel-graphics"

    return "gpu-other"
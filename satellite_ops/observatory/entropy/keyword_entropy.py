# ============================================================================

# SHIN SATELLITE OPS｜Keyword Entropy

# ============================================================================

from collections import Counter
from pathlib import Path

LOG_PATH = "satellite_ops/logs/post_history.log"

TRACK_KEYWORDS = [

"AI",
"GPU",
"VRAM",
"LLM",
"RTX",
"NVIDIA",
"モバイル",
"ノートPC",

]

def analyze_keyword_entropy():

    path = Path(LOG_PATH)

    if not path.exists():
        return {}

    with open(path, "r", encoding="utf-8") as f:
        logs = f.read()

    counter = Counter()

    for keyword in TRACK_KEYWORDS:
        counter[keyword] = logs.count(keyword)

    return dict(counter)


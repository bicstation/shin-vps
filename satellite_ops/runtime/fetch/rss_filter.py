# ============================================================================

# SHIN SATELLITE OPS｜RSS Filter

# ============================================================================

AI_KEYWORDS = [
    "AI",
    "GPU",
    "NVIDIA",
    "RTX",
    "PC",
    "ノートPC",
    "半導体",
    "生成AI",

    ]

def filter_ai_topics(topics):

    filtered = []

    for topic in topics:
        title = topic.get("title", "")
        if any(keyword in title for keyword in AI_KEYWORDS):
            filtered.append(topic)

    return filtered


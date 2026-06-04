# ============================================================================

# SHIN SATELLITE OPS｜Builder Router

# ============================================================================

from satellite_ops.topics.builders.ai_gpu_builder import (
build_ai_gpu_paragraphs,
)

def select_builder(topic, hour=None):


    title = topic.get("title", "")

    # ------------------------------------------------------------------------
    # AI / GPU
    # ------------------------------------------------------------------------

    ai_keywords = [
        "AI",
        "GPU",
        "RTX",
        "LLM",
        "生成AI",
        "NVIDIA",
    ]

    if any(keyword in title for keyword in ai_keywords):

        return build_ai_gpu_paragraphs(
            topic,
            hour=hour,
        )

    # ------------------------------------------------------------------------
    # Fallback
    # ------------------------------------------------------------------------

    return build_ai_gpu_paragraphs(
        topic,
        hour=hour,
    )


# =========================================================
# FILE:
# api/utils/semantic/traversal/detect_features.py
# =========================================================


# =========================================================
# DETECT FEATURES RUNTIME
# =========================================================

def detect_features_runtime(

    specs,

    trace_runtime=False,

):

    attributes = []

    # =====================================================
    # SOURCE
    # =====================================================

    source_text = str(
        specs.get(
            "source_text",
            ""
        )
    ).lower()

    # =====================================================
    # AI FEATURES
    # =====================================================

    if (

        "copilot+ pc" in source_text

        or

        "ai pc" in source_text

        or

        "local llm" in source_text

    ):

        attributes.append(
            "cpu-ai"
        )

    # =====================================================
    # OLED
    # =====================================================

    if (

        "oled" in source_text

        or

        "qd-oled" in source_text

    ):

        attributes.append(
            "monitor-oled"
        )

    # =====================================================
    # HIGH REFRESH
    # =====================================================

    if (

        "240hz" in source_text

        or

        "360hz" in source_text

        or

        "500hz" in source_text

    ):

        attributes.append(
            "monitor-highrefresh"
        )

    # =====================================================
    # ULTRAWIDE
    # =====================================================

    if (

        "21:9" in source_text

        or

        "32:9" in source_text

    ):

        attributes.append(
            "monitor-ultrawide"
        )

    # =====================================================
    # DEVICE
    # =====================================================

    if (

        "notebook" in source_text

        or

        "laptop" in source_text

    ):

        attributes.append(
            "device-laptop"
        )

    if (

        "desktop" in source_text

    ):

        attributes.append(
            "device-desktop"
        )

    if (

        "mini pc" in source_text

    ):

        attributes.append(
            "device-mini"
        )

    # =====================================================
    # UNIQUE
    # =====================================================

    attributes = list(
        set(attributes)
    )

    return attributes
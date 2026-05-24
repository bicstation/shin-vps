# =========================================================
# SHIN CORE LINX
# semantic/mapping/detect_features.py
# =========================================================


# =========================================================
# FEATURE ATTRIBUTE DETECTION
# =========================================================

def detect_pc_feature(
    specs,
):

    slugs = set()

    cpu_model = (
        specs.get(
            "cpu_model",
            ""
        ) or ""
    ).lower()

    gpu_model = (
        specs.get(
            "gpu_model",
            ""
        ) or ""
    ).lower()

    refresh_rate = specs.get(
        "refresh_rate",
        0
    ) or 0

    has_npu = specs.get(
        "has_npu",
        False
    ) or False

    display_info = (
        specs.get(
            "display_info",
            ""
        ) or ""
    ).lower()

    # =====================================================
    # NVIDIA RTX
    # =====================================================

    if "rtx" in gpu_model:

        slugs.add(
            "feature-rtx"
        )

    # =====================================================
    # AI / NPU
    # =====================================================

    if has_npu:

        slugs.add(
            "feature-npu"
        )

    # =====================================================
    # HIGH REFRESH RATE
    # =====================================================

    if refresh_rate >= 120:

        slugs.add(
            "feature-high-refresh"
        )

    # =====================================================
    # OLED
    # =====================================================

    if "oled" in display_info:

        slugs.add(
            "feature-oled"
        )

    # =====================================================
    # TOUCH DISPLAY
    # =====================================================

    if "touch" in display_info:

        slugs.add(
            "feature-touch"
        )

    # =====================================================
    # INTEL EVO
    # =====================================================

    if "evo" in cpu_model:

        slugs.add(
            "feature-intel-evo"
        )

    # =====================================================
    # RYZEN AI
    # =====================================================

    if "ryzen ai" in cpu_model:

        slugs.add(
            "feature-ryzen-ai"
        )

    # =====================================================
    # SNAPDRAGON X
    # =====================================================

    if "snapdragon x" in cpu_model:

        slugs.add(
            "feature-snapdragon-x"
        )

    return list(slugs)
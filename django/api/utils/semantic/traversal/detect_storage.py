# =========================================================
# FILE:
# api/utils/semantic/traversal/detect_storage.py
# =========================================================


# =========================================================
# DETECT STORAGE RUNTIME
# =========================================================

def detect_storage_runtime(

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
    # CAPACITY
    # =====================================================

    if (

        "4tb" in source_text

        or

        "4096gb" in source_text

    ):

        attributes.append(
            "ssd-2tb-plus"
        )

    elif (

        "2tb" in source_text

        or

        "2048gb" in source_text

    ):

        attributes.append(
            "ssd-2tb-plus"
        )

    elif (

        "1tb" in source_text

        or

        "1024gb" in source_text

    ):

        attributes.append(
            "ssd-1tb"
        )

    elif (

        "512gb" in source_text

    ):

        attributes.append(
            "ssd-512gb"
        )

    # =====================================================
    # NVME
    # =====================================================

    if (

        "nvme" in source_text

        or

        "pcie ssd" in source_text

        or

        "m.2" in source_text

    ):

        attributes.append(
            "storage-nvme"
        )

    # =====================================================
    # UNIQUE
    # =====================================================

    attributes = list(
        set(attributes)
    )

    return attributes
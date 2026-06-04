# =========================================================
# FILE:
# api/utils/semantic/traversal/detect_memory.py
# =========================================================


# =========================================================
# DETECT MEMORY RUNTIME
# =========================================================

def detect_memory_runtime(

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
    # MEMORY
    # =====================================================

    if "128gb" in source_text:

        attributes.append(
            "mem-128gb"
        )

    if "96gb" in source_text:

        attributes.append(
            "mem-96gb"
        )

    if "64gb" in source_text:

        attributes.append(
            "mem-64gb-plus"
        )

    if "48gb" in source_text:

        attributes.append(
            "mem-48gb"
        )

    if "32gb" in source_text:

        attributes.append(
            "mem-32gb"
        )

    if "24gb" in source_text:

        attributes.append(
            "mem-24gb"
        )

    if "16gb" in source_text:

        attributes.append(
            "mem-16gb"
        )

    if "8gb" in source_text:

        attributes.append(
            "mem-8gb"
        )

    # =====================================================
    # UNIQUE
    # =====================================================

    attributes = list(
        set(attributes)
    )

    return attributes
# =========================================================
# FILE:
# api/utils/semantic/extraction/extract_pc_specs.py
# =========================================================

from api.utils.semantic.extraction.extract_cpu import (
    extract_cpu,
)

from api.utils.semantic.extraction.extract_gpu import (
    extract_gpu,
)

from api.utils.semantic.extraction.extract_memory import (
    extract_memory,
)

from api.utils.semantic.extraction.extract_display import (
    extract_display,
)


# =========================================================
# EXTRACT PC SPECS
# =========================================================

def extract_pc_specs(

    product,

    trace_runtime=False,

):
    # =====================================================
    # SOURCE
    # =====================================================

    source_text = " ".join([

        str(
            getattr(
                product,
                "name",
                "",
            ) or ""
        ),

        str(
            getattr(
                product,
                "description",
                "",
            ) or ""
        ),

        str(
            getattr(
                product,
                "long_description",
                "",
            ) or ""
        ),

    ]).lower()

    # =====================================================
    # EXTRACTION
    # =====================================================

    cpu_specs = extract_cpu(
        source_text
    )

    gpu_specs = extract_gpu(
        source_text
    )

    memory_specs = extract_memory(
        source_text
    )

    display_specs = extract_display(
        source_text
    )

    # =====================================================
    # RUNTIME SPECS
    # =====================================================

    specs = {

        "source_text":
            source_text,

        "cpu":
            cpu_specs,

        "gpu":
            gpu_specs,

        "memory":
            memory_specs,

        "display":
            display_specs,
    }

    return specs
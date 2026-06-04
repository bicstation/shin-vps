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
    # DB SOURCE
    # =====================================================

    cpu_model = str(
        getattr(
            product,
            "cpu_model",
            "",
        ) or ""
    )

    gpu_model = str(
        getattr(
            product,
            "gpu_model",
            "",
        ) or ""
    )

    display_info = str(
        getattr(
            product,
            "display_info",
            "",
        ) or ""
    )

    memory_gb = str(
        getattr(
            product,
            "memory_gb",
            "",
        ) or ""
    )

    storage_gb = str(
        getattr(
            product,
            "storage_gb",
            "",
        ) or ""
    )

    # =====================================================
    # SOURCE TEXT
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

        cpu_model,

        gpu_model,

        display_info,

        f"{memory_gb}gb",

        f"{storage_gb}gb",

    ]).lower()

    # =====================================================
    # EXTRACTION
    # =====================================================

    cpu_specs = extract_cpu(
        cpu_model
    )

    gpu_specs = extract_gpu(
        gpu_model
    )

    memory_specs = extract_memory(
        f"{memory_gb}gb"
    )

    display_specs = extract_display(
        display_info
    )

    # =====================================================
    # STORAGE
    # =====================================================

    storage_specs = [

        f"{storage_gb}gb"
    ]

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

        "storage":
            storage_specs,

        "display":
            display_specs,
    }

    return specs
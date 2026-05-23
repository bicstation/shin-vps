# =========================================================
# SHIN CORE LINX
# semantic/runtime/compile_semantic_runtime.py
# =========================================================

from typing import Dict, Any

from api.models import PCProduct

from api.utils.semantic.extraction.extract_pc_specs import (
    extract_pc_specs
)

from api.utils.semantic.inference.infer_ai import (
    infer_ai_capability
)

from api.utils.semantic.inference.infer_gaming import (
    infer_gaming_capability
)

from api.utils.semantic.inference.infer_creator import (
    infer_creator_capability
)

from api.utils.semantic.inference.compile_workflows import (
    compile_workflow_tags
)


# =========================================================
# HELPERS
# =========================================================

def safe_json(value):

    if not value:
        return {}

    if isinstance(value, dict):
        return value

    return {}


# =========================================================
# SAVE SPECS
# =========================================================

def apply_specs_to_product(
    product,
    specs,
):

    product.cpu_model = specs.get(
        "cpu_model"
    )

    product.gpu_model = specs.get(
        "gpu_model"
    )

    product.memory_gb = specs.get(
        "memory_gb"
    )

    product.storage_gb = specs.get(
        "storage_gb"
    )

    product.display_size = specs.get(
        "display_size"
    )

    product.refresh_rate = specs.get(
        "refresh_rate"
    )

    product.has_npu = specs.get(
        "has_npu"
    )

    product.score_cpu = specs.get(
        "score_cpu"
    )

    product.score_gpu = specs.get(
        "score_gpu"
    )

    product.score_ai = specs.get(
        "score_ai"
    )


# =========================================================
# APPLY INFERENCE
# =========================================================

def apply_inference_to_product(
    product,
    ai_data,
    gaming_data,
    creator_data,
):

    # =========================================
    # semantic usage scores
    # =========================================

    product.score_ai = max(

        product.score_ai or 0,

        ai_data.get(
            "score_ai",
            0
        )
    )

    product.score_gaming = gaming_data.get(
        "score_gaming",
        0
    )

    product.score_creator = creator_data.get(
        "score_creator",
        0
    )

    # =========================================
    # workflow tags
    # =========================================

    workflow_tags = compile_workflow_tags(

        specs={

            "cpu_model": product.cpu_model,

            "gpu_model": product.gpu_model,

            "memory_gb": product.memory_gb,

            "has_npu": product.has_npu,
        },

        ai_data=ai_data,

        gaming_data=gaming_data,

        creator_data=creator_data,
    )

    product.workflow_tags = workflow_tags


# =========================================================
# OBSERVABILITY
# =========================================================

def print_runtime_debug(
    product,
    specs,
    ai_data,
):

    print(
        "\n"
        "=================================================="
    )

    print(
        f"🧠 {product.id}"
    )

    print(
        product.name
    )

    print(
        "--------------------------------------------------"
    )

    print(
        "CPU:",
        specs.get("cpu_model")
    )

    print(
        "GPU:",
        specs.get("gpu_model")
    )

    print(
        "MEMORY:",
        specs.get("memory_gb")
    )

    print(
        "AI SCORE:",
        ai_data.get("score_ai")
    )

    print(
        "=================================================="
    )


# =========================================================
# MAIN
# =========================================================

def compile_semantic_runtime(
    product: PCProduct
) -> Dict[str, Any]:

    # =========================================
    # extraction
    # =========================================

    specs = extract_pc_specs(
        product
    )

    specs = safe_json(
        specs
    )

    # =========================================
    # inference
    # =========================================

    ai_data = infer_ai_capability(
        specs
    )

    gaming_data = infer_gaming_capability(
        specs
    )

    creator_data = infer_creator_capability(
        specs
    )

    # =========================================
    # apply specs
    # =========================================

    apply_specs_to_product(
        product=product,
        specs=specs,
    )

    # =========================================
    # apply inference
    # =========================================

    apply_inference_to_product(

        product=product,

        ai_data=ai_data,

        gaming_data=gaming_data,

        creator_data=creator_data,
    )

    # =========================================
    # runtime metadata
    # =========================================

    product.semantic_runtime = "v3"

    product.semantic_authority = (
        "backend"
    )

    # =========================================
    # observability
    # =========================================

    print_runtime_debug(

        product=product,

        specs=specs,

        ai_data=ai_data,
    )

    # =========================================
    # save
    # =========================================

    product.save()

    # =========================================
    # return
    # =========================================

    return {

        "success": True,

        "product_id": product.id,

        "specs": specs,

        "ai_data": ai_data,

        "gaming_data": gaming_data,

        "creator_data": creator_data,

        "workflow_tags": (
            product.workflow_tags
        ),
    }
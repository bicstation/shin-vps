# =========================================================
# FILE:
# api/services/ai/services/spec_runtime_persist_service.py
# =========================================================

from django.db import transaction


class SpecRuntimePersistService:

    # =====================================================
    # SAVE
    # =====================================================

    @transaction.atomic
    def save(

        self,

        product,

        spec_result,

    ):

        if not spec_result:

            return None

        product.is_active = True
        product.is_posted = True

        product.cpu_model = spec_result.cpu_model
        product.gpu_model = spec_result.gpu_model
        product.memory_gb = spec_result.memory_gb
        product.storage_gb = spec_result.storage_gb
        product.display_info = spec_result.display_info
        product.is_ai_pc = spec_result.is_ai_pc

        # Runtime は正常終了
        product.spec_processed = True

        # Reality が十分取得できたか
        product.spec_complete = all([

            product.cpu_model,
            product.gpu_model,
            product.memory_gb > 0,
            product.storage_gb > 0,
            product.display_info,

        ])

        product.save(

            update_fields=[

                "is_active",
                "is_posted",

                "cpu_model",
                "gpu_model",
                "memory_gb",
                "storage_gb",
                "display_info",
                "is_ai_pc",

                "spec_processed",
                "spec_complete",

            ]

        )

        return product
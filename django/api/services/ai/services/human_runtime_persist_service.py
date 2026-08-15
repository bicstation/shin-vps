# =========================================================
# FILE:
# api/services/ai/services/human_runtime_persist_service.py
# =========================================================

import json


class HumanRuntimePersistService:

    # =====================================================
    # SAVE
    # =====================================================

    def save(

        self,

        product,

        result,

    ):

        product.is_active = True

        product.is_posted = True

        product.ai_summary = (
            result.summary
        )

        product.target_user = (
            result.target_user
        )

        product.strengths = (
            json.dumps(
                result.strengths,
                ensure_ascii=False,
            )
        )

        product.weaknesses = (
            json.dumps(
                result.weaknesses,
                ensure_ascii=False,
            )
        )

        product.usage_tags = (
            json.dumps(
                result.usage_tags,
                ensure_ascii=False,
            )
        )

        product.product_points = (
            result.product_points
        )

        product.save(

            update_fields=[

                "is_active",

                "is_posted",

                "ai_summary",

                "target_user",

                "strengths",

                "weaknesses",

                "usage_tags",

                "product_points",

            ]

        )

        return product
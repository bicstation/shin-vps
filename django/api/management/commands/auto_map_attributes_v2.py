# =========================================================
# FILE:
# /home/maya/shin-vps/django/api/management/commands/auto_map_attributes_v2.py
#
# SHIN CORE LINX
# Semantic Runtime Orchestration Layer
# =========================================================

from django.core.management.base import BaseCommand

from api.models import (
    PCProduct,
)

from api.utils.semantic.loader.load_semantic_master import (
    load_semantic_master,
)

from api.utils.semantic.runtime.normalize_runtime import (
    normalize_runtime,
)

from api.utils.semantic.runtime.resolve_alias_runtime import (
    resolve_alias_runtime,
)

from api.utils.semantic.runtime.detect_attribute_runtime import (
    detect_attribute_runtime,
)

from api.utils.semantic.runtime.traverse_group_runtime import (
    traverse_group_runtime,
)

from api.utils.semantic.runtime.compile_workflow_runtime import (
    compile_workflow_runtime,
)

from api.utils.semantic.runtime.persist_runtime import (
    persist_runtime,
)

from api.utils.semantic.runtime.runtime_log import (
    runtime_log,
)


class Command(BaseCommand):

    help = (
        "Auto Map Semantic Attributes V2"
    )

    def handle(self, *args, **options):

        # =================================================
        # LOAD MASTER AUTHORITY
        # =================================================

        semantic_master = (
            load_semantic_master()
        )

        # =================================================
        # PRODUCTS
        # =================================================

        products = (
            PCProduct.objects.all()
        )

        total = products.count()

        # =================================================
        # SUMMARY
        # =================================================

        summary = {

            "total": 0,

            "errors": 0,

            "usage_ai": 0,

            "usage_gaming": 0,

            "usage_creator": 0,

            "usage_business": 0,
        }

        # =================================================
        # LOOP
        # =================================================

        for index, product in enumerate(products, start=1):

            progress = (
                f"[{index}/{total}]"
            )

            try:

                runtime_log(
                    True,
                    f"PRODUCT {progress}",
                    product.name,
                )

                # =========================================
                # NORMALIZE
                # =========================================

                normalized_tokens = (
                    normalize_runtime(
                        product,
                        semantic_master,
                    )
                )

                # =========================================
                # RESOLVE ALIAS
                # =========================================

                semantic_attributes = (
                    resolve_alias_runtime(
                        normalized_tokens,
                        semantic_master,
                    )
                )

                # =========================================
                # ATTRIBUTE DETECT
                # =========================================

                detected_attributes = (
                    detect_attribute_runtime(
                        semantic_attributes,
                        semantic_master,
                    )
                )

                # =========================================
                # GROUP TRAVERSAL
                # =========================================

                semantic_groups = (
                    traverse_group_runtime(
                        detected_attributes,
                        semantic_master,
                    )
                )

                # =========================================
                # WORKFLOW COMPILE
                # =========================================

                semantic_runtime = (
                    compile_workflow_runtime(
                        semantic_groups,
                        semantic_master,
                    )
                )

                # =========================================
                # PERSIST
                # =========================================

                persist_runtime(
                    product,
                    semantic_runtime,
                )

                # =========================================
                # SUMMARY
                # =========================================

                summary["total"] += 1

                groups = semantic_runtime.get(
                    "groups",
                    []
                )

                if "usage-ai" in groups:
                    summary["usage_ai"] += 1

                if "usage-gaming" in groups:
                    summary["usage_gaming"] += 1

                if "usage-creator" in groups:
                    summary["usage_creator"] += 1

                if "usage-business" in groups:
                    summary["usage_business"] += 1

                runtime_log(
                    True,
                    f"DONE {progress}",
                    {
                        "product": product.name,
                    },
                )

            except Exception as e:

                summary["errors"] += 1

                runtime_log(
                    True,
                    "RUNTIME ERROR",
                    str(e),
                )

        # =================================================
        # FINAL SUMMARY
        # =================================================

        runtime_log(
            True,
            "SEMANTIC SUMMARY",
            summary,
        )

        runtime_log(
            True,
            "AUTO MAP ATTRIBUTES V2",
            "COMPLETED",
        )
# =========================================================
# FILE:
# api/management/commands/auto_map_attributes_v2.py
# =========================================================

from django.core.management.base import (
    BaseCommand,
)

from api.models import (
    PCProduct,
)

from api.utils.semantic.authority.loader import (
    load_semantic_master,
)

from api.utils.semantic.extraction.extract_pc_specs import (
    extract_pc_specs,
)

from api.utils.semantic.authority.normalization import (
    normalize_runtime,
)

from api.utils.semantic.authority.aliases import (
    resolve_alias_runtime,
)

from api.utils.semantic.traversal.detect_usage import (
    detect_usage_runtime,
)

from api.utils.semantic.traversal.detect_memory import (
    detect_memory_runtime,
)

from api.utils.semantic.traversal.detect_storage import (
    detect_storage_runtime,
)

from api.utils.semantic.traversal.detect_features import (
    detect_features_runtime,
)

from api.utils.semantic.traversal.compile_workflows import (
    compile_workflow_runtime,
)

from api.utils.semantic.runtime.persist_runtime import (
    persist_runtime,
)

from api.utils.semantic.runtime.runtime_log import (
    runtime_log,
)


# =========================================================
# COMMAND
# =========================================================

class Command(BaseCommand):

    help = (
        "Compile semantic runtime v2"
    )

    # =====================================================
    # HANDLE
    # =====================================================

    def handle(

        self,

        *args,

        **options,

    ):

        # =================================================
        # LOAD AUTHORITY
        # =================================================

        semantic_master = (
            load_semantic_master()
        )

        # =================================================
        # PRODUCTS
        # =================================================

        products = (
            PCProduct.objects
            .filter(
                is_active=True,
            )
            .order_by("id")
        )

        total = products.count()

        # =================================================
        # SUMMARY
        # =================================================

        summary = {

            "total": 0,

            "ai": 0,

            "gaming": 0,

            "creator": 0,

            "business": 0,

            "errors": 0,
        }

        # =================================================
        # LOOP
        # =================================================

        for index, product in enumerate(

            products,

            start=1,

        ):

            try:

                # =========================================
                # PRODUCT
                # =========================================

                print()

                print(
                    "=" * 56
                )

                print(
                    f"PRODUCT [{index}/{total}]"
                )

                print(
                    "=" * 56
                )

                print(
                    product.name
                )

                # =========================================
                # EXTRACTION
                # =========================================

                specs = extract_pc_specs(
                    product
                )

                runtime_log(
                    False,
                    "SPECS",
                    specs,
                )

                # =========================================
                # NORMALIZE
                # =========================================

                normalized_tokens = (
                    normalize_runtime(
                        specs,
                        semantic_master,
                    )
                )

                runtime_log(
                    False,
                    "NORMALIZED",
                    normalized_tokens,
                )

                # =========================================
                # ALIASES
                # =========================================

                semantic_attributes = (
                    resolve_alias_runtime(
                        normalized_tokens,
                        semantic_master,
                    )
                )

                # =========================================
                # EXTRA DETECT
                # =========================================

                semantic_attributes += (
                    detect_memory_runtime(
                        specs
                    )
                )

                semantic_attributes += (
                    detect_storage_runtime(
                        specs
                    )
                )

                semantic_attributes += (
                    detect_features_runtime(
                        specs
                    )
                )

                semantic_attributes = list(
                    set(
                        semantic_attributes
                    )
                )

                runtime_log(
                    False,
                    "ATTRIBUTES",
                    semantic_attributes,
                )

                # =========================================
                # GROUP TRAVERSAL
                # =========================================

                semantic_groups = (
                    detect_usage_runtime(
                        {
                            "semantic_attributes":
                                semantic_attributes
                        },
                        semantic_master,
                    )
                )

                runtime_log(
                    False,
                    "GROUPS",
                    semantic_groups,
                )

                # =========================================
                # WORKFLOW
                # =========================================

                workflow_runtime = (
                    compile_workflow_runtime(
                        semantic_groups,
                        semantic_master,
                    )
                )

                workflow_tags = (
                    workflow_runtime.get(
                        "workflow_tags",
                        []
                    )
                )

                semantic_labels = (
                    workflow_runtime.get(
                        "semantic_labels",
                        []
                    )
                )

                runtime_log(
                    False,
                    "WORKFLOW",
                    workflow_runtime,
                )

                # =========================================
                # RUNTIME
                # =========================================

                semantic_runtime = {

                    "runtime_mode":
                        "production",

                    "specs":
                        specs,

                    "normalized_tokens":
                        normalized_tokens,

                    "semantic_attributes":
                        semantic_attributes,

                    "semantic_groups":
                        semantic_groups,

                    "workflow_tags":
                        workflow_tags,

                    "semantic_labels":
                        semantic_labels,
                }

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

                if (

                    "usage-ai"

                    in

                    workflow_tags

                ):

                    summary["ai"] += 1

                if (

                    "usage-gaming"

                    in

                    workflow_tags

                ):

                    summary["gaming"] += 1

                if (

                    "usage-creator"

                    in

                    workflow_tags

                ):

                    summary["creator"] += 1

                if (

                    "usage-business"

                    in

                    workflow_tags

                ):

                    summary["business"] += 1

                # =========================================
                # DONE
                # =========================================

                print()

                print(
                    "=" * 56
                )

                print(
                    f"DONE [{index}/{total}]"
                )

                print(
                    "=" * 56
                )

                print({

                    "product":
                        product.name,

                    "workflow":
                        workflow_tags,

                    "attributes":
                        len(
                            semantic_attributes
                        ),
                })

            except Exception as error:

                summary["errors"] += 1

                print()

                print(
                    "=" * 56
                )

                print(
                    "RUNTIME ERROR"
                )

                print(
                    "=" * 56
                )

                print(
                    str(error)
                )

        # =================================================
        # SUMMARY
        # =================================================

        print()

        print(
            "=" * 56
        )

        print(
            "SEMANTIC SUMMARY"
        )

        print(
            "=" * 56
        )

        print(summary)

        print()

        print(
            "=" * 56
        )

        print(
            "AUTO MAP ATTRIBUTES V2"
        )

        print(
            "=" * 56
        )

        print(
            "COMPLETED"
        )
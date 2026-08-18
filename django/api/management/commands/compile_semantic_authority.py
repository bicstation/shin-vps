# =========================================================
# FILE:
# /home/maya/shin-dev/shin-vps/django/api/management/commands/compile_semantic_runtime_v2.py
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
                    f"📤 [{index}/{total}] "
                    f"{product.name}"
                )

                # =========================================
                # EXTRACTION
                # =========================================

                specs = extract_pc_specs(
                    product
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
                # TSV MAPPING RESULT
                # =========================================

                print()

                print(
                    "🔗 TSV MAPPING"
                )

                print(
                    f"   ATTRIBUTES : "
                    f"{len(semantic_attributes)}"
                )

                print(
                    f"   GROUPS     : "
                    f"{len(semantic_groups)}"
                )

                print(
                    f"   WORKFLOWS  : "
                    f"{len(workflow_tags)}"
                )

                # =========================================
                # DONE
                # =========================================

                print()

                print(
                    f"✅ SEMANTIC COMPLETED "
                    f"[{index}/{total}]"
                )

                print(
                    f"   PRODUCT : "
                    f"{product.name}"
                )

                print(
                    f"   WORKFLOW: "
                    f"{workflow_tags}"
                )

                print(
                    f"   ATTRIBUTES: "
                    f"{len(semantic_attributes)}"
                )

            except Exception as error:

                summary["errors"] += 1

                print()

                print(
                    "=" * 56
                )

                print(
                    "❌ SEMANTIC RUNTIME ERROR"
                )

                print(
                    f"PRODUCT : "
                    f"{product.name}"
                )

                print(
                    f"ERROR   : "
                    f"{error}"
                )

                print(
                    "=" * 56
                )

        # =================================================
        # SUMMARY
        # =================================================

        print()

        print(
            "=" * 56
        )

        print(
            "🧠 SEMANTIC RUNTIME COMPLETE"
        )

        print(
            "=" * 56
        )

        print(
            f"TOTAL    : "
            f"{summary['total']}"
        )

        print(
            f"AI       : "
            f"{summary['ai']}"
        )

        print(
            f"GAMING   : "
            f"{summary['gaming']}"
        )

        print(
            f"CREATOR  : "
            f"{summary['creator']}"
        )

        print(
            f"BUSINESS : "
            f"{summary['business']}"
        )

        print(
            f"ERRORS   : "
            f"{summary['errors']}"
        )

        print(
            "=" * 56
        )
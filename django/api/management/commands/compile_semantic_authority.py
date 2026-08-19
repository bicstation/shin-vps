# -*- coding: utf-8 -*-

from collections import Counter

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
        #
        # Semantic Runtime is intentionally executed
        # against all active PC products.
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
        # START
        # =================================================

        print()
        print("=" * 72)
        print("🧠 SEMANTIC RUNTIME")
        print("=" * 72)

        print(
            f"TARGET : "
            f"{total:,} ACTIVE PRODUCTS"
        )

        print("=" * 72)

        # =================================================
        # LOOP
        # =================================================

        for index, product in enumerate(
            products,
            start=1,
        ):

            try:

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
                        [],
                    )
                )

                semantic_labels = (
                    workflow_runtime.get(
                        "semantic_labels",
                        [],
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
                # PROGRESS
                #
                # Normal success logs are suppressed.
                # Show progress every 100 products.
                # =========================================

                if (
                    index % 100 == 0
                    or index == total
                ):

                    print(
                        f"PROGRESS "
                        f"{index:,}/{total:,}"
                    )

            except Exception as error:

                summary["errors"] += 1

                # =========================================
                # ERROR
                #
                # Errors are displayed immediately.
                # =========================================

                print()
                print(
                    f"❌ SEMANTIC ERROR "
                    f"[{index:,}/{total:,}]"
                )

                print(
                    f"   PRODUCT : "
                    f"{product.unique_id}"
                )

                print(
                    f"   NAME    : "
                    f"{product.name}"
                )

                print(
                    f"   ERROR   : "
                    f"{error}"
                )

                print()

        # =================================================
        # SUMMARY
        # =================================================

        print()
        print("=" * 72)
        print("🧠 SEMANTIC RUNTIME COMPLETE")
        print("=" * 72)

        print(
            f"TOTAL    : "
            f"{summary['total']:,}"
        )

        print(
            f"AI       : "
            f"{summary['ai']:,}"
        )

        print(
            f"GAMING   : "
            f"{summary['gaming']:,}"
        )

        print(
            f"CREATOR  : "
            f"{summary['creator']:,}"
        )

        print(
            f"BUSINESS : "
            f"{summary['business']:,}"
        )

        print(
            f"ERRORS   : "
            f"{summary['errors']:,}"
        )

        print("=" * 72)

        # =================================================
        # SEMANTIC GROUP PRODUCT COUNTS
        #
        # Re-read persisted semantic_runtime so that the
        # displayed counts represent the actual Runtime
        # state after compilation.
        # =================================================

        group_counter = Counter()

        runtime_products = (
            PCProduct.objects
            .filter(
                is_active=True,
            )
            .exclude(
                semantic_runtime__isnull=True,
            )
            .values_list(
                "semantic_runtime",
                flat=True,
            )
        )

        for runtime in runtime_products:

            if not runtime:
                continue

            for group_slug in (
                runtime.get(
                    "semantic_groups",
                    [],
                )
            ):

                group_counter[group_slug] += 1

        # =================================================
        # GROUP COUNT OUTPUT
        # =================================================

        print()
        print("=" * 80)
        print("📊 SEMANTIC GROUP PRODUCT COUNTS")
        print("=" * 80)

        print(
            f"{'GROUP SLUG':<36}"
            f"{'PRODUCTS':>12}"
        )

        print("-" * 80)

        for group_slug, count in sorted(
            group_counter.items(),
            key=lambda item: (
                -item[1],
                item[0],
            ),
        ):

            print(
                f"{group_slug:<36}"
                f"{count:>12,}"
            )

        print("-" * 80)

        print(
            f"{'TOTAL GROUPS':<36}"
            f"{len(group_counter):>12,}"
        )

        print("=" * 80)
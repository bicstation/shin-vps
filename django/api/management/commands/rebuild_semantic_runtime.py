# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/rebuild_semantic_runtime.py

"""
SHIN CORE LINX
Semantic Runtime Compiler

database products
↓
semantic extraction
↓
workflow inference
↓
semantic graph
↓
adaptive runtime
↓
persistent semantic universe
"""

from django.core.management.base import (
    BaseCommand,
)

raise Exception(
    "DEPRECATED COMMAND. Use compile_semantic_runtime."
)


from django.db import transaction

from django.utils import timezone

from api.models import PCProduct

# ==========================================================
# RUNTIME BUILDER
# ==========================================================

from api.services.semantic.runtime_builder import (

    apply_runtime_to_product,

    requires_runtime_rebuild,

    build_runtime_summary,
)

# ==========================================================
# CONSTANTS
# ==========================================================

SEMANTIC_VERSION = "v2"

GRAPH_CANDIDATE_LIMIT = 120


class Command(BaseCommand):

    help = (
        "Rebuild semantic runtime "
        "for PCProduct"
    )

    # ======================================================
    # ARGUMENTS
    # ======================================================

    def add_arguments(self, parser):

        # ==================================================
        # LIMIT
        # ==================================================

        parser.add_argument(

            "--limit",

            type=int,

            default=0
        )

        # ==================================================
        # NULL ONLY
        # ==================================================

        parser.add_argument(

            "--null-only",

            action="store_true"
        )

        # ==================================================
        # PRODUCT TYPE
        # ==================================================

        parser.add_argument(

            "--product-type",

            type=str,

            default=""
        )

        # ==================================================
        # DIRTY ONLY
        # ==================================================

        parser.add_argument(

            "--dirty-only",

            action="store_true"
        )

        # ==================================================
        # SEMANTIC VERSION
        # IMPORTANT:
        # argparse already reserves --version
        # ==================================================

        parser.add_argument(

            "--semantic-version",

            type=str,

            default=SEMANTIC_VERSION
        )

        # ==================================================
        # SKIP GRAPH
        # ==================================================

        parser.add_argument(

            "--skip-graph",

            action="store_true"
        )

        # ==================================================
        # VERBOSE STATS
        # ==================================================

        parser.add_argument(

            "--stats",

            action="store_true"
        )

    # ======================================================
    # UTIL
    # ======================================================

    def log_header(self, title):

        self.stdout.write("")
        self.stdout.write("=" * 60)

        self.stdout.write(
            self.style.SUCCESS(
                title
            )
        )

        self.stdout.write("=" * 60)

    # ======================================================
    # QUERYSET
    # ======================================================

    def build_queryset(self, options):

        queryset = PCProduct.objects.all()

        # ==================================================
        # NULL ONLY
        # ==================================================

        if options["null_only"]:

            queryset = queryset.filter(
                semantic_runtime__isnull=True
            )

        # ==================================================
        # PRODUCT TYPE
        # ==================================================

        product_type = options.get(
            "product_type"
        )

        if product_type:

            queryset = queryset.filter(
                product_type=product_type
            )

        # ==================================================
        # DIRTY ONLY
        # ==================================================

        if options["dirty_only"]:

            dirty_ids = []

            for product in queryset.iterator():

                try:

                    if requires_runtime_rebuild(
                        product
                    ):

                        dirty_ids.append(
                            product.id
                        )

                except Exception:

                    dirty_ids.append(
                        product.id
                    )

            queryset = queryset.filter(
                id__in=dirty_ids
            )

        # ==================================================
        # LIMIT
        # ==================================================

        limit = options.get(
            "limit",
            0
        )

        if limit > 0:

            queryset = queryset[:limit]

        return queryset

    # ======================================================
    # GRAPH CANDIDATES
    # ======================================================

    def build_graph_candidates(

        self,

        product,
    ):

        runtime = getattr(

            product,

            "semantic_runtime",

            {}
        ) or {}

        product_type = runtime.get(
            "product_type"
        )

        queryset = PCProduct.objects.exclude(
            id=product.id
        ).exclude(
            semantic_runtime__isnull=True
        )

        # ==================================================
        # Same Product Type Priority
        # ==================================================

        if product_type:

            queryset = queryset.filter(
                product_type=product_type
            )

        return queryset[
            :GRAPH_CANDIDATE_LIMIT
        ]

    # ======================================================
    # CONTAMINATION CHECK
    # ======================================================

    def detect_runtime_contamination(
        self,
        runtime
    ):

        issues = []

        if not runtime:
            return issues

        product_type = runtime.get(
            "product_type"
        )

        memory_gb = runtime.get(
            "memory_gb"
        )

        storage_gb = runtime.get(
            "storage_gb"
        )

        workflows = runtime.get(
            "workflows",
            []
        )

        # ==================================================
        # Monitor Contamination
        # ==================================================

        if product_type in [

            "monitor",

            "immersive_monitor",

            "creator_monitor",
        ]:

            if memory_gb:

                issues.append(
                    "monitor_has_memory"
                )

            if storage_gb:

                issues.append(
                    "monitor_has_storage"
                )

        # ==================================================
        # Accessory Contamination
        # ==================================================

        if product_type in [

            "accessory",

            "software",
        ]:

            if workflows:

                issues.append(
                    "accessory_has_workflow"
                )

        return issues

    # ======================================================
    # STATS
    # ======================================================

    def build_stats(
        self,
        products
    ):

        stats = {

            # ==============================================
            # Base
            # ==============================================
            "TOTAL_RUNTIME":
                0,

            "VALID_RUNTIME":
                0,

            "INVALID_RUNTIME":
                0,

            # ==============================================
            # Graph
            # ==============================================
            "GRAPH_EDGES":
                0,

            # ==============================================
            # Workflows
            # ==============================================
            "WORKFLOWS":
                0,

            # ==============================================
            # Contamination
            # ==============================================
            "CONTAMINATED":
                0,
        }

        for product in products:

            runtime = getattr(

                product,

                "semantic_runtime",

                {}
            ) or {}

            stats["TOTAL_RUNTIME"] += 1

            if runtime.get(
                "runtime_valid"
            ):

                stats["VALID_RUNTIME"] += 1

            else:

                stats["INVALID_RUNTIME"] += 1

            # --------------------------------------------------
            # Graph
            # --------------------------------------------------

            graph_edges = runtime.get(
                "semantic_graph",
                []
            )

            stats["GRAPH_EDGES"] += len(
                graph_edges
            )

            # --------------------------------------------------
            # Workflows
            # --------------------------------------------------

            workflows = runtime.get(
                "workflows",
                []
            )

            stats["WORKFLOWS"] += len(
                workflows
            )

            # --------------------------------------------------
            # Contamination
            # --------------------------------------------------

            issues = self.detect_runtime_contamination(
                runtime
            )

            if issues:

                stats["CONTAMINATED"] += 1

        return stats

    # ======================================================
    # MAIN
    # ======================================================

    @transaction.atomic
    def handle(self, *args, **options):

        started_at = timezone.now()

        self.log_header(
            "🚀 START: "
            "rebuild_semantic_runtime"
        )

        queryset = self.build_queryset(
            options
        )

        total = 0
        success = 0
        failed = 0

        contamination_count = 0

        rebuilt_products = []

        # ==================================================
        # LOOP
        # ==================================================

        for product in queryset.iterator():

            total += 1

            try:

                # ==========================================
                # Graph Candidates
                # ==========================================

                related_products = []

                if not options["skip_graph"]:

                    related_products = (
                        self.build_graph_candidates(
                            product
                        )
                    )

                # ==========================================
                # Runtime Build
                # ==========================================

                apply_runtime_to_product(

                    product,

                    related_products=related_products,
                )

                runtime = getattr(

                    product,

                    "semantic_runtime",

                    {}
                ) or {}

                # ==========================================
                # Contamination Detection
                # ==========================================

                issues = (
                    self.detect_runtime_contamination(
                        runtime
                    )
                )

                if issues:

                    contamination_count += 1

                # ==========================================
                # Save
                # ==========================================

                product.save(

                    update_fields=[

                        "cpu_model",

                        "gpu_model",

                        "memory_gb",

                        "storage_gb",

                        "display_info",

                        "product_type",

                        "semantic_runtime",
                    ]
                )

                rebuilt_products.append(
                    product
                )

                success += 1

                # ==========================================
                # Runtime Summary
                # ==========================================

                summary = build_runtime_summary(
                    runtime
                )

                self.stdout.write(

                    self.style.SUCCESS(

                        f"✅ "
                        f"[{success}] "
                        f"{product.id} "
                        f"{product.name[:50]}"
                    )
                )

                self.stdout.write(

                    f"   "
                    f"TYPE="
                    f"{summary.get('product_type')} | "

                    f"WORKFLOW="
                    f"{summary.get('primary_workflow')} | "

                    f"SCORE="
                    f"{summary.get('semantic_score')}"
                )

                # ==========================================
                # Contamination Warning
                # ==========================================

                if issues:

                    self.stdout.write(

                        self.style.WARNING(

                            f"   ⚠ "
                            f"CONTAMINATION: "
                            f"{', '.join(issues)}"
                        )
                    )

            except Exception as e:

                failed += 1

                self.stderr.write(

                    self.style.ERROR(

                        f"❌ ERROR "
                        f"[{product.id}] "
                        f"{str(e)}"
                    )
                )

        # ==================================================
        # STATS
        # ==================================================

        stats = self.build_stats(
            rebuilt_products
        )

        ended_at = timezone.now()

        elapsed = ended_at - started_at

        # ==================================================
        # SUMMARY
        # ==================================================

        self.log_header(
            "✅ DONE"
        )

        self.stdout.write(

            self.style.SUCCESS(

                f"TOTAL: {total}\n"

                f"SUCCESS: {success}\n"

                f"FAILED: {failed}\n"

                f"CONTAMINATION: "
                f"{contamination_count}\n"

                f"SEMANTIC_VERSION: "
                f"{options['semantic_version']}\n"

                f"ELAPSED: "
                f"{elapsed}"
            )
        )

        # ==================================================
        # STATS
        # ==================================================

        if options["stats"]:

            self.log_header(
                "📊 SEMANTIC STATS"
            )

            for key, value in stats.items():

                self.stdout.write(
                    f"{key}: {value}"
                )

        # ==================================================
        # FINAL
        # ==================================================

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "🌌 Semantic Universe Compiled"
            )
        )
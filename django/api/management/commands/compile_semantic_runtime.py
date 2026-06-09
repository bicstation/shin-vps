# =========================================================
# SHIN CORE LINX
# analyze_pc_spec.py
# parallel semantic runtime analyzer
# centralized observability integrated
# =========================================================

from concurrent.futures import ( ThreadPoolExecutor, as_completed, )
from django.core.management.base import ( BaseCommand)
from api.models import ( PCProduct )
from api.utils.semantic.runtime.runtime_log import ( runtime_log, )
from api.utils.semantic.runtime.compile_semantic_runtime import (  compile_semantic_runtime )

# =========================================================
# COMMAND
# =========================================================

class Command(BaseCommand):

    help = (
        "Analyze PC semantic runtime"
    )

    # =====================================================
    # ARGUMENTS
    # =====================================================

    def add_arguments(

        self,

        parser,
    ):

        # =================================================
        # LIMIT
        # =================================================

        parser.add_argument(

            "--limit",

            type=int,

            default=10,

            help=(
                "Limit number of products"
            ),
        )

        # =================================================
        # FORCE
        # =================================================

        parser.add_argument(

            "--force",

            action="store_true",

            help=(
                "Force runtime rebuild"
            ),
        )

        # =================================================
        # NEEDS RUNTIME
        # =================================================

        parser.add_argument(

            "--needs-runtime",

            action="store_true",

            help=(
                "Analyze products requiring semantic runtime"
            ),
        )

        # =================================================
        # SKIP EXTRACTION
        # =================================================

        parser.add_argument(

            "--skip-extraction",

            action="store_true",

            help=(
                "Reuse existing extracted specs"
            ),
        )

        # =================================================
        # TRACE RUNTIME
        # =================================================

        parser.add_argument(

            "--trace-runtime",

            action="store_true",

            help=(
                "Enable semantic runtime observability"
            ),
        )

        # =================================================
        # PARALLEL WORKERS
        # =================================================

        parser.add_argument(

            "--workers",

            type=int,

            default=4,

            help=(
                "Parallel semantic workers"
            ),
        )

    # =====================================================
    # PRODUCT PROCESSOR
    # =====================================================

    def process_product(

        self,

        product,

        total,

        index,

        force,

        skip_extraction,

        trace_runtime,

        needs_runtime,
    ):

        try:

            runtime_log(

                True,

                f"PRODUCT [{index}/{total}]",

                product.name,
            )

            # =============================================
            # EXISTING
            # =============================================

            runtime_log(

                trace_runtime,

                "EXISTING CPU",

                product.cpu_model,
            )

            runtime_log(

                trace_runtime,

                "EXISTING GPU",

                product.gpu_model,
            )

            runtime_log(

                trace_runtime,

                "EXISTING MEMORY",

                product.memory_gb,
            )

            # =============================================
            # SKIP
            # =============================================

            if (

                product.semantic_runtime_compiled
                and not force
                and not needs_runtime

            ):

                runtime_log(

                    True,

                    "SKIPPED",

                    product.name,
                )

                return

            # =============================================
            # COMPILE
            # =============================================

            runtime_result = (
                compile_semantic_runtime(

                    product=product,

                    skip_extraction=skip_extraction,

                    trace_runtime=trace_runtime,
                )
            )

            # =============================================
            # SAVE
            # =============================================

            product.semantic_runtime = (
                runtime_result
            )

            product.semantic_runtime_compiled = True

            product.save()

            # =============================================
            # SUCCESS
            # =============================================

            runtime_log(

                True,

                "PERSISTED",

                product.name,
            )

        except Exception as e:

            runtime_log(

                True,

                "RUNTIME ERROR",

                str(e),
            )

    # =====================================================
    # HANDLE
    # =====================================================

    def handle(

        self,

        *args,

        **options,
    ):

        limit = options.get(
            "limit"
        )

        force = options.get(
            "force"
        )

        needs_runtime = options.get(
            "needs_runtime"
        )

        skip_extraction = options.get(
            "skip_extraction"
        )

        trace_runtime = options.get(
            "trace_runtime"
        )

        workers = options.get(
            "workers"
        )

        # =================================================
        # QUERYSET
        # =================================================

        queryset = (
            PCProduct.objects.all()
        )

        # =================================================
        # NEEDS RUNTIME
        # =================================================

        if needs_runtime:

            queryset = queryset.filter(

                semantic_runtime_compiled=False
            )

        # =================================================
        # LIMIT
        # =================================================

        queryset = list(

            queryset.order_by(
                "-id"
            )[:limit]
        )

        total = len(queryset)

        # =================================================
        # START
        # =================================================

        runtime_log(

            True,

            "SEMANTIC RUNTIME ANALYSIS",

            {

                "products":
                    total,

                "workers":
                    workers,

                "force":
                    force,

                "needs_runtime":
                    needs_runtime,

                "skip_extraction":
                    skip_extraction,

                "trace_runtime":
                    trace_runtime,
            },
        )

        # =================================================
        # PARALLEL EXECUTION
        # =================================================

        with ThreadPoolExecutor(

            max_workers=workers

        ) as executor:

            futures = []

            for index, product in enumerate(

                queryset,

                start=1,
            ):

                future = executor.submit(

                    self.process_product,

                    product,

                    total,

                    index,

                    force,

                    skip_extraction,

                    trace_runtime,

                    needs_runtime,
                )

                futures.append(
                    future
                )

            # =============================================
            # WAIT
            # =============================================

            for future in as_completed(
                futures
            ):

                try:

                    future.result()

                except Exception as e:

                    runtime_log(

                        True,

                        "THREAD ERROR",

                        str(e),
                    )

        # =================================================
        # DONE
        # =================================================

        runtime_log(

            True,

            "SEMANTIC RUNTIME COMPLETED",
        )
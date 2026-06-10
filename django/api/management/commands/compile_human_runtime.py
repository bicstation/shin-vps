# =========================================================
# FILE:
# api/management/commands/compile_human_runtime.py
# =========================================================

from concurrent.futures import (
    ThreadPoolExecutor,
    as_completed,
)

from django.core.management.base import (
    BaseCommand,
)

from django.db import (
    close_old_connections,
)

from django.db.models import (
    Q,
)

from api.models.pc_products import (
    PCProduct,
)

from api.services.ai.runtime.ai_runtime import (
    AIRuntime,
)

from api.services.ai.services.pc_summary_service import (
    PCSummaryService,
)

from api.services.ai.services.human_runtime_persist_service import (
    HumanRuntimePersistService,
)


class Command(BaseCommand):

    help = (
        "Compile Human Runtime"
    )

    # =====================================================
    # INIT
    # =====================================================

    def __init__(

        self,

        *args,

        **kwargs,

    ):

        super().__init__(
            *args,
            **kwargs,
        )

        self.summary_service = (
            PCSummaryService()
        )

        self.persist_service = (
            HumanRuntimePersistService()
        )

    # =====================================================
    # ARGUMENTS
    # =====================================================

    def add_arguments(

        self,

        parser,

    ):

        parser.add_argument(
            "unique_id",
            nargs="?",
            type=str,
        )

        parser.add_argument(
            "--limit",
            type=int,
            default=1,
        )

        parser.add_argument(
            "--force",
            action="store_true",
        )

    # =====================================================
    # HANDLE
    # =====================================================

    def handle(

        self,

        *args,

        **options,

    ):

        products = (
            self.get_products(
                options
            )
        )

        if not products.exists():

            self.stdout.write(

                self.style.WARNING(
                    "🔎 No Target Products"
                )

            )

            return

        self.stdout.write(

            self.style.SUCCESS(

                f"🚀 Human Runtime "
                f"{len(products)} Products "
                f"/ Workers="
                f"{AIRuntime.max_workers()}"

            )

        )

        with ThreadPoolExecutor(

            max_workers=(
                AIRuntime.max_workers()
            )

        ) as executor:

            futures = {

                executor.submit(

                    self.process_product,

                    product,

                    index + 1,

                    len(products),

                ): product

                for index, product
                in enumerate(products)

            }

            for future in as_completed(
                futures
            ):

                try:

                    future.result()

                except Exception as e:

                    product = (
                        futures[future]
                    )

                    self.stdout.write(

                        self.style.ERROR(

                            f"❌ "
                            f"{product.unique_id} "
                            f"{e}"

                        )

                    )

    # =====================================================
    # PRODUCTS
    # =====================================================

    def get_products(

        self,

        options,

    ):

        unique_id = (
            options["unique_id"]
        )

        limit = (
            options["limit"]
        )

        force = (
            options["force"]
        )

        if unique_id:

            return (

                PCProduct.objects.filter(
                    unique_id=unique_id
                )

            )

        query = (
            PCProduct.objects.all()
        )

        if not force:

            query = query.filter(

                Q(
                    ai_summary__isnull=True
                )

                |

                Q(
                    ai_summary=""
                )

            )

            query = query.exclude(
                cpu_model=""
            )

            query = query.exclude(
                memory_gb=0
            )

            query = query.exclude(
                storage_gb=0
            )

        return query[:limit]

    # =====================================================
    # PROCESS
    # =====================================================

    def process_product(

        self,

        product,

        count,

        total,

    ):

        close_old_connections()

        try:

            self.stdout.write(

                f"📤 "
                f"({count}/{total}) "
                f"{product.name}"

            )

            bundle = (

                self.summary_service.generate(
                    product
                )

            )

            if not bundle:

                self.stdout.write(

                    self.style.WARNING(

                        f"⚠️ Empty Result "
                        f"{product.unique_id}"

                    )

                )

                return

            result = (
                bundle["summary_result"]
            )

            self.persist_service.save(

                product,

                result,

            )

            self.stdout.write(

                self.style.SUCCESS(

                    "\n"
                    "==================================================\n"
                    "✅ HUMAN COMPLETED\n"
                    "==================================================\n"
                    f"PRODUCT : {product.unique_id}\n"
                    f"MODEL   : {bundle['model']}\n"
                    f"KEY     : {bundle['api_key_index']}\n"
                    f"TIME    : {bundle['elapsed']} sec\n"
                    # f"RETRY   : {bundle['attempts']}\n"
                    "\n"
                    f"TARGET  : {result.target_user}\n"
                    f"TAGS    : {', '.join(result.usage_tags)}\n"
                    f"SUMMARY : {result.summary[:120]}\n"
                    "=================================================="

                )

            )

        finally:

            close_old_connections()
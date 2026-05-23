# =========================================================
# SHIN CORE LINX
# analyze_pc_spec.py
#
# FINAL ORCHESTRATION VERSION
# =========================================================

from django.core.management.base import (
    BaseCommand
)

from django.utils import timezone

from api.models import PCProduct

# =========================================================
# semantic runtime
# =========================================================

from api.utils.semantic.runtime.compile_semantic_runtime import (
    compile_semantic_runtime
)

# =========================================================
# content runtime
# =========================================================

from api.utils.semantic.content.generate_article import (
    generate_article_content
)


# =========================================================
# COMMAND
# =========================================================

class Command(BaseCommand):

    help = (
        "Analyze PC products "
        "using semantic runtime"
    )

    # =====================================================
    # args
    # =====================================================

    def add_arguments(
        self,
        parser
    ):

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
    # handle
    # =====================================================

    def handle(
        self,
        *args,
        **options
    ):

        limit = options[
            "limit"
        ]

        force = options[
            "force"
        ]

        # =============================================
        # queryset
        # =============================================

        queryset = (
            PCProduct.objects.all()
        )

        # =============================================
        # skip analyzed
        # =============================================

        if not force:

            queryset = queryset.filter(

                last_spec_parsed_at__isnull=True
            )

        # =============================================
        # limit
        # =============================================

        products = queryset[:limit]

        total = products.count()

        # =============================================
        # start
        # =============================================

        self.stdout.write(

            self.style.SUCCESS(

                f"🚀 解析開始: "
                f"{total} 件"
            )
        )

        # =============================================
        # loop
        # =============================================

        for index, product in enumerate(

            products,
            start=1
        ):

            self.analyze_product(

                product=product,

                count=index,

                total=total,
            )


    # =====================================================
    # analyze product
    # =====================================================

    def analyze_product(

        self,
        product,
        count,
        total,
    ):

        try:

            print(
                "\n"
                "=================================================="
            )

            print(
                f"🧠 [{count}/{total}]"
            )

            print(
                product.name
            )

            # =========================================
            # semantic runtime
            # =========================================

            runtime_result = (
                compile_semantic_runtime(
                    product
                )
            )

            specs = runtime_result.get(
                "specs",
                {}
            )

            ai_data = runtime_result.get(
                "ai_data",
                {}
            )

            workflow_tags = runtime_result.get(
                "workflow_tags",
                []
            )

            # =========================================
            # observability
            # =========================================

            print(
                "\n"
                "----------------------------------"
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
                ai_data.get(
                    "score_ai"
                )
            )

            print(
                "WORKFLOWS:",
                workflow_tags
            )

            # =========================================
            # content runtime
            # =========================================

            content_result = (
                generate_article_content(

                    product=product,

                    runtime_result=runtime_result,
                )
            )

            # =========================================
            # apply content
            # =========================================

            product.ai_title = (
                content_result.get(
                    "title"
                )
            )

            product.ai_summary = (
                content_result.get(
                    "summary"
                )
            )

            product.ai_content = (
                content_result.get(
                    "content"
                )
            )

            product.ai_faq = (
                content_result.get(
                    "faq"
                )
            )

            # =========================================
            # runtime metadata
            # =========================================

            product.semantic_runtime = (
                "v3"
            )

            product.semantic_runtime_updated_at = (
                timezone.now()
            )

            product.last_spec_parsed_at = (
                timezone.now()
            )

            # =========================================
            # save
            # =========================================

            product.save()

            # =========================================
            # success
            # =========================================

            self.stdout.write(

                self.style.SUCCESS(

                    f"✅ 更新完了 "
                    f"({count}/{total}) "
                    f"{product.unique_id}"
                )
            )

        except Exception as e:

            self.stdout.write(

                self.style.ERROR(

                    f"❌ 解析失敗 "
                    f"({product.unique_id}) "
                    f"{str(e)}"
                )
            )

            print(
                "\n"
                "=================================================="
            )

            print(
                "RUNTIME ERROR"
            )

            print(
                str(e)
            )

            print(
                "=================================================="
            )
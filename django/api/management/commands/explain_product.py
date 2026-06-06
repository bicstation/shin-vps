# explain_product.py 修正版（モデル切替対応）
# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from api.models import (
    AdultProduct,
    PCProduct,
)

from api.utils.semantic.extraction.extract_adult_reality import ( extract_adult_reality,)
from api.utils.semantic.authority.loader import ( load_semantic_master,)
from api.utils.semantic.authority.normalization import ( normalize_runtime,)
from api.utils.semantic.authority.aliases import ( resolve_alias_runtime,)
from api.utils.semantic.extraction.extract_pc_specs import ( extract_pc_specs, )
from api.utils.semantic.traversal.detect_usage import ( detect_usage_runtime, )
from api.utils.semantic.traversal.compile_workflows import ( compile_workflow_runtime, )

class Command(BaseCommand):

    help = "Explain Product Semantic Runtime"

    # =====================================================
    # ARGUMENTS
    # =====================================================

    def add_arguments(self, parser):

        parser.add_argument(
            "model",
            choices=[
                "adult",
                "pc",
            ],
        )

        parser.add_argument(
            "product_id",
            type=int,
        )

    # =====================================================
    # HANDLE
    # =====================================================

    def handle(self, *args, **options):

        model_name = options["model"]

        product_id = options["product_id"]

        # =================================================
        # MODEL SELECT
        # =================================================

        if model_name == "adult":

            product = (
                AdultProduct.objects
                .prefetch_related(
                    "genres",
                    "attributes",
                    "actresses",
                )
                .filter(
                    id=product_id,
                )
                .first()
            )

        elif model_name == "pc":

            product = (
                PCProduct.objects
                .filter(
                    id=product_id,
                )
                .first()
            )

        else:

            self.stdout.write(
                self.style.ERROR(
                    "Invalid model"
                )
            )

            return

        # =================================================
        # NOT FOUND
        # =================================================

        if not product:

            self.stdout.write(
                self.style.ERROR(
                    "Product not found"
                )
            )

            return

        # =================================================
        # AUTHORITY
        # =================================================

        semantic_master = (
            load_semantic_master()
        )

        # =================================================
        # REALITY
        # =================================================
        
        if model_name == "adult": 
            reality = ( 
                extract_adult_reality( 
                    product 
                ) 
            ) 
        elif model_name == "pc": 
            reality = (
                extract_pc_specs( 
                    product 
                ) 
            ) 
        else: 
            reality = {}


        # =================================================
        # NORMALIZATION
        # =================================================

        normalized_tokens = (
            normalize_runtime(
                reality,
                semantic_master,
                trace_runtime=False,
            )
        )

        # =================================================
        # RESOLVE
        # =================================================

        semantic_attributes = (
            resolve_alias_runtime(
                normalized_tokens,
                semantic_master,
                trace_runtime=False,
            )
        )

        semantic_groups = (
            detect_usage_runtime(
                {
                    "semantic_attributes":
                        semantic_attributes
                },
                semantic_master,
            )
        )

        workflow_runtime = (
            compile_workflow_runtime(
                semantic_groups,
                semantic_master,
            )
        )


        # =================================================
        # OUTPUT
        # =================================================

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write("PRODUCT EXPLAIN")
        self.stdout.write("=" * 60)

        self.stdout.write("")
        self.stdout.write(
            f"MODEL : {model_name}"
        )

        self.stdout.write(
            f"ID : {product.id}"
        )

        if model_name == "adult":

            self.stdout.write(
                f"TITLE : {product.title}"
            )

            self.stdout.write(
                f"SOURCE : {product.api_source}"
            )

        elif model_name == "pc":

            self.stdout.write(
                f"NAME : {product.name}"
            )
            
            self.stdout.write( 
                f"UNIQUE_ID : {product.unique_id}" 
            )

        # =============================================
        # REALITY
        # =============================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("REALITY")
        self.stdout.write("-" * 60)

        for key, value in reality.items():

            self.stdout.write(
                f"{key}: {value}"
            )

        # =============================================
        # NORMALIZED
        # =============================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("NORMALIZED")
        self.stdout.write("-" * 60)

        for token in normalized_tokens:

            self.stdout.write(
                str(token)
            )

        # =============================================
        # ATTRIBUTES
        # =============================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("RESOLVED ATTRIBUTES")
        self.stdout.write("-" * 60)

        for slug in semantic_attributes:

            self.stdout.write(
                slug
            )

        self.stdout.write("")
        self.stdout.write("=" * 60)

        # =============================================
        # GROUPS
        # =============================================
        
        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("GROUPS")
        self.stdout.write("-" * 60)

        for group in semantic_groups:
            self.stdout.write(group)

        # =============================================
        # WORKFLOWS
        # =============================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("WORKFLOWS")
        self.stdout.write("-" * 60)

        for workflow in workflow_runtime["workflow_tags"]:
            self.stdout.write(workflow)

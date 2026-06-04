# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from api.models import (
AdultProduct,
)

from api.utils.semantic.extraction.extract_adult_reality import (
extract_adult_reality,
)

from api.utils.semantic.authority.loader import (
load_semantic_master,
)

from api.utils.semantic.authority.normalization import (
normalize_runtime,
)

from api.utils.semantic.authority.aliases import (
resolve_alias_runtime,
)

class Command(BaseCommand):

    help = "Explain Product Semantic Runtime"

    def add_arguments(self, parser):

        parser.add_argument(
            "product_id",
            type=int,
        )

    def handle(self, *args, **options):

        product_id = options["product_id"]

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

        if not product:

            self.stdout.write(
                self.style.ERROR(
                    "Product not found"
                )
            )
            return

        semantic_master = (
            load_semantic_master()
        )

        reality = (
            extract_adult_reality(
                product,
            )
        )

        normalized_tokens = (
            normalize_runtime(
                reality,
                semantic_master,
                trace_runtime=False,
            )
        )

        semantic_attributes = (
            resolve_alias_runtime(
                normalized_tokens,
                semantic_master,
                trace_runtime=False,
            )
        )

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write("PRODUCT EXPLAIN")
        self.stdout.write("=" * 60)

        self.stdout.write("")
        self.stdout.write(
            f"ID : {product.id}"
        )

        self.stdout.write(
            f"TITLE : {product.title}"
        )

        self.stdout.write(
            f"SOURCE : {product.api_source}"
        )

        # =====================================
        # GENRES
        # =====================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("GENRES")
        self.stdout.write("-" * 60)

        for genre in product.genres.all():

            self.stdout.write(
                genre.name
            )

        # =====================================
        # REALITY
        # =====================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("REALITY")
        self.stdout.write("-" * 60)

        for key, value in reality.items():

            self.stdout.write(
                f"{key}: {value}"
            )

        # =====================================
        # NORMALIZED
        # =====================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("NORMALIZED")
        self.stdout.write("-" * 60)

        for token in normalized_tokens:

            self.stdout.write(
                str(token)
            )

        # =====================================
        # RESOLVED
        # =====================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("RESOLVED ATTRIBUTES")
        self.stdout.write("-" * 60)

        for slug in semantic_attributes:

            self.stdout.write(
                slug
            )

        # =====================================
        # DB ATTACHED
        # =====================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("DB ATTACHED")
        self.stdout.write("-" * 60)

        for attr in product.attributes.all():

            self.stdout.write(
                attr.slug
            )

        self.stdout.write("")
        self.stdout.write("=" * 60)


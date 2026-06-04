# -*- coding: utf-8 -*-

# /home/maya/shin-dev/shin-vps/django/api/management/commands/auto_map_adult_attributes_v2.py

from django.core.management.base import (BaseCommand,)
from api.models import (
    AdultProduct,
)
from api.models.adult_products import (
    AdultAttribute,
)
from api.utils.semantic.authority.loader import (load_semantic_master,)
from api.utils.semantic.authority.normalization import (normalize_runtime,)
from api.utils.semantic.authority.aliases import (resolve_alias_runtime,)
from api.utils.semantic.extraction.extract_adult_reality import (extract_adult_reality,)

class Command(BaseCommand):

    help = (
        "Auto map adult attributes "
        "from semantic authority"
    )

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(
            "--limit",
            type=int,
            default=0,
        )

        parser.add_argument(
            "--offset",
            type=int,
            default=0,
        )

        parser.add_argument(
            "--force",
            action="store_true",
        )

        parser.add_argument(
            "--trace",
            action="store_true",
        )

    def handle(
        self,
        *args,
        **options,
    ):

        limit = options["limit"]

        offset = options["offset"]

        force = options["force"]

        trace = options["trace"]

        self.stdout.write("")
        self.stdout.write(
            "=" * 60
        )
        self.stdout.write(
            "AUTO MAP ADULT ATTRIBUTES V2"
        )
        self.stdout.write(
            "=" * 60
        )

        semantic_master = (
            load_semantic_master()
        )

        # products = (

        #     AdultProduct.objects

        #     .filter(
        #         is_active=True,
        #     )

        #     .order_by(
        #         "id"
        #     )

        # )[offset:offset + limit]
        
        if limit <= 0:

            products = (
                AdultProduct.objects
                .filter(
                    is_active=True,
                )
                .order_by(
                    "id"
                )
            )

        else:

            products = (
                AdultProduct.objects
                .filter(
                    is_active=True,
                )
                .order_by(
                    "id"
                )
            )[offset:offset + limit]
        
        

        total = len(products)

        processed = 0
        mapped = 0
        skipped = 0
        errors = 0

        self.stdout.write(
            f"Products : {total}"
        )

        self.stdout.write("")

        for product in products:

            processed += 1

            try:

                # =====================================
                # SKIP
                # =====================================

                if (
                    product.has_attributes
                    and not force
                ):

                    skipped += 1
                    continue

                # =====================================
                # REALITY
                # =====================================

                reality = (
                    extract_adult_reality(
                        product
                    )
                )

                # =====================================
                # NORMALIZATION
                # =====================================

                normalized_tokens = (
                    normalize_runtime(
                        reality,
                        semantic_master,
                        trace_runtime=False,
                    )
                )

                # =====================================
                # ALIAS RESOLUTION
                # =====================================

                semantic_attributes = (
                    resolve_alias_runtime(
                        normalized_tokens,
                        semantic_master,
                        trace_runtime=False,
                    )
                )

                # =====================================
                # CLEAR
                # =====================================

                product.attributes.clear()

                attached_count = 0

                # =====================================
                # ATTRIBUTE ATTACH
                # =====================================

                for slug in semantic_attributes:

                    attribute = (
                        AdultAttribute.objects
                        .filter(
                            slug=slug
                        )
                        .first()
                    )

                    if not attribute:
                        continue

                    product.attributes.add(
                        attribute
                    )

                    attached_count += 1

                # =====================================
                # FLAGS
                # =====================================

                product.has_attributes = (
                    attached_count > 0
                )

                product.save(
                    update_fields=[
                        "has_attributes",
                    ]
                )

                mapped += 1

                # =====================================
                # TRACE
                # =====================================

                if trace:

                    self.stdout.write("")
                    self.stdout.write(
                        f"[{product.id}] "
                        f"{product.title}"
                    )

                    self.stdout.write(
                        f"Tokens : "
                        f"{normalized_tokens}"
                    )

                    self.stdout.write(
                        f"Attributes : "
                        f"{semantic_attributes}"
                    )

                # =====================================
                # PROGRESS
                # =====================================

                if processed % 100 == 0:

                    self.stdout.write(
                        f"[PROGRESS] "
                        f"{processed}/{total}"
                    )

            except Exception as e:

                errors += 1

                self.stdout.write(
                    self.style.WARNING(
                        f"[ERROR] "
                        f"{product.id} "
                        f"{e}"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            "AUTO MAP ADULT ATTRIBUTES V2"
        )

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            f"Processed : {processed}"
        )

        self.stdout.write(
            f"Mapped    : {mapped}"
        )

        self.stdout.write(
            f"Skipped   : {skipped}"
        )

        self.stdout.write(
            f"Errors    : {errors}"
        )

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write("")


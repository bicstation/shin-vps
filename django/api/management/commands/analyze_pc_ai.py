# -*- coding: utf-8 -*-

from concurrent.futures import (
    ThreadPoolExecutor,
    as_completed,
)

from django.core.management.base import ( BaseCommand,)
from django.db import ( close_old_connections, )
from django.db.models import ( Q, )
from api.models.pc_products import ( PCProduct, )
from api.services.ai.services.pc_spec_service import (  PCSpecService, )
from django.utils import timezone
from datetime import timedelta

MAX_WORKERS = 1

class Command(BaseCommand):

    help = (
        "Generate PC Specs"
    )

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

        unique_id = (
            options["unique_id"]
        )

        limit = (
            options["limit"]
        )

        force = (
            options["force"]
        )

        products = (
            self.get_products(

                unique_id,

                limit,

                force,

            )
        )

        if not products.exists():

            self.stdout.write(

                self.style.WARNING(

                    "🔎 対象製品なし"

                )

            )

            return

        self.stdout.write(

            self.style.SUCCESS(

                f"🚀 START "
                f"{products.count()}"

            )

        )

        with ThreadPoolExecutor(

            max_workers=
            MAX_WORKERS

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
                        futures[
                            future
                        ]
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
        unique_id,
        limit,
        force,

    ):

        retry_limit = (
            timezone.now()
            - timedelta(hours=24)
        )        
        
        if unique_id:

            return (

                PCProduct.objects

                .filter(

                    unique_id=
                    unique_id

                )

            )

        query = (
            PCProduct.objects.all()
        )

        if not force:

            query = query.filter(
                
                Q(cpu_model__isnull=True)
                |
                Q(cpu_model="")

                # Q(
                #     cpu_model__isnull=True
                # )

                # |

                # Q(
                #     cpu_model=""
                # )

                # |

                # Q(
                #     memory_gb=0
                # )

                # |

                # Q(
                #     storage_gb=0
                # )

                # |

                # Q(
                #     display_info__isnull=True
                # )

                # |

                # Q(
                #     display_info=""
                # )

            ).exclude(

               updated_at__gte=retry_limit

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

            service = (
                PCSpecService()
            )

            result = (
                service.generate(
                    product
                )
            )

            if not result:

                return

            if not result.is_valid:

                self.stdout.write(
                    self.style.WARNING(
                        f"⚠️ "
                        f"スペック取得失敗: "
                        f"{product.unique_id}"
                    )
                )

                return

            self.save_spec(
                product,
                result,
            )

            self.stdout.write(

                self.style.SUCCESS(

                    f"✅ "
                    f"({count}/{total}) "
                    f"{product.unique_id}"
                    f"{product.name}"

                )

            )

        finally:

            close_old_connections()

    # =====================================================
    # SAVE
    # =====================================================

    def save_spec(
        self,
        product,
        result,

    ):

        product.is_active = True
        product.is_posted = True

        product.cpu_model = (
            result.cpu_model
        )

        product.gpu_model = (
            result.gpu_model
        )

        product.memory_gb = (
            result.memory_gb
        )

        product.storage_gb = (
            result.storage_gb
        )

        product.display_info = (
            result.display_info
        )

        product.save()

        self.stdout.write(

            f"[{product.unique_id}] "
            f"CPU:{result.cpu_model} | "
            f"GPU:{result.gpu_model} | "
            f"MEM:{result.memory_gb}GB | "
            f"SSD:{result.storage_gb}GB | "
            f"AI:{result.is_ai_pc}"

        )
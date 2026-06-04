# -*- coding: utf-8 -*-

import csv
import os

from django.core.management.base import BaseCommand

from api.models import (
    PCAttribute,
    AdultAttribute,
)


class Command(BaseCommand):

    help = (
        "統合属性マスター(TSV)をインポートします"
        "（PC用・アダルト用を自動振り分け）"
    )

    def add_arguments(
        self,
        parser,
    ):
        parser.add_argument(
            "file_path",
            type=str,
        )

    def handle(
        self,
        *args,
        **options,
    ):

        file_path = options["file_path"]

        if not os.path.exists(file_path):

            self.stderr.write(
                self.style.ERROR(
                    f"ファイルが見つかりません: {file_path}"
                )
            )
            return

        try:

            self.stdout.write("")
            self.stdout.write("=" * 60)
            self.stdout.write(
                "IMPORT SPECS"
            )
            self.stdout.write("=" * 60)

            # =====================================================
            # Clear
            # =====================================================

            PCAttribute.objects.all().delete()
            AdultAttribute.objects.all().delete()

            self.stdout.write(
                self.style.WARNING(
                    "既存属性マスターをクリアしました"
                )
            )

            # =====================================================
            # Adult Types
            # =====================================================

            adult_types = {

                "body",
                "style",
                "scene",
                "feature",
                "actor_type",
                "video_spec",

            }

            # =====================================================
            # Import
            # =====================================================

            pc_count = 0
            adult_count = 0
            skipped_count = 0

            processed_slugs = set()

            with open(
                file_path,
                "r",
                encoding="utf-8",
            ) as f:

                reader = csv.DictReader(
                    f,
                    delimiter="\t",
                )

                for row in reader:

                    # ---------------------------------------------
                    # Backward Compatibility
                    # ---------------------------------------------

                    attr_type = (

                        row.get("type")

                        or row.get("attr_type")

                        or ""

                    ).strip()

                    slug = (
                        row.get("slug")
                        or ""
                    ).strip()

                    name = (
                        row.get("name")
                        or ""
                    ).strip()

                    # ---------------------------------------------
                    # Validation
                    # ---------------------------------------------

                    if not slug:

                        skipped_count += 1
                        continue

                    if not attr_type:

                        skipped_count += 1

                        self.stdout.write(

                            self.style.WARNING(
                                f"[SKIP] attr_type missing : {slug}"
                            )

                        )

                        continue

                    if slug in processed_slugs:

                        skipped_count += 1
                        continue

                    



                    # ---------------------------------------------
                    # Safe Cast
                    # ---------------------------------------------

                    try:
                        order = int(
                            row.get(
                                "order",
                                999,
                            )
                        )
                    except Exception:
                        order = 999

                    try:
                        semantic_weight = float(
                            row.get(
                                "semantic_weight",
                                1.0,
                            )
                        )
                    except Exception:
                        semantic_weight = 1.0

                    # ---------------------------------------------
                    # Params
                    # ---------------------------------------------
                        
                    
                    params = {

                        "attr_type": attr_type,

                        "slug": slug,

                        "name": name,

                        "search_keywords": (
                            row.get(
                                "search_keywords",
                                "",
                            ).strip()
                        ),

                        "order": order,

                        "semantic_role": (
                            row.get(
                                "semantic_role",
                                "",
                            ).strip()
                        ),

                        "semantic_weight": semantic_weight,

                        "icon": (
                            row.get(
                                "icon",
                                "",
                            ).strip()
                        ),

                        "color": (
                            row.get(
                                "color",
                                "",
                            ).strip()
                        ),

                        "is_ranking_enabled": str(
                            row.get(
                                "is_ranking_enabled",
                                "false",
                            )
                        ).lower() in (
                            "1",
                            "true",
                            "yes",
                        ),
                    }
                    
                    # # ---------------------------------------------
                    # # Params
                    # # ---------------------------------------------

                    # params = {

                    #     "attr_type": attr_type,

                    #     "slug": slug,

                    #     "name": name,

                    #     "search_keywords": (
                    #         row.get(
                    #             "search_keywords",
                    #             "",
                    #         )
                    #         .strip()
                    #     ),

                    #     "order": int(
                    #         row.get(
                    #             "order",
                    #             999,
                    #         )
                    #     ),

                    #     "semantic_role": (
                    #         row.get(
                    #             "semantic_role",
                    #             "",
                    #         )
                    #         .strip()
                    #     ),

                    #     "semantic_weight": float(

                    #         row.get(
                    #             "semantic_weight",
                    #             1.0,
                    #         )

                    #     ),

                    #     "icon": (
                    #         row.get(
                    #             "icon",
                    #             "",
                    #         )
                    #         .strip()
                    #     ),

                    #     "color": (
                    #         row.get(
                    #             "color",
                    #             "",
                    #         )
                    #         .strip()
                    #     ),

                    #     "is_ranking_enabled": str(
                    #         row.get(
                    #             "is_ranking_enabled",
                    #             "false",
                    #         )
                    #     ).lower() in (
                    #         "1",
                    #         "true",
                    #         "yes",
                    #     ),
                    # }

                    # ---------------------------------------------
                    # Adult
                    # ---------------------------------------------

                    if attr_type in adult_types:

                        AdultAttribute.objects.create(
                            **params
                        )

                        adult_count += 1

                    else:

                        PCAttribute.objects.create(
                            **params
                        )

                        pc_count += 1

                    processed_slugs.add(
                        slug
                    )

            # =====================================================
            # Summary
            # =====================================================

            self.stdout.write("")
            self.stdout.write("=" * 60)
            self.stdout.write(
                "IMPORT RESULT"
            )
            self.stdout.write("=" * 60)

            self.stdout.write(
                f"PC Attributes     : {pc_count}"
            )

            self.stdout.write(
                f"Adult Attributes  : {adult_count}"
            )

            self.stdout.write(
                f"Skipped           : {skipped_count}"
            )

            self.stdout.write("")

            self.stdout.write(
                f"PC DB Count       : "
                f"{PCAttribute.objects.count()}"
            )

            self.stdout.write(
                f"Adult DB Count    : "
                f"{AdultAttribute.objects.count()}"
            )

            self.stdout.write("")
            self.stdout.write("=" * 60)

        except Exception as e:

            self.stderr.write(

                self.style.ERROR(
                    f"エラーが発生しました: {e}"
                )

            )
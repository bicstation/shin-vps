# -*- coding: utf-8 -*-

import os
import csv

from django.core.management.base import (
    BaseCommand
)

from django.db import transaction


class Command(BaseCommand):

    help = (
        'TSVファイルから '
        'semantic attributes を '
        '安全同期します'
    )

    # =====================================================
    # MAIN
    # =====================================================
    def handle(self, *args, **options):

        # =================================================
        # Dynamic Import
        # =================================================
        try:

            from api.models.pc_products import (
                PCAttribute
            )

            from api.models.adult_models import (
                AdultAttribute
            )

        except ImportError:

            from api.models import (
                PCAttribute,
                AdultAttribute
            )

        # =================================================
        # TSV Path
        # =================================================
        file_path = (
            '/usr/src/app/'
            'master_data/attributes.tsv'
        )

        if not os.path.exists(file_path):

            self.stdout.write(

                self.style.ERROR(

                    f"❌ File not found: "
                    f"{file_path}"

                )
            )

            return

        # =================================================
        # Sync Function
        # =================================================
        def process_sync(
            model_class,
            target_is_adult
        ):

            label = (

                "🔞 ADULT"

                if target_is_adult

                else "💻 PC"
            )

            count = 0

            updated_ids = []

            with open(
                file_path,
                'r',
                encoding='utf-8'
            ) as f:

                reader = csv.DictReader(
                    f,
                    delimiter='\t'
                )

                # =========================================
                # Header Normalize
                # =========================================
                fieldnames = [

                    (
                        x.strip()

                        if x else ""
                    )

                    for x in (
                        reader.fieldnames or []
                    )
                ]

                reader.fieldnames = fieldnames

                # =========================================
                # TSV ROW LOOP
                # =========================================
                for row in reader:

                    # -------------------------------------
                    # Normalize Row Keys
                    # -------------------------------------
                    normalized_row = {

                        (
                            k.strip()

                            if k else ""
                        ): (

                            v.strip()

                            if isinstance(v, str)

                            else v
                        )

                        for k, v in row.items()
                    }

                    # -------------------------------------
                    # BACKWARD COMPATIBILITY
                    # type -> attr_type
                    # keywords -> search_keywords
                    # -------------------------------------
                    attr_type = (

                        normalized_row.get(
                            'attr_type'
                        )

                        or

                        normalized_row.get(
                            'type'
                        )

                        or

                        ''
                    )

                    search_keywords = (

                        normalized_row.get(
                            'search_keywords'
                        )

                        or

                        normalized_row.get(
                            'keywords'
                        )

                        or

                        ''
                    )

                    # -------------------------------------
                    # Skip Invalid
                    # -------------------------------------
                    if not attr_type:

                        self.stdout.write(

                            self.style.WARNING(

                                "⚠️ attr_type missing"
                            )
                        )

                        continue

                    slug = (
                        normalized_row.get(
                            'slug',
                            ''
                        )
                        .strip()
                        .lower()
                    )

                    if not slug:

                        self.stdout.write(

                            self.style.WARNING(

                                "⚠️ slug missing"
                            )
                        )

                        continue

                    # -------------------------------------
                    # Adult Flag
                    # -------------------------------------
                    raw_val = (

                        normalized_row.get(
                            'is_adult',
                            '0'
                        )
                        .strip()
                    )

                    current_row_is_adult = (
                        raw_val == '1'
                    )

                    if (
                        current_row_is_adult
                        != target_is_adult
                    ):

                        continue

                    # -------------------------------------
                    # Semantic Fields
                    # -------------------------------------
                    semantic_role = (
                        normalized_row.get(
                            'semantic_role',
                            ''
                        )
                    )

                    semantic_weight = (
                        normalized_row.get(
                            'semantic_weight',
                            0
                        )
                    )

                    icon = (
                        normalized_row.get(
                            'icon',
                            ''
                        )
                    )

                    color = (
                        normalized_row.get(
                            'color',
                            ''
                        )
                    )

                    # -------------------------------------
                    # Safe Numeric
                    # -------------------------------------
                    try:

                        order = int(
                            float(
                                normalized_row.get(
                                    'order',
                                    0
                                )
                            )
                        )

                    except Exception:

                        order = 0

                    try:

                        semantic_weight = float(
                            semantic_weight
                        )

                    except Exception:

                        semantic_weight = 0

                    # -------------------------------------
                    # Update or Create
                    # -------------------------------------
                    obj, created = (

                        model_class.objects
                        .update_or_create(

                            slug=slug,

                            defaults={

                                'attr_type':
                                    attr_type,

                                'name':
                                    normalized_row.get(
                                        'name',
                                        ''
                                    ),

                                'search_keywords':
                                    search_keywords,

                                'order':
                                    order,

                                'is_adult':
                                    target_is_adult,

                                # =====================
                                # Semantic Metadata
                                # =====================
                                'semantic_role':
                                    semantic_role,

                                'semantic_weight':
                                    semantic_weight,

                                'icon':
                                    icon,

                                'color':
                                    color,
                            }
                        )
                    )

                    updated_ids.append(
                        obj.id
                    )

                    count += 1

            # =============================================
            # LOG
            # =============================================
            self.stdout.write(

                self.style.SUCCESS(

                    f"✅ {label}: "
                    f"{count} 件同期完了 "
                    f"(リレーション維持)"
                )
            )

            return updated_ids

        # =================================================
        # Transaction
        # =================================================
        try:

            with transaction.atomic():

                process_sync(
                    PCAttribute,
                    False
                )

                process_sync(
                    AdultAttribute,
                    True
                )

            self.stdout.write(

                self.style.SUCCESS(

                    "✨ semantic attribute "
                    "sync completed"
                )
            )

        except Exception as e:

            self.stdout.write(

                self.style.ERROR(

                    f"❌ 同期中にエラー: "
                    f"{str(e)}"

                )
            )
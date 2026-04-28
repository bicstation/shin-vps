# -*- coding: utf-8 -*-
# api/management/commands/auto_map_attributes.py

import re
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import PCProduct, PCAttribute, AdultProduct, AdultAttribute


class Command(BaseCommand):
    help = '属性の自動マッピング（最終版・完成版）'

    CPU_PRIORITY = {
        "core i9": 100,
        "ryzen 9": 100,
        "core ultra 9": 95,

        "core i7": 90,
        "ryzen 7": 90,

        "core i5": 80,
        "core i3": 70,

        "ryzen ai 300": 60,
    }

    GPU_PRIORITY = {
        "rtx 4090": 100,
        "rtx 4080": 95,
        "rtx 4070": 90,
        "rtx 4060": 85,

        "intel arc": 50,
        "intel graphics (内蔵)": 10,
        "rtx 40シリーズ": 5,
    }

    def handle(self, *args, **options):

        targets = [
            {
                'name': 'PC',
                'products': PCProduct.objects.all().prefetch_related('attributes'),
                'attributes': PCAttribute.objects.filter(is_adult=False),
                'fields': [
                    'name',
                    'description',
                    'ai_summary',
                    'cpu_model',
                    'gpu_model',
                    'display_info',
                    'target_segment'
                ]
            },
            {
                'name': 'ADULT',
                'products': AdultProduct.objects.all().prefetch_related('attributes'),
                'attributes': AdultAttribute.objects.all(),
                'fields': [
                    'title',
                    'product_description',
                    'rich_description',
                    'ai_summary',
                    'ai_content',
                    'ai_catchcopy',
                    'target_segment'
                ]
            }
        ]

        total_count = 0

        for target in targets:
            self.stdout.write(self.style.HTTP_INFO(f"🚀 {target['name']} 開始"))

            attributes = list(target['attributes'])

            # -------------------------
            # 属性前処理
            # -------------------------
            prepared_attrs = []

            for attr in attributes:
                raw_keywords = attr.search_keywords or ""

                keywords = [
                    k.strip().lower()
                    for k in re.split(r'[,\s、，\t\n]+', raw_keywords)
                    if len(k.strip()) >= 2   # ←緩和（重要）
                ]

                keywords.append(attr.name.lower())

                prepared_attrs.append({
                    'obj': attr,
                    'keywords': keywords,
                    'type': attr.attr_type
                })

            with transaction.atomic():

                for product in target['products']:

                    texts = []
                    for f in target['fields']:
                        val = getattr(product, f, "")
                        if val:
                            texts.append(str(val))

                    target_text = " ".join(texts).lower()

                    if not target_text:
                        continue

                    existing_ids = set(product.attributes.values_list('id', flat=True))

                    best_match = {}

                    for attr_data in prepared_attrs:
                        attr = attr_data['obj']

                        if attr.id in existing_ids:
                            continue

                        score = 0

                        for kw in attr_data['keywords']:
                            # ★ここ修正（完全一致→部分一致）
                            if kw in target_text:
                                score += 1

                        if score < 1:
                            continue

                        attr_type = attr_data['type']
                        name = attr.name.lower()

                        # -------------------------
                        # priority計算
                        # -------------------------
                        if attr_type == "cpu":
                            priority = self.CPU_PRIORITY.get(name, 0) * 100 + (score * 10)

                        elif attr_type == "gpu":
                            priority = self.GPU_PRIORITY.get(name, 0) * 100 + (score * 10)

                        else:
                            priority = score

                        # -------------------------
                        # ベスト更新
                        # -------------------------
                        if attr_type not in best_match or best_match[attr_type]['priority'] < priority:
                            best_match[attr_type] = {
                                'attr': attr,
                                'priority': priority
                            }

                    # -------------------------
                    # 登録
                    # -------------------------
                    to_add = [v['attr'] for v in best_match.values()]

                    if to_add:
                        product.attributes.add(*to_add)
                        total_count += len(to_add)

        self.stdout.write(self.style.SUCCESS(f'✅ 完了: {total_count} 件紐付け'))
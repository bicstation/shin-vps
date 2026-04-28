# -*- coding: utf-8 -*-
# api/management/commands/auto_map_attributes.py

import re
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import PCProduct, PCAttribute, AdultProduct, AdultAttribute


class Command(BaseCommand):
    help = '属性の自動マッピング（最終完成版）'     

    # -------------------------
    # CPU / GPU priority
    # -------------------------
    CPU_PRIORITY = {
        "core i9": 100,
        "ryzen 9": 100,
        "core ultra 9": 95,
        "core i7": 90,
        "ryzen 7": 90,
        "core i5": 80,
        "core i3": 70,
    }

    GPU_PRIORITY = {
        "rtx 5090": 100,
        "rtx 5080": 95,
        "rtx 5070 ti": 92,
        "rtx 5070": 90,
        "rtx 4070 ti": 85,
        "rtx 4060": 80,
        "intel arc": 50,
        "intel graphics (内蔵)": 1,
    }

    # -------------------------
    # TYPE設定
    # -------------------------
    SINGLE_TYPES = [
        "cpu", "gpu", "vram", "memory", "storage",
        "monitor_size", "resolution", "refresh_rate", "panel_type"
    ]

    MULTI_TYPES = [
        "usage", "gpu_type", "cpu_feature",
        "pc_feature", "storage_type", "aspect_ratio"
    ]

    # -------------------------
    # 正規化
    # -------------------------
    def normalize(self, text):
        return text.replace(" ", "").replace("-", "").lower()

    # -------------------------
    # メイン処理
    # -------------------------
    def handle(self, *args, **options):

        targets = [
            {
                'name': 'PC',
                'products': PCProduct.objects.all().prefetch_related('attributes'),
                'attributes': PCAttribute.objects.filter(is_adult=False),
                'fields': [
                    'title', 'name', 'description', 'ai_summary',
                    'cpu_model', 'gpu_model', 'display_info', 'target_segment'
                ]
            },
            {
                'name': 'ADULT',
                'products': AdultProduct.objects.all().prefetch_related('attributes'),
                'attributes': AdultAttribute.objects.all(),
                'fields': [
                    'title', 'product_description', 'rich_description',
                    'ai_summary', 'ai_content', 'ai_catchcopy', 'target_segment'
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
                    if len(k.strip()) >= 2
                ]

                keywords.append(attr.name.lower())

                prepared_attrs.append({
                    'obj': attr,
                    'keywords': keywords,
                    'type': attr.attr_type
                })

            # -------------------------
            # マッピング
            # -------------------------
            with transaction.atomic():

                for product in target['products']:

                    # -------------------------
                    # モニター判定（重要）
                    # -------------------------                   
                    product_name = (getattr(product, "name", "") or getattr(product, "title", "")).lower()

                    is_monitor = any([
                        "モニター" in product_name,
                        "monitor" in product_name,
                        "display" in product_name,
                        "ディスプレイ" in product_name
                    ])
                    
                    
                    if is_monitor:
                        # モニター専用処理だけやる
                        allowed_types = [
                            "monitor_size",
                            "resolution",
                            "refresh_rate",
                            "panel_type"
                        ]
                    else:
                        allowed_types = None


                    skip_cpu_gpu = is_monitor
                    skip_pc_tags = is_monitor

                    texts = []
                    for f in target['fields']:
                        val = getattr(product, f, "")
                        if val:
                            texts.append(str(val))

                    target_text = " ".join(texts).lower()
                    target_text_norm = self.normalize(target_text)

                    if not target_text:
                        continue

                    existing_ids = set(product.attributes.values_list('id', flat=True))
                    best_match = {}

                    # -------------------------
                    # マッチング処理（完全版）
                    # -------------------------
                    for attr_data in prepared_attrs:

                        attr = attr_data['obj']
                        attr_type = attr_data['type']

                        if attr.id in existing_ids:
                            continue

                        score = 0
                        matched = False
                        match_type = ""

                        for kw in attr_data['keywords']:
                            kw = kw.strip().lower()
                            if not kw:
                                continue
                            

                            kw_norm = self.normalize(kw)

                            # -------------------------
                            # CPU / GPU → 正規表現
                            # -------------------------
                            if attr_type in ["cpu", "gpu"]:
                                
                                if len(kw) < 5:
                                    continue
                                
                                if not any(c.isdigit() for c in kw):
                                    continue
                                                               
                                pattern = re.escape(kw).replace(r"\ ", r"\s*")

                                if re.search(pattern, target_text):
                                    score += 2
                                    matched = True
                                    match_type = "REGEX"
                                    break

                            # -------------------------
                            # その他 → 通常マッチ
                            # -------------------------
                            else:
                                if kw in target_text:
                                    score += 1
                                    matched = True
                                    match_type = "RAW"
                                    break

                                elif kw_norm in target_text_norm:
                                    score += 2
                                    matched = True
                                    match_type = "NORM"
                                    break

                        # -------------------------
                        # スキップ条件
                        # -------------------------
                        if not matched:
                            continue

                        # -------------------------
                        # モニター制御
                        # -------------------------
                        if allowed_types is not None:
                            if attr_type not in allowed_types:
                                continue

                        if attr_type in ["cpu", "gpu"]:
                            if skip_cpu_gpu:
                                continue

                        if skip_pc_tags:
                            if attr_type in ["cpu", "gpu", "usage", "pc_feature"]:
                                continue

                        # -------------------------
                        # priority
                        # -------------------------
                        if attr_type in ["cpu", "gpu"]:
                            priority = (attr.order or 0) * 1000 + (score * 10)
                        else:
                            priority = score

                        if "シリーズ" in attr.name:
                            priority -= 500
                            
                        if "世代" in attr.name:
                            priority -= 300
                        
                        if attr.name == "NPU搭載":
                            priority -= 100

                        # -------------------------
                        # SINGLE
                        # -------------------------
                        if attr_type in self.SINGLE_TYPES:

                            if attr_type not in best_match:
                                best_match[attr_type] = {
                                    'attr': attr,
                                    'priority': priority
                                }
                            else:
                                if priority > best_match[attr_type]['priority']:
                                    best_match[attr_type] = {
                                        'attr': attr,
                                        'priority': priority
                                    }

                        # -------------------------
                        # MULTI
                        # -------------------------
                        elif attr_type in self.MULTI_TYPES:

                            if attr_type not in best_match:
                                best_match[attr_type] = []

                            if len(best_match[attr_type]) < 5:
                                best_match[attr_type].append(attr)

                        # -------------------------
                        # デバッグ
                        # -------------------------
                        # title = getattr(product, "title", None) or getattr(product, "name", "")
                        # if "4070" in title:
                        #     print(f"🔥 {match_type} MATCH | attr={attr.name} | title={title}")
                    
                    # -------------------------
                    # 登録
                    # -------------------------
                    to_add = []

                    for v in best_match.values():
                        if isinstance(v, list):
                            to_add.extend(v)
                        else:
                            to_add.append(v['attr'])

                    if to_add:
                        product.attributes.add(*to_add)
                        total_count += len(to_add)

        self.stdout.write(self.style.SUCCESS(f'✅ 完了: {total_count} 件紐付け'))
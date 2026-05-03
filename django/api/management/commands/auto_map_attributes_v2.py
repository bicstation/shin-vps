# api/management/commands/auto_map_attributes_v2.py

import re
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import PCProduct, PCAttribute


class Command(BaseCommand):
    help = "PC属性 自動マッピング V2（完全版）"

    # -------------------------
    # GPU正規表現
    # -------------------------
    GPU_PATTERNS = [
        (r"5090", "gpu-rtx-5090"),
        (r"5080", "gpu-rtx-5080"),
        (r"5070\s?ti", "gpu-rtx-5070"),
        (r"5070", "gpu-rtx-5070"),
        (r"4070\s?ti", "gpu-rtx-4070"),
        (r"4070", "gpu-rtx-4070"),
        (r"4060", "gpu-rtx-4060"),
        (r"arc", "gpu-intel-arc"),
        (r"intel.*graphics", "gpu-intel-graphics"),
    ]

    # -------------------------
    # CPU正規表現
    # -------------------------
    CPU_PATTERNS = [
        (r"core\s?i9", "cpu-core-i9"),
        (r"core\s?i7", "cpu-core-i7"),
        (r"core\s?i5", "cpu-core-i5"),
        (r"core\s?i3", "cpu-core-i3"),
        (r"ryzen\s?9", "cpu-ryzen-9"),
        (r"ryzen\s?7", "cpu-ryzen-7"),
        (r"ryzen\s?5", "cpu-ryzen-5"),
    ]

    def handle(self, *args, **options):

        self.stdout.write("🚀 属性V2 完全版 START")

        attrs = PCAttribute.objects.filter(is_adult=False)
        attr_map = {a.slug: a for a in attrs}

        def get(slug):
            return attr_map.get(slug)

        total = 0

        with transaction.atomic():

            for p in PCProduct.objects.all().prefetch_related("attributes"):

                new_attrs = []

                # =========================
                # GPU
                # =========================               
                gpu_text = (p.gpu_model or "").lower()

                # 🔥 ノイズ除去（超重要）
                gpu_text = gpu_text.replace("nvidia", "").replace("geforce", "").strip()

                gpu_attr = None

                for pattern, slug in self.GPU_PATTERNS:
                    if re.search(pattern, gpu_text):
                        gpu_attr = get(slug)
                        break

                # 🔥 fallback強化
                if not gpu_attr:
                    if "rtx" in gpu_text:
                        gpu_attr = get("gpu-rtx-4060")  # 最低RTX扱い
                    else:
                        gpu_attr = get("gpu-intel-graphics")
                
                if gpu_attr:
                    new_attrs.append(gpu_attr)

                # =========================
                # CPU
                # =========================
                cpu_text = (p.cpu_model or "").lower()

                for pattern, slug in self.CPU_PATTERNS:
                    if re.search(pattern, cpu_text):
                        attr = get(slug)
                        if attr:
                            new_attrs.append(attr)
                        break

                # =========================
                # メモリ
                # =========================
                mem = p.memory_gb or 0

                if mem >= 64:
                    new_attrs.append(get("mem-64gb"))
                elif mem >= 32:
                    new_attrs.append(get("mem-32gb"))
                elif mem >= 16:
                    new_attrs.append(get("mem-16gb"))

                # =========================
                # ストレージ
                # =========================
                storage = getattr(p, "storage_gb", 0) or 0

                if storage >= 2000:
                    new_attrs.append(get("storage-2tb"))
                elif storage >= 1000:
                    new_attrs.append(get("storage-1tb"))
                elif storage >= 500:
                    new_attrs.append(get("storage-512gb"))

                # =========================
                # usage（動的生成）
                # =========================
                gpu_score = gpu_attr.order if gpu_attr else 0
                spec_score = p.spec_score or 0

                if gpu_score >= 80:
                    new_attrs.append(get("usage-gaming"))

                elif spec_score >= 85:
                    new_attrs.append(get("usage-creator"))

                elif mem <= 8:
                    new_attrs.append(get("usage-budget"))

                else:
                    new_attrs.append(get("usage-business"))

                # =========================
                # クリーンアップ
                # =========================
                clean = list({a for a in new_attrs if a})

                # 上書き
                p.attributes.set(clean)

                total += len(clean)

        self.stdout.write(self.style.SUCCESS(f"✅ DONE: {total} attributes updated"))
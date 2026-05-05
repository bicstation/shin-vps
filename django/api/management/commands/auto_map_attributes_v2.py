# api/management/commands/auto_map_attributes_v2.py

import re
from collections import defaultdict
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import PCProduct, PCAttribute


# =========================
# GPU 正規化
# =========================
def normalize_gpu(name: str) -> str:
    if not name or not isinstance(name, str):
        return ""

    text = name.lower().strip()

    if text in ["未定", "unknown", "不明", ""]:
        return ""

    text = (
        text.replace("nvidia", "")
            .replace("geforce", "")
            .replace("amd", "")
            .replace("radeon", "")
            .replace("graphics", "")
            .strip()
    )

    if "/" in text:
        text = text.split("/")[0].strip()

    match = re.search(r'rtx[\s\-]*(\d{3,4})', text)
    if match:
        return f"gpu-rtx-{match.group(1)}"

    match = re.search(r'gtx[\s\-]*(\d{3,4})', text)
    if match:
        return f"gpu-gtx-{match.group(1)}"

    if "arc" in text:
        return "gpu-intel-arc"

    if any(x in text for x in ["intel", "iris", "uhd"]):
        return "gpu-intel-graphics"

    return ""


# =========================
# CPU 正規化
# =========================
def normalize_cpu(name: str) -> str:
    if not name or not isinstance(name, str):
        return ""

    text = name.lower().strip()

    if text in ["未定", "unknown", "不明", ""]:
        return ""

    text = (
        text.replace("intel", "")
            .replace("amd", "")
            .replace("processor", "")
            .strip()
    )

    if "ultra 9" in text:
        return "cpu-core-i9"
    if "ultra 7" in text:
        return "cpu-core-i7"
    if "ultra 5" in text:
        return "cpu-core-i5"

    if "i9" in text:
        return "cpu-core-i9"
    if "i7" in text:
        return "cpu-core-i7"
    if "i5" in text:
        return "cpu-core-i5"
    if "i3" in text:
        return "cpu-core-i3"

    if "ryzen ai 9" in text:
        return "cpu-ryzen-9"
    if "ryzen ai 7" in text:
        return "cpu-ryzen-7"

    if "ryzen 9" in text:
        return "cpu-ryzen-9"
    if "ryzen 7" in text:
        return "cpu-ryzen-7"
    if "ryzen 5" in text:
        return "cpu-ryzen-5"
    if "ryzen 3" in text:
        return "cpu-ryzen-3"

    if any(x in text for x in ["n100", "celeron"]):
        return "cpu-core-i3"

    return ""


# =========================
# maker 正規化
# =========================
def normalize_maker(name: str) -> str:
    if not name or not isinstance(name, str):
        return ""

    text = name.lower()

    if "asus" in text:
        return "maker-asus"
    if "dell" in text or "alienware" in text:
        return "maker-dell"
    if "hp" in text or "omen" in text:
        return "maker-hp"
    if "lenovo" in text:
        return "maker-lenovo"
    if "msi" in text:
        return "maker-msi"
    if "dynabook" in text:
        return "maker-dynabook"
    if "fujitsu" in text:
        return "maker-fujitsu"
    if "nec" in text:
        return "maker-nec"

    return ""


# =========================
# usage キーワード
# =========================
USAGE_KEYWORDS = {
    "usage-gaming": ["ゲーミング", "fps", "rtx"],
    "usage-creator": ["動画編集", "adobe", "raw"],
    "usage-business": ["office", "法人", "事務"],
    "usage-ai": ["ai", "stable diffusion", "llm"],
    "usage-mobile": ["軽量", "モバイル", "薄型"],
    "usage-budget": ["安い", "格安", "コスパ"],
}


# =========================
# usage 判定（ハイブリッド）
# =========================
def detect_usage(p, get, cpu_slug, gpu_attr):
    text = (p.name or "").lower()
    scores = {k: 0 for k in USAGE_KEYWORDS.keys()}

    # TSV
    for slug, keywords in USAGE_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                scores[slug] += 3

    # GPU補正
    gpu_score = gpu_attr.order if gpu_attr else 0
    if gpu_score >= 90:
        scores["usage-gaming"] += 3
    elif gpu_score >= 80:
        scores["usage-gaming"] += 2
        scores["usage-creator"] += 1
    elif gpu_score <= 40:
        scores["usage-business"] += 2

    # CPU補正
    if cpu_slug in ["cpu-core-i9", "cpu-ryzen-9"]:
        scores["usage-creator"] += 2
    elif cpu_slug == "cpu-core-i7":
        scores["usage-creator"] += 1
    elif cpu_slug == "cpu-core-i3":
        scores["usage-business"] += 2
        scores["usage-budget"] += 1

    best_slug = max(scores, key=scores.get)

    if scores[best_slug] == 0:
        best_slug = "usage-budget"

    return get(best_slug)


# =========================
# Command
# =========================
class Command(BaseCommand):
    help = "PC属性 自動マッピング V2（完全版）"

    def handle(self, *args, **options):
        self.stdout.write("🚀 属性V2 START")

        attrs = PCAttribute.objects.filter(is_adult=False)
        attr_map = {a.slug: a for a in attrs}

        def get(slug):
            return attr_map.get(slug)

        total_attrs = 0
        type_counts = defaultdict(int)
        product_count = 0

        with transaction.atomic():
            for p in PCProduct.objects.all():

                product_count += 1
                new_attrs = []

                # GPU
                gpu_slug = normalize_gpu(p.gpu_model)
                gpu_attr = get(gpu_slug)

                if not gpu_attr:
                    gpu_attr = get("gpu-intel-graphics")

                if gpu_attr:
                    new_attrs.append(gpu_attr)
                    type_counts["gpu"] += 1

                # CPU
                cpu_slug = normalize_cpu(p.cpu_model)
                cpu_attr = get(cpu_slug)

                if not cpu_attr:
                    cpu_attr = get("cpu-core-i3")

                if cpu_attr:
                    new_attrs.append(cpu_attr)
                    type_counts["cpu"] += 1

                # maker
                maker_slug = normalize_maker(p.name)
                maker_attr = get(maker_slug)
                if maker_attr:
                    new_attrs.append(maker_attr)
                    type_counts["maker"] += 1

                # usage
                usage_attr = detect_usage(p, get, cpu_slug, gpu_attr)
                if usage_attr:
                    new_attrs.append(usage_attr)
                    type_counts["usage"] += 1

                unique_attrs = list({a for a in new_attrs if a})
                p.attributes.set(unique_attrs)

                total_attrs += len(unique_attrs)

        # ログ
        self.stdout.write(self.style.SUCCESS("✅ DONE"))
        self.stdout.write(f"📦 Products: {product_count}")
        self.stdout.write(f"🏷 Total Attributes: {total_attrs}")

        for k, v in type_counts.items():
            self.stdout.write(f"  - {k}: {v}")
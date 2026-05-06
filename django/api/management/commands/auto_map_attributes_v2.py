from collections import defaultdict
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import PCProduct, PCAttribute
from api.utils.attribute_loader import sync_attributes_from_tsv
from api.utils.attribute_matcher import match_attribute


# =========================
# memory 判定
# =========================
def detect_memory_attr(memory_gb, get):

    memory_gb = memory_gb or 0

    if memory_gb >= 64:
        return get("mem-64gb-plus")

    elif memory_gb >= 32:
        return get("mem-32gb")

    elif memory_gb >= 16:
        return get("mem-16gb")

    elif memory_gb >= 8:
        return get("mem-8gb")

    return None


# =========================
# storage 判定
# =========================
def detect_storage_attr(storage_gb, get):

    storage_gb = storage_gb or 0

    if storage_gb >= 2000:
        return get("ssd-2tb-plus")

    elif storage_gb >= 1000:
        return get("ssd-1tb")

    elif storage_gb >= 512:
        return get("ssd-512gb")

    elif storage_gb >= 256:
        return get("ssd-256gb")

    return None


# =========================
# usage 判定
# =========================
def detect_usage(p, get, cpu_attr, gpu_attr):

    text = (p.name or "").lower()

    scores = {}

    usage_attrs = PCAttribute.objects.filter(
        attr_type="usage"
    )

    for usage in usage_attrs:

        scores[usage.slug] = 0

        keywords = (usage.search_keywords or "").split(",")

        for kw in keywords:

            kw = kw.strip().lower()

            if not kw:
                continue

            if kw in text:
                scores[usage.slug] += 3

    # -------------------------
    # GPU補正
    # -------------------------
    gpu_score = gpu_attr.order if gpu_attr else 0

    if gpu_score >= 90:
        scores["usage-gaming"] += 3

    elif gpu_score >= 80:
        scores["usage-gaming"] += 2
        scores["usage-creator"] += 1

    elif gpu_score <= 10:
        scores["usage-business"] += 2

    # -------------------------
    # CPU補正
    # -------------------------
    if cpu_attr:

        if cpu_attr.slug in [
            "intel-core-ultra-9",
            "intel-core-i9",
            "amd-ryzen-9",
        ]:
            scores["usage-creator"] += 2
            scores["usage-ai"] += 1

        elif cpu_attr.slug in [
            "intel-core-ultra-7",
            "intel-core-i7",
            "amd-ryzen-7",
        ]:
            scores["usage-creator"] += 1

        elif cpu_attr.slug in [
            "intel-low-end",
            "intel-core-i3",
        ]:
            scores["usage-business"] += 2
            scores["usage-budget"] += 1

    best_slug = max(scores, key=scores.get)

    return get(best_slug)


# =========================
# Command
# =========================
class Command(BaseCommand):

    help = "PC属性 自動マッピング V2（TSV完全版）"

    def handle(self, *args, **options):

        self.stdout.write("🚀 属性V2 TSV START")

        # -------------------------
        # TSV同期
        # -------------------------
        BASE_DIR = Path("/usr/src/app")

        tsv_path = BASE_DIR / "master_data" / "attributes.tsv"

        result = sync_attributes_from_tsv(tsv_path)

        self.stdout.write(
            f"📥 TSV Sync: created={result['created']} updated={result['updated']}"
        )

        # -------------------------
        # attribute map
        # -------------------------
        attrs = PCAttribute.objects.all()

        attr_map = {
            a.slug: a
            for a in attrs
        }

        def get(slug):
            return attr_map.get(slug)

        total_attrs = 0
        type_counts = defaultdict(int)
        product_count = 0

        # =========================
        # MAIN LOOP
        # =========================
        with transaction.atomic():

            for p in PCProduct.objects.all():

                product_count += 1

                new_attrs = []

                # -------------------------
                # GPU
                # -------------------------
                gpu_attr = match_attribute(
                    p.gpu_model,
                    "gpu"
                )

                if not gpu_attr:
                    gpu_attr = get("gpu-intel-graphics")

                if gpu_attr:
                    new_attrs.append(gpu_attr)
                    type_counts["gpu"] += 1

                # -------------------------
                # CPU
                # -------------------------
                cpu_attr = match_attribute(
                    p.cpu_model,
                    "cpu"
                )

                if not cpu_attr:
                    cpu_attr = get("intel-low-end")

                if cpu_attr:
                    new_attrs.append(cpu_attr)
                    type_counts["cpu"] += 1

                # -------------------------
                # maker
                # -------------------------
                maker_attr = match_attribute(
                    p.name,
                    "maker"
                )

                if maker_attr:
                    new_attrs.append(maker_attr)
                    type_counts["maker"] += 1

                # -------------------------
                # memory
                # -------------------------
                memory_attr = detect_memory_attr(
                    p.memory_gb,
                    get
                )

                if memory_attr:
                    new_attrs.append(memory_attr)
                    type_counts["memory"] += 1

                # -------------------------
                # storage
                # -------------------------
                storage_attr = detect_storage_attr(
                    p.storage_gb,
                    get
                )

                if storage_attr:
                    new_attrs.append(storage_attr)
                    type_counts["storage"] += 1

                # -------------------------
                # usage
                # -------------------------
                usage_attr = detect_usage(
                    p,
                    get,
                    cpu_attr,
                    gpu_attr
                )

                if usage_attr:
                    new_attrs.append(usage_attr)
                    type_counts["usage"] += 1

                # -------------------------
                # 保存
                # -------------------------
                unique_attrs = list({
                    a for a in new_attrs
                    if a
                })

                p.attributes.set(unique_attrs)

                total_attrs += len(unique_attrs)

        # =========================
        # LOG
        # =========================
        self.stdout.write(
            self.style.SUCCESS("✅ DONE")
        )

        self.stdout.write(
            f"📦 Products: {product_count}"
        )

        self.stdout.write(
            f"🏷 Total Attributes: {total_attrs}"
        )

        for k, v in type_counts.items():

            self.stdout.write(
                f"  - {k}: {v}"
            )
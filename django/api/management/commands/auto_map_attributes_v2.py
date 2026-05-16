from collections import defaultdict
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import PCProduct, PCAttribute

from api.utils.attribute_loader import (
    sync_attributes_from_tsv
)
from api.utils.attribute_matcher import (
    match_attribute
)
from api.utils.semantic.runtime import (
    run_semantic_runtime
)

# =========================================================
# Memory 判定
# =========================================================
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


# =========================================================
# Storage 判定
# =========================================================
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


# =========================================================
# Weight Feature 判定
# =========================================================
def detect_pc_feature(weight_kg, get):

    weight_kg = weight_kg or 0

    # 超軽量
    if (
        weight_kg > 0
        and weight_kg < 1.0
    ):
        return get("feat-weight-1kg")

    # 軽量
    elif (
        weight_kg >= 1.0
        and weight_kg <= 1.5
    ):
        return get("feat-weight-1-5kg")

    # 標準
    elif (
        weight_kg > 1.5
        and weight_kg <= 2.0
    ):
        return get("feat-weight-2kg")

    return None


# =========================================================
# Usage 判定
# =========================================================
def detect_usage(
    p,
    get,
    cpu_attr,
    gpu_attr
):

    combined_text = " ".join([

        p.name or "",
        p.description or "",
        p.cpu_model or "",
        p.gpu_model or "",

    ]).lower()

    scores = {}

    usage_attrs = PCAttribute.objects.filter(
        attr_type="usage"
    )

    for usage in usage_attrs:

        scores[usage.slug] = 0

        keywords = (
            usage.search_keywords or ""
        ).split(",")

        for kw in keywords:

            kw = kw.strip().lower()

            if not kw:
                continue

            if kw in combined_text:
                scores[usage.slug] += 3

    # =====================================================
    # GPU補正
    # =====================================================
    gpu_score = (
        gpu_attr.order
        if gpu_attr
        else 0
    )

    if gpu_score >= 90:

        scores["usage-gaming"] += 3

    elif gpu_score >= 80:

        scores["usage-gaming"] += 2
        scores["usage-creator"] += 1

    elif gpu_score <= 10:

        scores["usage-business"] += 2

    # =====================================================
    # CPU補正
    # =====================================================
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

    # =====================================================
    # 空安全化
    # =====================================================
    if not scores:
        return None

    # =====================================================
    # Best Usage
    # =====================================================
    best_slug = max(
        scores,
        key=scores.get
    )

    return get(best_slug)


# =========================================================
# Command
# =========================================================
class Command(BaseCommand):

    help = "PC属性 自動マッピング V2（TSV完全版）"

    def handle(self, *args, **options):

        self.stdout.write(
            "🚀 属性V2 TSV START"
        )

        # =================================================
        # TSV同期
        # =================================================
        BASE_DIR = Path("/usr/src/app")

        tsv_path = (
            BASE_DIR
            / "master_data"
            / "attributes.tsv"
        )

        result = sync_attributes_from_tsv(
            tsv_path
        )

        self.stdout.write(

            f"📥 TSV Sync: "
            f"created={result['created']} "
            f"updated={result['updated']}"
        )

        # =================================================
        # Attribute Map
        # =================================================
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

        # =================================================
        # MAIN LOOP
        # =================================================
        with transaction.atomic():

            for p in PCProduct.objects.all():

                product_count += 1

                new_attrs = []
                
                # =========================================================
                # GPU
                # =========================================================
                gpu_attr = match_attribute(
                    p.gpu_model,
                    "gpu"
                )

                # fallback 廃止
                # semantic truth 優先

                if gpu_attr:

                    new_attrs.append(
                        gpu_attr
                    )

                    type_counts["gpu"] += 1


                # =========================================================
                # CPU
                # =========================================================
                cpu_attr = match_attribute(
                    p.cpu_model,
                    "cpu"
                )

                # fallback 廃止
                # semantic truth 優先

                if cpu_attr:

                    new_attrs.append(
                        cpu_attr
                    )

                    type_counts["cpu"] += 1


                # =========================================
                # Maker
                # =========================================
                maker_text = " ".join([

                    p.maker or "",
                    p.name or "",
                    p.description or "",

                ]).lower()

                maker_attr = match_attribute(
                    maker_text,
                    "maker"
                )

                if maker_attr:

                    new_attrs.append(
                        maker_attr
                    )

                    type_counts["maker"] += 1

                    # =====================================
                    # Normalize maker column
                    # =====================================
                    if (
                        not p.maker
                        or
                        p.maker == "unknown"
                    ):

                        p.maker = maker_attr.name


                # =========================================================
                # Memory
                # =========================================================
                memory_attr = detect_memory_attr(
                    p.memory_gb,
                    get
                )

                if memory_attr:

                    new_attrs.append(
                        memory_attr
                    )

                    type_counts["memory"] += 1


                # =========================================================
                # Storage
                # =========================================================
                storage_attr = detect_storage_attr(
                    p.storage_gb,
                    get
                )

                if storage_attr:

                    new_attrs.append(
                        storage_attr
                    )

                    type_counts["storage"] += 1


                # =========================================================
                # PC Feature
                # =========================================================
                pc_feature_attr = detect_pc_feature(

                    getattr(
                        p,
                        "weight_kg",
                        0
                    ),

                    get
                )

                if pc_feature_attr:

                    new_attrs.append(
                        pc_feature_attr
                    )

                    type_counts["pc_feature"] += 1


                # =========================================================
                # Usage
                # =========================================================
                usage_attr = detect_usage(
                    p,
                    get,
                    cpu_attr,
                    gpu_attr
                )

                if usage_attr:

                    new_attrs.append(
                        usage_attr
                    )

                    type_counts["usage"] += 1

                # =========================================
                # Device
                # =========================================
                device_text = " ".join([

                    p.name or "",
                    p.description or "",
                    p.cpu_model or "",
                    p.gpu_model or "",

                ]).lower()

                device_attr = match_attribute(
                    device_text,
                    "device"
                )

                if device_attr:

                    new_attrs.append(
                        device_attr
                    )

                    type_counts["device"] += 1

                # =========================================================
                # Semantic Runtime
                # =========================================================

                semantic_text = " ".join([

                    p.name or "",
                    p.description or "",
                    p.cpu_model or "",
                    p.gpu_model or "",
                    p.maker or "",

                ]).lower()


                # =========================================================
                # Run Semantic Runtime
                # =========================================================

                semantic_result = run_semantic_runtime(
                    semantic_text
                )


                # =========================================================
                # Debug
                # =========================================================

                self.stdout.write(
                    f"\n🧠 SEMANTIC: {p.id}"
                )
                self.stdout.write(
                    str(
                        semantic_result["sorted_scores"]
                    )
                )

                # =========================================================
                # Semantic Threshold
                # =========================================================

                SEMANTIC_THRESHOLD = 0.70


                # =========================================================
                # Apply Semantic Attributes
                # =========================================================

                for slug, score in (

                    semantic_result["sorted_scores"]

                ):

                    if score < SEMANTIC_THRESHOLD:
                        continue

                    attr = get(slug)

                    if not attr:
                        continue

                    new_attrs.append(attr)

                    type_counts[
                        attr.attr_type
                    ] += 1


                # =========================================================
                # Duplicate Safe
                # =========================================================
                unique_attrs = []

                seen = set()

                for a in new_attrs:

                    if not a:
                        continue

                    if a.id in seen:
                        continue

                    seen.add(a.id)

                    unique_attrs.append(a)                

                # =========================================================
                # Save
                # =========================================================
                p.attributes.set(
                    unique_attrs
                )

                # =====================================
                # Save normalized fields
                # =====================================
                p.save(
                    update_fields=[
                        "maker"
                    ]
                )

                total_attrs += len(
                    unique_attrs
                )

        # =================================================
        # LOG
        # =================================================
        self.stdout.write(

            self.style.SUCCESS(
                "✅ DONE"
            )
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
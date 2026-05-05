# /home/maya/shin-dev/shin-vps/django/api/views/pc_stats_view.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Count, Q

from api.models import PCProduct, PCAttribute
import re


# -------------------------
# slug正規化（統一仕様）
# -------------------------
def normalize_slug(text: str) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')


# -------------------------
# GPU表示名の整形（強化版）
# -------------------------
def clean_gpu_name(raw: str) -> str:
    if not raw:
        return ""

    n = raw.strip()

    # NVIDIA系
    n = n.replace("GeForce ", "").replace("NVIDIA ", "")

    # Intel系（CPU混入対策）
    low = n.lower()
    if "intel" in low:
        if "arc" in low:
            return "Intel Arc"
        # CPU系っぽいものは除外
        if "core" in low or "processor" in low:
            return ""
        return "Intel"

    # AMD系（簡易整形）
    n = n.replace("Radeon ", "")

    # Graphics削除
    n = n.replace(" Graphics", "")

    # 空白整理
    n = re.sub(r'\s+', ' ', n).strip()

    return n


# -------------------------
# API
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def pc_sidebar_stats(request):

    base_qs = PCProduct.objects.filter(
        is_active=True,
        unified_genre="PC"
    )

    # -------------------------
    # GPU（属性ベース）
    # -------------------------
    gpu_qs = PCAttribute.objects.filter(
        attr_type="gpu",
        pc_products__is_active=True,
        pc_products__unified_genre="PC"
    ).values("name").annotate(
        count=Count("pc_products", distinct=True)
    ).order_by("-count")

    gpu = []
    seen = set()

    for g in gpu_qs:
        if g["count"] <= 0:
            continue

        clean_name = clean_gpu_name(g["name"])

        # ❌ 空 or ノイズ除外
        if not clean_name:
            continue

        slug = f'gpu-{normalize_slug(clean_name)}'

        # 重複防止（RTX 4060 と RTX4060 等）
        if slug in seen:
            continue

        seen.add(slug)

        gpu.append({
            "name": clean_name,
            "slug": slug,
            "count": g["count"]
        })

    # -------------------------
    # maker
    # -------------------------
    maker_qs = base_qs.values("maker").annotate(
        count=Count("id")
    ).order_by("-count")

    maker_counts = []
    for m in maker_qs:
        name = (m.get("maker") or "").strip()

        if not name:
            continue

        maker_counts.append({
            "name": name.upper(),
            "maker": name,
            "slug": f'maker-{normalize_slug(name)}',
            "count": m["count"]
        })

    return Response({
        "gpu": gpu[:10],
        "maker_counts": maker_counts[:10],
    })
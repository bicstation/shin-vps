# /home/maya/shin-dev/shin-vps/django/api/views/pc_stats_view.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Count

from api.models import PCProduct, PCAttribute
import re


# -------------------------
# slug正規化（統一仕様）
# -------------------------
def normalize_slug(text: str) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)  # 英数字以外 → -
    text = re.sub(r'-+', '-', text)          # 連続-圧縮
    return text.strip('-')                   # 前後-削除


# -------------------------
# GPU表示名の整形
# -------------------------
def clean_gpu_name(raw: str) -> str:
    n = raw

    # NVIDIA系
    n = n.replace("GeForce ", "").replace("NVIDIA ", "")

    # Intel系
    if "intel" in n.lower():
        if "arc" in n.lower():
            return "Intel Arc"
        return "Intel"

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

    base_qs = PCProduct.objects.filter(is_active=True)

    # -------------------------
    # GPU
    # -------------------------
    gpu_qs = PCAttribute.objects.filter(
        attr_type="gpu",
        pc_products__is_active=True
    ).values("name").annotate(
        count=Count("pc_products", distinct=True)
    ).order_by("-count")

    gpu = []
    for g in gpu_qs:
        if g["count"] <= 0:
            continue

        clean_name = clean_gpu_name(g["name"])

        gpu.append({
            "name": clean_name,
            "slug": f'gpu-{normalize_slug(clean_name)}',
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
        if not m["maker"]:
            continue

        maker_counts.append({
            "name": m["maker"].upper(),
            "maker": m["maker"],
            "slug": f'maker-{normalize_slug(m["maker"])}',  # ← 追加（重要）
            "count": m["count"]
        })

    return Response({
        "gpu": gpu[:10],
        "maker_counts": maker_counts[:10],
    })
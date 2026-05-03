from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Count

from api.models import PCProduct, PCAttribute


@api_view(["GET"])
@permission_classes([AllowAny])
def pc_sidebar_stats(request):

    base_qs = PCProduct.objects.filter(is_active=True)

    # GPU
    gpu_qs = PCAttribute.objects.filter(
        attr_type="gpu",
        pc_products__is_active=True
    ).values("name").annotate(
        count=Count("pc_products")
    ).order_by("-count")

    gpu = [
        {
            "name": g["name"],
            "slug": f'gpu-{g["name"].lower().replace(" ", "-")}',
            "count": g["count"]
        }
        for g in gpu_qs if g["count"] > 0
    ]

    # maker
    maker_qs = base_qs.values("maker").annotate(
        count=Count("id")
    ).order_by("-count")

    maker_counts = [
        {
            "name": m["maker"].upper(),
            "maker": m["maker"],
            "count": m["count"]
        }
        for m in maker_qs if m["maker"]
    ]

    return Response({
        "gpu": gpu[:10],
        "maker_counts": maker_counts[:10],
    })
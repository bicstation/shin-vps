from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models import PCProduct
from api.serializers.pc_product_serializer import PCProductSerializer


# -------------------------
# 🥇 ランキング
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def pc_product_ranking(request):

    use = request.GET.get("use", "score")

    qs = PCProduct.objects.all()

    # 用途別ソート（ここ後で強化できる）
    if use == "gaming":
        qs = qs.order_by("-score_gpu")
    elif use == "work":
        qs = qs.order_by("-score_cpu")
    else:
        qs = qs.order_by("-spec_score")

    qs = qs[:20]

    serializer = PCProductSerializer(qs, many=True)
    return Response(serializer.data)


# -------------------------
# 📄 個別
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])

def pc_product_detail(request, unique_id):

    # print("DETAIL HIT:", unique_id)

    try:
        product = PCProduct.objects.get(unique_id=unique_id)

        # 👇 これに変更
        return Response({
            "id": product.id,
            "unique_id": product.unique_id,
            "name": product.name,
        })

    except Exception as e:
        print("ERROR:", e)
        return Response({"error": str(e)}, status=500)
    
# def pc_product_detail(request, unique_id):
    
#     print("DETAIL HIT:", unique_id)  # ←追加

#     try:
#         product = PCProduct.objects.get(unique_id=unique_id)

#         serializer = PCProductSerializer(product)
#         return Response(serializer.data)

#     except PCProduct.DoesNotExist:
#         return Response({"error": "not found"}, status=404)
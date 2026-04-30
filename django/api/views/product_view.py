from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from api.models.product import Product
from api.models import PCProduct
from api.serializers.product_serializer import ProductSerializer


# -------------------------
# ランキングAPI
# -------------------------
class ProductRankingView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):

        qs = Product.objects.filter(
            is_active=True,
            is_visible=True
        ).order_by('-ranking_score')[:10]

        products = list(qs)

        for i, p in enumerate(products, start=1):
            p.rank = i

        serializer = ProductSerializer(
            products,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)


# -------------------------
# 詳細API
# -------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_detail(request, unique_id):

    product = Product.objects.filter(
        unique_id=unique_id,
        is_active=True,
        is_visible=True
    ).select_related('pc_product').first()

    if not product:
        return Response({"error": "Product not found"}, status=404)

    pc = product.pc_product or PCProduct.objects.filter(unique_id=product.external_id).first()

    if not pc:
        return Response({"error": "pc_product not found"}, status=404)

    serializer = ProductSerializer(product, context={"request": request})

    return Response(serializer.data)


# -------------------------
# 関連商品API
# -------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def get_related_products(request, unique_id):

    product = Product.objects.filter(
        unique_id=unique_id,
        is_active=True,
        is_visible=True
    ).select_related('pc_product').first()

    if not product:
        return Response([], status=200)

    base = product.pc_product or PCProduct.objects.filter(unique_id=product.external_id).first()

    if not base:
        return Response([], status=200)

    try:
        price = int(base.price or 0)
    except Exception:
        price = 0

    if price <= 0:
        price_min, price_max = 0, 10**12
    else:
        price_min, price_max = int(price * 0.7), int(price * 1.3)

    qs = PCProduct.objects.filter(
        price__gte=price_min,
        price__lte=price_max
    ).exclude(unique_id=base.unique_id)[:6]

    data = []

    for p in qs:
        image = p.image_url or "/static/no-image.png"

        if image.startswith("/"):
            image = request.build_absolute_uri(image)

        data.append({
            "unique_id": p.unique_id,
            "title": p.name or "",
            "image": image,
            "price": p.price or 0,
            "url": p.url or "",
        })

    return Response(data)


# -------------------------
# タグ抽出（Serializer流用）
# -------------------------
def get_tags(product, request):
    s = ProductSerializer(product, context={"request": request})
    return s.data.get("tags", [])


# -------------------------
# 理由生成（CV向上）
# -------------------------
def build_reason(tags, price):
    reasons = []

    if any("RTX" in t for t in tags):
        reasons.append("高性能GPU搭載でゲームに最適")

    if any("32GB" in t for t in tags):
        reasons.append("大容量メモリで作業も快適")

    if price and price < 250000:
        reasons.append("この性能でコスパが高い")

    return "・".join(reasons) or "バランスの良いおすすめモデル"


# -------------------------
# 診断API（最終完成版）
# -------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def diagnose_pc(request):

    purpose = (request.data.get("purpose") or "").lower()
    budget = (request.data.get("budget") or "").lower()

    # -------------------------
    # ベースクエリ（最適化）
    # -------------------------
    base_qs = Product.objects.filter(
        is_active=True,
        is_visible=True,
        price__isnull=False
    ).prefetch_related("attributes")

    # -------------------------
    # 用途フィルタ（強化版）
    # -------------------------
    qs = base_qs
    
    print("BASE:", base_qs.count())
    print("AFTER PURPOSE:", qs.count())
    
    
    if purpose == "gaming":

        qs = qs.annotate(
            purpose_score=Case(
                # 🔥 最強GPU
                When(attributes__name__icontains="4090", then=Value(100)),
                When(attributes__name__icontains="4080", then=Value(90)),
                When(attributes__name__icontains="4070", then=Value(80)),

                # GPUあり
                When(attributes__name__icontains="RTX", then=Value(70)),
                When(attributes__name__icontains="GeForce", then=Value(60)),

                # ゲーミングキーワード
                When(title__icontains="ゲーミング", then=Value(50)),
                
                # 💡 ノートは減点（ここが今回のポイント）
                When(title__icontains="ノート", then=Value(30)),

                default=Value(0),
                output_field=IntegerField()
            )
        )


    elif purpose == "business":

        qs = qs.annotate(
            purpose_score=Case(
                When(attributes__name__icontains="Core i7", then=Value(80)),
                When(attributes__name__icontains="Core i5", then=Value(70)),
                When(attributes__name__icontains="Ryzen 7", then=Value(80)),
                When(attributes__name__icontains="Ryzen 5", then=Value(70)),

                When(title__icontains="ビジネス", then=Value(60)),

                default=Value(0),
                output_field=IntegerField()
            )
        )
          



    elif purpose == "creative":

        qs = qs.annotate(
            purpose_score=Case(
                When(attributes__name__icontains="4090", then=Value(100)),
                When(attributes__name__icontains="4080", then=Value(90)),
                When(attributes__name__icontains="32GB", then=Value(80)),

                When(title__icontains="クリエイター", then=Value(70)),

                default=Value(0),
                output_field=IntegerField()
            )
        )


    # -------------------------
    # fallback（重要）
    # -------------------------
    if not qs.exists():
        qs = base_qs.annotate(
            purpose_score=Value(1, output_field=IntegerField())
        )

    # -------------------------
    # 重複除去
    # -------------------------
    qs = qs.distinct()

    # -------------------------
    # fallback（重要）
    # -------------------------
    if not qs.exists():
        qs = base_qs

    # -------------------------
    # 価格フィルタ
    # -------------------------
    tmp_qs = qs
    print("BEFORE PRICE:", tmp_qs.count(
    
    if budget == "low":
        qs = qs.filter(price__lte=150000)

    elif budget == "mid":
        qs = qs.filter(price__gt=150000, price__lte=300000)

    elif budget == "high":
        qs = qs.filter(price__gt=300000)
        
    # 価格フィルタ後
    if budget == "low":
        tmp_qs = tmp_qs.filter(price__lte=150000)
    elif budget == "mid":
        tmp_qs = tmp_qs.filter(price__gt=150000, price__lte=300000)
    elif budget == "high":
        tmp_qs = tmp_qs.filter(price__gt=300000)

    print("AFTER PRICE:", tmp_qs.count())
    

    # fallback（価格）
    if not qs.exists():
        qs = base_qs

    # -------------------------
    # ソート
    # -------------------------
    qs = qs.order_by("-purpose_score", "-ranking_score")

    best = qs.first()

    if not best:
        return Response({
            "best": None,
            "alternatives": []
        })

    alternatives = qs.exclude(id=best.id)[:3]

    context = {"request": request}

    # -------------------------
    # reason生成
    # -------------------------
    def build_reason(tags, price):
        reasons = []

        if any("RTX" in t for t in tags):
            reasons.append("高性能GPU搭載でゲームに最適")

        if any("32GB" in t for t in tags):
            reasons.append("大容量メモリで作業も快適")

        if price and price < 250000:
            reasons.append("この性能でコスパが高い")

        return "・".join(reasons) or "バランスの良いおすすめモデル"

    # -------------------------
    # レスポンス生成
    # -------------------------
    best_data = ProductSerializer(best, context=context).data
    best_data["reason"] = build_reason(
        best_data.get("tags", []),
        best_data.get("price")
    )

    alt_data = []
    for p in alternatives:
        data = ProductSerializer(p, context=context).data
        data["reason"] = build_reason(
            data.get("tags", []),
            data.get("price")
        )
        alt_data.append(data)

    return Response({
        "best": best_data,
        "alternatives": alt_data
    })
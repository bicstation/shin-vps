# api/views/ranking_view.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from api.models import Product
from api.serializers.product_serializer import ProductSerializer


class RankingAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, slug=None):

        use = request.GET.get("use", "light")

        qs = Product.objects.filter(
            is_active=True,
            is_visible=True
        ).select_related('pc_product').prefetch_related('attributes')

        # -------------------------
        # 🔥 slug優先フィルタ（最優先）
        # -------------------------
        if slug:

            if slug.startswith("gpu-"):
                gpu = slug.replace("gpu-", "")
                qs = qs.filter(attributes__slug__icontains=gpu)

            elif slug.startswith("maker-"):
                maker = slug.replace("maker-", "")
                qs = qs.filter(maker__iexact=maker)

        else:
            # -------------------------
            # 用途フィルタ（slugがないときだけ）
            # -------------------------
            if use == "gaming":
                qs = qs.filter(attributes__slug="usage-gaming")
            elif use == "work":
                qs = qs.filter(attributes__slug="usage-business")
            elif use == "light":
                qs = qs.filter(attributes__slug="usage-home")

        # -------------------------
        # スコア計算
        # -------------------------
        from django.db.models import F, FloatField, ExpressionWrapper

        qs = qs.annotate(
            final_score=ExpressionWrapper(
                F('pc_product__spec_score') * 0.6 +
                F('pc_product__score_cost') * 0.4,
                output_field=FloatField()
            )
        ).order_by('-final_score')[:10]

        products = list(qs)

        for i, p in enumerate(products, start=1):
            p.rank = i

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
# api/views/ranking_view.py

class RankingAPIView(APIView):

    def get(self, request):

        use = request.GET.get("use", "light")
        gpu = request.GET.get("gpu")

        qs = Product.objects.filter(
            is_active=True,
            is_visible=True
        ).select_related('pc_product').prefetch_related('attributes')

        # 用途
        if use == "gaming":
            qs = qs.filter(attributes__slug="usage-gaming")
        elif use == "work":
            qs = qs.filter(attributes__slug="usage-business")
        elif use == "light":
            qs = qs.filter(attributes__slug="usage-home")

        # GPU
        if gpu:
            qs = qs.filter(attributes__slug=gpu)

        # スコア
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
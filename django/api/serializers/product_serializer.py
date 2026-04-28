# api/serializers/product_serializer.py

from rest_framework import serializers
from django.utils import timezone
from api.models.product import Product


class ProductSerializer(serializers.ModelSerializer):
    image = serializers.CharField(source='thumbnail_url', default="")
    url = serializers.CharField(source='affiliate_url', default="")
    genre = serializers.SerializerMethodField()
    actress = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'image',
            'price',
            'url',
            'genre',
            'actress',
            'ranking_score',
            'label',
            'tags',
        ]

    # -----------------
    # genre
    # -----------------
    def get_genre(self, obj):
        g = obj.genres.first()
        return g.name if g else ""

    # -----------------
    # actress
    # -----------------
    def get_actress(self, obj):
        a = obj.actresses.first()
        return a.name if a else ""

    # -----------------
    # label（強化版）
    # -----------------
    
    def get_label(self, obj):
        score = obj.ranking_score or 0
        price = obj.price or 0

        if score >= 95:
            return "🔥 人気No.1"

        if score >= 90:
            return "⭐ 高評価"

        if price > 0 and price < 300000:
            return "💰 コスパ良"

        if obj.created_at:
            if (timezone.now() - obj.created_at).days <= 7:
                return "🆕 新着"

        return ""
    
    
    def get_tags(self, obj):
        attrs = list(obj.attributes.all())

        grouped = {}

        for a in attrs:
            grouped.setdefault(a.attr_type, []).append(a)

        result = []

        for t, items in grouped.items():

            # -----------------
            # CPU
            # -----------------
            if t == "cpu":
                items = sorted(items, key=lambda x: x.order or 0, reverse=True)
                result.append(items[0].name)

            # -----------------
            # GPU（専用ロジック）
            # -----------------
            elif t == "gpu":

                def gpu_score(x):
                    name = x.name.lower()

                    if "5090" in name: return 110
                    if "5080" in name: return 105
                    if "5070 ti" in name: return 100
                    if "5070" in name: return 95

                    if "4090" in name: return 92
                    if "4080" in name: return 88
                    if "4070 ti" in name: return 85
                    if "4070" in name: return 82
                    if "4060 ti" in name: return 78
                    if "4060" in name: return 75
                    if "4050" in name: return 70

                    if "radeon" in name: return 60
                    if "arc" in name: return 50

                    # 内蔵GPUは最弱
                    if "intel" in name: return 1

                    return 0

                items = sorted(items, key=gpu_score, reverse=True)
                result.append(items[0].name)

            # -----------------
            # メモリ / VRAM
            # -----------------
            elif t in ["memory", "vram"]:
                items = sorted(items, key=lambda x: x.order or 0, reverse=True)
                result.append(items[0].name)

            # -----------------
            # その他（MULTI）
            # -----------------
            else:
                for i in items:
                    result.append(i.name)

        return result   

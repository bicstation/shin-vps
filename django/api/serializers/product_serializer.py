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

        # 🔥 最上位
        if score >= 95:
            return "🔥 人気No.1"

        # ⭐ 高評価
        if score >= 90:
            return "⭐ 高評価"

        # 💰 コスパ
        if price > 0 and price < 300000:
            return "💰 コスパ良"

        # 🆕 新着（7日以内）
        if obj.created_at:
            if (timezone.now() - obj.created_at).days <= 7:
                return "🆕 新着"

        return ""
    
    def get_tags(self, obj):
        return [
            attr.name
            for attr in obj.attributes.all().order_by('order')[:5]
        ]
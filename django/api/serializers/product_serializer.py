# api/serializers/product_serializer.py

from rest_framework import serializers
from api.models.product import Product
from django.conf import settings


class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    url = serializers.CharField(source='affiliate_url', default="")
    genre = serializers.SerializerMethodField()
    actress = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'unique_id',
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
    # label（強化）
    # -----------------
    def get_label(self, obj):

        if getattr(obj, "rank", None) == 1:
            return "🔥 迷ったらこれ"

        tags = self.get_tags(obj)
        price = obj.price or 0

        # GPU
        if any("5090" in t or "5080" in t for t in tags):
            return "👑 最強スペック"

        if any("5070" in t or "4070" in t for t in tags):
            return "🎮 ゲーミング最適"

        # CPU
        if any("core i9" in t.lower() or "ryzen 9" in t.lower() for t in tags):
            return "⚡ ハイエンド"

        # コスパ
        if price < 250000:
            return "💰 コスパ良"

        return ""

    # -----------------
    # image（完全安定版）
    # -----------------
    def get_image(self, obj):
        request = self.context.get("request")

        image = None

        if obj.image_local:
            try:
                image = obj.image_local.url
            except Exception:
                image = None

        if not image:
            image = obj.image_source or obj.thumbnail_url or "/no-image.jpg"

        # 🔥 絶対URL化（超重要）
        if image.startswith("/"):
            if request:
                return request.build_absolute_uri(image)

            base = getattr(settings, "SITE_URL", "")
            return f"{base}{image}" if base else image

        return image

    # -----------------
    # tags（安定版）
    # -----------------
    def get_tags(self, obj):
        attrs = list(obj.attributes.all())

        grouped = {}
        for a in attrs:
            grouped.setdefault(a.attr_type, []).append(a)

        result = []

        for t, items in grouped.items():

            # CPU
            if t == "cpu":
                items = sorted(items, key=lambda x: x.order or 0, reverse=True)
                result.append(items[0].name)

            # GPU
            elif t == "gpu":
                def gpu_score(x):
                    name = x.name.lower()
                    if "5090" in name: return 110
                    if "5080" in name: return 105
                    if "5070" in name: return 95
                    if "4090" in name: return 92
                    if "4080" in name: return 88
                    if "4070" in name: return 82
                    if "4060" in name: return 75
                    return 0

                items = sorted(items, key=gpu_score, reverse=True)

                gpu_name = items[0].name.replace("GeForce ", "").replace("NVIDIA ", "")
                result.append(gpu_name)

            # メモリ
            elif t in ["memory", "vram"]:
                items = [i for i in items if "8gb" not in i.name.lower()]

                if not items:
                    continue

                items = sorted(items, key=lambda x: x.order or 0, reverse=True)

                raw_name = items[0].name
                clean_name = raw_name.replace("（標準）", "").replace("（大容量）", "")
                result.append(clean_name)

        # 優先順位
        priority = ["rtx", "core i9", "core i7", "32gb", "16gb"]

        result = sorted(
            result,
            key=lambda t: next((i for i, p in enumerate(priority) if p in t.lower()), 99)
        )

        # NG除外
        NG_WORDS = ["8gb", "4gb", "最低限", "以下"]

        result = [
            t for t in result
            if not any(x in t.lower() for x in NG_WORDS)
        ]

        return result[:3]
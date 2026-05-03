from rest_framework import serializers
from api.models import PCProduct


class PCProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = PCProduct
        fields = [
            "id",
            "unique_id",
            "name",
            "price",
            "url",
            "image_url",

            # スペック
            "cpu_model",
            "gpu_model",
            "memory_gb",
            "storage_gb",

            # スコア
            "score_cpu",
            "score_gpu",
            "score_cost",
            "score_portable",
            "score_ai",
            "spec_score",

            # AI
            "ai_summary",
            "ai_content",

            # レーダー
            "radar_chart",
        ]
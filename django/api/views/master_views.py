# -*- coding: utf-8 -*-
from rest_framework import generics, status
from rest_framework.response import Response
from django.utils.text import slugify
from django.db.models import Count
from api.models import Genre, Maker, Actress, Label
# シリアライザーは後ほど作成するパッケージからインポート
# from api.serializers.adult_serializers import GenreSerializer ...

class BaseMasterListView(generics.ListAPIView):
    """
    💡 マスターデータ取得の基底クラス
    AI解析スコアや製品カウントに基づいたフィルタリングを標準装備
    """
    def get_queryset(self):
        # 0件のものを表示したくない、またはAI解析済みのものを優先するロジック
        return self.model.objects.annotate(
            total_products=Count('adultproduct')
        ).filter(total_products__gt=0).order_by('-total_products')

class GenreListAPIView(BaseMasterListView):
    queryset = Genre.objects.all()
    # serializer_class = GenreSerializer

class MakerListAPIView(BaseMasterListView):
    queryset = Maker.objects.all()
    # serializer_class = MakerSerializer

# --- 🚀 ここからが「名寄せ」の心臓部 ---

def get_or_create_normalized_entity(model, name, raw_source=None):
    """
    💡 名寄せ関数: 
    名前の表記揺れを吸収し、DBに1つしかない状態を維持する
    """
    if not name:
        return None
    
    # 1. 正規化 (トリミング、大文字化など)
    clean_name = name.strip()
    
    # 2. 既存チェック (大文字小文字を区別しない一致)
    instance = model.objects.filter(name__iexact=clean_name).first()
    
    if not instance:
        # なければ作成
        # スラッグ重複回避のためユニークな値を生成
        base_slug = slugify(clean_name) or "unnamed"
        instance = model.objects.create(
            name=clean_name,
            slug=f"{base_slug}-{raw_source.lower()}" if raw_source else base_slug
        )
        created = True
    else:
        created = False
        
    return instance
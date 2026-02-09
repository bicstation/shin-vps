# -*- coding: utf-8 -*-
from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from api.models import (
    Actress, Genre, Maker, Label, Director, Series, Author
)
from api.serializers import (
    ActressSerializer, GenreSerializer, MakerSerializer, 
    LabelSerializer, DirectorSerializer, SeriesSerializer, AuthorSerializer
)

# --------------------------------------------------------------------------
# 0. 基底クラス (コードの重複を避け、機能を統一)
# --------------------------------------------------------------------------

class MasterEntityListView(generics.ListAPIView):
    """
    マスタデータ取得の共通ベースクラス。
    サイドバーやフィルタリング用の選択肢として利用することを想定し、
    一括取得（pagination_class = None）を維持しつつ、検索機能を提供します。
    """
    permission_classes = [AllowAny]
    pagination_class = None  # 全件取得（サイドバー等のリスト用）
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug', 'ruby'] # フロントエンドからのクイック検索用
    ordering = ['name']

# --------------------------------------------------------------------------
# 1. 各マスタデータ View 実装
# --------------------------------------------------------------------------

class ActressListAPIView(MasterEntityListView):
    """女優一覧"""
    queryset = Actress.objects.all()
    serializer_class = ActressSerializer

class GenreListAPIView(MasterEntityListView):
    """ジャンル一覧"""
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class MakerListAPIView(MasterEntityListView):
    """メーカー一覧"""
    queryset = Maker.objects.all()
    serializer_class = MakerSerializer

class LabelListAPIView(MasterEntityListView):
    """レーベル一覧"""
    queryset = Label.objects.all()
    serializer_class = LabelSerializer

class DirectorListAPIView(MasterEntityListView):
    """監督一覧"""
    queryset = Director.objects.all()
    serializer_class = DirectorSerializer

class SeriesListAPIView(MasterEntityListView):
    """シリーズ一覧"""
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

class AuthorListAPIView(MasterEntityListView):
    """著者一覧 (FANZA電子書籍等用)"""
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
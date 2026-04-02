# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/views/article_view.py
import logging
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from ..models.article import Article
from ..serializers.article_serializer import ArticleSerializer, ArticleDetailSerializer

logger = logging.getLogger(__name__)

class StandardPagination(PageNumberPagination):
    """ページネーションにより、一度に大量のデータを読み込む事故を防止"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ArticleViewSet(viewsets.ModelViewSet):
    """
    🔱 BICSTATION API v5.0 [ULTIMATE STABLE - Physical Filter Edition]
    🛡️ 修正内容:
    - v5.0新モデルに対応（is_adult, show_on_main, body_main 等）
    - extra_metadata 依存のフィルタリングを廃止し、物理カラムによる爆速検問を実装
    - 一般サイト（Bic Station等）へのアダルト混入を DB レベルで完全に遮断
    """
    serializer_class = ArticleSerializer
    pagination_class = StandardPagination
    
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    # 物理カラムによるフィルタリングを有効化
    filterset_fields = ['site', 'is_adult', 'show_on_main', 'show_on_satellite', 'is_exported', 'content_type']
    search_fields = ['title'] 
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """アクションに応じてシリアライザーを動的に切り替える"""
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ArticleDetailSerializer
        return ArticleSerializer

    def get_queryset(self):
        """
        ⚡ 物理カラムによる超高速クエリロジック
        """
        # 1. 基礎クエリと defer (一覧時は重いテキストカラムを除外)
        queryset = Article.objects.all()
        if self.action == 'list':
            # v5.0 では body_main と body_satellite を除外して軽量化
            queryset = queryset.defer('body_main', 'body_satellite')

        # 2. プロジェクト識別 (ミドルウェアまたはクエリパラメータから取得)
        project_id = getattr(self.request, 'project_id', None)
        if not project_id or project_id == 'default':
            project_id = self.request.query_params.get('project')

        # 🛡️ 一般サイト（健全サイト）のリスト
        GENERAL_PROJECTS = ['bicstation', 'saving', 'bicstation-host', 'saving-host', 'news']

        # 3. 配信ロジックの適用
        if project_id and project_id != 'default':
            # 基本は対象サイトで絞り込み
            queryset = queryset.filter(site=project_id)
            
            # ✅ 一般サイト向け：アダルトを「物理カラム」で完全に排除
            if project_id in GENERAL_PROJECTS:
                queryset = queryset.filter(is_adult=False, show_on_main=True)
            
            # ✅ アダルトサイト向け：アダルト属性のみを配信
            else:
                queryset = queryset.filter(is_adult=True)

        # 4. 並び替え (スライスは Pagination に任せる)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """保存時に site 情報を自動付与し、用途を判定"""
        project_id = getattr(self.request, 'project_id', 'default')
        
        # 保存時のデフォルト属性を設定
        if project_id in ['bicstation', 'saving']:
            serializer.save(site=project_id, is_adult=False, show_on_main=True)
        elif project_id in ['tiper', 'avflash']:
            serializer.save(site=project_id, is_adult=True, show_on_main=True)
        else:
            serializer.save()

    @action(detail=False, methods=['post'], url_path='bulk-export-done')
    def bulk_mark_as_exported(self, request):
        """一括公開済み更新"""
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response({"error": "ids list required"}, status=status.HTTP_400_BAD_REQUEST)
        
        project_id = getattr(self.request, 'project_id', None)
        update_filter = {"id__in": ids}
        if project_id and project_id != 'default':
            update_filter["site"] = project_id

        updated_count = Article.objects.filter(**update_filter).update(is_exported=True)
        return Response({
            "status": "success",
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='check-source')
    def check_source_exists(self, request):
        """URL重複チェック (全サイト横断またはサイト別)"""
        url = request.query_params.get('url')
        site = request.query_params.get('site')
        if not url:
            return Response({"error": "url required"}, status=400)
            
        filters = Q(source_url=url)
        if site:
            filters &= Q(site=site)
            
        exists = Article.objects.filter(filters).exists()
        return Response({"exists": exists, "source_url": url})
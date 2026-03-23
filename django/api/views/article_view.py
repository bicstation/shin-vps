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
    """ページネーションを強制し、一度に数千件読み込む事故を防ぐ"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ArticleViewSet(viewsets.ModelViewSet):
    """
    🔱 BICSTATION API v41.6 [ULTIMATE STABLE - High Performance Edition]
    🛡️ 修正内容:
    - TypeError: Cannot reorder a query once a slice has been taken. を完全解消
    - 手動スライスを廃止し、StandardPagination に件数制御を委譲
    - フィルタリングと並び替えの整合性を確保
    """
    serializer_class = ArticleSerializer
    pagination_class = StandardPagination
    
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    filterset_fields = ['site', 'is_exported', 'content_type']
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
        ⚡ 超高速クエリロジック (Fix: Remove manual slicing)
        """
        # 1. 基礎クエリと defer (一覧時の軽量化)
        queryset = Article.objects.all()
        if self.action == 'list':
            queryset = queryset.defer('body_text')

        # 2. 基本の並び順（スライス前に行う必要がある）
        queryset = queryset.order_by('-created_at')

        # 3. プロジェクト識別
        project_id = getattr(self.request, 'project_id', None)
        if not project_id or project_id == 'default':
            project_id = self.request.query_params.get('project')

        # 🛡️ 一般サイト（健全サイト）のリスト
        GENERAL_PROJECTS = ['bicstation', 'saving', 'bicstation-host', 'saving-host', 'news']

        # 4. フィルタリング実行
        if project_id and project_id != 'default':
            queryset = queryset.filter(site=project_id)
            
            # ✅ 一般サイトならアダルト排除
            if project_id in GENERAL_PROJECTS:
                queryset = queryset.exclude(extra_metadata__is_adult=True)
        
        # ⚠️ 【重要修正】ここで手動スライス (queryset[:100]) を行うと、
        # DRFのPaginationやOrderingFilterと衝突して500エラーになるため削除しました。
        # 件数制限は StandardPagination (page_size=20) が安全に行います。

        return queryset

    def perform_create(self, serializer):
        """保存時に site 情報を自動付与"""
        project_id = getattr(self.request, 'project_id', 'default')
        if project_id != 'default':
            serializer.save(site=project_id)
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
        """URL重複チェック"""
        url = request.query_params.get('url')
        if not url:
            return Response({"error": "url required"}, status=400)
            
        exists = Article.objects.filter(source_url=url).exists()
        return Response({"exists": exists, "source_url": url})
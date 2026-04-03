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
    🔱 BICSTATION API v5.1 [SHIN-VPS FINAL - Domain Matching Edition]
    🛡️ 修正内容:
    - Middleware の判定結果(project_id)に基づき、各サイトに最適な記事を物理カラムでフィルタ。
    - 一般サイト/アダルトサイトの判定リストを v3.9 の実環境に完全適合。
    - 判定漏れ時に「全件アダルト」になる危険な else 処理を回避。
    """
    serializer_class = ArticleSerializer
    pagination_class = StandardPagination
    
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
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
        ⚡ プロジェクト別の配信フィルタリングロジック
        """
        # 1. 基礎クエリ
        queryset = Article.objects.all()
        if self.action == 'list':
            queryset = queryset.defer('body_main', 'body_satellite')

        # 2. プロジェクト識別
        project_id = getattr(self.request, 'project_id', 'default')
        
        # 🛡️ 判定グループの定義 (ドメイン名・ホスト名・プロジェクト名を網羅)
        GENERAL_PROJECTS = ['bicstation', 'saving', 'bicstation-host', 'saving-host', 'news', 'bic-saving']
        ADULT_PROJECTS = ['tiper', 'avflash', 'tiper-host', 'avflash-host']

        # 3. 配信ロジックの適用
        # ✅ 一般サイト向け：アダルト排除 ＋ 一般記事のみ
        if project_id in GENERAL_PROJECTS:
            queryset = queryset.filter(is_adult=False, show_on_main=True)
            # さらに site が特定されている場合は絞り込む（混合を防ぐ場合）
            # queryset = queryset.filter(site__in=['bicstation', 'saving', 'news'])

        # ✅ アダルトサイト向け：アダルト属性のみを配信
        elif project_id in ADULT_PROJECTS:
            queryset = queryset.filter(is_adult=True)

        # ✅ それ以外（管理画面や判定不能時）
        else:
            # クエリパラメータ ?project= があればそれを優先
            param_project = self.request.query_params.get('project')
            if param_project in GENERAL_PROJECTS:
                queryset = queryset.filter(is_adult=False)
            elif param_project in ADULT_PROJECTS:
                queryset = queryset.filter(is_adult=True)
            # パラメータもなければ全件表示（管理画面用）

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """保存時に site 情報を自動付与"""
        project_id = getattr(self.request, 'project_id', 'default')
        
        if project_id in ['bicstation', 'saving', 'bicstation-host', 'saving-host']:
            serializer.save(site=project_id, is_adult=False, show_on_main=True)
        elif project_id in ['tiper', 'avflash', 'tiper-host', 'avflash-host']:
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
        """URL重複チェック"""
        url = request.query_params.get('url')
        site = request.query_params.get('site')
        if not url:
            return Response({"error": "url required"}, status=400)
            
        q_filter = Q(source_url=url)
        if site:
            q_filter &= Q(site=site)
            
        exists = Article.objects.filter(q_filter).exists()
        return Response({"exists": exists, "source_url": url})
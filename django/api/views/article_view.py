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
    🔱 BICSTATION API v5.2 [SHIN-VPS FINAL - Domain Matching Edition]
    🛡️ 修正内容:
    - 外部からの 'site' クエリパラメータを最優先で受け付けるよう get_queryset を強化。
    - Middleware の project_id とクエリパラメータの site を統合し、正確なサイト記事を抽出。
    - フィルタリングの優先順位を整理し、NO_DATA 事故を防止。
    """
    serializer_class = ArticleSerializer
    pagination_class = StandardPagination
    
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    # site を含めることで DjangoFilterBackend が自動的に ?site=... を処理可能にする
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
        ⚡ プロジェクト別の配信フィルタリングロジック (統合修正版)
        """
        # 1. 基礎クエリ
        queryset = Article.objects.all()
        if self.action == 'list':
            queryset = queryset.defer('body_main', 'body_satellite')

        # 2. パラメータ及び識別子の取得
        # Middlewareからの識別子
        project_id = getattr(self.request, 'project_id', 'default')
        # クエリパラメータからの直接指定 (site または project)
        param_site = self.request.query_params.get('site') or self.request.query_params.get('project')
        
        # ターゲットとなる識別子を確定 (パラメータがあればそれを優先)
        target_id = param_site if param_site else project_id

        # 🛡️ 判定グループの定義
        GENERAL_PROJECTS = ['bicstation', 'saving', 'bicstation-host', 'saving-host', 'news', 'bic-saving']
        ADULT_PROJECTS = ['tiper', 'avflash', 'tiper-host', 'avflash-host']

        # 3. 配信ロジックの適用
        if target_id in GENERAL_PROJECTS:
            # 一般サイト: アダルト排除 + メイン表示ON
            queryset = queryset.filter(is_adult=False, show_on_main=True)
            
            # 🎯 重要: 'bicstation-host' などの場合は DB上の 'bicstation' にマッピングしてフィルタ
            site_filter = target_id.replace('-host', '')
            if site_filter in ['bicstation', 'saving']:
                 queryset = queryset.filter(site=site_filter)

        elif target_id in ADULT_PROJECTS:
            # アダルトサイト: アダルト属性のみ
            queryset = queryset.filter(is_adult=True)
            site_filter = target_id.replace('-host', '')
            queryset = queryset.filter(site=site_filter)

        # 4. DjangoFilterBackend による後続フィルタ (?site= 等) を有効にするため queryset を返す
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """保存時に site 情報を自動付与"""
        project_id = getattr(self.request, 'project_id', 'default')
        site_val = project_id.replace('-host', '')
        
        if project_id in ['bicstation', 'saving', 'bicstation-host', 'saving-host']:
            serializer.save(site=site_val, is_adult=False, show_on_main=True)
        elif project_id in ['tiper', 'avflash', 'tiper-host', 'avflash-host']:
            serializer.save(site=site_val, is_adult=True, show_on_main=True)
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
            update_filter["site"] = project_id.replace('-host', '')

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
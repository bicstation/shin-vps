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
    🔱 BICSTATION API v5.4 [DIAGNOSTICS EDITION]
    🛡️ 修正内容:
    - 導線診断ログ (ROUTE DIAGNOSTICS) を搭載。
    - 全ドメイン対応の「洗浄エンジン」によるマルチテナント配信。
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
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ArticleDetailSerializer
        return ArticleSerializer

    def get_queryset(self):
        """
        ⚡ 全ドメイン・マルチテナント自動判定ロジック + 導線診断
        """
        # 1. 基礎クエリ
        queryset = Article.objects.all()
        if self.action == 'list':
            queryset = queryset.defer('body_main', 'body_satellite')

        # 2. 識別子の取得
        project_id = getattr(self.request, 'project_id', 'default')
        param_site = self.request.query_params.get('site') or self.request.query_params.get('project')
        raw_target = (param_site if param_site else project_id).lower()

        # 🎯 3. 「ドメイン洗浄」エンジン
        clean_id = raw_target.replace('api.', '').replace('api-', '').replace('-host', '').split('.')[0]
        
        # 🛡️ 4. グループ判定ロジック
        GENERAL_KEYS = ['station', 'saving', 'news']
        ADULT_KEYS = ['tiper', 'avflash', 'erog', 'adult']

        # 🌊 5. 配信フィルタリング実行
        site_val = "unknown"
        if any(k in clean_id for k in GENERAL_KEYS):
            site_val = 'saving' if 'saving' in clean_id else 'bicstation'
            queryset = queryset.filter(is_adult=False, show_on_main=True, site=site_val)
            
        elif any(k in clean_id for k in ADULT_KEYS):
            site_val = 'tiper' if 'tiper' in clean_id else 'avflash'
            queryset = queryset.filter(is_adult=True, site=site_val)
        
        else:
            site_val = clean_id
            queryset = queryset.filter(site=clean_id)

        # 🚀 6. 導線を表示するログ (提督用診断用)
        # ※ site_filter 変数名を site_val に合わせて調整しました
        print(f"\n" + "="*40)
        print(f"🛰️  --- ROUTE DIAGNOSTICS ---")
        print(f"🏠  HOST: {self.request.get_host()}")
        print(f"🎯  RAW TARGET: {raw_target}")
        print(f"🧼  CLEANED ID: {clean_id}")
        print(f"🏷️  FINAL SITE TAG: {site_val}")
        print(f"📊  FINAL SQL COUNT: {queryset.count()}")
        print("="*40 + "\n")

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        project_id = getattr(self.request, 'project_id', 'default').lower()
        clean_id = project_id.replace('api.', '').replace('api-', '').replace('-host', '').split('.')[0]
        
        if any(k in clean_id for k in ['station', 'saving']):
            site_val = 'saving' if 'saving' in clean_id else 'bicstation'
            serializer.save(site=site_val, is_adult=False, show_on_main=True)
        elif any(k in clean_id for k in ['tiper', 'avflash']):
            site_val = 'tiper' if 'tiper' in clean_id else 'avflash'
            serializer.save(site=site_val, is_adult=True, show_on_main=True)
        else:
            serializer.save()

    @action(detail=False, methods=['post'], url_path='bulk-export-done')
    def bulk_mark_as_exported(self, request):
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response({"error": "ids list required"}, status=status.HTTP_400_BAD_REQUEST)
        
        project_id = getattr(self.request, 'project_id', 'default').lower()
        clean_id = project_id.replace('api.', '').replace('api-', '').replace('-host', '').split('.')[0]
        
        update_filter = {"id__in": ids}
        if clean_id != 'default':
            update_filter["site"] = clean_id

        updated_count = Article.objects.filter(**update_filter).update(is_exported=True)
        return Response({"status": "success", "updated_count": updated_count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='check-source')
    def check_source_exists(self, request):
        url = request.query_params.get('url')
        site = request.query_params.get('site')
        if not url:
            return Response({"error": "url required"}, status=400)
        q_filter = Q(source_url=url)
        if site:
            q_filter &= Q(site=site)
        exists = Article.objects.filter(q_filter).exists()
        return Response({"exists": exists, "source_url": url})
# -*- coding: utf-8 -*-
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
    """
    ページネーション設定
    💡 page_size_query_param を有効にし、フロント側から件数を操作可能にする
    """
    page_size = 20
    page_size_query_param = 'page_size' 
    max_page_size = 500 # 137件を一気に取れるように上限を解放

class ArticleViewSet(viewsets.ModelViewSet):
    """
    🔱 BICSTATION API v5.6 [BREAK_LIMIT_ALL_DATA]
    🛡️ 修正内容:
    - pagination_class を維持しつつ上限を解放。
    - フィルタを site 識別子のみに絞り、137件の通過を保証。
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
        # 末尾のスラッシュや余計なホスト名を徹底排除
        clean_id = raw_target.replace('api.', '').replace('api-', '').replace('-host', '').replace('/', '').split('.')[0]
        
        # 🛡️ 4. グループ定義
        GENERAL_KEYS = ['station', 'saving', 'news', 'bic']
        ADULT_KEYS = ['tiper', 'avflash', 'erog', 'adult']

        # 🌊 5. 配信フィルタリング実行 [FORCE_ALL_PASS]
        # 💡 site 以外のフラグ(is_adult, show_on_main)による除外を一時的に停止
        site_val = "unknown"
        
        if any(k in clean_id for k in GENERAL_KEYS):
            site_val = 'saving' if 'saving' in clean_id else 'bicstation'
            queryset = queryset.filter(site=site_val)
            
        elif any(k in clean_id for k in ADULT_KEYS):
            site_val = 'tiper' if 'tiper' in clean_id else 'avflash'
            queryset = queryset.filter(site=site_val)
        
        else:
            site_val = clean_id
            queryset = queryset.filter(site=clean_id)

        # 🚀 6. 導線を表示するログ
        # 💡 count() はDB上の全ヒット数を出すため、ここで 137 が出れば DB接続は完璧です
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
        
        if any(k in clean_id for k in ['station', 'saving', 'bic']):
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
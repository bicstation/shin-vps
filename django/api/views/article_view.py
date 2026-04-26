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
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

class StandardPagination(PageNumberPagination):
    """
    ページネーション設定
    💡 page_size_query_param を有効にし、フロント側から件数を操作可能にする
    """
    page_size = 20
    page_size_query_param = 'page_size' 
    max_page_size = 500 

class ArticleViewSet(viewsets.ModelViewSet):
    """
    🔱 BICSTATION API v7.1 [QUAD_DOMAIN_FINAL_REINFORCED]
    🛡️ 提督の対応表に基づき、ローカル/本番を問わずドメインを厳格に分離。
    🚀 内部通信(Docker)時は QueryParam を、外部通信時は Host を優先。
    """
    permission_classes = [AllowAny]
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
        ⚡ 4ドメイン・マルチテナント厳格判定ロジック
        """
        queryset = Article.objects.all()
        if self.action == 'list':
            queryset = queryset.defer('body_main', 'body_satellite')

        # 1. 識別子の優先順位取得
        # 内部通信用: QueryParam (?site=) 
        # Middleware用: request.project_id
        # フォールバック: Host名
        param_site = self.request.query_params.get('site') or self.request.query_params.get('project')
        middleware_project = getattr(self.request, 'project_id', None)
        host_name = self.request.get_host().lower()

        # ターゲットの決定 (QueryParamがあれば最優先)
        raw_target = param_site if param_site else (middleware_project if middleware_project else host_name)

        # 🎯 2. 「ドメイン・ホスト洗浄」エンジン
        # api-saving-host, api.bic-saving.com 等をすべて正規化
        clean_id = raw_target.replace('api.', '').replace('api-', '').replace('-host', '').replace('/', '').split(':')[0]
        
        # 🛡️ 3. 提督のリストに基づく「通称」確定マッピング
        # ローカル/本番を問わず、キーワードが含まれていれば各艦隊へ振り分け
        if 'saving' in clean_id:
            site_val = 'saving'
        elif 'tiper' in clean_id:
            site_val = 'tiper'
        elif 'avflash' in clean_id:
            site_val = 'avflash'
        # bicstation, station, localhost, django(内部通信デフォルト) はすべて基幹艦隊へ
        elif any(k in clean_id for k in ['bicstation', 'station', 'bic', 'localhost', '127.0.0.1', 'django']):
            site_val = 'bicstation'
        else:
            # 判別不能な場合は安全のためクリーンなIDをそのまま使用
            site_val = clean_id 

        # 🌊 4. 配信フィルタリング実行
        queryset = queryset.filter(site=site_val)

        # 🚀 5. 導線診断ログ (VPSの docker logs での視認性を最大化)
        print(f"\n" + "📡" + "="*45)
        print(f"🛰️  ROUTE: {raw_target} ➔ 🧼 CLEAN: {clean_id} ➔ 🏷️ TAG: {site_val}")
        print(f"📊 SQL COUNT: {queryset.count()} | ACTION: {self.action}")
        print("="*47 + "\n")

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """
        記事作成時、判定された site_val に基づいて属性を自動補完
        """
        # queryset判定と同じロジックでサイトを特定
        param_site = self.request.query_params.get('site')
        project_id = getattr(self.request, 'project_id', 'default').lower()
        target = (param_site if param_site else project_id).lower()
        
        if 'saving' in target:
            serializer.save(site='saving', is_adult=False, show_on_main=True)
        elif 'tiper' in target:
            serializer.save(site='tiper', is_adult=True, show_on_main=True)
        elif 'avflash' in target:
            serializer.save(site='avflash', is_adult=True, show_on_main=True)
        else:
            serializer.save(site='bicstation', is_adult=False, show_on_main=True)

    @action(detail=False, methods=['post'], url_path='bulk-export-done')
    def bulk_mark_as_exported(self, request):
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response({"error": "ids list required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # サイト特定ロジック
        param_site = self.request.query_params.get('site')
        project_id = getattr(self.request, 'project_id', 'default').lower()
        clean_id = (param_site if param_site else project_id).replace('api.', '').replace('api-', '').replace('-host', '').split('.')[0]
        
        update_filter = {"id__in": ids}
        # 明確なサイト指定がある場合のみフィルタを強化
        if clean_id not in ['default', 'localhost', '127.0.0.1', 'django']:
            update_filter["site__icontains"] = clean_id

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
    

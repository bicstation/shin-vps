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
    max_page_size = 500 # 上限を解放し、全件取得にも対応

class ArticleViewSet(viewsets.ModelViewSet):
    """
    🔱 BICSTATION API v7.0 [QUAD_DOMAIN_FINAL_REINFORCED]
    🛡️ 提督の対応表に基づき、ローカル/本番を問わずドメインを厳格に分離。
    """
    serializer_class = ArticleSerializer
    pagination_class = StandardPagination
    
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    # フィルタを site 識別子に固定
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
        # 1. 基礎クエリ (一覧時は本文を除去して軽量化)
        queryset = Article.objects.all()
        if self.action == 'list':
            queryset = queryset.defer('body_main', 'body_satellite')

        # 2. 識別子の取得 (Middlewareの project_id または QueryParam を優先)
        project_id = getattr(self.request, 'project_id', 'default')
        param_site = self.request.query_params.get('site') or self.request.query_params.get('project')
        raw_target = (param_site if param_site else project_id).lower()

        # 🎯 3. 「ドメイン・ホスト洗浄」エンジン
        # api-saving-host, api.bic-saving.com 等から共通の「通称」を導き出す
        clean_id = raw_target.replace('api.', '').replace('api-', '').replace('-host', '').replace('/', '').split('.')[0]
        
        # 🛡️ 4. 提督のリストに基づく「通称」確定マッピング
        if 'saving' in clean_id:
            site_val = 'saving'
        elif 'tiper' in clean_id:
            site_val = 'tiper'
        elif 'avflash' in clean_id:
            site_val = 'avflash'
        elif any(k in clean_id for k in ['bicstation', 'station', 'bic', 'localhost', '127.0.0.1']):
            site_val = 'bicstation'
        else:
            site_val = clean_id  # 予備の識別子

        # 🌊 5. 配信フィルタリング実行
        # DBの site フィールドと完全一致するもののみを抽出
        queryset = queryset.filter(site=site_val)

        # 🚀 6. 導線診断ログ (docker logs で最重要視する部分)
        print(f"\n" + "="*40)
        print(f"🛰️  --- QUAD-DOMAIN ROUTE DIAGNOSTICS ---")
        print(f"🏠  HOST: {self.request.get_host()}")
        print(f"🎯  RAW TARGET: {raw_target}")
        print(f"🧼  CLEANED ID: {clean_id}")
        print(f"🏷️  FINAL SITE TAG: {site_val}")
        print(f"📊  FINAL SQL COUNT: {queryset.count()}") 
        print("="*40 + "\n")

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """
        記事作成時、リクエスト元のホストに応じて site/is_adult を自動補完
        """
        project_id = getattr(self.request, 'project_id', 'default').lower()
        
        if 'saving' in project_id:
            serializer.save(site='saving', is_adult=False, show_on_main=True)
        elif 'tiper' in project_id:
            serializer.save(site='tiper', is_adult=True, show_on_main=True)
        elif 'avflash' in project_id:
            serializer.save(site='avflash', is_adult=True, show_on_main=True)
        else:
            serializer.save(site='bicstation', is_adult=False, show_on_main=True)

    @action(detail=False, methods=['post'], url_path='bulk-export-done')
    def bulk_mark_as_exported(self, request):
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response({"error": "ids list required"}, status=status.HTTP_400_BAD_REQUEST)
        
        project_id = getattr(self.request, 'project_id', 'default').lower()
        # 洗浄してサイトを特定
        clean_id = project_id.replace('api.', '').replace('api-', '').replace('-host', '').split('.')[0]
        
        update_filter = {"id__in": ids}
        # default/localhost 以外はサイトを絞って更新
        if not any(k in clean_id for k in ['default', 'localhost', '127.0.0.1']):
            # saving, tiper, avflash 等の厳格一致
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
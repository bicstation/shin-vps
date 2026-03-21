# -*- coding: utf-8 -*-
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

# インポートパスを __init__.py 経由の公開構造に合わせる
from ..models import Article
from ..serializers import ArticleSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    """
    4サイト（tiper, avflash, bicstation, saving）統合記事のAPI
    - get_queryset により、各プロジェクトごとの記事を厳格に分離
    - サイト別、投稿/ニュース別でのフィルタリングに対応
    """
    serializer_class = ArticleSerializer
    
    # 標準的なフィルタリング・検索・ソート機能を有効化
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    # 🔗 クエリパラメータでの絞り込み設定
    filterset_fields = ['site', 'content_type', 'is_exported']
    
    # 🔍 キーワード検索（タイトルと本文を対象）
    search_fields = ['title', 'body_text']
    
    # 🔃 並び替え（デフォルトは作成日の降順）
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        🌟 修正: プロジェクト分離ロジック
        ?project=bicstation 等のパラメータがある場合、
        extra_metadata 内の project キーで厳格にフィルタリングする。
        """
        queryset = Article.objects.all()
        
        # URLパラメータから project 名を取得
        project_slug = self.request.query_params.get('project')
        
        if project_slug:
            # JSONField(extra_metadata) 内の 'project' キーを検索
            # これにより、アダルト記事が Bicstation に混ざるのを防ぎます
            queryset = queryset.filter(extra_metadata__project=project_slug)
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """
        保存時のフック
        """
        serializer.save()

    @action(detail=False, methods=['post'], url_path='bulk-export-done')
    def bulk_mark_as_exported(self, request):
        """
        外部（WordPress等）への投稿が完了したID群を一括で「公開済み」に更新
        """
        ids = request.data.get('ids', [])
        
        if not isinstance(ids, list) or not ids:
            return Response(
                {"error": "有効なIDのリスト(ids)を送信してください。"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = Article.objects.filter(id__in=ids).update(is_exported=True)
        
        return Response({
            "status": "success",
            "message": f"{updated_count}件の記事を外部公開済みとして更新しました。",
            "updated_count": updated_count
         Dun": updated_count
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='check-source')
    def check_source_exists(self, request):
        """
        特定のURLが既にDBに存在するかチェック
        """
        url = request.query_params.get('url')
        exists = Article.objects.filter(source_url=url).exists()
        return Response({"exists": exists, "source_url": url})
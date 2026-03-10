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
    - サイト別、投稿/ニュース別でのフィルタリングに対応
    - 重複投稿防止のための source_url チェックはシリアライザー/モデル側で制御
    """
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    
    # 標準的なフィルタリング・検索・ソート機能を有効化
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    # 🔗 クエリパラメータでの絞り込み設定
    # 例: /api/articles/?site=avflash&is_exported=false
    filterset_fields = ['site', 'content_type', 'is_exported']
    
    # 🔍 キーワード検索（タイトルと本文を対象）
    search_fields = ['title', 'body_text']
    
    # 🔃 並び替え（デフォルトは作成日の降順）
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        """
        保存時のフック（必要に応じてロジックを追加可能）
        """
        serializer.save()

    @action(detail=False, methods=['post'], url_path='bulk-export-done')
    def bulk_mark_as_exported(self, request):
        """
        外部（WordPress等）への投稿が完了したID群を一括で「公開済み」に更新
        Payload: {"ids": [101, 102, 105]}
        """
        ids = request.data.get('ids', [])
        
        if not isinstance(ids, list) or not ids:
            return Response(
                {"error": "有効なIDのリスト(ids)を送信してください。"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 一括更新クエリを実行（効率的）
        updated_count = Article.objects.filter(id__in=ids).update(is_exported=True)
        
        return Response({
            "status": "success",
            "message": f"{updated_count}件の記事を外部公開済みとして更新しました。",
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='check-source')
    def check_source_exists(self, request):
        """
        特定のURLが既にDBに存在するかチェック（スクリプト側での重複排除用）
        Query: ?url=https://...
        """
        url = request.query_params.get('url')
        exists = Article.objects.filter(source_url=url).exists()
        return Response({"exists": exists, "source_url": url})
# -*- coding: utf-8 -*-
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

# インポートパスを構造に合わせる
from ..models import Article
from ..serializers import ArticleSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    """
    🚀 4サイト（tiper, avflash, bicstation, saving）統合記事のAPI [v3.9 完全版]
    - ミドルウェア判定の project_id に基づき表示を自動隔離。
    - extra_metadata 内の 'is_adult' フラグを読み取り、一般サイトからアダルトを強制排除。
    """
    serializer_class = ArticleSerializer
    
    # フィルタリング機能
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    # クエリパラメータ設定
    filterset_fields = ['content_type', 'is_exported']
    
    # 検索・ソート
    search_fields = ['title', 'body_text']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        🌟 修正: JSONField(extra_metadata) を介したドメイン隔離 + コンテンツ安全フィルター
        """
        queryset = Article.objects.all()
        
        # 1. ミドルウェアまたはクエリパラメータからプロジェクトIDを特定
        project_id = getattr(self.request, 'project_id', None)
        if not project_id or project_id == 'default':
            project_id = self.request.query_params.get('project')

        # 2. 一般サイト（健全サイト）のリストを定義
        GENERAL_PROJECTS = ['bicstation', 'saving', 'bicstation-host', 'saving-host']

        # 3. 強制フィルタリング実行
        if project_id:
            # A. 該当プロジェクトの記事のみに絞り込み
            queryset = queryset.filter(site=project_id)
            
            # B. 【重要】一般サイトの場合、metadata内のアダルトフラグをチェックして強制排除
            if project_id in GENERAL_PROJECTS:
                # extra_metadata__is_adult=True のものをリストから除外する
                queryset = queryset.exclude(extra_metadata__is_adult=True)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """
        保存時のフック: site情報の自動付与
        """
        project_id = getattr(self.request, 'project_id', 'default')
        # 保存時に site が未指定なら、現在のプロジェクト名を自動セット
        if project_id != 'default':
            serializer.save(site=project_id)
        else:
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
        
        # セキュリティ: 自プロジェクトに属する記事のみを更新可能にする
        project_id = getattr(self.request, 'project_id', None)
        update_filter = {"id__in": ids}
        if project_id and project_id != 'default':
            update_filter["site"] = project_id

        updated_count = Article.objects.filter(**update_filter).update(is_exported=True)
        
        return Response({
            "status": "success",
            "message": f"{updated_count}件の記事を外部公開済みとして更新しました。",
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='check-source')
    def check_source_exists(self, request):
        """
        特定のURLが既にDBに存在するかチェック
        """
        url = request.query_params.get('url')
        if not url:
            return Response({"error": "urlを指定してください。"}, status=400)
            
        exists = Article.objects.filter(source_url=url).exists()
        return Response({"exists": exists, "source_url": url})
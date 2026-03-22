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
    🚀 4サイト（tiper, avflash, bicstation, saving）統合記事のAPI
    [マルチドメイン完全隔離版]
    - ミドルウェアで判定された project_id に基づき、表示する記事を自動で切り替えます。
    - これにより、PCサイト(BICSTATION)にアダルト記事が混入するリスクをゼロにします。
    """
    serializer_class = ArticleSerializer
    
    # 標準的なフィルタリング・検索・ソート機能を有効化
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    # 🔗 クエリパラメータでの絞り込み設定
    # ※ site は get_queryset で自動付与されるため、基本的には content_type 等を指定
    filterset_fields = ['content_type', 'is_exported']
    
    # 🔍 キーワード検索（タイトルと本文を対象）
    search_fields = ['title', 'body_text']
    
    # 🔃 並び替え
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        🌟 修正: ドメインベースの自動プロジェクト分離
        ミドルウェアがセットした request.project_id を使用します。
        """
        # 1. 基礎となるクエリセット
        queryset = Article.objects.all()
        
        # 2. ミドルウェアから判定済みプロジェクトIDを取得
        project_id = getattr(self.request, 'project_id', None)
        
        # 3. 強制フィルタリング
        # クエリパラメータで ?project=... と送られてきても、
        # ドメイン判定 (project_id) が存在する場合はそちらを「絶対」として優先します。
        if project_id and project_id != 'default':
            # モデルの 'site' フィールドがドメインと一致するものだけに絞る
            # 例: bicstation.com からのアクセスなら site='bicstation' の記事のみ
            queryset = queryset.filter(site=project_id)
        else:
            # プロジェクトが特定できない（直IPアクセス等）場合、
            # クエリパラメータの project を予備としてチェック
            project_slug = self.request.query_params.get('project')
            if project_slug:
                queryset = queryset.filter(site=project_slug)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """
        保存時のフック
        作成時、現在のドメインに基づいて自動的に site フィールドを埋めることも可能です。
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
        
        # セキュリティ強化: 自分のプロジェクトに属する記事のみを更新可能にする
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
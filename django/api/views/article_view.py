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
    [マルチドメイン完全隔離 + アダルトコンテンツ強制排除版]
    - ミドルウェアで判定された project_id に基づき、表示する記事を自動で切り替えます。
    - 一般サイト（Bic Station / Saving）の場合、データ上のミスがあってもアダルト記事を表示させない二重フィルターを搭載。
    """
    serializer_class = ArticleSerializer
    
    # 標準的なフィルタリング・検索・ソート機能を有効化
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    # 🔗 クエリパラメータでの絞り込み設定
    filterset_fields = ['content_type', 'is_exported']
    
    # 🔍 キーワード検索（タイトルと本文を対象）
    search_fields = ['title', 'body_text']
    
    # 🔃 並び替え
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        🌟 修正: ドメインベースの自動プロジェクト分離 + コンテンツ安全フィルター
        """
        # 1. 基礎となるクエリセット
        queryset = Article.objects.all()
        
        # 2. ミドルウェアから判定済みプロジェクトIDを取得
        project_id = getattr(self.request, 'project_id', None)
        
        # 一般サイト（健全サイト）のリストを定義
        # ※ project_id に入る可能性がある値を指定
        GENERAL_PROJECTS = ['bicstation', 'saving', 'bicstation-host', 'saving-host']
        
        # 3. 強制フィルタリング
        if project_id and project_id != 'default':
            # A. まずはドメインに紐づくサイト名で絞り込み
            queryset = queryset.filter(site=project_id)
            
            # B. 【重要】一般サイトの場合、アダルトフラグが立っているものを強制排除
            # モデルに is_adult フィールドがある場合:
            if project_id in GENERAL_PROJECTS:
                queryset = queryset.filter(is_adult=False)
                
                # もし is_adult フィールドがない場合は、代わりに以下のようなカテゴリ制限等を使います
                # queryset = queryset.exclude(content_type='adult')
        
        else:
            # プロジェクトが特定できない（直IPアクセス等）場合、
            # クエリパラメータの project を予備としてチェック
            project_slug = self.request.query_params.get('project')
            if project_slug:
                queryset = queryset.filter(site=project_slug)
                # 予備チェック時も一般サイトならアダルトを弾く
                if project_slug in GENERAL_PROJECTS:
                    queryset = queryset.filter(is_adult=False)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """
        保存時のフック
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
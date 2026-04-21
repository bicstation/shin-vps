# -*- coding: utf-8 -*-
"""
ContentHub ViewSet
Path: /home/maya/dev/shin-vps/django/api/views/contenthub_viewset.py

SHIN-VPS v5.5 統合コンテンツハブ・ビューセット
担当サイト: BicStation, 303sh, 環境要塞, DeepMoon
AI生成コンテンツの集約、フィルタリング、および複数サイトへの配信ロジックを統合管理します。
"""

import logging
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction

# 内部モジュールのインポート
from api.models import ContentHub
from api.serializers import ContentHubSerializer

logger = logging.getLogger(__name__)

class ContentHubViewSet(viewsets.ModelViewSet):
    """
    統合コンテンツ管理ビューセット。
    AIエージェントからの自動投入(Ingest)、連載ナビゲーション、Markdown出力に対応。
    """
    queryset = ContentHub.objects.all()
    serializer_class = ContentHubSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    # フィルタリング・検索・ソート設定
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    # フィルタリング対象フィールド（フロントエンドの「情報整理」を容易にする設計）
    filterset_fields = {
        'site': ['exact', 'in'],
        'content_type': ['exact'],
        'is_adult': ['exact'],
        'is_pub': ['exact'],
        'series_slug': ['exact', 'isnull'],
        'category': ['exact'],
    }

    # 検索対象フィールド（技術アーカイブやニュースの深掘り検索用）
    search_fields = ['title', 'body_md', 'tags', 'meta_data']

    # ソート順のデフォルト
    ordering_fields = ['created_at', 'updated_at', 'episode_no']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        クエリセットの動的制御
        - スタッフ権限がない場合、公開済み(is_pub=True)のみを返却。
        """
        qs = super().get_queryset()
        if not self.request.user or not self.request.user.is_staff:
            qs = qs.filter(is_pub=True)
        return qs

    @action(detail=True, methods=['get'])
    def navigation(self, request, slug=None):
        """
        連載記事(Series)における前後のエピソード情報を取得。
        GET /api/content-hub/items/{slug}/navigation/
        """
        instance = self.get_object()

        if not instance.series_slug:
            return Response(
                {"detail": "このコンテンツは連載（シリーズ）設定されていません。"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 同一サイト・同一シリーズ内での前後エピソードを抽出
        siblings = self.get_queryset().filter(
            site=instance.site,
            series_slug=instance.series_slug
        ).only('slug', 'title', 'episode_no').order_by('episode_no')

        prev_node = siblings.filter(episode_no__lt=instance.episode_no).last()
        next_node = siblings.filter(episode_no__gt=instance.episode_no).first()

        data = {
            "current": {
                "episode_no": instance.episode_no,
                "title": instance.title,
                "slug": instance.slug
            },
            "previous": {
                "slug": prev_node.slug,
                "title": prev_node.title,
                "episode_no": prev_node.episode_no
            } if prev_node else None,
            "next": {
                "slug": next_node.slug,
                "title": next_node.title,
                "episode_no": next_node.episode_no
            } if next_node else None,
        }
        return Response(data)

    @action(detail=False, methods=['post'], url_path='ai-ingest')
    def ai_ingest(self, request):
        """
        AIエージェントからの自動投入用。
        POST /api/content-hub/items/ai-ingest/
        slugが重複している場合は更新(Update)、なければ作成(Create)します。
        """
        slug = request.data.get('slug')
        if not slug:
            return Response({"detail": "Ingestにはslugが必須です。"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # 既存のインスタンスを検索
            instance = ContentHub.objects.filter(slug=slug).first()
            # partial=True により、送信されたフィールドのみの更新を許可
            serializer = self.get_serializer(instance, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                status_code = status.HTTP_200_OK if instance else status.HTTP_201_CREATED
                logger.info(f"AI Ingest Success: {slug} (Status: {status_code})")
                return Response(serializer.data, status=status_code)

            logger.error(f"AI Ingest Validation Error: {slug} - {serializer.errors}")
            return Response(serializer.errors, status=status_code.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='export-md')
    def export_markdown(self, request, slug=None):
        """
        Markdownデータを純粋なテキストとして取得。
        GET /api/content-hub/items/{slug}/export-md/
        """
        instance = self.get_object()
        if not instance.body_md:
            return Response({"detail": "Markdownコンテンツが空です。"}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            instance.body_md,
            content_type="text/markdown; charset=utf-8"
        )

    @action(detail=False, methods=['get'], url_path='top-featured')
    def top_featured(self, request):
        """
        TOPページ用の注目のコンテンツ（最新5件）を返却。
        """
        # プロジェクトの優先順位に基づき、最新の公開記事を取得
        featured = self.get_queryset().filter(is_pub=True).order_by('-created_at')[:5]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)
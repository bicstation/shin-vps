# -*- coding: utf-8 -*-
"""
ContentHub ViewSet
Path: /usr/src/app/api/views/contenthub_view.py

SHIN-VPS v5.5 統合コンテンツハブ・ビューセット
担当サイト: BicStation, 303sh, 環境要塞, DeepMoon
"""

import logging
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

# 既存のモデルとシリアライザーをインポート
from api.models import ContentHub
from api.serializers import ContentHubSerializer

logger = logging.getLogger(__name__)

class ContentHubViewSet(viewsets.ModelViewSet):
    """
    統合コンテンツ管理ビューセット。
    AI生成コンテンツの集約、複数サイトへの配信、連載管理を担当します。
    """
    queryset = ContentHub.objects.all()
    serializer_class = ContentHubSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    # フィルタリング機能の有効化
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    # フィルタリング対象フィールド
    filterset_fields = {
        'site': ['exact'],
        'content_type': ['exact'],
        'is_adult': ['exact'],
        'is_pub': ['exact'],
        'series_slug': ['exact', 'isnull'],
        'category': ['exact'],
    }

    # 検索対象フィールド
    search_fields = ['title', 'body_md', 'tags', 'meta_data']

    # ソート順のデフォルト
    ordering_fields = ['created_at', 'updated_at', 'episode_no']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        クエリセットの動的制御
        - スタッフ権限がない場合、公開済み(is_pub=True)のみを返します。
        """
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(is_pub=True)
        return qs

    @action(detail=True, methods=['get'])
    def navigation(self, request, slug=None):
        """
        連載記事（Series）における「前後のエピソード」を取得
        GET /api/content-hub/{slug}/navigation/
        """
        instance = self.get_object()

        if not instance.series_slug:
            return Response(
                {"detail": "This content is not part of a series."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 同一サイト・同一シリーズ内での前後関係を抽出
        siblings = self.get_queryset().filter(
            site=instance.site,
            series_slug=instance.series_slug
        ).order_by('episode_no')

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
        AIエージェントからのコンテンツ自動投入用エンドポイント
        POST /api/content-hub/ai-ingest/
        slugが重複している場合は更新(Update)、なければ作成(Create)します。
        """
        slug = request.data.get('slug')
        if not slug:
            return Response({"detail": "Slug is required for ingestion."}, status=status.HTTP_400_BAD_REQUEST)

        instance = ContentHub.objects.filter(slug=slug).first()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            status_code = status.HTTP_200_OK if instance else status.HTTP_201_CREATED
            return Response(serializer.data, status=status_code)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='export-md')
    def export_markdown(self, request, slug=None):
        """
        Markdownデータをテキストとして取得
        GET /api/content-hub/{slug}/export-md/
        """
        instance = self.get_object()
        if not instance.body_md:
            return Response({"detail": "Markdown content is empty."}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            instance.body_md,
            content_type="text/markdown; charset=utf-8"
        )
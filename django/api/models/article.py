# -*- coding: utf-8 -*-
from django.db import models
from django.utils.timezone import now
from django.contrib.postgres.indexes import GinIndex  # PostgreSQL専用インデックス

class Article(models.Model):
    """
    PC, 節約, アダルト(tiper/avflash)の全艦隊を統合管理するモデル。
    マルチドメイン対応のため、siteカラムとextra_metadataによる柔軟な拡張性を持ちます。
    """
    
    TYPE_CHOICES = [
        ('post', '通常記事(Post)'),
        ('news', 'ニュース(News)'),
    ]

    # --- 配信・分類 ---
    # db_index=True により、ドメインごとのフィルタリングを高速化
    site = models.CharField(
        max_length=50, 
        db_index=True, 
        verbose_name="対象サイト"
    )
    content_type = models.CharField(
        max_length=10, 
        choices=TYPE_CHOICES, 
        default='post', 
        db_index=True, 
        verbose_name="種別"
    )

    # --- コンテンツ本体 ---
    title = models.CharField(
        max_length=500, 
        verbose_name="タイトル"
    )
    # TextFieldはデータ量が大きいため、API一覧取得(list)時は .defer() で除外推奨
    body_text = models.TextField(
        verbose_name="本文（AI生成）"
    )
    
    # --- メディア・参照 ---
    main_image_url = models.URLField(
        max_length=1000, 
        verbose_name="メイン画像URL", 
        blank=True, 
        null=True
    )
    source_url = models.URLField(
        max_length=1000, 
        verbose_name="取得元URL"
    )

    # --- 拡張データ（PCスペック、出演者、価格、アダルトフラグなど） ---
    # GINインデックスを適用することで、JSON内部の検索を劇的に高速化
    extra_metadata = models.JSONField(
        default=dict, 
        blank=True, 
        verbose_name="メタデータ"
    )

    # --- 状態・時間管理 ---
    is_exported = models.BooleanField(
        default=False, 
        db_index=True, 
        verbose_name="外部出力済"
    )
    created_at = models.DateTimeField(
        default=now, 
        db_index=True, 
        verbose_name="作成日時"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="更新日時"
    )

    class Meta:
        verbose_name = "配信記事"
        verbose_name_plural = "配信記事一覧"
        ordering = ['-created_at']
        
        # siteが異なれば同じURLの記事も持てるが、同一サイト内での重複は許さない
        unique_together = ('site', 'source_url')
        
        # インデックス戦略
        indexes = [
            # ドメイン・種別・日付を組み合わせた複合インデックス（フロントエンドのクエリに最適化）
            models.Index(
                fields=['site', 'content_type', '-created_at'], 
                name='idx_site_type_created'
            ),
            # JSONField(extra_metadata) 内の検索を高速化するGINインデックス
            # これにより extra_metadata__is_adult=False 等のクエリが爆速になります
            GinIndex(
                fields=['extra_metadata'], 
                name='idx_extra_metadata_gin'
            ),
        ]

    def __str__(self):
        return f"[{self.site}] {self.title[:30]}"
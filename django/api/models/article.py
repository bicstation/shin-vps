# -*- coding: utf-8 -*-
from django.db import models
from django.utils.timezone import now
from django.contrib.postgres.indexes import GinIndex

class Article(models.Model):
    """
    SHIN-VPS v5.0: 1レコード・マルチコンテンツ・マルチデリバリーモデル
    - 属性(is_adult)と配信フラグ(main/satellite)を物理分離
    - 1レコード内にメイン用とサテライト用の独立したAI本文を保持
    - 画像・動画・拡張メタデータをJSONFieldで一元管理
    """

    TYPE_CHOICES = [
        ('post', '通常記事(Post)'),
        ('news', 'ニュース(News)'),
    ]

    SITE_CHOICES = [
        ('tiper', 'Tiper (Adult)'),
        ('avflash', 'AV Flash (Adult)'),
        ('bicstation', 'Bic Station (General)'),
        ('saving', 'Bic Saving (General)'),
    ]

    # --- 1. 配信・属性フラグ ---
    is_adult = models.BooleanField(
        default=False, 
        db_index=True, 
        verbose_name="アダルト属性"
    )
    show_on_main = models.BooleanField(
        default=True, 
        db_index=True, 
        verbose_name="メイン表示用"
    )
    show_on_satellite = models.BooleanField(
        default=False, 
        db_index=True, 
        verbose_name="サテライト表示用"
    )

    site = models.CharField(
        max_length=50, 
        choices=SITE_CHOICES,
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

    # --- 2. コンテンツ本体 (用途別に独立) ---
    title = models.CharField(
        max_length=500, 
        verbose_name="タイトル"
    )
    body_main = models.TextField(
        verbose_name="本文（メインサイト用AI生成）",
        help_text="メインサイト向けの高品質・長文記事"
    )
    body_satellite = models.TextField(
        verbose_name="本文（サテライト用AI生成）",
        blank=True, 
        null=True,
        help_text="サテライト/SEO/被リンク用の短文・要約記事"
    )

    # --- 3. メディア・外部参照 (JSONによる柔軟な管理) ---
    # 複数画像管理例: [{"url": "...", "alt": "..."}, {"url": "...", "alt": "..."}]
    images_json = models.JSONField(
        default=list, 
        blank=True, 
        verbose_name="画像セット(JSON)"
    )
    
    # 複数動画管理例: [{"url": "...", "provider": "fanza", "type": "sample"}]
    videos_json = models.JSONField(
        default=list, 
        blank=True, 
        verbose_name="動画セット(JSON)"
    )

    source_url = models.URLField(
        max_length=1000, 
        verbose_name="取得元URL"
    )

    # --- 4. 拡張データ・状態管理 ---
    extra_metadata = models.JSONField(
        default=dict, 
        blank=True, 
        verbose_name="拡張メタデータ",
        help_text="PCスペック、出演者情報、価格等の付随データ"
    )

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
        unique_together = ('site', 'source_url')
        
        # 検索効率を最大化するインデックス戦略
        indexes = [
            # メインサイト表示用の高速クエリ
            models.Index(
                fields=['site', 'is_adult', 'show_on_main', '-created_at'], 
                name='idx_site_main_delivery'
            ),
            # サテライト表示用の高速クエリ
            models.Index(
                fields=['site', 'show_on_satellite', '-created_at'], 
                name='idx_site_sat_delivery'
            ),
            # JSON内部検索を高速化するGINインデックス群
            GinIndex(fields=['images_json'], name='idx_images_gin'),
            GinIndex(fields=['videos_json'], name='idx_videos_gin'),
            GinIndex(fields=['extra_metadata'], name='idx_metadata_gin'),
        ]

    def __str__(self):
        icon = "🔞" if self.is_adult else "🌐"
        dest = ""
        if self.show_on_main: dest += "💎"
        if self.show_on_satellite: dest += "🛰️"
        return f"{icon}{dest} [{self.get_site_display()}] {self.title[:30]}"
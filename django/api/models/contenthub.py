# -*- coding: utf-8 -*-
from django.db import models
from django.utils.timezone import now
from django.contrib.postgres.indexes import GinIndex
from django.utils.text import slugify

class ContentHub(models.Model):
    """
    SHIN-VPS v5.5: 統合コンテンツハブ (ContentHub)
    - 4つのドメイン (Bicstation, Saving, Tiper, AVFlash) を一括管理
    - アダルト属性(is_adult)とサイト識別(site)によるマルチテナント運用
    - 連載(Series/Phase/Episode)構造を完全サポート
    - AI生成のMarkdownをそのまま格納する「直接マッピング」専用設計
    """

    SITE_CHOICES = [
        ('bicstation', 'Bic Station (Tech/General)'),
        ('saving', 'Bic Saving (Life/General)'),
        ('tiper', 'Tiper (Adult/Portal)'),
        ('avflash', 'AV Flash (Adult/News)'),
    ]

    TYPE_CHOICES = [
        ('post', '通常記事(Post)'),
        ('course', '連載/講座(Course)'),
        ('news', 'ニュース(News)'),
    ]

    # --- 1. 配信・属性・フィルタリング ---
    site = models.CharField(
        max_length=50, 
        choices=SITE_CHOICES, 
        db_index=True,
        verbose_name="配信対象ドメイン"
    )
    is_adult = models.BooleanField(
        default=False, 
        db_index=True, 
        verbose_name="アダルト属性"
    )
    is_pub = models.BooleanField(
        default=False, 
        db_index=True, 
        verbose_name="公開状態"
    )
    content_type = models.CharField(
        max_length=10, 
        choices=TYPE_CHOICES, 
        default='post', 
        db_index=True, 
        verbose_name="コンテンツ種別"
    )

    # --- 2. 連載・階層管理 (「環境要塞」ロードマップ対応) ---
    series_slug = models.SlugField(
        max_length=100, 
        db_index=True, 
        verbose_name="連載スラグ",
        help_text="例: software-fortress"
    )
    phase_title = models.CharField(
        max_length=255, 
        blank=True, 
        verbose_name="フェーズ名",
        help_text="例: 第1段階：OS・基盤環境の最適化"
    )
    episode_no = models.IntegerField(
        default=0, 
        db_index=True, 
        verbose_name="エピソード番号"
    )

    # --- 3. コンテンツ本体 (Markdown直接マッピング) ---
    title = models.CharField(
        max_length=500, 
        verbose_name="タイトル"
    )
    slug = models.SlugField(
        max_length=255, 
        unique=True, 
        verbose_name="URLスラグ"
    )
    body_md = models.TextField(
        verbose_name="本文(Markdown)",
        help_text="Gemini等が生成したMarkdownをそのまま保存。表示側でパースします。"
    )
    excerpt = models.TextField(
        max_length=2000, 
        blank=True, 
        verbose_name="要約/AI学習用コンテキスト",
        help_text="AIが前後の文脈を理解するための要約データ"
    )

    # --- 4. メディア & 拡張データ (JSONField) ---
    images_json = models.JSONField(
        default=list, 
        blank=True, 
        verbose_name="画像リソース(JSON)"
    )
    extra_data = models.JSONField(
        default=dict, 
        blank=True, 
        verbose_name="拡張メタデータ"
    )
    ai_trace = models.JSONField(
        default=dict, 
        blank=True, 
        verbose_name="AI生成履歴"
    )

    # --- 5. 分類・ステータス・時間 ---
    category = models.CharField(
        max_length=100, 
        db_index=True, 
        verbose_name="カテゴリ"
    )
    # タグは頻繁に変わるためJSONFieldで管理するのも手ですが、一旦カンマ区切り文字列か、運用次第で検討
    tags = models.CharField(max_length=255, blank=True, verbose_name="タグ(カンマ区切り)")

    is_reviewed = models.BooleanField(
        default=False, 
        db_index=True, 
        verbose_name="検閲済み"
    )
    created_at = models.DateTimeField(default=now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'content_hubs'
        verbose_name = "統合コンテンツハブ記事"
        verbose_name_plural = "統合コンテンツハブ記事一覧"
        ordering = ['-created_at']
        
        # 4ドメインのマルチテナント配信を最速化するインデックス
        indexes = [
            models.Index(
                fields=['site', 'is_adult', 'is_pub', 'episode_no'], 
                name='idx_hub_delivery_v5'
            ),
            models.Index(
                fields=['series_slug', 'episode_no'], 
                name='idx_hub_series_v5'
            ),
            GinIndex(fields=['extra_data'], name='idx_hub_extra_gin'),
            GinIndex(fields=['images_json'], name='idx_hub_img_gin'),
        ]
        
        # 同一サイト・連載内での話数重複を防止
        # 注意: series_slugが空(単発記事)の場合の挙動に注意が必要なため、
        # 運用上、単発記事には固有の識別子(uuid等)をseries_slugに入れる運用を推奨
        unique_together = ('site', 'series_slug', 'episode_no')

    def __str__(self):
        icon = "🔞" if self.is_adult else "🌐"
        status = "✅" if self.is_pub else "📝"
        return f"{icon} [{self.site}] {self.title} ({status})"

    def save(self, *args, **kwargs):
        # 自動スラグ生成（既存のスラグがない場合）
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
# -*- coding: utf-8 -*-
from django.db import models
from django.utils.timezone import now

class Article(models.Model):
    """
    22サイト（Livedoor艦隊, WordPress艦隊, その他ポータル）の
    通常記事(Post)とニュース(News)を統合管理するモデル。
    同一URLの作品でも、投稿先（site）が異なれば別記事として共存可能。
    """
    
    SITE_CHOICES = [
        ('tiper', 'tiper.live'),
        ('avflash', 'avflash'),
        ('bicstation', 'bicstation'),
        ('saving', 'bic-saving'),
        # 以下、動的に追加されるサイト識別子も許容するため max_length を確保
    ]
    
    TYPE_CHOICES = [
        ('post', '通常記事(Post)'),
        ('news', 'ニュース(News)'),
    ]

    # --- 配信・分類 ---
    # site_id（livedoor_ol等）を格納するため、SITE_CHOICESに含まれない値も許容
    site = models.CharField(max_length=50, db_index=True, verbose_name="対象サイト")
    content_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='post', db_index=True, verbose_name="種別")

    # --- コンテンツ本体 ---
    title = models.CharField(max_length=500, verbose_name="タイトル")
    body_text = models.TextField(verbose_name="本文（AI生成）")
    
    # --- メディア・参照 ---
    main_image_url = models.URLField(max_length=1000, verbose_name="メイン画像URL")
    
    # 【重要】unique=Trueを解除し、複数サイトへの同時爆撃をデータベースレベルで許可
    source_url = models.URLField(max_length=1000, verbose_name="取得元URL")

    # --- 拡張データ（PCスペック、出演者、価格など） ---
    extra_metadata = models.JSONField(default=dict, blank=True, verbose_name="メタデータ")

    # --- 状態・時間管理 ---
    is_exported = models.BooleanField(default=False, db_index=True, verbose_name="外部出力済")
    created_at = models.DateTimeField(default=now, db_index=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "配信記事"
        verbose_name_plural = "配信記事一覧"
        ordering = ['-created_at']
        
        # 【司令官の生命線】同じURLでも、投稿先サイトが違えば別レコードとして保存を許可する
        unique_together = ('site', 'source_url')
        
        indexes = [
            models.Index(fields=['site', 'content_type', '-created_at']),
        ]

    def __str__(self):
        return f"[{self.site}] {self.title[:30]}"
# -*- coding: utf-8 -*-
from django.db import models
from django.utils import timezone
# 外部参照するモデルをインポート
from .raw_and_entities import RawApiData, Maker, Label, Director, Series, Genre, Actress 


# ==========================================================================
# 1. 作品属性モデル (AdultAttribute)
# PCAttributeと同様に、詳細なタグ管理を行うためのマスター
# ==========================================================================
class AdultAttribute(models.Model):
    TYPE_CHOICES = [
        ('body', '身体的特徴'),      # 巨乳、スレンダー等
        ('style', '作品スタイル'),    # 清楚、ギャル、人妻等
        ('scene', 'シチュエーション'), # 職場、学校、野外等
        ('feature', '特殊仕様'),      # VR、4K、独占配信等
    ]
    
    attr_type = models.CharField('属性タイプ', max_length=20, choices=TYPE_CHOICES)
    name = models.CharField('表示名', max_length=100)
    slug = models.SlugField('スラッグ', max_length=100, unique=True)
    
    search_keywords = models.TextField(
        '検索キーワード', 
        blank=True, 
        help_text="カンマ(,)区切りで入力"
    )
    order = models.PositiveIntegerField('並び順', default=0)

    class Meta:
        verbose_name = '作品属性'
        verbose_name_plural = '作品属性一覧'
        ordering = ['attr_type', 'order', 'name']

    def __str__(self):
        return f"[{self.get_attr_type_display()}] {self.name}"


# ==========================================================================
# 2. アダルト商品モデル (AdultProduct)
# ==========================================================================
class AdultProduct(models.Model):
    # --- 既存カラム (基本情報) ---
    raw_data = models.ForeignKey(RawApiData, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products', verbose_name="生データソース")
    api_source = models.CharField(max_length=10, verbose_name="APIソース (DUGA/FANZA)")
    api_product_id = models.CharField(max_length=255, verbose_name="API提供元製品ID")
    product_id_unique = models.CharField(max_length=255, unique=True, verbose_name="統合ID")
    title = models.CharField(max_length=512, verbose_name="作品タイトル")
    release_date = models.DateField(null=True, blank=True, verbose_name="公開日")
    affiliate_url = models.URLField(max_length=2048, verbose_name="アフィリエイトURL")
    price = models.IntegerField(null=True, blank=True, verbose_name="販売価格 (円)")
    image_url_list = models.JSONField(default=list, verbose_name="画像URLリスト")
    sample_movie_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="サンプル動画URL")
    
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_made', verbose_name="メーカー")
    label = models.ForeignKey(Label, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_labeled', verbose_name="レーベル")
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_directed', verbose_name="監督")
    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_in_series', verbose_name="シリーズ")
    genres = models.ManyToManyField(Genre, related_name='adult_products', verbose_name="ジャンル")
    actresses = models.ManyToManyField(Actress, related_name='adult_products', verbose_name="出演者")

    # --- 🚀 追加: AI生成・投稿管理カラム (PC版を継承) ---
    ai_content = models.TextField(null=True, blank=True, verbose_name="AI生成レビュー本文")
    ai_summary = models.CharField(max_length=500, null=True, blank=True, verbose_name="AI記事要約/メタディスクリプション")
    target_segment = models.CharField(max_length=255, null=True, blank=True, verbose_name="AI判定ターゲット層")
    
    is_posted = models.BooleanField(default=False, verbose_name="ブログ/SNS投稿済み")
    is_active = models.BooleanField(default=True, verbose_name="掲載中")
    
    # --- 📊 追加: 5軸解析スコア (レーダーチャート用 1-100) ---
    score_visual = models.IntegerField(default=0, verbose_name="ルックス・画質スコ2(1-100)")
    score_story = models.IntegerField(default=0, verbose_name="構成・ストーリースコア(1-100)")
    score_cost = models.IntegerField(default=0, verbose_name="コスパスコア(1-100)")
    score_erotic = models.IntegerField(default=0, verbose_name="エロティシズムスコア(1-100)")
    score_rarity = models.IntegerField(default=0, verbose_name="希少性・プレミアスコア(1-100)")
    
    spec_score = models.IntegerField(default=0, verbose_name="総合評価スコア(0-100)")
    last_spec_parsed_at = models.DateTimeField(null=True, blank=True, verbose_name="解析実行日")

    # --- 🏷️ 追加: スペック属性タグ ---
    attributes = models.ManyToManyField(
        AdultAttribute, 
        blank=True, 
        related_name='products',
        verbose_name="詳細スペック属性"
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")
    
    class Meta:
        db_table = 'adult_product'
        verbose_name = 'アダルト商品'
        verbose_name_plural = 'アダルト商品一覧'
        ordering = ['-release_date']

    def __str__(self):
        return self.title

    # 保存時の自動処理
    def save(self, *args, **kwargs):
        # 1. サンプル動画がある場合は自動的に属性フラグなどを検討するロジック（PC版のis_ai_pc判定に近いもの）
        # 例: 動画URLがあればスコアのベースラインを上げるなど
        if self.sample_movie_url and self.score_visual == 0:
            self.score_visual = 50 # 暫定スコア
            
        super().save(*args, **kwargs)
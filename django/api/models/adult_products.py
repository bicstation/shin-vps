# -*- coding: utf-8 -*-
from django.db import models
from django.utils import timezone
import unicodedata
import re

# 外部参照するモデルをインポート
# 💡 Author を追加
from .raw_and_entities import RawApiData, Maker, Label, Director, Series, Genre, Actress, Author 


# ==========================================================================
# 1. 作品属性モデル (AdultAttribute)
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
    
    slug = models.CharField(
        'スラッグ', 
        max_length=100, 
        unique=True, 
        db_index=True, 
        help_text="URLに使用されます。日本語可。"
    )
    
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

    def save(self, *args, **kwargs):
        if self.name:
            self.name = unicodedata.normalize('NFKC', self.name).strip()
        
        if not self.slug:
            temp_slug = self.name.replace(" ", "-").replace("　", "-")
            self.slug = re.sub(r'[^\w\s-]', '', temp_slug)
            
        super().save(*args, **kwargs)


# ==========================================================================
# 2. アダルト商品モデル (AdultProduct)
# ==========================================================================
class AdultProduct(models.Model):
    # --- 基本情報 ---
    raw_data = models.ForeignKey(RawApiData, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products', verbose_name="生データソース")
    
    api_source = models.CharField(
        max_length=20, 
        verbose_name="APIソース (DMM/FANZA/DUGA)",
        help_text="取得元のプラットフォーム識別子"
    )
    
    api_product_id = models.CharField(max_length=255, verbose_name="API提供元製品ID")
    product_id_unique = models.CharField(max_length=255, unique=True, verbose_name="統合ID")
    title = models.CharField(max_length=512, verbose_name="作品タイトル")
    
    product_description = models.TextField(
        null=True, 
        blank=True, 
        verbose_name="作品紹介文",
        help_text="AI解析の元ネタとなる文章"
    )
    
    release_date = models.DateField(null=True, blank=True, verbose_name="公開日")
    affiliate_url = models.URLField(max_length=2048, verbose_name="アフィリエイトURL")
    price = models.IntegerField(null=True, blank=True, verbose_name="販売価格 (円)")
    image_url_list = models.JSONField(default=list, verbose_name="画像URLリスト")

    sample_movie_url = models.JSONField(
        null=True, 
        blank=True, 
        verbose_name="サンプル動画データ",
        help_text="{'url': '...', 'preview_image': '...'} の形式で格納"
    )
    
    # --- リレーション ---
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_made', verbose_name="メーカー")
    label = models.ForeignKey(Label, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_labeled', verbose_name="レーベル")
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_directed', verbose_name="監督")
    
    # 💡 追加ポイント: Author (著者/作者) のリレーションを追加
    author = models.ForeignKey(
        Author, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='adult_products_authored', 
        verbose_name="著者/作者"
    )

    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_in_series', verbose_name="シリーズ")
    genres = models.ManyToManyField(Genre, related_name='adult_products', verbose_name="ジャンル")
    actresses = models.ManyToManyField(Actress, related_name='adult_products', verbose_name="出演者")

    # --- AI生成・管理 ---
    ai_content = models.TextField(null=True, blank=True, verbose_name="AI生成レビュー本文")
    ai_summary = models.CharField(max_length=500, null=True, blank=True, verbose_name="AI記事要約")
    target_segment = models.CharField(max_length=255, null=True, blank=True, verbose_name="AI判定ターゲット層")
    
    is_posted = models.BooleanField(default=False, verbose_name="投稿済み")
    is_active = models.BooleanField(default=True, verbose_name="掲載中")
    
    # --- 📊 スコア解析 ---
    score_visual = models.IntegerField(default=0, verbose_name="ルックス(1-100)")
    score_story = models.IntegerField(default=0, verbose_name="構成(1-100)")
    score_cost = models.IntegerField(default=0, verbose_name="コスパ(1-100)")
    score_erotic = models.IntegerField(default=0, verbose_name="エロ(1-100)")
    score_rarity = models.IntegerField(default=0, verbose_name="希少性(1-100)")
    
    spec_score = models.IntegerField(default=0, verbose_name="総合スコア(0-100)")
    last_spec_parsed_at = models.DateTimeField(null=True, blank=True, verbose_name="解析実行日")

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

    def save(self, *args, **kwargs):
        # 1. api_source を大文字で統一
        if self.api_source:
            self.api_source = self.api_source.upper()

        if self.title:
            self.title = unicodedata.normalize('NFKC', self.title).strip()

        # 2. 統合IDの自動生成
        if not self.product_id_unique and self.api_source and self.api_product_id:
            self.product_id_unique = f"{self.api_source.lower()}_{self.api_product_id}"

        # 3. 総合スコアの自動計算
        scores = [self.score_visual, self.score_story, self.score_cost, self.score_erotic, self.score_rarity]
        filled_scores = [s for s in scores if s > 0]
        if filled_scores:
            self.spec_score = sum(filled_scores) // len(filled_scores)

        super().save(*args, **kwargs)
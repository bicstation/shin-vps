# -*- coding: utf-8 -*-
# /usr/src/app/api/models/adult_models.py

from django.db import models
from django.utils import timezone
import unicodedata

# 外部参照モデル（Master Data）
from .raw_and_entities import RawApiData, Maker, Label, Director, Series, Genre, Actress, Author 

# ==========================================================================
# 🚀 階層マスタモデル
# ==========================================================================
class FanzaFloorMaster(models.Model):
    site_code = models.CharField('サイトコード', max_length=50, db_index=True, help_text="FANZA / DMM.com")
    site_name = models.CharField('サイト名', max_length=100)
    service_code = models.CharField('サービスコード', max_length=50, db_index=True, help_text="digital, mono, book等")
    service_name = models.CharField('サービス名', max_length=100)
    floor_code = models.CharField('フロアコード', max_length=50, unique=True, db_index=True)
    floor_name = models.CharField('フロア名', max_length=100)
    
    is_adult = models.BooleanField('アダルトフラグ', default=True)
    ai_system_prompt = models.TextField('AIシステムプロンプト', blank=True, null=True)
    ai_tone_keywords = models.CharField('トーンキーワード', max_length=255, blank=True, null=True)

    is_active = models.BooleanField('有効', default=True, db_index=True)
    last_synced_at = models.DateTimeField('最終同期日', auto_now=True)

    class Meta:
        db_table = 'fanza_floor_master'
        verbose_name = '階層マスタ'
        verbose_name_plural = '階層マスタ一覧'
        ordering = ['site_code', 'service_code', 'floor_code']

    def __str__(self):
        status = "R18" if self.is_adult else "一般"
        return f"[{self.site_code}:{status}] {self.service_name} > {self.floor_name}"

# ==========================================================================
# 1. 作品属性（ドメイン隔離対応版）
# ==========================================================================
class AdultAttribute(models.Model):
    TYPE_CHOICES = [
        ('body', '身体的特徴'),
        ('style', '作品スタイル'),
        ('scene', 'シチュエーション'),
        ('feature', '技術・物理仕様'),
        ('event', '販売形態・催事'),
        ('actor_type', '出演者タイプ'),
    ]
    attr_type = models.CharField('属性タイプ', max_length=20, choices=TYPE_CHOICES, db_index=True)
    name = models.CharField('表示名', max_length=100)
    slug = models.CharField('スラッグ', max_length=100, unique=True, db_index=True)
    search_keywords = models.TextField('抽出キーワード', blank=True)
    order = models.PositiveIntegerField('表示順', default=0)

    # 💡 勝利の鍵：PCサイトとの混同を防ぐための明示的フラグ
    is_adult = models.BooleanField(
        'アダルト属性フラグ', 
        default=True, 
        db_index=True,
        help_text="Trueに固定。Bic Station側の属性マスタ同期から除外するための識別子です。"
    )

    class Meta:
        verbose_name = '作品属性'
        verbose_name_plural = '作品属性一覧'
        ordering = ['attr_type', 'order', 'name']

    def __str__(self):
        return f"🔞 [{self.get_attr_type_display()}] {self.name}"

# ==========================================================================
# 2. 統合アダルト商品モデル（複合インデックス高速化版）
# ==========================================================================
class AdultProduct(models.Model):
    # 基本リレーション
    raw_data = models.ForeignKey(RawApiData, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products')
    api_source = models.CharField(max_length=20, verbose_name="ソース元", db_index=True)
    api_service = models.CharField(max_length=50, null=True, blank=True, verbose_name="サービス種別", db_index=True)
    floor_master = models.ForeignKey(FanzaFloorMaster, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    floor_code = models.CharField(max_length=50, verbose_name="フロア識別", db_index=True)
    
    # 識別子
    api_product_id = models.CharField(max_length=255, verbose_name="元サイトの商品ID")
    product_id_unique = models.CharField(max_length=255, unique=True, verbose_name="システム内一意識別子")
    content_id = models.CharField(max_length=255, null=True, blank=True, db_index=True, verbose_name="コンテンツID")
    
    # コンテンツ情報
    title = models.CharField(max_length=512, verbose_name="作品タイトル")
    product_description = models.TextField(null=True, blank=True, verbose_name="標準紹介文")
    rich_description = models.TextField(null=True, blank=True, verbose_name="詳細ストーリー")
    release_date = models.DateField(null=True, blank=True, verbose_name="発売・公開日", db_index=True)
    affiliate_url = models.URLField(max_length=2048, verbose_name="アフィリエイトURL")
    
    # 価格・販売情報
    price = models.IntegerField(null=True, blank=True, verbose_name="現在の最安値", db_index=True)
    list_price = models.IntegerField(null=True, blank=True, verbose_name="定価")
    price_all_options = models.JSONField(default=list, blank=True, verbose_name="価格バリエーション")
    is_unlimited = models.BooleanField(default=False, verbose_name="サブスク対象", db_index=True)
    unlimited_channels = models.JSONField(default=list, blank=True, verbose_name="所属サブスク名")
    is_on_sale = models.BooleanField(default=False, verbose_name="セール中", db_index=True)
    discount_rate = models.IntegerField(default=0, verbose_name="割引率(%)")
    campaign_title = models.CharField(max_length=255, null=True, blank=True, verbose_name="セール名")
    campaign_date_end = models.DateTimeField(null=True, blank=True, verbose_name="セール終了期限")
    
    # スペック
    stock_status = models.CharField(max_length=50, null=True, blank=True, verbose_name="在庫/予約状況")
    maker_product_id = models.CharField(max_length=100, null=True, blank=True, verbose_name="メーカー品番")
    volume = models.CharField(max_length=50, null=True, blank=True, verbose_name="総量")
    delivery_type = models.CharField(max_length=50, null=True, blank=True, verbose_name="媒体/形式")
    jancode = models.CharField(max_length=20, null=True, blank=True, db_index=True, verbose_name="JANコード")
    
    # 評価
    review_average = models.FloatField(default=0.0, verbose_name="評価平均点", db_index=True)
    review_count = models.PositiveIntegerField(default=0, verbose_name="レビュー投稿数")

    # メディア
    image_url_list = models.JSONField(default=dict, verbose_name="メイン画像群") 
    sample_image_list = models.JSONField(default=list, verbose_name="サンプル画像")
    sample_movie_url = models.JSONField(null=True, blank=True, verbose_name="動画プレイヤー情報")
    tachiyomi_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="試し読みURL")

    # マスターリレーション
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_made')
    label = models.ForeignKey(Label, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_labeled')
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_directed')
    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_in_series')
    authors = models.ManyToManyField(Author, blank=True, related_name='products_authored')
    genres = models.ManyToManyField(Genre, related_name='products')
    actresses = models.ManyToManyField(Actress, related_name='products')
    
    # 💡 作品属性リレーション
    attributes = models.ManyToManyField(AdultAttribute, blank=True, related_name='products')

    # 🤖 AI解析セクション
    ai_catchcopy = models.CharField(max_length=500, null=True, blank=True, verbose_name="AIキャッチコピー")
    ai_summary = models.TextField(null=True, blank=True, verbose_name="AIサマリー文")
    ai_content = models.TextField(null=True, blank=True, verbose_name="AI生成独自レビュー")
    target_segment = models.CharField(max_length=255, null=True, blank=True, verbose_name="ターゲット層")
    ai_chat_comments = models.JSONField(default=list, blank=True, verbose_name="疑似チャット")
    
    # 🚀 高速検索用キャッシュフラグ
    has_attributes = models.BooleanField(
        default=False, 
        db_index=True, 
        verbose_name="属性あり", 
        help_text="属性が1つ以上ある場合にTrue。検索高速化用。"
    )

    # 評価・スコア
    ai_score_visual = models.IntegerField(default=0, verbose_name="AI映像評価")
    ai_score_story = models.IntegerField(default=0, verbose_name="AIストーリー評価")
    ai_score_erotic = models.IntegerField(default=0, verbose_name="AI刺激評価")

    score_visual = models.IntegerField(default=0, verbose_name="視覚的完成度(VISUAL)")
    score_story = models.IntegerField(default=0, verbose_name="シナリオ強度(STORY)")
    score_erotic = models.IntegerField(default=0, verbose_name="エロティズム(EROTIC)")
    score_rarity = models.IntegerField(default=0, verbose_name="希少性(RARITY)")
    score_cost_performance = models.IntegerField(default=0, verbose_name="コスパ(COST)")
    
    spec_score = models.IntegerField(default=0, verbose_name="おすすめ総合スコア", db_index=True)
    score_fetish = models.IntegerField(default=0, verbose_name="フェティシズム濃度")
    last_spec_parsed_at = models.DateTimeField(null=True, blank=True, verbose_name="AI解析実施日")
    
    is_posted = models.BooleanField(default=False, verbose_name="公開状態", db_index=True)
    is_active = models.BooleanField(default=True, verbose_name="有効", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'adult_product'
        verbose_name = '統合アダルト商品'
        verbose_name_plural = '統合アダルト商品一覧'
        ordering = ['-release_date']
        indexes = [
            models.Index(fields=['is_active', 'has_attributes', '-release_date']),
            models.Index(fields=['api_source', 'is_active', '-release_date']),
            models.Index(fields=['floor_code', 'is_active', '-release_date']),
        ]

    def __str__(self):
        return f"[{self.api_source}] {self.title}"

    def save(self, *args, **kwargs):
        if self.title:
            self.title = unicodedata.normalize('NFKC', self.title).strip()
        if self.api_source:
            self.api_source = self.api_source.upper()
        if not self.product_id_unique:
            self.product_id_unique = f"{self.api_source}_{self.floor_code}_{self.api_product_id}".lower()
        
        # セール判定
        if self.list_price and self.price and int(self.list_price) > int(self.price):
            self.is_on_sale = True
            self.discount_rate = int((1 - (int(self.price) / int(self.list_price))) * 100)
        
        super().save(*args, **kwargs)

# ==========================================================================
# 3. 統合アダルト女優プロファイル
# ==========================================================================
class AdultActressProfile(models.Model):
    master_actress = models.OneToOneField(
        Actress, on_delete=models.CASCADE, related_name='profile', null=True, blank=True
    )
    actress_id = models.CharField('FANZA女優ID', max_length=100, unique=True, db_index=True)
    name = models.CharField('女優名', max_length=255, db_index=True)
    ruby = models.CharField('読み仮名', max_length=255, null=True, blank=True)
    
    bust = models.IntegerField('バスト', null=True, blank=True)
    cup = models.CharField('カップ', max_length=10, null=True, blank=True, db_index=True)
    waist = models.IntegerField('ウエスト', null=True, blank=True)
    hip = models.IntegerField('ヒップ', null=True, blank=True)
    height = models.IntegerField('身長', null=True, blank=True, db_index=True)
    birthday = models.DateField('生年月日', null=True, blank=True)
    blood_type = models.CharField('血液型', max_length=10, null=True, blank=True)
    prefectures = models.CharField('出身地', max_length=100, null=True, blank=True)
    hobby = models.TextField('趣味', null=True, blank=True)
    
    image_url_small = models.URLField('画像URL(小)', max_length=500, null=True, blank=True)
    image_url_large = models.URLField('画像URL(大)', max_length=500, null=True, blank=True)
    external_links = models.JSONField('外部リンク集', default=dict, blank=True)

    ai_catchcopy = models.CharField('AIキャッチコピー', max_length=500, null=True, blank=True)
    ai_description = models.TextField('AI生成紹介文', null=True, blank=True)
    
    score_visual = models.IntegerField('視覚的評価(VISUAL)', default=0, db_index=True)
    score_style = models.IntegerField('スタイル評価(STYLE)', default=0, db_index=True)
    score_performance = models.IntegerField('表現力(PERFORMANCE)', default=0, db_index=True)
    score_popularity = models.IntegerField('市場人気度(POPULARITY)', default=0, db_index=True)
    
    ai_power_score = models.IntegerField('おすすめ総合評価', default=0, db_index=True)
    
    product_count = models.PositiveIntegerField('出演作品数', default=0, db_index=True)
    is_active = models.BooleanField('有効', default=True, db_index=True)
    last_synced_at = models.DateTimeField('最終同期日', auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'adult_actress_profile'
        verbose_name = 'アダルト女優プロファイル'
        verbose_name_plural = 'アダルト女優プロファイル一覧'
        ordering = ['-ai_power_score', '-product_count']
        indexes = [
            models.Index(fields=['is_active', '-ai_power_score']),
        ]

    def __str__(self):
        return f"{self.name} ({self.actress_id})"

    def save(self, *args, **kwargs):
        if self.name:
            self.name = unicodedata.normalize('NFKC', self.name).strip()
        super().save(*args, **kwargs)
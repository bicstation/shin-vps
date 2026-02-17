# -*- coding: utf-8 -*-
from django.db import models
from django.utils import timezone
import unicodedata

# 外部参照モデル（Master Data）
from .raw_and_entities import RawApiData, Maker, Label, Director, Series, Genre, Actress, Author 

# ==========================================================================
# 🚀 NEW: 階層マスタモデル (API構造の永続化用)
# ==========================================================================
class FanzaFloorMaster(models.Model):
    """
    【階層マスタ】
    FANZA/DMM公式APIの FloorList から取得した サイト > サービス > フロア 構造を保存。
    フロントエンドのサイドバー生成や、物理パスの解決に使用する。
    """
    site_code = models.CharField('サイトコード', max_length=50, db_index=True, help_text="FANZA / DMM.com")
    site_name = models.CharField('サイト名', max_length=100)
    
    service_code = models.CharField('サービスコード', max_length=50, db_index=True, help_text="digital, mono, book等")
    service_name = models.CharField('サービス名', max_length=100)
    
    floor_code = models.CharField('フロアコード', max_length=50, unique=True, db_index=True, help_text="videoa, dvd, comic等")
    floor_name = models.CharField('フロア名', max_length=100)
    
    is_active = models.BooleanField('有効', default=True)
    last_synced_at = models.DateTimeField('最終同期日', auto_now=True)

    class Meta:
        db_table = 'fanza_floor_master'
        verbose_name = '階層マスタ'
        verbose_name_plural = '階層マスタ一覧'
        ordering = ['site_code', 'service_code', 'floor_code']

    def __str__(self):
        return f"[{self.site_code}] {self.service_name} > {self.floor_name}"

# ==========================================================================
# 1. 作品属性（詳細スペック・AIタグ付け用）
# ==========================================================================
class AdultAttribute(models.Model):
    """
    【AI・検索用メタデータ】
    公式ジャンル(Genre)では検索に引っかからない、より情緒的・詳細な「切り口」を管理。
    """
    TYPE_CHOICES = [
        ('body', '身体的特徴'),
        ('style', '作品スタイル'),
        ('scene', 'シチュエーション'),
        ('feature', '技術・物理仕様'),
        ('event', '販売形態・催事'),
    ]
    attr_type = models.CharField('属性タイプ', max_length=20, choices=TYPE_CHOICES)
    name = models.CharField('表示名', max_length=100)
    slug = models.CharField('スラッグ', max_length=100, unique=True, db_index=True)
    search_keywords = models.TextField(
        '抽出キーワード', 
        blank=True, 
        help_text="AIがタイトルや紹介文からこの属性を自動判定するための単語群（カンマ区切り）"
    )
    order = models.PositiveIntegerField('表示順', default=0)

    class Meta:
        verbose_name = '作品属性'
        verbose_name_plural = '作品属性一覧'
        ordering = ['attr_type', 'order', 'name']

    def __str__(self):
        return f"[{self.get_attr_type_display()}] {self.name}"

# ==========================================================================
# 2. 統合アダルト商品モデル（全フロア統合・AI自動運用型）
# ==========================================================================
class AdultProduct(models.Model):
    """
    【基幹モデル：全フロア統合データベース】
    """
    # --- 🔑 識別・基本情報 ---
    raw_data = models.ForeignKey(
        RawApiData, on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='adult_products', verbose_name="生データソース"
    )
    api_source = models.CharField(
        max_length=20, verbose_name="ソース元", help_text="FANZA / DMM / DUGA"
    )
    
    # NEW: 階層マスタとの紐付け
    floor_master = models.ForeignKey(
        FanzaFloorMaster, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='products', verbose_name="所属フロアマスタ"
    )
    
    floor_code = models.CharField(
        max_length=50, verbose_name="フロア識別", db_index=True,
        help_text="videoa(動画), unlimited_comic(読み放題), mono(通販) 等"
    )
    api_product_id = models.CharField(
        max_length=255, verbose_name="元サイトの商品ID", help_text="cidやproduct_id"
    )
    product_id_unique = models.CharField(
        max_length=255, unique=True, verbose_name="システム内一意識別子", 
        help_text="例: fanza_videoa_abp123"
    )
    content_id = models.CharField(
        max_length=255, null=True, blank=True, db_index=True, verbose_name="コンテンツID"
    )
    title = models.CharField(max_length=512, verbose_name="作品タイトル")
    
    # --- 📝 紹介文 ---
    product_description = models.TextField(null=True, blank=True, verbose_name="標準紹介文")
    rich_description = models.TextField(null=True, blank=True, verbose_name="詳細ストーリー")
    
    release_date = models.DateField(null=True, blank=True, verbose_name="発売・公開日")
    affiliate_url = models.URLField(max_length=2048, verbose_name="アフィリエイトURL")
    
    # --- 💰 価格・見放題 ---
    price = models.IntegerField(null=True, blank=True, verbose_name="現在の最安値")
    list_price = models.IntegerField(null=True, blank=True, verbose_name="定価")
    price_all_options = models.JSONField(default=list, blank=True, verbose_name="価格バリエーション")
    
    is_unlimited = models.BooleanField(default=False, verbose_name="サブスク対象")
    unlimited_channels = models.JSONField(default=list, blank=True, verbose_name="所属サブスク名")
    
    is_on_sale = models.BooleanField(default=False, verbose_name="セール中")
    discount_rate = models.IntegerField(default=0, verbose_name="割引率(%)")
    campaign_title = models.CharField(max_length=255, null=True, blank=True, verbose_name="セール名")
    campaign_date_end = models.DateTimeField(null=True, blank=True, verbose_name="セール終了期限")

    # --- 📦 フロア別属性 ---
    stock_status = models.CharField(max_length=50, null=True, blank=True, verbose_name="在庫/予約状況")
    maker_product_id = models.CharField(max_length=100, null=True, blank=True, verbose_name="メーカー品番")
    volume = models.CharField(max_length=50, null=True, blank=True, verbose_name="総量")
    delivery_type = models.CharField(max_length=50, null=True, blank=True, verbose_name="媒体/形式")

    # --- 📊 ユーザー評価 ---
    review_average = models.FloatField(default=0.0, verbose_name="評価平均点")
    review_count = models.PositiveIntegerField(default=0, verbose_name="レビュー投稿数")
    jancode = models.CharField(max_length=20, null=True, blank=True, db_index=True, verbose_name="JAN/ISBNコード")

    # --- 🖼️ メディア ---
    image_url_list = models.JSONField(default=dict, verbose_name="メイン画像群") 
    sample_image_list = models.JSONField(default=list, verbose_name="サンプル画像")
    sample_movie_url = models.JSONField(null=True, blank=True, verbose_name="動画プレイヤー情報")
    tachiyomi_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="試し読み/体験版URL")
    
    # --- 🔗 フロア間連携 ---
    mono_product_info = models.JSONField(default=list, blank=True, verbose_name="他フロア商品リンク")

    # --- 🔗 マスタ連携 ---
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_made')
    label = models.ForeignKey(Label, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_labeled')
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_directed')
    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_in_series')
    authors = models.ManyToManyField(Author, blank=True, related_name='products_authored')
    genres = models.ManyToManyField(Genre, related_name='products')
    actresses = models.ManyToManyField(Actress, related_name='products')
    attributes = models.ManyToManyField(AdultAttribute, blank=True, related_name='products')

    # --- 🤖 AI & 解析スコアリング ---
    ai_content = models.TextField(null=True, blank=True, verbose_name="AI生成独自レビュー")
    ai_summary = models.CharField(max_length=500, null=True, blank=True, verbose_name="AIキャッチコピー")
    ai_chat_comments = models.JSONField(default=list, blank=True, verbose_name="疑似チャット")
    target_segment = models.CharField(max_length=255, null=True, blank=True, verbose_name="ターゲット層")

    score_visual = models.IntegerField(default=0, verbose_name="視覚的完成度")
    score_story = models.IntegerField(default=0, verbose_name="シナリオ強度")
    score_fetish = models.IntegerField(default=0, verbose_name="フェティシズム濃度")
    score_cost_performance = models.IntegerField(default=0, verbose_name="コスパ")
    ranking_trend = models.JSONField(default=list, blank=True, verbose_name="ランキング推移")

    last_spec_parsed_at = models.DateTimeField(null=True, blank=True, verbose_name="AI解析実施日")
    spec_score = models.IntegerField(default=0, verbose_name="おすすめスコア")
    is_posted = models.BooleanField(default=False, verbose_name="公開状態")
    is_active = models.BooleanField(default=True, verbose_name="有効")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'adult_product'
        verbose_name = '統合アダルト商品'
        verbose_name_plural = '統合アダルト商品一覧'
        ordering = ['-release_date']

    def __str__(self):
        return f"[{self.api_source}] {self.title}"

    def save(self, *args, **kwargs):
        # 1. 表記正規化
        if self.title:
            self.title = unicodedata.normalize('NFKC', self.title).strip()
        if self.api_source:
            self.api_source = self.api_source.upper()
        
        # 2. 自動紐付け：floor_code から floor_master を自動セット
        if not self.floor_master and self.floor_code:
            master = FanzaFloorMaster.objects.filter(floor_code=self.floor_code).first()
            if master:
                self.floor_master = master

        # 3. ユニークID生成
        if not self.product_id_unique:
            self.product_id_unique = f"{self.api_source}_{self.floor_code}_{self.api_product_id}".lower()

        # 4. 割引計算
        if self.list_price and self.price and int(self.list_price) > int(self.price):
            self.is_on_sale = True
            self.discount_rate = int((1 - (int(self.price) / int(self.list_price))) * 100)
        else:
            self.is_on_sale = False
            self.discount_rate = 0

        super().save(*args, **kwargs)
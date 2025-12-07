from django.db import models
from django.utils import timezone

# ==========================================================================
# 1. API生データモデル (RawApiData)
# ==========================================================================

class RawApiData(models.Model):
    """
    FANZA, DUGA, LinkShareなどのAPI/FTPから取得した
    生データ（JSONやCSV行）をそのまま格納するモデル。
    """
    API_CHOICES = [
        ('DUGA', 'DUGA API'),
        ('FANZA', 'FANZA API'),
        ('LINKSHARE', 'LinkShare FTP'), # ★ 追加
    ]

    api_source = models.CharField(max_length=15, choices=API_CHOICES, verbose_name="APIソース")
    api_product_id = models.CharField(max_length=255, verbose_name="API商品ID/リンクID")
    
    # JSONFieldはPostgreSQLで推奨。CSVデータもJSON化して保存可能
    raw_json_data = models.JSONField(verbose_name="生データ(JSON)")
    
    api_service = models.CharField(max_length=50, null=True, blank=True, verbose_name="APIサービスコード")
    api_floor = models.CharField(max_length=50, null=True, blank=True, verbose_name="APIフロアコード")

    migrated = models.BooleanField(default=False, verbose_name="移行済み") 
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")
    
    class Meta:
        db_table = 'site_raw_api_data' # 共通プレフィックス
        verbose_name = 'API生データ'
        verbose_name_plural = 'API生データ一覧'
        unique_together = ('api_source', 'api_product_id')

    def __str__(self):
        return f"{self.api_source}: {self.api_product_id}"


# ==========================================================================
# 2. アダルト系エンティティモデル群 (EntityBase)
# ==========================================================================

class EntityBase(models.Model):
    """
    メーカー、ジャンル、女優などの共通フィールドを持つ基底クラス
    """
    api_source = models.CharField(max_length=10, verbose_name="APIソース (DUGA/FANZA)")
    api_id = models.CharField(max_length=255, null=True, blank=True, unique=False, verbose_name="API固有ID")
    name = models.CharField(max_length=255, verbose_name="名称")
    product_count = models.IntegerField(default=0, verbose_name="関連商品数")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        abstract = True
        unique_together = (('api_source', 'name'),)
        ordering = ['name']

    def __str__(self):
        return f"[{self.api_source}] {self.name}"

class Maker(EntityBase):
    """メーカー"""
    class Meta(EntityBase.Meta):
        db_table = 'adult_maker'
        verbose_name = 'メーカー'
        verbose_name_plural = 'メーカー一覧'

class Label(EntityBase):
    """レーベル"""
    class Meta(EntityBase.Meta):
        db_table = 'adult_label'
        verbose_name = 'レーベル'
        verbose_name_plural = 'レーベル一覧'

class Genre(EntityBase):
    """ジャンル/カテゴリ"""
    class Meta(EntityBase.Meta):
        db_table = 'adult_genre'
        verbose_name = 'ジャンル'
        verbose_name_plural = 'ジャンル一覧'

class Actress(EntityBase):
    """女優/出演者"""
    class Meta(EntityBase.Meta):
        db_table = 'adult_actress'
        verbose_name = '女優'
        verbose_name_plural = '女優一覧'

class Director(EntityBase):
    """監督"""
    class Meta(EntityBase.Meta):
        db_table = 'adult_director'
        verbose_name = '監督'
        verbose_name_plural = '監督一覧'

class Series(EntityBase):
    """シリーズ"""
    class Meta(EntityBase.Meta):
        db_table = 'adult_series'
        verbose_name = 'シリーズ'
        verbose_name_plural = 'シリーズ一覧'


# ==========================================================================
# 3. アダルト商品モデル (AdultProduct)
# ==========================================================================

class AdultProduct(models.Model):
    """
    正規化された、アダルト系コンテンツ専用の商品データ。
    FANZA/DUGAのデータを統合・整形して格納する。
    """
    raw_data = models.ForeignKey(
        RawApiData,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='adult_products',
        verbose_name="生データソース"
    )

    api_source = models.CharField(max_length=10, verbose_name="APIソース")
    api_product_id = models.CharField(max_length=255, verbose_name="API提供元製品ID")
    product_id_unique = models.CharField(max_length=255, unique=True, verbose_name="統合ID")
    title = models.CharField(max_length=512, verbose_name="作品タイトル")
    release_date = models.DateField(null=True, blank=True, verbose_name="公開日")
    
    affiliate_url = models.URLField(max_length=2048, verbose_name="アフィリエイトURL")
    price = models.IntegerField(null=True, blank=True, verbose_name="販売価格 (円)")
    image_url_list = models.JSONField(default=list, verbose_name="画像URLリスト")

    # リレーション
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name="メーカー")
    label = models.ForeignKey(Label, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name="レーベル")
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name="監督")
    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name="シリーズ")

    genres = models.ManyToManyField(Genre, related_name='products', verbose_name="ジャンル")
    actresses = models.ManyToManyField(Actress, related_name='products', verbose_name="出演者")
    
    is_active = models.BooleanField(default=True, verbose_name="有効/無効")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        db_table = 'adult_product'
        verbose_name = 'アダルト商品'
        verbose_name_plural = 'アダルト商品一覧'
        ordering = ['-release_date']

    def __str__(self):
        return self.title


# ==========================================================================
# 4. LinkShare商品モデル (LinkshareProduct) - ノーマル商品用
# ==========================================================================

class LinkshareProduct(models.Model):
    """
    LinkShareマーチャンダイザー(クロスデバイス)フォーマット(38フィールド)に対応した商品モデル。
    BicCamera, BicSavingなどのノーマル商品データとして使用します。
    参照: アフィリエイト様向けマーチャンダイザーご利用ガイド_Ver6.2.3.pdf
    """
    
    # --- 管理用フィールド ---
    merchant_id = models.CharField(max_length=32, verbose_name="マーチャントID (MID)", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    # --- 1. 基本属性 (フィールド 1-28) ---
    
    # 1. リンク ID (半角数字)
    link_id = models.CharField(max_length=64, verbose_name="リンクID", db_index=True)
    
    # 2. 商品名 (全半角 255文字)
    product_name = models.CharField(max_length=512, verbose_name="商品名") # 余裕を持って512
    
    # 3. SKU (半角英数記号 64文字)
    sku = models.CharField(max_length=128, verbose_name="SKU", db_index=True) # 余裕を持って128
    
    # 4. 主カテゴリ (全半角 50文字)
    primary_category = models.CharField(max_length=255, blank=True, null=True, verbose_name="主カテゴリ")
    
    # 5. サブカテゴリ (全半角 2000文字)
    sub_category = models.TextField(blank=True, null=True, verbose_name="サブカテゴリ")
    
    # 6. 商品 URL
    product_url = models.URLField(max_length=2048, verbose_name="商品URL")
    
    # 7. 商品画像 URL
    image_url = models.URLField(max_length=2048, blank=True, null=True, verbose_name="商品画像URL")
    
    # 8. 購買ボタンクリック後の URL
    buy_url = models.URLField(max_length=2048, blank=True, null=True, verbose_name="購買URL")
    
    # 9. 商品概要
    short_description = models.TextField(blank=True, null=True, verbose_name="商品概要")
    
    # 10. 商品詳細
    description = models.TextField(blank=True, null=True, verbose_name="商品詳細")
    
    # 11. 値引金額（割合）
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name="値引金額/率")
    
    # 12. 値引種別 (amount/percentage)
    discount_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="値引種別")
    
    # 13. 値引き後の価格 (売価)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name="販売価格")
    
    # 14. 値引き前の価格 (定価)
    retail_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name="定価")
    
    # 15. リンク有効日
    begin_date = models.DateTimeField(blank=True, null=True, verbose_name="リンク有効日")
    
    # 16. リンク無効日
    end_date = models.DateTimeField(blank=True, null=True, verbose_name="リンク無効日")
    
    # 17. ブランド名
    brand_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="ブランド名")
    
    # 18. 送料
    shipping = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name="送料")
    
    # 19. キーワード
    keywords = models.TextField(blank=True, null=True, verbose_name="キーワード")
    
    # 20. 製造品番
    manufacturer_part_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="製造品番")
    
    # 21. メーカー名
    manufacturer_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="メーカー名")
    
    # 22. 配送追加情報
    shipping_information = models.CharField(max_length=255, blank=True, null=True, verbose_name="配送追加情報")
    
    # 23. 在庫情報
    availability = models.CharField(max_length=100, blank=True, null=True, verbose_name="在庫情報")
    
    # 24. 共通商品コード (JAN/UPC)
    universal_product_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="JAN/UPC")
    
    # 25. 追加属性コード (class_id)
    class_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="追加属性コード")
    
    # 26. 通貨単位
    currency = models.CharField(max_length=10, default='JPY', verbose_name="通貨")
    
    # 27. M1
    m1 = models.CharField(max_length=2000, blank=True, null=True, verbose_name="M1")
    
    # 28. インプレッション計測 URL
    pixel_url = models.CharField(max_length=512, blank=True, null=True, verbose_name="Pixel URL")

    # --- 2. 追加属性 (フィールド 29-38) ---
    attribute_1 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性1")
    attribute_2 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性2")
    attribute_3 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性3")
    attribute_4 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性4")
    attribute_5 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性5")
    attribute_6 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性6")
    attribute_7 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性7")
    attribute_8 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性8")
    attribute_9 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性9")
    attribute_10 = models.CharField(max_length=255, blank=True, null=True, verbose_name="追加属性10")

    class Meta:
        # LinkShareデータのマスターテーブルとして 'ls_' プレフィックスを使用
        db_table = 'ls_product_master'
        verbose_name = 'LinkShare商品マスタ'
        verbose_name_plural = 'LinkShare商品マスタ一覧'
        unique_together = ('merchant_id', 'sku') 
        indexes = [
            models.Index(fields=['merchant_id', 'updated_at']),
        ]

    def __str__(self):
        return f"[{self.merchant_id}] {self.product_name} ({self.sku})"
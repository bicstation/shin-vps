# -*- coding: utf-8 -*-
from django.db import models
from django.utils import timezone
import unicodedata

# 外部参照モデル（Master Data）
from .raw_and_entities import RawApiData, Maker, Label, Director, Series, Genre, Actress, Author 

# ==========================================================================
# 1. 作品属性（詳細スペック・AIタグ付け用）
# ==========================================================================
class AdultAttribute(models.Model):
    """
    【AI・検索用メタデータ】
    公式ジャンル(Genre)では検索に引っかからない、より情緒的・詳細な「切り口」を管理。
    AIが紹介文を生成する際の「フック（特徴量）」として活用する。
    """
    TYPE_CHOICES = [
        ('body', '身体的特徴'),      # 巨尻、Pカップ、熟女、アスリート体型
        ('style', '作品スタイル'),    # 読み放題対象、単行本、VR、4K、フルカラー、デジタル限定
        ('scene', 'シチュエーション'),  # 寝取り(NTR)、叔母、痙攣膣、時間停止、中出し、無防備トレーニング
        ('feature', '技術・物理仕様'),  # Windows11、Blu-ray、特典チェキ付、電子版特典付き
        ('event', '販売形態・催事'),   # コミケ作品、FANZA限定、在庫限り、先行予約
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
    動画・月額見放題・通販・同人・電子書籍をこの1つで管理。
    
    【AIへの指示書：運用ルール】
    1. analyze_adult_products コマンド実行時、AIは rich_description を最優先で読み込むこと。
    2. ai_summary には、スマホ閲覧時にクリックしたくなるキャッチコピーを生成すること。
    3. ai_content には、読者の妄想を膨らませるストーリー仕立てのレビューを生成すること。
    4. target_segment には、その作品が「誰に刺さるか」を明確に言語化すること。
    """
    
    # --- 🔑 識別・基本情報 ---
    raw_data = models.ForeignKey(
        RawApiData, on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='adult_products', verbose_name="生データソース"
    )
    api_source = models.CharField(
        max_length=20, verbose_name="ソース元", help_text="fanza / dmm / duga"
    )
    floor_code = models.CharField(
        max_length=50, verbose_name="フロア識別", 
        help_text="videoa(動画), unlimited_comic(読み放題), mono(通販) 等"
    )
    api_product_id = models.CharField(
        max_length=255, verbose_name="元サイトの商品ID", help_text="cidやproduct_id"
    )
    product_id_unique = models.CharField(
        max_length=255, unique=True, verbose_name="システム内一意識別子", 
        help_text="例: fanza_unlimited_b079akroe00078 (重複登録防止用)"
    )
    content_id = models.CharField(
        max_length=255, null=True, blank=True, db_index=True, verbose_name="コンテンツID"
    )
    title = models.CharField(max_length=512, verbose_name="作品タイトル")
    
    # --- 📝 紹介文 (ハイブリッド管理) ---
    product_description = models.TextField(
        null=True, blank=True, verbose_name="標準紹介文", 
        help_text="公式APIから取得。SEO用の基本的な説明文。"
    )
    rich_description = models.TextField(
        null=True, blank=True, 
        verbose_name="詳細ストーリー", 
        help_text="HTML(__NEXT_DATA__)から抽出。AIがエロい紹介文や属性を生成するための濃厚なソース。"
    )
    
    release_date = models.DateField(null=True, blank=True, verbose_name="発売・公開日")
    affiliate_url = models.URLField(max_length=2048, verbose_name="アフィリエイトURL")
    
    # --- 💰 価格・見放題 ---
    price = models.IntegerField(null=True, blank=True, verbose_name="現在の最安値")
    list_price = models.IntegerField(null=True, blank=True, verbose_name="定価")
    
    price_all_options = models.JSONField(
        default=list, blank=True, 
        verbose_name="価格バリエーション", 
        help_text="動画のHD/4K/DL版の各価格リスト。"
    )
    
    is_unlimited = models.BooleanField(default=False, verbose_name="サブスク対象")
    unlimited_channels = models.JSONField(
        default=list, blank=True, 
        verbose_name="所属サブスク名", 
        help_text="['FANZAブックス読み放題', '見放題ch デラックス'] 等"
    )
    
    is_on_sale = models.BooleanField(default=False, verbose_name="セール中")
    discount_rate = models.IntegerField(default=0, verbose_name="割引率(%)")
    campaign_title = models.CharField(max_length=255, null=True, blank=True, verbose_name="セール名")
    campaign_date_end = models.DateTimeField(null=True, blank=True, verbose_name="セール終了期限")

    # --- 📦 フロア別属性 ---
    stock_status = models.CharField(
        max_length=50, null=True, blank=True, 
        verbose_name="在庫/予約状況"
    )
    maker_product_id = models.CharField(
        max_length=100, null=True, blank=True, 
        verbose_name="メーカー品番", help_text="パッケージに記載されている英数字"
    )
    volume = models.CharField(
        max_length=50, null=True, blank=True, 
        verbose_name="総量", help_text="動画の分数、書籍のページ数"
    )
    delivery_type = models.CharField(
        max_length=50, null=True, blank=True, 
        verbose_name="媒体/形式", help_text="DVD, Blu-ray, streaming等"
    )

    # --- 📊 ユーザー評価 ---
    review_average = models.FloatField(default=0.0, verbose_name="評価平均点")
    review_count = models.PositiveIntegerField(default=0, verbose_name="レビュー投稿数")
    jancode = models.CharField(
        max_length=20, null=True, blank=True, db_index=True, verbose_name="JAN/ISBNコード"
    )

    # --- 🖼️ メディア ---
    image_url_list = models.JSONField(
        default=dict, verbose_name="メイン画像群", 
        help_text="{'small': '...', 'large': '...', 'list': '...'}。"
    ) 
    sample_image_list = models.JSONField(
        default=list, verbose_name="サンプル画像", help_text="ギャラリー表示用URLリスト"
    )
    sample_movie_url = models.JSONField(
        null=True, blank=True, 
        verbose_name="動画プレイヤー情報"
    )
    tachiyomi_url = models.URLField(
        max_length=2048, null=True, blank=True, 
        verbose_name="試し読み/体験版URL"
    )
    
    # --- 🔗 フロア間連携 ---
    mono_product_info = models.JSONField(
        default=list, blank=True, 
        verbose_name="他フロア商品リンク"
    )

    # --- 🔗 マスタ連携 ---
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_made', verbose_name="メーカー/出版社")
    label = models.ForeignKey(Label, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_labeled', verbose_name="レーベル")
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_directed', verbose_name="監督")
    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_in_series', verbose_name="シリーズ")
    authors = models.ManyToManyField(Author, blank=True, related_name='products_authored', verbose_name="著者/作家/原画")
    genres = models.ManyToManyField(Genre, related_name='products', verbose_name="ジャンル")
    actresses = models.ManyToManyField(Actress, related_name='products', verbose_name="出演女優/声優")
    attributes = models.ManyToManyField(AdultAttribute, blank=True, related_name='products', verbose_name="AI抽出・詳細タグ")

    # --- 🤖 AI & コミュニティ演出（AIソムリエの主戦場） ---
    ai_content = models.TextField(
        null=True, blank=True, 
        verbose_name="AI生成独自レビュー", 
        help_text="【AIへの指示】rich_descriptionを元に、読者の欲情を煽るブログ記事風レビューを生成してください。"
    )
    ai_summary = models.CharField(
        max_length=500, null=True, blank=True, 
        verbose_name="AIキャッチコピー", 
        help_text="【AIへの指示】一覧画面で目を引くための強烈な1行キャッチコピーを生成してください。"
    )
    ai_chat_comments = models.JSONField(
        default=list, blank=True, 
        verbose_name="疑似チャット/掲示板", 
        help_text="【AIへの指示】複数のユーザーになりきって、作品に対する期待や感想を3〜5件生成してください。"
    )
    target_segment = models.CharField(
        max_length=255, null=True, blank=True, 
        verbose_name="ターゲット層", 
        help_text="【AIへの指示】この作品が最も刺さる層を特定してください（例：新人発掘好き、ムチムチ熟女ファン等）。"
    )

    # --- ⚙️ 管理・公開設定 ---
    last_spec_parsed_at = models.DateTimeField(
        null=True, blank=True, 
        verbose_name="AI解析実施日",
        help_text="最後にAIソムリエが解析を行った日時。"
    )
    spec_score = models.IntegerField(
        default=0, 
        verbose_name="おすすめスコア", 
        help_text="評価点やAI判定から算出する内部的な表示優先度(0-100)。"
    )
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
        # 1. 表記のゆれを統一 (全角・半角の正規化)
        if self.title:
            self.title = unicodedata.normalize('NFKC', self.title).strip()
        
        # 2. 統合ユニークIDの生成
        if not self.product_id_unique:
            self.product_id_unique = f"{self.api_source}_{self.floor_code}_{self.api_product_id}".lower()

        # 3. 割引率の自動計算
        if self.list_price and self.price and int(self.list_price) > int(self.price):
            self.is_on_sale = True
            self.discount_rate = int((1 - (int(self.price) / int(self.list_price))) * 100)
        else:
            self.is_on_sale = False
            self.discount_rate = 0

        super().save(*args, **kwargs)
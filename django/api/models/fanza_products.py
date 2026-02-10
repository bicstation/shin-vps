# -*- coding: utf-8 -*-
from django.db import models
from django.utils import timezone
# 共通のエンティティ（女優・メーカー等）のみ参照
from .raw_and_entities import Maker, Label, Director, Series, Genre, Actress, Author 

class FanzaProduct(models.Model):
    """
    FANZA / DMM.com の全サービス（Digital, Mono, Book, Unlimited, Monthly）
    を統合管理し、AI解析や独自スコアリングに対応した最適化モデル。
    """

    # --- 1. 識別・管理用 ---
    # fz_{service_code}_{content_id} 等で生成し、プラットフォーム内の一意性を担保
    unique_id = models.CharField('統合用ID', max_length=255, unique=True)
    content_id = models.CharField('コンテンツID', max_length=100, db_index=True)
    product_id = models.CharField('プロダクトID', max_length=100, blank=True, null=True)
    
    # サイト・サービス構造
    site_code = models.CharField('サイト', max_length=20, db_index=True)      # FANZA / DMM.com
    service_code = models.CharField('サービス', max_length=50, db_index=True)  # digital, monthly, unlimited_book等
    floor_code = models.CharField('フロア', max_length=50, db_index=True)      # videoa, premium, unlimited_comic等
    floor_name = models.CharField('フロア名', max_length=100, blank=True)

    # --- 2. 作品基本情報 ---
    title = models.CharField('タイトル', max_length=512)
    url = models.URLField('商品URL', max_length=1000)
    affiliate_url = models.URLField('アフィURL', max_length=2048)
    release_date = models.DateTimeField('発売・配信日', null=True, db_index=True)
    
    # volume: 動画なら「120」（分）、書籍なら「200」（ページ）等を保持
    volume = models.CharField('ボリューム/収録時間', max_length=50, blank=True, null=True)
    
    # --- 3. 価格・セール情報 ---
    # 数値での基本価格（ソート・フィルタ用。通常は最安値や標準価格を保存）
    price = models.IntegerField('基本価格', default=0, db_index=True)
    
    # 複雑な体系をJSONで管理
    # 構造例: 
    # {
    #   "min_price": 350, 
    #   "max_price": 1666, 
    #   "is_sale": true,
    #   "deliveries": [{"type": "hd", "price": 1175, "list_price": 1680}, ...],
    #   "campaign": {"title": "30%OFF", "end_date": "2026-02-09"}
    # }
    price_info = models.JSONField('詳細価格情報', default=dict)

    # --- 4. ユーザー評価情報 ---
    review_count = models.IntegerField('レビュー数', default=0)
    review_average = models.FloatField('レビュー平均点', default=0.0)

    # --- 5. ビジュアル要素 (高画質対応) ---
    # imageURL: list, small, large を保持
    image_urls = models.JSONField('画像URLリスト', default=dict) 
    
    # sampleImageURL.sample_l.image (高画質サンプル) の配列を優先保存
    sample_images = models.JSONField('サンプル画像リスト', default=list)
    
    # sampleMovieURL: pc_flag, sp_flag, および各サイズ(476_306等)のURLを保持
    sample_movie = models.JSONField('サンプル動画データ', default=dict, null=True, blank=True)

    # --- 6. 属性リレーション ---
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, related_name='fanza_products')
    label = models.ForeignKey(Label, on_delete=models.SET_NULL, null=True, blank=True, related_name='fanza_products')
    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='fanza_products')
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, blank=True, related_name='fanza_products')
    
    # 複数人・複数属性対応
    genres = models.ManyToManyField(Genre, related_name='fanza_products')
    actresses = models.ManyToManyField(Actress, related_name='fanza_products')
    authors = models.ManyToManyField(Author, related_name='fanza_products', blank=True) # 電子書籍・読み放題用

    # --- 7. AI解析・拡張メタデータ ---
    # APIのitem_infoを加工せず保存（後からのデータ抽出・修正用）
    raw_item_info = models.JSONField('API生情報(item_info)', default=dict)
    
    # AI生成コンテンツ
    product_description = models.TextField('作品紹介/レビュー文', blank=True)
    ai_summary = models.CharField('AI要約', max_length=500, blank=True)
    
    # AI解析スコアリング (1-100)
    score_visual = models.IntegerField('ルックス点', default=0)
    score_story = models.IntegerField('ストーリー点', default=0)
    score_cost = models.IntegerField('コスパ点', default=0)
    score_erotic = models.IntegerField('エロ点', default=0)
    score_rarity = models.IntegerField('プレミア点', default=0)
    
    # レーダーチャート用（フロントエンドJS等にそのまま渡せる形式）
    radar_chart_data = models.JSONField('チャート用JSON', default=list)

    # --- 8. 管理・運用フラグ ---
    is_active = models.BooleanField('公開フラグ', default=True)
    is_recommend = models.BooleanField('おすすめフラグ', default=False) # 独自ピックアップ用
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fanza_product'
        verbose_name = 'FANZA商品'
        verbose_name_plural = 'FANZA商品一覧'
        ordering = ['-release_date']
        indexes = [
            models.Index(fields=['unique_id']),
            models.Index(fields=['content_id']),
            models.Index(fields=['site_code', 'service_code', 'floor_code']),
            models.Index(fields=['release_date']),
            models.Index(fields=['is_active']),
            models.Index(fields=['price']), # 価格検索用インデックス
        ]

    def __str__(self):
        return f"[{self.floor_name}] {self.title[:30]}"

    @property
    def get_main_image(self):
        """フロントエンド表示用のメイン画像（largeを優先）を取得"""
        # adminやフロントで使用。画像URLリストから最適なものを返す
        return self.image_urls.get('large') or self.image_urls.get('list')

    @property
    def get_sample_movie_url(self):
        """高画質(720_480)の動画URLを優先的に取得"""
        if self.sample_movie:
            return (
                self.sample_movie.get('size_720_480') or 
                self.sample_movie.get('size_644_414') or 
                self.sample_movie.get('size_560_360')
            )
        return None
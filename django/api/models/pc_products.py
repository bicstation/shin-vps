from django.db import models
from django.utils.timezone import now

class PCAttribute(models.Model):
    """
    CPU、メモリ、NPUなどのスペック情報を管理するマスターモデル
    """
    TYPE_CHOICES = [
        ('cpu', 'CPU'),
        ('memory', 'メモリ'),
        ('storage', 'ストレージ'),
        ('gpu', 'グラフィック'),
        ('npu', 'AIプロセッサ(NPU)'),
        ('os', 'OS'),
    ]
    
    attr_type = models.CharField('属性タイプ', max_length=20, choices=TYPE_CHOICES)
    name = models.CharField('表示名', max_length=100) # 例: "Core i7", "16GB", "40 TOPS以上"
    slug = models.SlugField('スラッグ', max_length=100, unique=True) # 例: "core-i7", "mem-16gb"
    
    # 🚀 追加: 表記揺れ対策用の検索キーワード
    # カンマ区切りで入力（例: "i7-13, 13700K, 14700"）
    search_keywords = models.TextField(
        '検索キーワード', 
        blank=True, 
        help_text="検索時に使用する別名です。複数の場合はカンマ(,)で区切ってください。"
    )
    
    # 🚀 サイドバー等での表示順を制御
    order = models.PositiveIntegerField('並び順', default=0, help_text="数字が小さいほど上に表示されます")

    class Meta:
        verbose_name = 'スペック属性'
        verbose_name_plural = 'スペック属性一覧'
        # タイプごとにまとめ、その中で設定した並び順、名前順にする
        ordering = ['attr_type', 'order', 'name']

    def __str__(self):
        return f"[{self.get_attr_type_display()}] {self.name}"


class PCProduct(models.Model):
    """
    PC製品を管理する汎用モデル
    （2重仕分け ＋ 生HTMLマッピング ＋ AIコンテンツ保持 ＋ 正式アフィリエイトURL対応 ＋ スペック属性連携版）
    """
    # 識別用
    unique_id = models.CharField(max_length=255, unique=True, db_index=True, verbose_name="固有ID")
    site_prefix = models.CharField(max_length=20, verbose_name="サイト接頭辞") # 'lenovo', 'hp', 'dell' など
    maker = models.CharField(max_length=100, db_index=True, verbose_name="メーカー")
    
    # 💡 2重仕分け用カラム
    raw_genre = models.CharField(max_length=100, default="", verbose_name="サイト別分類")
    unified_genre = models.CharField(max_length=50, default="", db_index=True, verbose_name="統合ジャンル")

    # 基本情報
    name = models.CharField(max_length=500, verbose_name="商品名")
    price = models.IntegerField(verbose_name="価格")
    url = models.URLField(max_length=1000, verbose_name="商品URL")
    image_url = models.URLField(max_length=1000, null=True, blank=True, verbose_name="画像URL")
    description = models.TextField(null=True, blank=True, verbose_name="詳細スペック")

    # 🚀 スペック属性（多対多リレーション）
    attributes = models.ManyToManyField(
        PCAttribute, 
        blank=True, 
        related_name='products',
        verbose_name="スペック属性タグ"
    )

    # 🚀 アフィリエイトURL管理
    affiliate_url = models.URLField(
        max_length=2000, 
        null=True, 
        blank=True, 
        verbose_name="正式アフィリエイトURL"
    )
    affiliate_updated_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="アフィリエイトURL最終更新"
    )

    # 🚀 AI生成コンテンツ
    ai_content = models.TextField(null=True, blank=True, verbose_name="AI生成記事本文")

    # 🚀 自動マッピング・受注停止管理用
    raw_html = models.TextField(null=True, blank=True, verbose_name="生のHTML内容")
    stock_status = models.CharField(
        max_length=100, 
        default="在庫あり", 
        verbose_name="在庫/受注状況"
    ) 
    
    is_posted = models.BooleanField(default=False, verbose_name="WP投稿済み")

    # 状態管理
    is_active = models.BooleanField(default=True, verbose_name="掲載中")
    created_at = models.DateTimeField(default=now, verbose_name="登録日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        verbose_name = "PC製品"
        verbose_name_plural = "PC製品一覧"
        ordering = ['-updated_at']

    def __str__(self):
        return f"[{self.maker}] {self.name[:30]}"

    # 💡 保存時の自動処理
    def save(self, *args, **kwargs):
        # 1. 統合ジャンルが空の場合のフォールバック
        if not self.unified_genre and self.raw_genre:
            self.unified_genre = self.raw_genre
        
        # 2. 受注停止ワードが含まれているかHTMLから自動チェック
        if self.raw_html:
            stop_words = ["現在ご注文いただけません", "受注停止", "販売終了", "品切れ"]
            if any(word in self.raw_html for word in stop_words):
                self.stock_status = "受注停止中"
        
        super().save(*args, **kwargs)
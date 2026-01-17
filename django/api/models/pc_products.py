# -*- coding: utf-8 -*-
from django.db import models
from django.utils.timezone import now

class PCAttribute(models.Model):
    """
    CPU、メモリ、NPUなどのスペック情報を管理するマスターモデル
    （既存のまま維持）
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
    name = models.CharField('表示名', max_length=100)
    slug = models.SlugField('スラッグ', max_length=100, unique=True)
    
    # 追加カラム（既存運用には影響なし）
    search_keywords = models.TextField(
        '検索キーワード', 
        blank=True, 
        help_text="検索時に使用する別名です。複数の場合はカンマ(,)で区切ってください。"
    )
    order = models.PositiveIntegerField('並び順', default=0, help_text="数字が小さいほど上に表示されます")

    class Meta:
        verbose_name = 'スペック属性'
        verbose_name_plural = 'スペック属性一覧'
        ordering = ['attr_type', 'order', 'name']

    def __str__(self):
        return f"[{self.get_attr_type_display()}] {self.name}"


class PCProduct(models.Model):
    """
    PC製品を管理する汎用モデル
    既存のテーブル構造を完全に維持し、AI処理用の新カラムを追加
    """
    # === 1. 既存カラム（一切変更なし） ===
    unique_id = models.CharField(max_length=255, unique=True, db_index=True, verbose_name="固有ID")
    site_prefix = models.CharField(max_length=20, verbose_name="サイト接頭辞")
    maker = models.CharField(max_length=100, db_index=True, verbose_name="メーカー")
    
    raw_genre = models.CharField(max_length=100, default="", verbose_name="サイト別分類")
    unified_genre = models.CharField(max_length=50, default="", db_index=True, verbose_name="統合ジャンル")

    name = models.CharField(max_length=500, verbose_name="商品名")
    price = models.IntegerField(verbose_name="価格")
    url = models.URLField(max_length=1000, verbose_name="商品URL")
    image_url = models.URLField(max_length=1000, null=True, blank=True, verbose_name="画像URL")
    description = models.TextField(null=True, blank=True, verbose_name="詳細スペック")

    attributes = models.ManyToManyField(
        PCAttribute, 
        blank=True, 
        related_name='products',
        verbose_name="スペック属性タグ"
    )

    affiliate_url = models.URLField(max_length=2000, null=True, blank=True, verbose_name="正式アフィリエイトURL")
    affiliate_updated_at = models.DateTimeField(null=True, blank=True, verbose_name="アフィリエイトURL最終更新")

    ai_content = models.TextField(null=True, blank=True, verbose_name="AI生成記事本文")

    raw_html = models.TextField(null=True, blank=True, verbose_name="生のHTML内容")
    stock_status = models.CharField(max_length=100, default="在庫あり", verbose_name="在庫/受注状況") 
    
    is_posted = models.BooleanField(default=False, verbose_name="WP投稿済み")
    is_active = models.BooleanField(default=True, verbose_name="掲載中")
    created_at = models.DateTimeField(default=now, verbose_name="登録日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")


    # === 2. 🚀 新規追加カラム（AI処理・構造化データ用） ===
    # JSONや生テキストからAIが抽出したデータを保存する場所
    # すべて null=True, blank=True で既存データへの影響を回避
    
    memory_gb = models.IntegerField(null=True, blank=True, verbose_name="メモリ(GB数値)")
    storage_gb = models.IntegerField(null=True, blank=True, verbose_name="ストレージ(GB数値)")
    npu_tops = models.FloatField(null=True, blank=True, verbose_name="NPU性能(TOPS)")
    
    cpu_model = models.CharField(max_length=255, null=True, blank=True, verbose_name="CPUモデル詳細")
    gpu_model = models.CharField(max_length=255, null=True, blank=True, verbose_name="GPUモデル詳細")
    display_info = models.CharField(max_length=255, null=True, blank=True, verbose_name="ディスプレイ情報")
    
    target_segment = models.CharField(max_length=255, null=True, blank=True, verbose_name="AI判定ターゲット層")
    is_ai_pc = models.BooleanField(default=False, verbose_name="AI PC該当フラグ")
    spec_score = models.IntegerField(default=0, verbose_name="性能評価スコア(0-100)")

    ai_summary = models.CharField(max_length=500, null=True, blank=True, verbose_name="AI記事要約/メタ情報")
    last_spec_parsed_at = models.DateTimeField(null=True, blank=True, verbose_name="スペック解析実行日")


    class Meta:
        verbose_name = "PC製品"
        verbose_name_plural = "PC製品一覧"
        ordering = ['-updated_at']

    def __str__(self):
        return f"[{self.maker}] {self.name[:30]}"

    # 💡 保存時の自動処理（既存ロジックを完全維持）
    def save(self, *args, **kwargs):
        # 1. 統合ジャンルのフォールバック（既存）
        if not self.unified_genre and self.raw_genre:
            self.unified_genre = self.raw_genre
        
        # 2. 受注停止ワードの自動チェック（既存）
        if self.raw_html:
            stop_words = ["現在ご注文いただけません", "受注停止", "販売終了", "品切れ", "在庫切れ"]
            if any(word in self.raw_html for word in stop_words):
                self.stock_status = "受注停止中"
            else:
                # 既存の状態を壊さないよう、明示的な「在庫あり」上書きが必要な場合のみ実施
                if self.stock_status == "受注停止中":
                    self.stock_status = "在庫あり"
        
        # 3. 新機能：AI PC判定（既存運用を邪魔しない範囲で追加）
        if self.description:
            ai_keywords = ["NPU", "Ryzen AI", "Core Ultra", "TOPS", "Copilot+"]
            if any(key.lower() in self.description.lower() for key in ai_keywords):
                self.is_ai_pc = True

        super().save(*args, **kwargs)
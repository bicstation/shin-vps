# api/models/product.py

from django.db import models
from django.utils.text import slugify
import uuid


class Product(models.Model):

    # -----------------
    # 基本情報
    # -----------------
    title = models.TextField(default="")  # ← 修正
 
    unique_id = models.SlugField(
        max_length=255,
        unique=True,
        db_index=True,
        null=True,   # ← 追加
        blank=True
    )
    thumbnail_url = models.URLField(max_length=1000, blank=True, null=True)  # 少し拡張
    affiliate_url = models.TextField(blank=True, null=True)  # ← 修正
    
    # -----------------
    # 画像キャッシュ（追加）
    # -----------------
    image_local = models.ImageField(upload_to='products/', null=True, blank=True)
    image_source = models.URLField(max_length=1000, null=True, blank=True)
    image_fetched = models.BooleanField(default=False)

    # -----------------
    # 数値系
    # -----------------
    price = models.IntegerField(default=0)
    ranking_score = models.FloatField(default=0)

    # -----------------
    # メタ情報
    # -----------------
    source = models.CharField(max_length=50, db_index=True)
    external_id = models.CharField(max_length=255, db_index=True)

    maker = models.CharField(max_length=255, blank=True)
    label_name = models.CharField(max_length=255, blank=True)

    release_date = models.DateField(null=True, blank=True)

    # -----------------
    # 属性
    # -----------------
    attributes = models.ManyToManyField(
        'PCAttribute',
        blank=True,
        related_name='products_items'
    )
    # -----------------
    # PC紐付け（追加）
    # -----------------
    pc_product = models.ForeignKey(
        'PCProduct',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='products'
    )

    # -----------------
    # リレーション
    # -----------------
    genres = models.ManyToManyField('Genre', blank=True, related_name='unified_products')
    actresses = models.ManyToManyField('Actress', blank=True, related_name='unified_products')

    # -----------------
    # フラグ
    # -----------------
    is_active = models.BooleanField(default=True)
    is_adult = models.BooleanField(default=True, db_index=True)
    is_visible = models.BooleanField(default=True)

    # -----------------
    # 日付
    # -----------------
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # -----------------
    # インデックス
    # -----------------
    class Meta:
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['source']),
            models.Index(fields=['is_adult']),
            models.Index(fields=['is_visible']),
            models.Index(
                fields=['is_active', 'is_visible', 'is_adult', '-ranking_score'],
                name='idx_product_ranking'
            ),
        ]

        constraints = [
            models.UniqueConstraint(
                fields=['source', 'external_id'],
                name='unique_source_external_id'
            )
        ]

    def __str__(self):
        return self.title
    
    # -----------------
    # save override（ここが今回追加）
    # -----------------   
    def save(self, *args, **kwargs):
        if not self.unique_id:
            base = slugify(self.title)[:50] or "product"

            while True:
                unique = f"{base}-{uuid.uuid4().hex[:8]}"
                if not Product.objects.filter(unique_id=unique).exists():
                    self.unique_id = unique
                    break

        super().save(*args, **kwargs)
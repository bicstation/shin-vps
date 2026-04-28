# api/models/product.py

from django.db import models


class Product(models.Model):

    # -----------------
    # 基本情報
    # -----------------
    title = models.CharField(max_length=255, default="")
    thumbnail_url = models.URLField(max_length=500, blank=True, null=True)
    affiliate_url = models.URLField(max_length=500, blank=True, null=True)

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

    # 👇 追加
    maker = models.CharField(max_length=255, blank=True)
    label_name = models.CharField(max_length=255, blank=True)

    # 👇 追加
    release_date = models.DateField(null=True, blank=True)

    attributes = models.ManyToManyField(
        'PCAttribute',  # ← とりあえずPCだけでOK
        blank=True,
        related_name='products_items'
    )
    
    # -----------------
    # リレーション
    # -----------------
    genres = models.ManyToManyField('Genre',blank=True,related_name='unified_products')
    actresses = models.ManyToManyField('Actress',blank=True,related_name='unified_products')

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
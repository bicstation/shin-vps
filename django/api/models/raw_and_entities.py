# -*- coding: utf-8 -*-
from django.db import models

# --------------------------------------------------------------------------
# 1. API生データモデル (RawApiData)
# --------------------------------------------------------------------------

class RawApiData(models.Model):
    """
    FANZAやDUGAなどのAPIから取得した生データをそのまま格納するモデル。
    """
    API_CHOICES = [
        ('DUGA', 'DUGA API'),
        ('FANZA', 'FANZA API'),
    ]

    api_source = models.CharField(max_length=10, choices=API_CHOICES, verbose_name="APIソース")
    api_product_id = models.CharField(max_length=255, verbose_name="API商品ID")
    raw_json_data = models.JSONField(verbose_name="生JSONデータ")
    
    api_service = models.CharField(max_length=50, null=True, blank=True, verbose_name="APIサービスコード")
    api_floor = models.CharField(max_length=50, null=True, blank=True, verbose_name="APIフロアコード")

    migrated = models.BooleanField(default=False, verbose_name="移行済み") 
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")
    
    class Meta:
        db_table = 'raw_api_data'
        verbose_name = 'API生データ'
        verbose_name_plural = 'API生データ一覧'
        unique_together = ('api_source', 'api_product_id')

    def __str__(self):
        return f"{self.api_source}: {self.api_product_id}"


# --------------------------------------------------------------------------
# 2. エンティティモデル群の基底クラスと個別モデル
# --------------------------------------------------------------------------

class EntityBase(models.Model):
    """
    メーカー、ジャンル、女優、著者などの共通フィールドを持つ基底クラス。
    """
    api_source = models.CharField(max_length=10, verbose_name="APIソース (DUGA/FANZA)")
    api_id = models.CharField(max_length=255, null=True, blank=True, verbose_name="API固有ID")
    
    name = models.CharField(max_length=255, verbose_name="名称")
    ruby = models.CharField(max_length=255, null=True, blank=True, verbose_name="ふりがな") # 拡張：FANZAのruby対応
    
    product_count = models.IntegerField(default=0, verbose_name="関連商品数")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        abstract = True
        # 同じソース内で「ID」または「名前」が重複しないように管理
        unique_together = (('api_source', 'name'),)
        ordering = ['name']

    def __str__(self):
        return f"[{self.api_source}] {self.name}"

class Maker(EntityBase):
    """メーカー / 出版社"""
    class Meta(EntityBase.Meta):
        db_table = 'maker'
        verbose_name = 'メーカー'
        verbose_name_plural = 'メーカー一覧'

class Label(EntityBase):
    """レーベル"""
    class Meta(EntityBase.Meta):
        db_table = 'label'
        verbose_name = 'レーベル'
        verbose_name_plural = 'レーベル一覧'

class Genre(EntityBase):
    """ジャンル / カテゴリ"""
    class Meta(EntityBase.Meta):
        db_table = 'genre'
        verbose_name = 'ジャンル'
        verbose_name_plural = 'ジャンル一覧'

class Actress(EntityBase):
    """女優 / 出演者"""
    class Meta(EntityBase.Meta):
        db_table = 'actress'
        verbose_name = '女優'
        verbose_name_plural = '女優一覧'

class Author(EntityBase):
    """著者 / 作者 (FANZAブックス・読み放題用)"""
    class Meta(EntityBase.Meta):
        db_table = 'author'
        verbose_name = '著者'
        verbose_name_plural = '著者一覧'

class Director(EntityBase):
    """監督"""
    class Meta(EntityBase.Meta):
        db_table = 'director'
        verbose_name = '監督'
        verbose_name_plural = '監督一覧'

class Series(EntityBase):
    """シリーズ"""
    class Meta(EntityBase.Meta):
        db_table = 'series'
        verbose_name = 'シリーズ'
        verbose_name_plural = 'シリーズ一覧'
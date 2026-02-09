# -*- coding: utf-8 -*-
from django.db import models
from django.utils.text import slugify
import uuid
import unicodedata
import re

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
# 2. エンティティモデル群の基底クラス (自動化・重複回避ロジック付き)
# --------------------------------------------------------------------------

class EntityBase(models.Model):
    """
    メーカー、ジャンル、女優、著者などの共通フィールドを持つ基底クラス。
    自動スラッグ生成、重複回避、およびデータ正規化機能を持ちます。
    """
    api_source = models.CharField(max_length=10, verbose_name="APIソース (DUGA/FANZA)")
    api_id = models.CharField(max_length=255, null=True, blank=True, verbose_name="API固有ID")
    
    name = models.CharField(max_length=255, verbose_name="名称")
    
    # 【修正】SlugFieldをCharFieldに変更。db_indexを付けて検索性を維持しつつ日本語を許容。
    slug = models.CharField(max_length=255, null=True, blank=True, verbose_name="スラッグ", db_index=True)
    ruby = models.CharField(max_length=255, null=True, blank=True, verbose_name="ふりがな") 
    
    product_count = models.IntegerField(default=0, verbose_name="関連商品数")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        abstract = True
        # api_source内での名称重複とスラッグ重複を防ぐ
        unique_together = (('api_source', 'name'), ('api_source', 'slug'))
        ordering = ['name']

    def __str__(self):
        return f"[{self.api_source}] {self.name}"

    def save(self, *args, **kwargs):
        # 1. テキストの正規化（全角英数字を半角に、前後の空白削除）
        if self.name:
            self.name = unicodedata.normalize('NFKC', self.name).strip()
        
        # ruby が空なら名前をセット（50音ソートのバックアップ用）
        if not self.ruby and self.name:
            self.ruby = self.name
        elif self.ruby:
            self.ruby = unicodedata.normalize('NFKC', self.ruby).strip()

        # 2. スラッグの自動生成と重複チェック
        if not self.slug or self.slug == "":
            # スペースをハイフンに変換し、URLに使えない記号を削除
            temp_slug = self.name.replace(" ", "-").replace("　", "-")
            # 記号を除去 (英数字、日本語、ハイフン、アンダースコア以外)
            temp_slug = re.sub(r'[^\w\s-]', '', temp_slug)
            
            base_slug = temp_slug
            if not base_slug:
                # 名前が記号のみなどの場合は api_id または UUID
                base_slug = self.api_id if self.api_id else str(uuid.uuid4().hex[:8])
            
            unique_slug = base_slug
            counter = 1
            model_class = self.__class__
            
            # 同じ api_source 内で重複がないかチェック
            while model_class.objects.filter(api_source=self.api_source, slug=unique_slug).exclude(pk=self.pk).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = unique_slug
        
        super().save(*args, **kwargs)

# --------------------------------------------------------------------------
# 3. 個別エンティティモデル
# --------------------------------------------------------------------------

class Maker(EntityBase):
    class Meta(EntityBase.Meta):
        db_table = 'maker'
        verbose_name = 'メーカー'
        verbose_name_plural = 'メーカー一覧'

class Label(EntityBase):
    class Meta(EntityBase.Meta):
        db_table = 'label'
        verbose_name = 'レーベル'
        verbose_name_plural = 'レーベル一覧'

class Genre(EntityBase):
    class Meta(EntityBase.Meta):
        db_table = 'genre'
        verbose_name = 'ジャンル'
        verbose_name_plural = 'ジャンル一覧'

class Actress(EntityBase):
    class Meta(EntityBase.Meta):
        db_table = 'actress'
        verbose_name = '女優'
        verbose_name_plural = '女優一覧'

class Author(EntityBase):
    class Meta(EntityBase.Meta):
        db_table = 'author'
        verbose_name = '著者'
        verbose_name_plural = '著者一覧'

class Director(EntityBase):
    class Meta(EntityBase.Meta):
        db_table = 'director'
        verbose_name = '監督'
        verbose_name_plural = '監督一覧'

class Series(EntityBase):
    class Meta(EntityBase.Meta):
        db_table = 'series'
        verbose_name = 'シリーズ'
        verbose_name_plural = 'シリーズ一覧'
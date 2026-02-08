# -*- coding: utf-8 -*-
from django.contrib import admin
from django.utils.safestring import mark_safe
from ..models import (
    Genre, Actress, Maker, Label, Director, Series, 
    Author, 
    AdultAttribute, PCAttribute, LinkshareProduct, PriceHistory
)

# --- 共通ベースクラス ---
class MasterAdmin(admin.ModelAdmin):
    """マスターデータ共通の管理設定"""
    # 一覧に ruby (ふりがな) を表示し、検索も可能にします
    list_display = ('name', 'ruby', 'api_source', 'product_count', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('name', 'ruby')
    ordering = ('-created_at',)

# --- 各モデルの管理クラス定義 ---

@admin.register(Genre)
class GenreAdmin(MasterAdmin):
    """ジャンル管理"""
    pass

@admin.register(Actress)
class ActressAdmin(MasterAdmin):
    """女優管理"""
    pass

@admin.register(Maker)
class MakerAdmin(MasterAdmin):
    """メーカー管理"""
    pass

@admin.register(Author)
class AuthorAdmin(MasterAdmin):
    """著者管理 (FANZA Books/Unlimited用)"""
    pass

@admin.register(Label)
class LabelAdmin(MasterAdmin):
    """レーベル管理"""
    pass

@admin.register(Director)
class DirectorAdmin(MasterAdmin):
    """監督管理"""
    pass

@admin.register(Series)
class SeriesAdmin(MasterAdmin):
    """シリーズ管理"""
    pass

@admin.register(AdultAttribute)
class AdultAttributeAdmin(admin.ModelAdmin):
    """アダルト属性管理"""
    list_display = ('name', 'attr_type', 'slug', 'product_count_badge')
    search_fields = ('name', 'slug')
    list_filter = ('attr_type',)

    def product_count_badge(self, obj):
        count = obj.products.count()
        return mark_safe(f'<span style="background: #e83e8c; color: white; padding: 2px 10px; border-radius: 12px;">{count}</span>')
    product_count_badge.short_description = "作品数"

@admin.register(PCAttribute)
class PCAttributeAdmin(admin.ModelAdmin):
    """PC属性管理"""
    list_display = ('name', 'attr_type', 'slug', 'product_count_badge')
    search_fields = ('name', 'slug')
    list_filter = ('attr_type',)

    def product_count_badge(self, obj):
        count = obj.products.count()
        return mark_safe(f'<span style="background: #007bff; color: white; padding: 2px 10px; border-radius: 12px;">{count}</span>')
    product_count_badge.short_description = "製品数"

@admin.register(LinkshareProduct)
class LinkshareProductAdmin(admin.ModelAdmin):
    """Linkshare商品管理"""
    # エラーの原因となっていた 'availability' をリストから除外しました
    list_display = ('product_name', 'sku', 'updated_at')
    search_fields = ('product_name', 'sku')

@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    """価格履歴管理"""
    list_display = ('product', 'price', 'recorded_at')
    list_filter = ('recorded_at',)
    readonly_fields = ('recorded_at',)
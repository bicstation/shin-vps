# -*- coding: utf-8 -*-
from django.contrib import admin
from django.utils.safestring import mark_safe
from ..models import (
    Genre, Actress, Maker, Label, Director, Series, 
    AdultAttribute, PCAttribute, LinkshareProduct, PriceHistory
)

# --- 共通ベースクラス ---
class MasterAdmin(admin.ModelAdmin):
    """マスターデータ共通の管理設定"""
    list_display = ('name', 'api_source', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('name',)

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

# --- その他のシンプルなモデルを一括登録 ---
admin.site.register([
    Label, 
    Director, 
    Series, 
    LinkshareProduct, 
    PriceHistory
])
# -*- coding: utf-8 -*-
from django.contrib import admin
from django.utils.safestring import mark_safe
from ..models import (
    Genre, Actress, Maker, Label, Director, Series, 
    Author, 
    AdultAttribute, PCAttribute, LinkshareProduct, PriceHistory
)

# 🌐 フロントエンドのベースURL
FRONTEND_BASE_URL = "https://tiper.live"

# --- 共通ベースクラス ---
class MasterAdmin(admin.ModelAdmin):
    """マスターデータ共通の管理設定"""
    list_display = ('display_name_link', 'ruby', 'api_source', 'product_count_badge', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('name', 'ruby')
    ordering = ('-created_at',)

    def display_name_link(self, obj):
        """フロントエンドの各アーカイブページへリンク"""
        # モデル名に基づいてパスを分岐
        model_name = obj._meta.model_name # 'actress', 'maker', etc.
        # モデル名が複数形でない場合は調整が必要な場合があります
        detail_url = f"{FRONTEND_BASE_URL}/{model_name}/{obj.id}"
        
        return mark_safe(f'<a href="{detail_url}" target="_blank" style="font-weight:bold; color:#00d1b2;">{obj.name}</a>')
    display_name_link.short_description = "名前 (LIVE)"

    def product_count_badge(self, obj):
        # Masterモデルに product_count フィールドがある前提
        count = getattr(obj, 'product_count', 0)
        return mark_safe(f'<span style="background: #6c757d; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px;">{count}</span>')
    product_count_badge.short_description = "作品数"

# --- 各モデルの管理クラス定義 ---

@admin.register(Genre)
class GenreAdmin(MasterAdmin):
    pass

@admin.register(Actress)
class ActressAdmin(MasterAdmin):
    """女優管理 - アバター表示等が必要な場合はここに追加可能"""
    pass

@admin.register(Maker)
class MakerAdmin(MasterAdmin):
    pass

@admin.register(Author)
class AuthorAdmin(MasterAdmin):
    pass

@admin.register(Label)
class LabelAdmin(MasterAdmin):
    pass

@admin.register(Director)
class DirectorAdmin(MasterAdmin):
    pass

@admin.register(Series)
class SeriesAdmin(MasterAdmin):
    pass

@admin.register(AdultAttribute)
class AdultAttributeAdmin(admin.ModelAdmin):
    list_display = ('display_attr_link', 'attr_type', 'slug', 'product_count_badge')
    search_fields = ('name', 'slug')
    list_filter = ('attr_type',)

    def display_attr_link(self, obj):
        detail_url = f"{FRONTEND_BASE_URL}/attribute/{obj.id}"
        return mark_safe(f'<a href="{detail_url}" target="_blank" style="font-weight:bold; color:#e83e8c;">{obj.name}</a>')
    display_attr_link.short_description = "属性名"

    def product_count_badge(self, obj):
        count = obj.products.count()
        return mark_safe(f'<span style="background: #e83e8c; color: white; padding: 2px 10px; border-radius: 12px;">{count}</span>')
    product_count_badge.short_description = "作品数"

@admin.register(PCAttribute)
class PCAttributeAdmin(admin.ModelAdmin):
    list_display = ('display_attr_link', 'attr_type', 'slug', 'product_count_badge')
    search_fields = ('name', 'slug')
    list_filter = ('attr_type',)

    def display_attr_link(self, obj):
        detail_url = f"{FRONTEND_BASE_URL}/pc/attribute/{obj.id}"
        return mark_safe(f'<a href="{detail_url}" target="_blank" style="font-weight:bold; color:#007bff;">{obj.name}</a>')
    display_attr_link.short_description = "属性名"

    def product_count_badge(self, obj):
        count = obj.products.count()
        return mark_safe(f'<span style="background: #007bff; color: white; padding: 2px 10px; border-radius: 12px;">{count}</span>')
    product_count_badge.short_description = "製品数"

@admin.register(LinkshareProduct)
class LinkshareProductAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'sku', 'updated_at')
    search_fields = ('product_name', 'sku')

@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price', 'recorded_at')
    list_filter = ('recorded_at',)
    readonly_fields = ('recorded_at',)
# -*- coding: utf-8 -*-
import logging
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path

from .models import (
    User, RawApiData, AdultProduct, FanzaProduct,
    Genre, Actress, Maker, Label, Director, Series, 
    Author, AdultAttribute, PCAttribute, LinkshareProduct, 
    PriceHistory, PCProduct
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 🛠️ 共通ユーティリティ（UI変換のみ）
# --------------------------------------------------------------------------
def get_score_bar(value, max_val=100):
    """スコアを視覚的なバーに変換"""
    val = value or 0
    color = "#e83e8c" if val > 75 else "#6f42c1" if val > 40 else "#6c757d"
    return mark_safe(
        f'<div style="width: 80px; background: #eee; height: 10px; border-radius: 5px; overflow: hidden;">'
        f'<div style="width: {val}%; background: {color}; height: 100%;"></div>'
        f'</div>'
    )

# --------------------------------------------------------------------------
# 1. User (ユーザー) 管理
# --------------------------------------------------------------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('✨ 追加プロフィール', {'fields': ('site_group', 'status_message', 'profile_image', 'bio')}),
    )
    list_display = ('username', 'display_avatar', 'email', 'site_group_tag', 'is_staff', 'is_active_tag')
    list_display_links = ('username', 'display_avatar') 
    
    def display_avatar(self, obj):
        if obj.profile_image:
            return mark_safe(f'<img src="{obj.profile_image}" width="30" height="30" style="border-radius: 50%; object-fit: cover;" />')
        return mark_safe('<div style="width: 30px; height: 30px; background: #eee; border-radius: 50%; display: inline-block;"></div>')
    display_avatar.short_description = ""

    def site_group_tag(self, obj):
        return mark_safe(f'<span style="background: #6c757d; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">{obj.site_group}</span>')

    def is_active_tag(self, obj):
        color = "#28a745" if obj.is_active else "#dc3545"
        return mark_safe(f'<span style="color: {color};">{"● 有効" if obj.is_active else "○ 停止"}</span>')

# --------------------------------------------------------------------------
# 2. AdultProduct & FanzaProduct (動画・アダルト)
# --------------------------------------------------------------------------
class BaseProductAdmin(admin.ModelAdmin):
    """動画製品共通のロジック"""
    def get_urls(self):
        return [
            path('fetch-fanza/', self.fetch_fanza_action, name='fetch_fanza'),
            path('fetch-duga/', self.fetch_duga_action, name='fetch_duga'),
        ] + super().get_urls()

    def fetch_fanza_action(self, request):
        call_command('fetch_fanza')
        self.message_user(request, "FANZA取得開始")
        return HttpResponseRedirect("../")

    def fetch_duga_action(self, request):
        call_command('fetch_duga')
        self.message_user(request, "DUGA取得開始")
        return HttpResponseRedirect("../")

@admin.register(FanzaProduct)
class FanzaProductAdmin(BaseProductAdmin):
    list_display = ('display_main_image', 'unique_id', 'title', 'price_tag', 'score_tag', 'is_active', 'release_date')
    list_display_links = ('display_main_image', 'unique_id', 'title') 
    list_filter = ('site_code', 'service_code', 'floor_code', 'is_active', 'release_date')
    search_fields = ('title', 'unique_id', 'content_id')
    readonly_fields = ('created_at', 'updated_at', 'raw_item_info')
    filter_horizontal = ('genres', 'actresses')

    def display_main_image(self, obj):
        url = obj.image_urls.get('list') or obj.image_urls.get('small') or obj.image_urls.get('large')
        if url:
            return mark_safe(f'<img src="{url}" width="70" style="border-radius:4px;" referrerpolicy="no-referrer" />')
        return "No Image"

    def price_tag(self, obj):
        p = obj.price_info.get('price', '---')
        return f"¥{p}"

    def score_tag(self, obj):
        avg = (obj.score_visual + obj.score_story + obj.score_cost + obj.score_erotic + obj.score_rarity) / 5
        return get_score_bar(avg)

@admin.register(AdultProduct)
class AdultProductAdmin(BaseProductAdmin):
    list_display = ('display_image', 'product_id_unique', 'title', 'price_display', 'score_bar', 'is_posted_tag', 'api_source_tag', 'release_date')
    list_display_links = ('display_image', 'product_id_unique', 'title')
    list_filter = ('api_source', 'is_active', 'is_posted', 'maker')
    search_fields = ('title', 'product_id_unique')

    # ✅ 修正箇所: display_image メソッドを定義
    def display_image(self, obj):
        if obj.image_url_list and len(obj.image_url_list) > 0:
            return mark_safe(f'<img src="{obj.image_url_list[0]}" width="70" style="border-radius:4px;" referrerpolicy="no-referrer" />')
        return "N/A"
    display_image.short_description = "画像"

    def api_source_tag(self, obj):
        # DMMは青、FANZAはピンク、その他はグレー
        color = "#ff3860" if obj.api_source == "FANZA" else "#007bff" if obj.api_source == "DMM" else "#6c757d"
        return mark_safe(f'<span style="background:{color}; color:white; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:bold;">{obj.api_source}</span>')
    api_source_tag.short_description = "ソース"

    def price_display(self, obj): return f"¥{obj.price:,}" if obj.price else "---"
    def score_bar(self, obj): return get_score_bar(obj.spec_score)
    def is_posted_tag(self, obj): return '📮' if obj.is_posted else '☁️'

# --------------------------------------------------------------------------
# 3. PCProduct (ハードウェア・PC製品)
# --------------------------------------------------------------------------
class PriceHistoryInline(admin.TabularInline):
    model = PriceHistory
    extra = 0
    readonly_fields = ('recorded_at',)
    can_delete = False

@admin.register(PCProduct)
class PCProductAdmin(admin.ModelAdmin):
    inlines = [PriceHistoryInline]
    list_display = ('display_thumb', 'maker', 'name', 'price_display', 'score_bar', 'stock_status_tag', 'ai_tag')
    list_display_links = ('display_thumb', 'name')
    list_filter = ('stock_status', 'maker', 'ai_content')
    search_fields = ('name', 'unique_id')

    def display_thumb(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="60" style="border-radius:4px;" referrerpolicy="no-referrer" />')
        return "No Image"

    def price_display(self, obj): return f"¥{obj.price:,}" if obj.price else "---"
    def score_bar(self, obj): return get_score_bar(obj.spec_score)

    def stock_status_tag(self, obj):
        color = "#28a745" if obj.stock_status == "instock" else "#dc3545"
        return mark_safe(f'<span style="background:{color}; color:white; padding:2px 8px; border-radius:10px; font-size:10px;">{obj.stock_status.upper()}</span>')

    def ai_tag(self, obj):
        if obj.ai_content:
            return mark_safe('<span style="background:#17a2b8; color:white; padding:2px 6px; border-radius:4px; font-size:10px;">GEN_AI</span>')
        return "-"

# --------------------------------------------------------------------------
# 4. Master Data (女優, メーカー, ジャンル等)
# --------------------------------------------------------------------------
@admin.register(Genre, Actress, Maker, Author, Label, Director, Series)
class AllMasterAdmin(admin.ModelAdmin):
    list_display = ('name', 'ruby', 'api_source_badge', 'count_badge', 'created_at')
    list_display_links = ('name',) 
    list_filter = ('api_source',)
    search_fields = ('name', 'ruby')

    def api_source_badge(self, obj):
        if not obj.api_source: return "-"
        return mark_safe(f'<span style="color:#777; font-size:11px;">[{obj.api_source}]</span>')
    api_source_badge.short_description = "ソース"

    def count_badge(self, obj):
        count = getattr(obj, 'product_count', 0)
        return mark_safe(f'<span style="background:#6c757d; color:white; padding:2px 10px; border-radius:12px; font-size:11px;">{count}</span>')

@admin.register(AdultAttribute, PCAttribute)
class AttributeAdmin(admin.ModelAdmin):
    list_display = ('name', 'attr_type', 'slug')
    list_display_links = ('name',)
    list_filter = ('attr_type',)

# 💡 RawApiData の管理画面
@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source_tag', 'api_service', 'api_floor', 'migrated', 'created_at')
    list_display_links = ('id',)
    list_filter = ('api_source', 'migrated', 'api_service')
    search_fields = ('api_source', 'api_service', 'api_floor')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    def api_source_tag(self, obj):
        color = "#ff3860" if obj.api_source == "FANZA" else "#007bff" if obj.api_source == "DMM" else "#6c757d"
        return mark_safe(f'<span style="background:{color}; color:white; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:bold;">{obj.api_source}</span>')
    api_source_tag.short_description = "ソース"

@admin.register(LinkshareProduct)
class LinkshareProductAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'sku', 'updated_at')
    list_display_links = ('product_name',)

@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price', 'recorded_at')
    list_display_links = ('product',)
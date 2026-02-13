# -*- coding: utf-8 -*-
import logging
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from django.db.models import Count

from .models import (
    User, RawApiData, AdultProduct, FanzaProduct,
    Genre, Actress, Maker, Label, Director, Series, 
    Author, AdultAttribute, PCAttribute, LinkshareProduct, 
    PriceHistory, PCProduct
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 🛠️ 共通ユーティリティ（視覚的アシスト）
# --------------------------------------------------------------------------
def get_score_bar(value, max_val=100):
    """スコアを視覚的なバーに変換。AI評価の直感的な把握用"""
    val = value or 0
    # スコア帯によって色を動的に変更（エロティシズムや画質の高さを示唆）
    if val > 85: color = "#ff0055"   # プレミアム
    elif val > 70: color = "#e83e8c" # 高評価
    elif val > 40: color = "#6f42c1" # 標準
    else: color = "#6c757d"          # 低評価
    
    return mark_safe(
        f'<div style="width: 100px; background: #e9ecef; height: 12px; border-radius: 6px; overflow: hidden; border: 1px solid #dee2e6;">'
        f'<div style="width: {val}%; background: {color}; height: 100%; transition: width 0.3s;"></div>'
        f'</div>'
        f'<span style="font-size: 10px; color: {color}; font-weight: bold;">{val}%</span>'
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
            return mark_safe(f'<img src="{obj.profile_image}" width="35" height="35" style="border-radius: 50%; object-fit: cover; border: 2px solid #ddd;" />')
        return mark_safe('<div style="width: 35px; height: 35px; background: #eee; border-radius: 50%; display: inline-block;"></div>')
    display_avatar.short_description = "AVATAR"

    def site_group_tag(self, obj):
        return mark_safe(f'<span style="background: #495057; color: white; padding: 3px 10px; border-radius: 12px; font-size: 10px;">{obj.site_group}</span>')

    def is_active_tag(self, obj):
        color = "#28a745" if obj.is_active else "#dc3545"
        return mark_safe(f'<b style="color: {color};">{"● ACTIVE" if obj.is_active else "○ STOPPED"}</b>')

# --------------------------------------------------------------------------
# 2. 動画製品ベース (共通アクション)
# --------------------------------------------------------------------------
class BaseProductAdmin(admin.ModelAdmin):
    """スクレイピングコマンドを管理画面から叩けるように拡張"""
    def get_urls(self):
        return [
            path('fetch-fanza/', self.fetch_fanza_action, name='fetch_fanza'),
            path('fetch-duga/', self.fetch_duga_action, name='fetch_duga'),
        ] + super().get_urls()

    def fetch_fanza_action(self, request):
        call_command('fetch_fanza')
        self.message_user(request, "🚀 FANZA APIからのデータ取得を開始しました。")
        return HttpResponseRedirect("../")

    def fetch_duga_action(self, request):
        call_command('fetch_duga')
        self.message_user(request, "🚀 DUGA APIからのデータ取得を開始しました。")
        return HttpResponseRedirect("../")

# --------------------------------------------------------------------------
# 3. AdultProduct (統合アダルト製品)
# --------------------------------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(BaseProductAdmin):
    """
    関連度（Attributes, Actresses, Genres）を管理する中枢画面。
    """
    list_display = (
        'display_image', 'product_id_unique', 'title_short', 
        'price_display', 'score_bar', 'relation_count', 
        'is_posted_tag', 'api_source_tag', 'release_date'
    )
    list_display_links = ('display_image', 'product_id_unique', 'title_short')
    list_filter = ('api_source', 'is_active', 'is_posted', 'maker', 'attributes')
    search_fields = ('title', 'product_id_unique', 'actresses__name', 'maker__name')
    ordering = ('-release_date',)
    
    # 複数選択をUI的に楽にする
    filter_horizontal = ('genres', 'actresses', 'attributes')
    
    def title_short(self, obj):
        return obj.title[:40] + '...' if len(obj.title) > 40 else obj.title
    title_short.short_description = "作品タイトル"

    def display_image(self, obj):
        if obj.image_url_list and len(obj.image_url_list) > 0:
            return mark_safe(f'<img src="{obj.image_url_list[0]}" width="80" style="border-radius:4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" referrerpolicy="no-referrer" />')
        return mark_safe('<div style="width:80px; height:50px; background:#f8f9fa; border:1px dashed #ccc; text-align:center; line-height:50px; font-size:10px;">No Image</div>')
    display_image.short_description = "PREVIEW"

    def api_source_tag(self, obj):
        color = "#ff3860" if obj.api_source == "FANZA" else "#007bff" if obj.api_source == "DMM" else "#6c757d"
        if obj.api_source == "DUGA": color = "#ff9f00"
        return mark_safe(f'<span style="background:{color}; color:white; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:bold;">{obj.api_source}</span>')
    api_source_tag.short_description = "SOURCE"

    def price_display(self, obj): return f"¥{obj.price:,}" if obj.price else "---"
    
    def score_bar(self, obj): return get_score_bar(obj.spec_score)
    score_bar.short_description = "AI総合評価"

    def relation_count(self, obj):
        """どれだけリレーション（関連の種）があるかを表示"""
        count = obj.actresses.count() + obj.genres.count() + obj.attributes.count()
        return mark_safe(f'<span style="color:#007bff;">🔗 {count} nodes</span>')
    relation_count.short_description = "関連強度"

    def is_posted_tag(self, obj):
        return mark_safe('<b>✅ POSTED</b>') if obj.is_posted else mark_safe('<span style="color:#ccc;">WAITING</span>')
    is_posted_tag.short_description = "投稿状態"

# --------------------------------------------------------------------------
# 4. FanzaProduct (FANZA専用)
# --------------------------------------------------------------------------
@admin.register(FanzaProduct)
class FanzaProductAdmin(BaseProductAdmin):
    list_display = ('display_main_image', 'unique_id', 'title', 'price_tag', 'score_tag', 'is_active', 'release_date')
    list_display_links = ('display_main_image', 'unique_id', 'title') 
    list_filter = ('site_code', 'is_active', 'release_date')
    search_fields = ('title', 'unique_id', 'content_id')
    filter_horizontal = ('genres', 'actresses')
    readonly_fields = ('created_at', 'updated_at', 'raw_item_info')

    def display_main_image(self, obj):
        url = obj.image_urls.get('list') or obj.image_urls.get('small')
        if url:
            return mark_safe(f'<img src="{url}" width="80" style="border-radius:4px;" referrerpolicy="no-referrer" />')
        return "No Image"

    def price_tag(self, obj):
        p = obj.price_info.get('price', '---')
        return f"¥{p}"

    def score_tag(self, obj):
        avg = (obj.score_visual + obj.score_story + obj.score_cost + obj.score_erotic + obj.score_rarity) / 5
        return get_score_bar(avg)
    score_tag.short_description = "AI 5軸平均"

# --------------------------------------------------------------------------
# 5. PCProduct & PriceHistory (ハードウェア系)
# --------------------------------------------------------------------------
class PriceHistoryInline(admin.TabularInline):
    model = PriceHistory
    extra = 0
    readonly_fields = ('recorded_at', 'price')
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
            return mark_safe(f'<img src="{obj.image_url}" width="60" style="border-radius:2px;" referrerpolicy="no-referrer" />')
        return "No Image"

    def price_display(self, obj): return f"¥{obj.price:,}" if obj.price else "---"
    def score_bar(self, obj): return get_score_bar(obj.spec_score)

    def stock_status_tag(self, obj):
        color = "#28a745" if obj.stock_status == "instock" else "#dc3545"
        return mark_safe(f'<span style="background:{color}; color:white; padding:2px 10px; border-radius:10px; font-size:10px; font-weight:bold;">{obj.stock_status.upper()}</span>')

    def ai_tag(self, obj):
        if obj.ai_content:
            return mark_safe('<span style="background:#17a2b8; color:white; padding:2px 6px; border-radius:4px; font-size:10px;">ANALYZED</span>')
        return "-"

# --------------------------------------------------------------------------
# 6. Master Data (女優, メーカー, ジャンル等)
# --------------------------------------------------------------------------
@admin.register(Genre, Actress, Maker, Author, Label, Director, Series)
class AllMasterAdmin(admin.ModelAdmin):
    """マスターデータ一覧。所属する作品数をアノテーションで表示"""
    list_display = ('name', 'ruby', 'api_source_badge', 'product_count_badge', 'created_at')
    list_display_links = ('name',) 
    list_filter = ('api_source',)
    search_fields = ('name', 'ruby')

    def get_queryset(self, request):
        # 💡 各マスターに関連付けられた AdultProduct の数をカウント
        qs = super().get_queryset(request)
        return qs.annotate(_product_count=Count('adult_products', distinct=True))

    def api_source_badge(self, obj):
        if not obj.api_source: return "-"
        return mark_safe(f'<span style="color:#666; font-family:monospace; font-size:11px;">[{obj.api_source}]</span>')
    api_source_badge.short_description = "SRC"

    def product_count_badge(self, obj):
        count = getattr(obj, '_product_count', 0)
        return mark_safe(f'<b style="background:#f1f3f5; color:#495057; border:1px solid #ced4da; padding:3px 12px; border-radius:15px; font-size:11px;">{count} titles</b>')
    product_count_badge.short_description = "関連作品数"

@admin.register(AdultAttribute, PCAttribute)
class AttributeAdmin(admin.ModelAdmin):
    list_display = ('name', 'attr_type', 'slug', 'order')
    list_filter = ('attr_type',)
    list_editable = ('order',)
    search_fields = ('name', 'slug')

@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source_tag', 'api_service', 'api_floor', 'migrated_badge', 'created_at')
    list_filter = ('api_source', 'migrated', 'api_service')
    readonly_fields = ('created_at', 'raw_json_display')
    
    def migrated_badge(self, obj):
        return mark_safe('<span style="color:green;">✔ Migrated</span>') if obj.migrated else mark_safe('<span style="color:orange;">Pending</span>')

    def api_source_tag(self, obj):
        color = "#ff3860" if obj.api_source == "FANZA" else "#007bff" if obj.api_source == "DMM" else "#6c757d"
        return mark_safe(f'<span style="background:{color}; color:white; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:bold;">{obj.api_source}</span>')

    def raw_json_display(self, obj):
        # JSONを綺麗に表示する処理など
        return mark_safe(f'<pre style="background:#f4f4f4; padding:10px;">{obj.data}</pre>')

# --------------------------------------------------------------------------
# 7. その他
# --------------------------------------------------------------------------
@admin.register(LinkshareProduct)
class LinkshareProductAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'sku', 'price_display', 'updated_at')
    def price_display(self, obj): return f"¥{obj.price:,}" if hasattr(obj, 'price') and obj.price else "---"

@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price', 'recorded_at')
    ordering = ('-recorded_at',)
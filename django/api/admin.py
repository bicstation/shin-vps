# -*- coding: utf-8 -*-
import logging
import json
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from django.db.models import Count
from django.utils import timezone

from .models import (
    User, RawApiData, AdultProduct, FanzaProduct,
    Genre, Actress, Maker, Label, Director, Series, 
    Author, AdultAttribute, PCAttribute, LinkshareProduct, 
    PriceHistory, PCProduct
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 🎨 共通ユーティリティ（視覚的アシスト）
# --------------------------------------------------------------------------
def get_score_bar(value, label="", width="100px"):
    """スコアを視覚的なバーに変換。AI評価の直感的な把握用"""
    val = value or 0
    if val > 85: color = "#ff0055"   # プレミアム
    elif val > 70: color = "#e83e8c" # 高評価
    elif val > 40: color = "#6f42c1" # 標準
    else: color = "#6c757d"          # 低評価
    
    label_html = f'<div style="font-size:9px; color:#666; margin-bottom:1px;">{label}</div>' if label else ""
    return mark_safe(
        f'{label_html}'
        f'<div style="width: {width}; background: #e9ecef; height: 10px; border-radius: 5px; overflow: hidden; border: 1px solid #dee2e6; margin-bottom: 2px;">'
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
    change_list_template = "admin/api/change_list_with_actions.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('fetch-fanza/', self.admin_site.admin_view(self.fetch_fanza_action), name='fetch_fanza'),
            path('fetch-duga/', self.admin_site.admin_view(self.fetch_duga_action), name='fetch_duga'),
        ]
        return custom_urls + urls

    def fetch_fanza_action(self, request):
        call_command('fetch_fanza')
        self.message_user(request, "🚀 FANZA/DMM APIからのデータ取得を開始しました。")
        return HttpResponseRedirect("../")

    def fetch_duga_action(self, request):
        call_command('fetch_duga')
        self.message_user(request, "🚀 DUGA APIからのデータ同期を開始しました。")
        return HttpResponseRedirect("../")

# --------------------------------------------------------------------------
# 3. AdultProduct (統合アダルト製品：V10.1 完全版)
# --------------------------------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(BaseProductAdmin):
    list_display = (
        'display_image', 'product_id_unique', 'title_short', 
        'author_tag', 'price_display', 'matrix_scores', 
        'is_posted_tag', 'api_source_tag', 'release_date'
    )
    list_display_links = ('display_image', 'product_id_unique', 'title_short')
    
    list_filter = ('api_source', 'is_active', 'is_posted', 'maker', 'authors', 'attributes')
    search_fields = ('title', 'product_id_unique', 'actresses__name', 'maker__name', 'authors__name')
    ordering = ('-release_date',)
    
    filter_horizontal = ('genres', 'actresses', 'authors', 'attributes')
    
    fieldsets = (
        ('基本情報', {'fields': ('product_id_unique', 'title', 'api_source', 'affiliate_url', 'price', 'release_date')}),
        ('メディア', {'fields': ('image_url_list', 'sample_movie_url')}),
        ('AI解析サマリー', {'fields': ('ai_summary', 'ai_content', 'target_segment')}),
        ('AIスコアリング (Matrix)', {
            'fields': (
                ('score_visual', 'score_story', 'score_cost'), 
                ('score_erotic', 'score_rarity'), 
                'spec_score'
            ),
        }),
        ('リレーション', {'fields': ('maker', 'label', 'authors', 'director', 'series', 'actresses', 'genres', 'attributes')}),
        ('ステータス', {'fields': ('is_active', 'is_posted')}),
    )

    def title_short(self, obj):
        return (obj.title[:30] + '...') if len(obj.title) > 30 else obj.title
    title_short.short_description = "タイトル"

    def author_tag(self, obj):
        authors = obj.authors.all()
        return ", ".join([a.name for a in authors]) if authors.exists() else "---"
    author_tag.short_description = "著者/作者"

    def display_image(self, obj):
        url = None
        if isinstance(obj.image_url_list, list) and len(obj.image_url_list) > 0:
            url = obj.image_url_list[0]
        elif isinstance(obj.image_url_list, dict):
            url = obj.image_url_list.get('list') or obj.image_url_list.get('small')

        if url:
            return mark_safe(f'<img src="{url}" width="85" style="border-radius:4px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" referrerpolicy="no-referrer" />')
        return "No Image"

    def matrix_scores(self, obj):
        """一覧で主要AIスコアをタイル表示"""
        return mark_safe(
            f'<div style="display: flex; flex-direction: column; gap: 4px; min-width: 110px;">'
            f'{get_score_bar(obj.score_visual, label="VISUAL", width="80px")}'
            f'{get_score_bar(obj.score_story, label="STORY", width="80px")}'
            f'<div style="border-top: 1px solid #ddd; margin-top: 2px; padding-top: 2px;">'
            f'{get_score_bar(obj.spec_score, label="TOTAL", width="80px")}'
            f'</div></div>'
        )
    matrix_scores.short_description = "AIスコアマトリックス"

    def api_source_tag(self, obj):
        colors = {"FANZA": "#ff3860", "DMM": "#007bff", "DUGA": "#ff9f00"}
        source_key = str(obj.api_source).upper() if obj.api_source else ""
        color = colors.get(source_key, "#6c757d")
        return mark_safe(f'<span style="background:{color}; color:white; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:bold;">{source_key}</span>')

    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "---"

    def is_posted_tag(self, obj):
        color = "#28a745" if obj.is_posted else "#adb5bd"
        return mark_safe(f'<b style="color:{color};">{"✅ POSTED" if obj.is_posted else "WAITING"}</b>')

# --------------------------------------------------------------------------
# 4. FanzaProduct (個別管理用)
# --------------------------------------------------------------------------
@admin.register(FanzaProduct)
class FanzaProductAdmin(BaseProductAdmin):
    list_display = ('display_main_image', 'unique_id', 'title_short', 'site_tag', 'release_date')
    list_filter = ('site_code', 'is_active')
    search_fields = ('title', 'unique_id')
    filter_horizontal = ('genres', 'actresses', 'authors')
    readonly_fields = ('raw_item_info',)

    def display_main_image(self, obj):
        url = (obj.image_urls or {}).get('list') or (obj.image_urls or {}).get('small')
        if url:
            return mark_safe(f'<img src="{url}" width="80" style="border-radius:4px;" referrerpolicy="no-referrer" />')
        return "No Image"

    def site_tag(self, obj):
        bg = "#cc0000" if obj.site_code == "FANZA" else "#0055aa"
        return mark_safe(f'<span style="background:{bg}; color:white; padding:2px 6px; border-radius:4px;">{obj.site_code}</span>')

    def title_short(self, obj):
        return (obj.title[:30] + '...') if len(obj.title) > 30 else obj.title

# --------------------------------------------------------------------------
# 5. PC・マスターデータ・他 (完全継承)
# --------------------------------------------------------------------------
@admin.register(Genre, Actress, Maker, Author, Label, Director, Series)
class AllMasterAdmin(admin.ModelAdmin):
    list_display = ('name', 'ruby', 'api_source_badge', 'product_count_badge')
    list_filter = ('api_source',)
    search_fields = ('name', 'ruby')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        model_name = self.model.__name__
        relation_map = {
            'Series': 'products_in_series', 'Maker': 'products_made',
            'Label': 'products_labeled', 'Director': 'products_directed',
            'Author': 'products_authored', 'Genre': 'products', 'Actress': 'products',
        }
        target_field = relation_map.get(model_name, 'adult_products')
        return qs.annotate(_product_count=Count(target_field, distinct=True))

    def api_source_badge(self, obj):
        source = obj.api_source or "COMMON"
        return mark_safe(f'<span style="font-family:monospace; font-size:11px; color:#666;">[{source.upper()}]</span>')

    def product_count_badge(self, obj):
        count = getattr(obj, '_product_count', 0)
        return mark_safe(f'<b style="color:#007bff;">{count} titles</b>')
    product_count_badge.short_description = "関連作品数"

@admin.register(AdultAttribute)
class AdultAttributeAdmin(admin.ModelAdmin):
    list_display = ('order', 'name', 'attr_type', 'slug')
    list_editable = ('order',)
    list_display_links = ('name',) 
    ordering = ('order',)

@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'api_service', 'migrated', 'created_at')
    readonly_fields = ('display_raw_data', 'created_at')

    def display_raw_data(self, obj):
        val = getattr(obj, 'data', None) or getattr(obj, 'raw_json', None) or {}
        formatted = json.dumps(val, indent=2, ensure_ascii=False)
        return mark_safe(f'<pre style="background:#272822; color:#f8f8f2; padding:15px; border-radius:5px; max-height:500px; overflow:auto;">{formatted}</pre>')

# --- インライン・PC製品・Linkshare ---
class PriceHistoryInline(admin.TabularInline):
    model = PriceHistory
    extra = 0
    readonly_fields = ('recorded_at', 'price')

@admin.register(PCProduct)
class PCProductAdmin(admin.ModelAdmin):
    inlines = [PriceHistoryInline]
    list_display = ('name', 'maker', 'price', 'stock_status')
    list_filter = ('stock_status', 'maker')

@admin.register(LinkshareProduct)
class LinkshareProductAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'sku', 'price_display', 'updated_at')
    search_fields = ('product_name', 'sku')
    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "---"

admin.site.register(PriceHistory)
admin.site.register(PCAttribute)
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

from .models import (
    User, RawApiData, AdultProduct, 
    Genre, Actress, Maker, Label, Director, Series, 
    Author, PCAttribute, LinkshareProduct, 
    PriceHistory, PCProduct, FanzaFloorMaster, AdultAttribute
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 🎨 共通ユーティリティ（視覚的アシスト）
# --------------------------------------------------------------------------
def get_score_bar(value, label="", width="100px"):
    """スコアを視覚的なバーに変換。AI評価の直感的な把握用"""
    val = value or 0
    if val >= 85: color = "#ff0055"   # プレミアム
    elif val >= 70: color = "#e83e8c" # 高評価
    elif val >= 50: color = "#6f42c1" # 標準
    else: color = "#6c757d"           # 低評価
    
    label_html = f'<div style="font-size:9px; color:#666; margin-bottom:1px; line-height:1;">{label}</div>' if label else ""
    return mark_safe(
        f'<div style="margin-bottom: 5px;">'
        f'{label_html}'
        f'<div style="width: {width}; background: #e9ecef; height: 8px; border-radius: 4px; overflow: hidden; border: 1px solid #dee2e6; display: inline-block; vertical-align: middle;">'
        f'<div style="width: {val}%; background: {color}; height: 100%;"></div>'
        f'</div>'
        f'<span style="font-size: 10px; color: {color}; font-weight: bold; margin-left: 5px;">{val}</span>'
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
    
    def display_avatar(self, obj):
        if obj.profile_image:
            return mark_safe(f'<img src="{obj.profile_image}" width="35" height="35" style="border-radius: 50%; object-fit: cover;" />')
        return "---"
    display_avatar.short_description = "AVATAR"

    def site_group_tag(self, obj):
        return mark_safe(f'<span style="background: #495057; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px;">{obj.site_group}</span>')

    def is_active_tag(self, obj):
        color = "#28a745" if obj.is_active else "#dc3545"
        return mark_safe(f'<b style="color: {color};">{"● ACTIVE" if obj.is_active else "○ STOPPED"}</b>')

# --------------------------------------------------------------------------
# 2. AdultProduct (統合アダルト製品)
# --------------------------------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    change_list_template = "admin/api/change_list_with_actions.html"
    
    # 一覧表示の設定
    list_display = (
        'display_image', 'product_id_unique', 'title_short', 
        'maker', 'matrix_scores', 'api_source_tag', 'is_posted_tag', 'open_link'
    )
    list_display_links = ('display_image', 'product_id_unique', 'title_short')
    list_filter = ('api_source', 'api_service', 'is_active', 'is_posted', 'maker')
    search_fields = ('title', 'product_id_unique', 'actresses__name', 'maker__name')
    ordering = ('-release_date',)
    filter_horizontal = ('genres', 'actresses', 'authors', 'attributes') 

    # 詳細（編集）画面のレイアウト
    fieldsets = (
        ('基本情報', {
            'fields': (
                'product_id_unique', 'title', 
                ('api_source', 'api_service'),  # 🚀 個別画面でサービスを表示
                ('floor_master', 'floor_code'), # 🚀 個別画面でフロアコードを表示
                'affiliate_url', 
                ('price', 'list_price'), 'release_date'
            )
        }),
        ('コンテンツ内容', {
            'fields': ('product_description', 'rich_description', 'volume', 'maker_product_id', 'jancode')
        }),
        ('メディア', {
            'fields': ('image_url_list', 'sample_image_list', 'sample_movie_url', 'tachiyomi_url')
        }),
        ('AI解析・レビュー', {
            'fields': ('ai_summary', 'ai_content', 'target_segment', 'ai_chat_comments')
        }),
        ('AIスコアリング (マトリックス)', {
            'fields': (
                ('score_visual', 'score_story'),
                ('score_erotic', 'score_rarity'),
                ('score_cost_performance', 'score_fetish'),
                'spec_score'
            ),
        }),
        ('リレーション・分類', {
            'fields': ('maker', 'label', 'authors', 'director', 'series', 'actresses', 'genres', 'attributes')
        }),
        ('ステータス・販売設定', {
            'fields': (('is_active', 'is_posted'), ('is_on_sale', 'discount_rate'), 'stock_status', 'delivery_type')
        }),
    )

    def title_short(self, obj):
        return obj.title[:30] + '...' if len(obj.title) > 30 else obj.title
    title_short.short_description = "作品タイトル"

    def display_image(self, obj):
        url = ""
        if isinstance(obj.image_url_list, list) and obj.image_url_list:
            url = obj.image_url_list[0]
        elif isinstance(obj.image_url_list, dict):
            url = obj.image_url_list.get('large') or obj.image_url_list.get('list')
        
        if url:
            return mark_safe(f'<img src="{url}" width="90" style="border-radius:4px; border:1px solid #ddd; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />')
        return "No Image"
    display_image.short_description = "メイン画像"

    def open_link(self, obj):
        if obj.affiliate_url:
            return mark_safe(f'<a href="{obj.affiliate_url}" target="_blank" style="display:inline-block; padding:3px 8px; background:#007bff; color:white; border-radius:3px; text-decoration:none; font-size:10px; font-weight:bold;">🔗 Open</a>')
        return "-"
    open_link.short_description = "外部リンク"

    def matrix_scores(self, obj):
        return mark_safe(
            f'<div style="min-width: 120px;">'
            f'{get_score_bar(obj.score_visual, "映像")}'
            f'{get_score_bar(obj.score_erotic, "刺激")}'
            f'<div style="border-top:1px solid #eee; padding-top:3px;">'
            f'{get_score_bar(obj.spec_score, "TOTAL", width="90px")}'
            f'</div></div>'
        )
    matrix_scores.short_description = "AI解析スコア"

    def api_source_tag(self, obj):
        colors = {"fanza": "#ff3860", "duga": "#ff9f00", "dmm": "#00d1b2"}
        src = str(obj.api_source).lower()
        return mark_safe(f'<span style="background:{colors.get(src, "#666")}; color:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">{src.upper()}</span>')
    api_source_tag.short_description = "ソース"

    def is_posted_tag(self, obj):
        return "✅" if obj.is_posted else "⏳"
    is_posted_tag.short_description = "公開"

    def get_urls(self):
        return [
            path('fetch-fanza/', self.admin_site.admin_view(self.fetch_action), {'cmd': 'fetch_fanza'}, name='fetch_fanza'),
            path('fetch-duga/', self.admin_site.admin_view(self.fetch_action), {'cmd': 'fetch_duga'}, name='fetch_duga'),
        ] + super().get_urls()

    def fetch_action(self, request, cmd):
        call_command(cmd)
        self.message_user(request, f"🚀 {cmd} 同期コマンドを実行しました。")
        return HttpResponseRedirect("../")

# --------------------------------------------------------------------------
# 3. マスターデータ（作品数表示付き）
# --------------------------------------------------------------------------
@admin.register(Genre, Actress, Maker, Author, Label, Director, Series)
class AllMasterAdmin(admin.ModelAdmin):
    list_display = ('name', 'ruby', 'api_source_badge', 'product_count_badge')
    search_fields = ('name', 'ruby')
    list_filter = ('api_source',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        rel_map = {
            'Genre': 'products', 'Actress': 'products', 'Maker': 'products_made', 
            'Author': 'products_authored', 'Label': 'products_labeled',
            'Director': 'products_directed', 'Series': 'products_in_series'
        }
        target = rel_map.get(self.model.__name__, 'products')
        return qs.annotate(_count=Count(target, distinct=True))

    def product_count_badge(self, obj):
        return mark_safe(f'<b style="color:#007bff;">{obj._count}</b> <span style="font-size:10px;">titles</span>')
    product_count_badge.short_description = "作品数"

    def api_source_badge(self, obj):
        return mark_safe(f'<span style="color:#999; font-size:10px;">[{obj.api_source}]</span>')
    api_source_badge.short_description = "ソース"

# --------------------------------------------------------------------------
# 4. RawApiData (生データ)
# --------------------------------------------------------------------------
@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('api_source_tag', 'api_service', 'api_floor', 'api_product_id', 'created_at', 'migrated')
    list_filter = ('api_source', 'api_service', 'migrated')
    search_fields = ('api_product_id',)
    readonly_fields = ('display_json',)

    def api_source_tag(self, obj):
        colors = {"fanza": "#ff3860", "duga": "#ff9f00", "dmm": "#00d1b2"}
        src = str(obj.api_source).lower()
        return mark_safe(f'<span style="background:{colors.get(src, "#666")}; color:white; padding:2px 8px; border-radius:4px; font-weight:bold;">{src.upper()}</span>')
    api_source_tag.short_description = "ソース"

    def display_json(self, obj):
        data = obj.raw_json_data or {}
        return mark_safe(f'<pre style="background:#272822; color:#f8f8f2; padding:15px; border-radius:5px; font-size:12px; overflow:auto; max-height:600px;">{json.dumps(data, indent=2, ensure_ascii=False)}</pre>')
    display_json.short_description = "生JSON解析結果"

# --------------------------------------------------------------------------
# 5. その他・属性管理
# --------------------------------------------------------------------------
@admin.register(AdultAttribute)
class AdultAttributeAdmin(admin.ModelAdmin):
    list_display = ('order', 'name', 'attr_type', 'slug')
    list_display_links = ('name',)
    list_editable = ('order',)
    list_filter = ('attr_type',)
    search_fields = ('name', 'slug')

@admin.register(FanzaFloorMaster)
class FanzaFloorMasterAdmin(admin.ModelAdmin):
    list_display = ('site_code', 'site_name', 'service_code', 'service_name', 'floor_code', 'floor_name', 'is_active')
    list_filter = ('site_code', 'service_code')
    search_fields = ('site_name', 'service_name', 'floor_name', 'floor_code')

# その他のインフラ系モデルを一括登録
admin.site.register([PCProduct, PCAttribute, PriceHistory, LinkshareProduct])
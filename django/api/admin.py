# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/admin.py

import logging
import json
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.safestring import mark_safe
from django.db.models import Count

# モデルのインポート
from .models import (
    User, RawApiData, AdultProduct, 
    Genre, Actress, Maker, Label, Director, Series, 
    Author, PCAttribute, LinkshareProduct, 
    PriceHistory, PCProduct, FanzaFloorMaster, AdultAttribute,
    AdultActressProfile,
    BSCarrier, BSDevice, BSDevicePrice, BSMobilePlan,
    BSDeviceColor,
    Article,
    ContentHub
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 🎨 共通ユーティリティ (Visual Components)
# --------------------------------------------------------------------------
def get_score_bar(value, label="", width="100px"):
    """スコアを視覚的なバーに変換"""
    try:
        val = int(float(value)) if value else 0
    except (ValueError, TypeError):
        val = 0
        
    if val >= 90: color = "#ffc107"   # 👑 ゴールド
    elif val >= 80: color = "#ff0055" # プレミアム
    elif val >= 65: color = "#e83e8c" # 高評価
    elif val >= 45: color = "#6f42c1" # 標準
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

def get_thumbnail(url, width=80):
    """汎用サムネイル表示"""
    if url:
        return mark_safe(f'<img src="{url}" width="{width}" style="border-radius:6px; border:1px solid #ddd; background:#f8f9fa; object-fit:cover;" />')
    return mark_safe(f'<div style="width:{width}px; height:40px; background:#eee; color:#999; text-align:center; line-height:40px; font-size:10px; border-radius:4px;">No Image</div>')

# --------------------------------------------------------------------------
# 📝 1. ContentHub (ハブ・コンテンツ統合管理) - NEW
# --------------------------------------------------------------------------

@admin.register(ContentHub)
class ContentHubAdmin(admin.ModelAdmin):
    list_display = (
        'display_thumb', 'type_badge', 'adult_badge', 
        'title_short', 'is_active_tag', 'created_at'
    )
    list_display_links = ('display_thumb', 'title_short')
    list_filter = ('content_type', 'is_adult', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'original_id')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('基本情報', {
            'fields': ('content_type', 'is_adult', 'title', 'description', 'is_active')
        }),
        ('紐付け・ソース', {
            'fields': ('original_id', 'source_article', 'source_adult_product', 'source_pc_product')
        }),
        ('メディア・拡張データ (JSON)', {
            'fields': ('images_json', 'videos_json', 'extra_metadata'),
            'classes': ('collapse',),
            'description': '配信に必要な全てのメタデータが統合されています。'
        }),
        ('システム', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

    def display_thumb(self, obj):
        url = None
        if obj.images_json and isinstance(obj.images_json, list) and len(obj.images_json) > 0:
            url = obj.images_json[0].get('url')
        return get_thumbnail(url, 90)
    display_thumb.short_description = "サムネイル"

    def type_badge(self, obj):
        colors = {'article': '#6f42c1', 'adult_product': '#ff0055', 'pc_product': '#007bff'}
        bg = colors.get(obj.content_type, '#6c757d')
        return mark_safe(f'<span style="background:{bg}; color:white; padding:3px 8px; border-radius:12px; font-size:10px; font-weight:bold;">{obj.content_type.upper()}</span>')
    type_badge.short_description = "種別"

    def adult_badge(self, obj):
        color = "#ff0055" if obj.is_adult else "#28a745"
        label = "🔞" if obj.is_adult else "🌐"
        return mark_safe(f'<span style="color:{color}; font-weight:bold;">{label}</span>')
    adult_badge.short_description = "属性"

    def title_short(self, obj): return obj.title[:45] + '...' if len(obj.title) > 45 else obj.title
    def is_active_tag(self, obj): return mark_safe("✅" if obj.is_active else "<span style='color:#bbb;'>❌</span>")
    is_active_tag.short_description = "有効"


# --------------------------------------------------------------------------
# 📝 2. Article (統合配信記事管理 / v5.0 物理分離対応版)
# --------------------------------------------------------------------------

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        'display_main_thumb', 'site_badge', 'adult_status', 'delivery_badge', 
        'title_short', 'is_exported_tag', 'created_at'
    )
    list_display_links = ('display_main_thumb', 'title_short')
    
    list_filter = (
        'site', 'is_adult', 'show_on_main', 'show_on_satellite', 
        'content_type', 'is_exported', 'created_at'
    )
    
    search_fields = ('title', 'body_main', 'body_satellite', 'source_url')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('基本情報', {
            'fields': ('site', 'is_adult', 'content_type', 'title', 'source_url')
        }),
        ('配信設定', {
            'fields': ('show_on_main', 'show_on_satellite', 'is_exported')
        }),
        ('コンテンツ (v5.0 用途別本文)', {
            'fields': ('body_main', 'body_satellite'),
            'description': 'メインサイト用とサテライト用でAIが生成した内容を保持します。'
        }),
        ('メディア・拡張データ (JSON形式)', {
            'fields': ('images_json', 'videos_json', 'extra_metadata'),
            'classes': ('collapse',),
            'description': 'VPS移行後はここに配列データが格納されます。'
        }),
        ('システム管理 (ReadOnly)', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

    def display_main_thumb(self, obj):
        url = None
        if obj.images_json and isinstance(obj.images_json, list) and len(obj.images_json) > 0:
            url = obj.images_json[0].get('url')
        
        if not url and hasattr(obj, 'main_image_url'):
            url = obj.main_image_url
            
        return get_thumbnail(url, 100)
    display_main_thumb.short_description = "画像"

    def adult_status(self, obj):
        color = "#ff0055" if obj.is_adult else "#28a745"
        label = "🔞 ADULT" if obj.is_adult else "🌐 GENERAL"
        return mark_safe(f'<b style="color:{color}; font-size:10px;">{label}</b>')
    adult_status.short_description = "属性"

    def delivery_badge(self, obj):
        badges = []
        if obj.show_on_main:
            badges.append('<span style="background:#007bff; color:white; padding:2px 5px; border-radius:3px; margin-right:2px; font-size:9px;">💎Main</span>')
        if obj.show_on_satellite:
            badges.append('<span style="background:#6c757d; color:white; padding:2px 5px; border-radius:3px; font-size:9px;">🛰️Sat</span>')
        return mark_safe(" ".join(badges)) if badges else "-"
    delivery_badge.short_description = "配信先"

    def site_badge(self, obj):
        colors = {'tiper': '#6f42c1', 'avflash': '#ff0055', 'bicstation': '#007bff', 'saving': '#28a745'}
        site_labels = dict(getattr(Article, 'SITE_CHOICES', []))
        display_text = site_labels.get(obj.site, obj.site)
        bg = colors.get(obj.site, '#6c757d')
        return mark_safe(f'<span style="background:{bg}; color:white; padding:3px 8px; border-radius:12px; font-size:10px; font-weight:bold;">{display_text}</span>')
    site_badge.short_description = "サイト"

    def title_short(self, obj): return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    def is_exported_tag(self, obj): return mark_safe("✅" if obj.is_exported else "<span style='color:#bbb;'>⏳</span>")

# --------------------------------------------------------------------------
# 💻 3. PCProduct (PC製品管理)
# --------------------------------------------------------------------------
@admin.register(PCProduct)
class PCProductAdmin(admin.ModelAdmin):
    list_display = ('display_image', 'maker_tag', 'name_short', 'price_display', 'pc_scores', 'is_ai_pc_tag')
    list_display_links = ('display_image', 'name_short')
    list_filter = ('maker', 'is_ai_pc') 
    search_fields = ('name', 'unique_id', 'cpu_model')
    
    def display_image(self, obj): return get_thumbnail(obj.image_url, 80)
    def name_short(self, obj): return obj.name[:40] + '...' if len(obj.name) > 40 else obj.name
    def maker_tag(self, obj): return mark_safe(f'<span style="background:#444; color:white; padding:2px 6px; border-radius:4px; font-size:10px;">{obj.maker}</span>')
    def price_display(self, obj):
        if not obj.price: return "---"
        try: return f"¥{int(float(obj.price)):,}"
        except: return f"¥{obj.price}"
    def pc_scores(self, obj):
        return mark_safe(f'<div style="min-width:110px;">{get_score_bar(obj.score_cpu, "CPU", "70px")}{get_score_bar(obj.score_gpu, "GPU", "70px")}</div>')
    def is_ai_pc_tag(self, obj): return mark_safe('<span style="color:#007bff; font-weight:bold;">🤖 AI PC</span>') if obj.is_ai_pc else "---"

# --------------------------------------------------------------------------
# 🔞 4. AdultProduct (統合アダルト製品)
# --------------------------------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    list_display = ('display_image', 'product_id_unique', 'title_short', 'maker', 'ai_sommelier_scores', 'api_source_tag', 'is_posted_tag')
    list_display_links = ('display_image', 'product_id_unique', 'title_short')
    list_filter = ('api_source', 'is_posted', 'maker')
    search_fields = ('title', 'product_id_unique')
    filter_horizontal = ('genres', 'actresses', 'attributes') 

    def display_image(self, obj):
        url = ""
        if isinstance(obj.image_url_list, list) and obj.image_url_list: url = obj.image_url_list[0]
        elif isinstance(obj.image_url_list, dict): url = obj.image_url_list.get('large') or obj.image_url_list.get('list')
        return get_thumbnail(url, 90)

    def title_short(self, obj):
        text = obj.ai_catchcopy if obj.ai_catchcopy else obj.title
        return text[:40] + '...' if len(text) > 40 else text
    def ai_sommelier_scores(self, obj):
        return mark_safe(f'<div style="min-width:120px;">{get_score_bar(obj.ai_score_visual*20, "AI映像")}{get_score_bar(obj.ai_score_erotic*20, "AI刺激")}</div>')
    def api_source_tag(self, obj):
        colors = {"fanza": "#ff3860", "duga": "#ff9f00", "dmm": "#00d1b2"}
        src = str(obj.api_source).lower()
        return mark_safe(f'<span style="background:{colors.get(src, "#666")}; color:white; padding:2px 6px; border-radius:4px; font-size:10px;">{src.upper()}</span>')
    def is_posted_tag(self, obj): return "✅" if obj.is_posted else "⏳"

# --------------------------------------------------------------------------
# 👥 5. User & Actress (画像付き)
# --------------------------------------------------------------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (('✨ 追加プロフィール', {'fields': ('site_group', 'status_message', 'profile_image', 'bio')}),)
    list_display = ('username', 'display_avatar', 'email', 'site_group', 'is_staff')
    def display_avatar(self, obj): return get_thumbnail(obj.profile_image, 40)

@admin.register(Actress)
class ActressAdmin(admin.ModelAdmin):
    list_display = ('display_image', 'name', 'ruby', 'golden_ratio_score', 'product_count_badge')
    search_fields = ('name', 'ruby')
    def get_queryset(self, request): return super().get_queryset(request).annotate(_count=Count('products', distinct=True))
    def display_image(self, obj):
        url = getattr(obj.profile, 'image_url', None) if hasattr(obj, 'profile') else None
        return get_thumbnail(url, 50)
    def golden_ratio_score(self, obj):
        if hasattr(obj, 'profile') and obj.profile: return get_score_bar(obj.profile.ai_power_score, f"{obj.profile.cup}Cup")
        return "No Data"
    def product_count_badge(self, obj): return mark_safe(f'<b style="color:#007bff;">{obj._count}</b>')

# --------------------------------------------------------------------------
# 📱 6. Bic-saving (スマホ系・画像強化)
# --------------------------------------------------------------------------
class BSDeviceColorInline(admin.TabularInline):
    model = BSDeviceColor
    extra = 1
class BSDevicePriceInline(admin.TabularInline):
    model = BSDevicePrice
    extra = 1

@admin.register(BSDevice)
class BSDeviceAdmin(admin.ModelAdmin):
    list_display = ('display_thumbnail', 'name', 'brand', 'performance_visual', 'sim_free_price')
    inlines = [BSDeviceColorInline, BSDevicePriceInline]
    def display_thumbnail(self, obj): return get_thumbnail(obj.main_image, 60)
    def performance_visual(self, obj):
        score = min((obj.ram_gb or 0) * 8, 100)
        return get_score_bar(score, label=f"RAM {obj.ram_gb}GB")

# --------------------------------------------------------------------------
# ⚙️ 7. システム・マスター管理
# --------------------------------------------------------------------------
@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('api_source', 'api_product_id', 'created_at', 'migrated')
    readonly_fields = ('display_json',)
    def display_json(self, obj):
        return mark_safe(f'<pre style="background:#272822; color:#f8f8f2; padding:15px; max-height:400px; overflow:auto;">{json.dumps(obj.raw_json_data, indent=2, ensure_ascii=False)}</pre>')

@admin.register(Genre, Maker, Author, Label, Director, Series)
class OtherMasterAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count_badge', 'api_source')
    def get_queryset(self, request):
        rel_map = {'Maker': 'products_made', 'Author': 'products_authored', 'Label': 'products_labeled', 'Director': 'products_directed', 'Series': 'products_in_series'}
        target = rel_map.get(self.model.__name__, 'products')
        return super().get_queryset(request).annotate(_count=Count(target, distinct=True))
    def product_count_badge(self, obj): return mark_safe(f'<b>{obj._count}</b>')

admin.site.register([
    PCAttribute, PriceHistory, LinkshareProduct, 
    AdultAttribute, AdultActressProfile, FanzaFloorMaster,
    BSCarrier, BSMobilePlan
])
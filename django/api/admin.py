# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/admin.py

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
    BSDeviceColor
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 🎨 共通ユーティリティ
# --------------------------------------------------------------------------
def get_score_bar(value, label="", width="100px"):
    """スコアを視覚的なバーに変換"""
    val = value or 0
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

# --------------------------------------------------------------------------
# 1. PCProduct (PC製品管理) - 最終修正版
# --------------------------------------------------------------------------
@admin.register(PCProduct)
class PCProductAdmin(admin.ModelAdmin):
    list_display = (
        'display_image', 'maker_tag', 'name_short', 
        'price_display', 'pc_scores', 'is_ai_pc_tag', 'last_spec_parsed_at'
    )
    list_display_links = ('display_image', 'name_short')
    list_filter = ('maker', 'is_ai_pc', 'last_spec_parsed_at') 
    search_fields = ('name', 'unique_id', 'cpu_model', 'gpu_model')
    ordering = ('-last_spec_parsed_at', '-created_at')
    
    # パフォーマンス対策: 存在するフィールドのみスキップ指定
    def get_queryset(self, request):
        # rich_description を削除し、存在する ai_content と description だけを defer
        return super().get_queryset(request).defer('ai_content', 'description')

    def display_image(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="80" style="border-radius:4px; border:1px solid #ddd; background:white;" />')
        return "No Image"
    display_image.short_description = "画像"

    def name_short(self, obj):
        return obj.name[:40] + '...' if len(obj.name) > 40 else obj.name
    name_short.short_description = "製品名"

    def maker_tag(self, obj):
        return mark_safe(f'<span style="background:#444; color:white; padding:2px 6px; border-radius:4px; font-size:10px;">{obj.maker}</span>')
    maker_tag.short_description = "メーカー"

    def price_display(self, obj):
        if not obj.price: return "---"
        try:
            return f"¥{int(float(obj.price)):,}"
        except:
            return f"¥{obj.price}"
    price_display.short_description = "価格"

    def pc_scores(self, obj):
        return mark_safe(
            f'<div style="min-width: 110px;">'
            f'{get_score_bar(obj.score_cpu, "CPU", width="70px")}'
            f'{get_score_bar(obj.score_gpu, "GPU", width="70px")}'
            f'</div>'
        )
    pc_scores.short_description = "スペック解析"

    def is_ai_pc_tag(self, obj):
        if obj.is_ai_pc:
            return mark_safe('<span style="color:#007bff; font-weight:bold;">🤖 AI PC</span>')
        return "---"
    is_ai_pc_tag.short_description = "AI対応"

# --------------------------------------------------------------------------
# 2. AdultProduct (統合アダルト製品)
# --------------------------------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    list_display = (
        'display_image', 'product_id_unique', 'title_short', 
        'maker', 'ai_sommelier_scores', 'api_source_tag', 'is_posted_tag', 'open_link'
    )
    list_display_links = ('display_image', 'product_id_unique', 'title_short')
    list_filter = ('api_source', 'api_service', 'is_active', 'is_posted', 'maker')
    search_fields = ('title', 'product_id_unique', 'actresses__name', 'maker__name')
    ordering = ('-release_date',)
    filter_horizontal = ('genres', 'actresses', 'authors', 'attributes') 

    def display_image(self, obj):
        url = ""
        if isinstance(obj.image_url_list, list) and obj.image_url_list:
            url = obj.image_url_list[0]
        elif isinstance(obj.image_url_list, dict):
            url = obj.image_url_list.get('large') or obj.image_url_list.get('list')
        if url:
            return mark_safe(f'<img src="{url}" width="90" style="border-radius:4px; border:1px solid #ddd;" />')
        return "No Image"

    def title_short(self, obj):
        text = obj.ai_catchcopy if obj.ai_catchcopy else obj.title
        return text[:40] + '...' if len(text) > 40 else text

    def ai_sommelier_scores(self, obj):
        return mark_safe(
            f'<div style="min-width: 120px;">'
            f'{get_score_bar(obj.ai_score_visual * 20, "AI映像")}'
            f'{get_score_bar(obj.ai_score_erotic * 20, "AI刺激")}'
            f'</div>'
        )

    def api_source_tag(self, obj):
        colors = {"fanza": "#ff3860", "duga": "#ff9f00", "dmm": "#00d1b2"}
        src = str(obj.api_source).lower()
        return mark_safe(f'<span style="background:{colors.get(src, "#666")}; color:white; padding:2px 6px; border-radius:4px; font-size:10px;">{src.upper()}</span>')

    def is_posted_tag(self, obj): return "✅" if obj.is_posted else "⏳"
    
    def open_link(self, obj):
        if obj.affiliate_url:
            return mark_safe(f'<a href="{obj.affiliate_url}" target="_blank" style="padding:3px 8px; background:#007bff; color:white; border-radius:3px; text-decoration:none; font-size:10px;">🔗 Open</a>')
        return "-"

# --------------------------------------------------------------------------
# 3. User & Masters
# --------------------------------------------------------------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (('✨ 追加プロフィール', {'fields': ('site_group', 'status_message', 'profile_image', 'bio')}),)
    list_display = ('username', 'display_avatar', 'email', 'site_group', 'is_staff')
    def display_avatar(self, obj):
        if obj.profile_image: return mark_safe(f'<img src="{obj.profile_image}" width="35" height="35" style="border-radius:50%;" />')
        return "---"

@admin.register(Actress)
class ActressAdmin(admin.ModelAdmin):
    list_display = ('name', 'ruby', 'golden_ratio_score', 'product_count_badge')
    search_fields = ('name', 'ruby')
    def get_queryset(self, request): return super().get_queryset(request).annotate(_count=Count('products', distinct=True))
    def golden_ratio_score(self, obj):
        if hasattr(obj, 'profile') and obj.profile: return get_score_bar(obj.profile.ai_power_score, f"{obj.profile.cup}Cup")
        return "No Data"
    def product_count_badge(self, obj): return mark_safe(f'<b style="color:#007bff;">{obj._count}</b>')

@admin.register(Genre, Maker, Author, Label, Director, Series)
class OtherMasterAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count_badge', 'api_source')
    def get_queryset(self, request):
        rel_map = {'Maker': 'products_made', 'Author': 'products_authored', 'Label': 'products_labeled', 'Director': 'products_directed', 'Series': 'products_in_series'}
        target = rel_map.get(self.model.__name__, 'products')
        return super().get_queryset(request).annotate(_count=Count(target, distinct=True))
    def product_count_badge(self, obj): return mark_safe(f'<b>{obj._count}</b>')

# --------------------------------------------------------------------------
# 4. Bic-saving (スマホ系)
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
    def display_thumbnail(self, obj):
        if obj.main_image: return mark_safe(f'<img src="{obj.main_image}" width="50" style="object-fit:contain;" />')
        return "-"
    def performance_visual(self, obj):
        score = min((obj.ram_gb or 0) * 8, 100)
        return get_score_bar(score, label=f"RAM {obj.ram_gb}GB")

@admin.register(BSCarrier, BSMobilePlan)
class MobileAdmin(admin.ModelAdmin): pass

# --------------------------------------------------------------------------
# 5. システム管理
# --------------------------------------------------------------------------
@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('api_source', 'api_product_id', 'created_at', 'migrated')
    readonly_fields = ('display_json',)
    def display_json(self, obj):
        return mark_safe(f'<pre style="background:#272822; color:#f8f8f2; padding:15px; max-height:400px; overflow:auto;">{json.dumps(obj.raw_json_data, indent=2, ensure_ascii=False)}</pre>')

# シンプル登録
admin.site.register([PCAttribute, PriceHistory, LinkshareProduct, AdultAttribute, AdultActressProfile, FanzaFloorMaster])
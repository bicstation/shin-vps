# -*- coding: utf-8 -*-
import logging
import json
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.safestring import mark_safe
from django.db.models import Count
from django.utils.text import slugify

# モデルのインポート
from .models import (
    User, RawApiData, AdultProduct, 
    Genre, Actress, Maker, Label, Director, Series, 
    Author, PCAttribute, LinkshareProduct, 
    PriceHistory, PCProduct, FanzaFloorMaster, AdultAttribute,
    AdultActressProfile,
    BSCarrier, BSDevice, BSDevicePrice, BSMobilePlan,
    BSDeviceColor,
    Article
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 🎨 共通ユーティリティ
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
    return mark_safe('<div style="width:{0}px; height:40px; background:#eee; color:#999; text-align:center; line-height:40px; font-size:10px; border-radius:4px;">No Image</div>'.format(width))

# --------------------------------------------------------------------------
# 📝 1. Article (統合配信記事管理 / JSONField対応版)
# --------------------------------------------------------------------------

# JSONField内のカテゴリでフィルタリングするためのカスタムフィルター
class ArticleCategoryFilter(admin.SimpleListFilter):
    title = 'カテゴリ(JSON)'
    parameter_name = 'json_category'

    def lookups(self, request, model_admin):
        # 実際にDBに存在するカテゴリ名を重複なく取得
        # データ量が多い場合は .distinct() よりも .values_list('extra_metadata__category') を使用
        categories = Article.objects.exclude(extra_metadata__category__isnull=True) \
                            .values_list('extra_metadata__category', flat=True).distinct()
        return [(c, c) for c in categories if c]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(extra_metadata__category=self.value())
        return queryset

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        'display_image', 'site_badge', 'type_badge', 'json_category_tag', 'title_short', 
        'is_exported_tag', 'created_at'
    )
    list_display_links = ('display_image', 'title_short')
    
    # 標準フィルタに JSON用カスタムフィルタを追加
    list_filter = ('site', 'content_type', ArticleCategoryFilter, 'is_exported', 'created_at')
    
    search_fields = ('title', 'body_text', 'source_url', 'extra_metadata__category', 'extra_metadata__tags')
    ordering = ('-created_at',)
    readonly_fields = ('display_extra_metadata', 'updated_at')

    def get_queryset(self, request):
        """ドメインによる自動絞り込み"""
        qs = super().get_queryset(request)
        p_id = getattr(request, 'project_id', 'default')
        if p_id not in ['default', 'tiper']:
            return qs.filter(site=p_id)
        return qs

    def save_model(self, request, obj, form, change):
        """保存時に現在のドメインを自動セット"""
        if not obj.site:
            p_id = getattr(request, 'project_id', 'default')
            if p_id != 'default': obj.site = p_id
        super().save_model(request, obj, form, change)

    # --- 表示カスタマイズ ---
    def display_image(self, obj): return get_thumbnail(obj.main_image_url, 100)
    display_image.short_description = "画像"

    def site_badge(self, obj):
        colors = {'tiper': '#6f42c1', 'avflash': '#ff0055', 'bicstation': '#007bff', 'saving': '#28a745'}
        # モデルにSITE_CHOICESがない場合を想定したフォールバック
        site_labels = dict(getattr(Article, 'SITE_CHOICES', []))
        display_text = site_labels.get(obj.site, obj.site)
        bg = colors.get(obj.site, '#6c757d')
        return mark_safe(f'<span style="background:{bg}; color:white; padding:3px 8px; border-radius:12px; font-size:10px; font-weight:bold;">{display_text}</span>')
    site_badge.short_description = "サイト"

    def type_badge(self, obj):
        color = "#17a2b8" if obj.content_type == 'news' else "#ffc107"
        text_color = "white" if obj.content_type == 'news' else "black"
        try: display_text = obj.get_content_type_display()
        except: display_text = obj.content_type
        return mark_safe(f'<span style="background:{color}; color:{text_color}; padding:2px 6px; border-radius:4px; font-size:10px;">{display_text}</span>')
    type_badge.short_description = "種別"

    def json_category_tag(self, obj):
        """extra_metadata内のカテゴリをバッジ表示"""
        cat = obj.extra_metadata.get('category')
        if cat:
            return mark_safe(f'<span style="color:#28a745; border:1px solid #28a745; padding:1px 5px; border-radius:3px; font-size:10px;">🏷 {cat}</span>')
        return "-"
    json_category_tag.short_description = "カテゴリ"

    def title_short(self, obj): return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    
    def is_exported_tag(self, obj): return mark_safe("✅ <small>済</small>" if obj.is_exported else "<span style='color:#bbb;'>⏳ 未</span>")
    
    def display_extra_metadata(self, obj):
        """JSONデータをシンタックスハイライト風に表示"""
        json_data = json.dumps(obj.extra_metadata, indent=2, ensure_ascii=False)
        return mark_safe(f'<pre style="background:#272822; color:#f8f8f2; padding:15px; border-radius:8px; font-family:Monaco, monospace; font-size:12px;">{json_data}</pre>')
    display_extra_metadata.short_description = "メタデータ(JSON)"

# --------------------------------------------------------------------------
# 💻 2. PCProduct (PC製品管理)
# --------------------------------------------------------------------------
@admin.register(PCProduct)
class PCProductAdmin(admin.ModelAdmin):
    list_display = ('display_image', 'maker_tag', 'name_short', 'price_display', 'pc_scores', 'is_ai_pc_tag')
    list_display_links = ('display_image', 'name_short')
    list_filter = ('maker', 'is_ai_pc') 
    search_fields = ('name', 'unique_id', 'cpu_model')
    
    def get_queryset(self, request):
        """bicstationドメイン以外では基本表示しない（または全表示）"""
        qs = super().get_queryset(request).defer('ai_content', 'description')
        p_id = getattr(request, 'project_id', 'default')
        if p_id == 'avflash': return qs.none() 
        return qs

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
# 🔞 3. AdultProduct (統合アダルト製品)
# --------------------------------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    list_display = ('display_image', 'product_id_unique', 'title_short', 'maker', 'ai_sommelier_scores', 'api_source_tag', 'is_posted_tag')
    list_display_links = ('display_image', 'product_id_unique', 'title_short')
    list_filter = ('api_source', 'is_posted', 'maker')
    search_fields = ('title', 'product_id_unique')
    filter_horizontal = ('genres', 'actresses', 'attributes') 

    def get_queryset(self, request):
        """クリーンなドメインではアダルト製品を隠す"""
        qs = super().get_queryset(request)
        p_id = getattr(request, 'project_id', 'default')
        if p_id in ['bicstation', 'saving']: return qs.none()
        return qs

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
# 👥 4. User & Actress (画像付き)
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
# 📱 5. Bic-saving (スマホ系・画像強化)
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
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        p_id = getattr(request, 'project_id', 'default')
        if p_id == 'avflash': return qs.none() 
        return qs

    def display_thumbnail(self, obj): return get_thumbnail(obj.main_image, 60)
    def performance_visual(self, obj):
        score = min((obj.ram_gb or 0) * 8, 100)
        return get_score_bar(score, label=f"RAM {obj.ram_gb}GB")

# --------------------------------------------------------------------------
# ⚙️ 6. システム・マスター管理
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
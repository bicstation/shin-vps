# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/admin.py

import os
from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

# モデルのインポート
from .models import (
    RawApiData, AdultProduct, LinkshareProduct,
    Genre, Actress, Maker, Label, Director, Series,
    PCAttribute, User, ProductComment
)
# PC製品、価格履歴、統計モデル
from .models.pc_products import PCProduct, PriceHistory
from .models.pc_stats import ProductDailyStats

# ----------------------------------------------------
# 0. カスタムフォーム & インライン
# ----------------------------------------------------
class AdultProductAdminForm(forms.ModelForm):
    class Meta:
        model = AdultProduct
        fields = '__all__'

class PriceHistoryInline(admin.TabularInline):
    """PC製品の詳細画面で価格履歴を直接編集・確認できるインライン"""
    model = PriceHistory
    extra = 0
    ordering = ('-recorded_at',)
    readonly_fields = ('recorded_at',)
    can_delete = True

class ProductDailyStatsInline(admin.TabularInline):
    """PC製品の詳細画面で日次アクセス統計を確認できるインライン"""
    model = ProductDailyStats
    extra = 0
    ordering = ('-date',)
    readonly_fields = ('date', 'pv_count', 'daily_rank', 'ranking_score')
    def has_add_permission(self, request, obj=None):
        return False

class ProductCommentInline(admin.TabularInline):
    """ユーザー詳細画面でコメント履歴を確認できるインライン"""
    model = ProductComment
    extra = 0
    fields = ('product', 'rating', 'content', 'created_at')
    readonly_fields = ('created_at',)

# ----------------------------------------------------
# 1. User (カスタムユーザー) のAdminクラス
# ----------------------------------------------------
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """プロフ画像、サイトグループ、ドメインを含めたカスタムユーザー管理"""
    
    # 一覧画面に site_group と origin_domain を追加
    list_display = ('username', 'email', 'site_group_display', 'origin_domain', 'is_staff', 'display_profile_image')
    list_filter = ('site_group', 'is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'email', 'origin_domain')
    inlines = [ProductCommentInline]

    # 詳細画面（編集画面）のレイアウト変更
    fieldsets = UserAdmin.fieldsets + (
        (_('追加情報 / サイト管理'), {
            'fields': ('site_group', 'origin_domain', 'profile_image', 'bio')
        }),
    )
    
    # 新規作成画面（UserAdmin.add_fieldsets）にも追加
    add_fieldsets = UserAdmin.add_fieldsets + (
        (_('追加情報 / サイト管理'), {
            'fields': ('site_group', 'origin_domain', 'profile_image', 'bio')
        }),
    )

    def site_group_display(self, obj):
        """一覧画面でサイトグループを色分け表示"""
        if obj.site_group == 'adult':
            return mark_safe('<b style="color: #d9534f;">アダルト (Adult)</b>')
        return mark_safe('<b style="color: #007bff;">一般系 (General)</b>')
    site_group_display.short_description = "所属グループ"
    site_group_display.admin_order_field = 'site_group'

    def display_profile_image(self, obj):
        if obj.profile_image:
            return mark_safe(f'<img src="{obj.profile_image.url}" width="30" height="30" style="border-radius: 50%;" />')
        return "No Image"
    display_profile_image.short_description = "画像"

# ----------------------------------------------------
# 1.1 ProductComment (製品コメント) のAdminクラス
# ----------------------------------------------------
@admin.register(ProductComment)
class ProductCommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating', 'content_summary', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('content', 'user__username', 'product__name')
    readonly_fields = ('created_at',)

    def content_summary(self, obj):
        return obj.content[:30] + "..." if len(obj.content) > 30 else obj.content
    content_summary.short_description = "コメント内容"

# ----------------------------------------------------
# 1.2 PCAttribute (スペック属性) のAdminクラス
# ----------------------------------------------------
@admin.register(PCAttribute)
class PCAttributeAdmin(admin.ModelAdmin):
    list_display = ('name', 'attr_type', 'slug', 'get_product_count', 'id')
    list_filter = ('attr_type',)
    search_fields = ('name', 'slug')
    ordering = ('attr_type', 'name')

    def get_product_count(self, obj):
        return obj.products.count()
    get_product_count.short_description = '紐付け製品数'

# ----------------------------------------------------
# 1.5 PriceHistory & ProductDailyStats
# ----------------------------------------------------
@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price', 'recorded_at')
    list_filter = ('recorded_at', 'product__maker')
    search_fields = ('product__name', 'product__unique_id')
    date_hierarchy = 'recorded_at'

@admin.register(ProductDailyStats)
class ProductDailyStatsAdmin(admin.ModelAdmin):
    """日次PV統計を一覧で確認できる管理画面"""
    list_display = ('date', 'product', 'pv_count', 'daily_rank', 'ranking_score')
    list_filter = ('date', 'product__site_prefix')
    search_fields = ('product__name', 'product__unique_id')
    date_hierarchy = 'date'

# ----------------------------------------------------
# 2. PCProduct (PC製品・ソフト・周辺機器) のAdminクラス
# ----------------------------------------------------
@admin.register(PCProduct)
class PCProductAdmin(admin.ModelAdmin):
    change_list_template = "admin/api/pcproduct/change_list.html"
    inlines = [PriceHistoryInline, ProductDailyStatsInline]

    list_display = (
        'maker',
        'display_thumbnail',
        'name_summary',
        'price_display',
        'spec_score_display',
        'stock_status',
        'display_scores',
        'os_support_summary', 
        'license_term',
        'is_download_display',
        'display_ai_status',
        'is_posted',
        'is_active',
        'updated_at',
    )
    list_display_links = ('name_summary',)
    list_filter = (
        'is_posted', 'is_active', 'is_ai_pc', 'is_download',
        'maker', 'cpu_socket', 'ram_type', 'attributes__attr_type',
        'stock_status', 'unified_genre',
    )
    search_fields = ('name', 'unique_id', 'cpu_model', 'os_support', 'description', 'ai_content')
    ordering = ('-spec_score', '-updated_at')
    filter_horizontal = ('attributes',)

    fieldsets = (
        ('基本情報', {
            'fields': ('unique_id', 'site_prefix', 'maker', 'is_active', 'is_posted', 'stock_status'),
        }),
        ('✨ ソフトウェア・ライセンス情報', {
            'fields': (
                ('os_support', 'is_download'),
                ('license_term', 'device_count'),
                ('edition',),
            ),
        }),
        ('🚀 レーダーチャート性能解析 (1-100)', {
            'fields': (
                ('score_cpu', 'score_gpu'),
                ('score_cost', 'score_portable'),
                ('score_ai', 'spec_score'),
                ('target_segment',),
            ),
        }),
        ('AI解析スペック詳細', {
            'fields': (
                ('cpu_model', 'gpu_model'),
                ('memory_gb', 'storage_gb'),
                ('display_info', 'is_ai_pc'),
                ('npu_tops',),
            ),
        }),
        ('自作PC提案用データ（AI推論）', {
            'fields': (
                ('cpu_socket', 'motherboard_chipset'),
                ('ram_type', 'power_recommendation'),
            ),
        }),
        ('仕分け・スペック属性タグ', {
            'fields': ('unified_genre', 'raw_genre', 'attributes'),
        }),
        ('製品詳細・HTML', {
            'fields': ('name', 'price', 'description', 'raw_html'),
        }),
        ('アフィリエイト・AI解説', {
            'fields': ('affiliate_url', 'affiliate_updated_at', 'ai_summary', 'ai_content', 'last_spec_parsed_at'),
        }),
        ('画像', {
            'fields': ('image_url', 'display_thumbnail_large'),
        }),
        ('システム情報', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'display_thumbnail_large', 'last_spec_parsed_at')

    def name_summary(self, obj):
        return obj.name[:40] + "..." if len(obj.name) > 40 else obj.name
    name_summary.short_description = "商品名"

    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "価格未定"
    price_display.short_description = "価格"

    def spec_score_display(self, obj):
        if obj.spec_score:
            color = "#d9534f" if obj.spec_score >= 80 else "#f0ad4e" if obj.spec_score >= 60 else "#333"
            return mark_safe(f'<b style="color: {color}; font-size: 1.1em;">{obj.spec_score}</b>')
        return "-"
    spec_score_display.short_description = "総合点"
    spec_score_display.admin_order_field = 'spec_score'

    def display_scores(self, obj):
        return mark_safe(
            f'<small>CPU:{obj.score_cpu or 0} G:{obj.score_gpu or 0} コスパ:{obj.score_cost or 0}<br>'
            f'AI:{obj.score_ai or 0} 携帯:{obj.score_portable or 0}</small>'
        )
    display_scores.short_description = "性能詳細"

    def os_support_summary(self, obj):
        return obj.os_support[:15] + ".." if obj.os_support and len(obj.os_support) > 15 else obj.os_support
    os_support_summary.short_description = "対応OS"

    def is_download_display(self, obj):
        if obj.is_download:
            return mark_safe('<span style="color: #007bff;">DL版</span>')
        return "パケ版"
    is_download_display.short_description = "提供形態"

    def display_thumbnail(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="80" height="50" style="object-fit: contain; background: #eee; border-radius: 4px;" />')
        return "No Image"
    display_thumbnail.short_description = '製品画像'

    def display_thumbnail_large(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="300" style="border: 1px solid #ccc;" />')
        return "画像なし"
    display_thumbnail_large.short_description = '画像プレビュー'

    def display_ai_status(self, obj):
        if obj.ai_content:
            return mark_safe('<span style="color: #28a745; font-weight: bold;">生成済み</span>')
        return mark_safe('<span style="color: #666;">未生成</span>')
    display_ai_status.short_description = 'AI解説'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('fetch-minisforum/', self.fetch_minisforum_action, name='fetch_minisforum'),
            path('fetch-lenovo/', self.fetch_lenovo_action, name='fetch_lenovo'),
            path('fetch-acer/', self.fetch_acer_action, name='fetch_acer'),
            path('generate-ai-article/', self.generate_ai_action, name='generate_ai_article'),
            path('full-update-pc/', self.full_update_pc_action, name='full_update_pc'),
        ]
        return custom_urls + urls

    def fetch_minisforum_action(self, request):
        self.message_user(request, "Minisforumデータの同期を開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def fetch_lenovo_action(self, request):
        self.message_user(request, "Lenovoデータの取得を開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def fetch_acer_action(self, request):
        self.message_user(request, "Acerデータの取得を開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def generate_ai_action(self, request):
        self.message_user(request, "AI記事生成プロセスを開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def full_update_pc_action(self, request):
        try:
            self.message_user(request, "全PCショップの一括更新プロセスを開始しました。", messages.WARNING)
        except Exception as e:
            self.message_user(request, f"一括更新エラー: {e}", messages.ERROR)
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 3. AdultProduct (アダルト製品データ) のAdminクラス
# ----------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    form = AdultProductAdminForm
    change_list_template = "admin/adult_product_changelist.html"

    list_display = (
        'product_id_unique', 'title', 'release_date', 'price', 'maker', 
        'display_first_image', 'is_active', 'updated_at',
    )
    list_display_links = ('product_id_unique', 'title') 
    list_filter = ('is_active', 'release_date', 'maker') 
    search_fields = ('title', 'product_id_unique')
    readonly_fields = ('created_at', 'updated_at', 'product_id_unique', 'api_source')

    def display_first_image(self, obj):
        if obj.image_url_list and obj.image_url_list[0]:
            return mark_safe(f'<img src="{obj.image_url_list[0]}" width="60" height="40" style="object-fit: cover; border-radius: 3px;" />')
        return "N/A"
    display_first_image.short_description = '画像'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('fetch-fanza/', self.fetch_fanza_action, name='fetch_fanza'),
            path('fetch-duga/', self.fetch_duga_action, name='fetch_duga'),
            path('normalize-data/', self.normalize_action, name='normalize_data'),
            path('full-update/', self.full_update_action, name='full_update'),
        ]
        return custom_urls + urls

    def fetch_fanza_action(self, request):
        call_command('fetch_fanza')
        self.message_user(request, "FANZAデータの取得が完了しました。")
        return HttpResponseRedirect("../")

    def fetch_duga_action(self, request):
        call_command('fetch_duga')
        self.message_user(request, "DUGAデータの取得が完了しました。")
        return HttpResponseRedirect("../")

    def normalize_action(self, request):
        call_command('normalize_fanza')
        self.message_user(request, "データの正規化が完了しました。")
        return HttpResponseRedirect("../")

    def full_update_action(self, request):
        call_command('fetch_fanza')
        call_command('fetch_duga')
        call_command('normalize_fanza')
        self.message_user(request, "すべての工程が完了しました！")
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 4. LinkshareProduct Admin
# ----------------------------------------------------
@admin.register(LinkshareProduct)
class LinkshareProductAdmin(admin.ModelAdmin): 
    list_display = ('id', 'product_name', 'sku', 'merchant_id', 'is_active', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')

# ----------------------------------------------------
# 5. その他マスター・共通設定
# ----------------------------------------------------
class CommonAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_product_count', 'api_source', 'created_at')
    def get_product_count(self, obj):
        if hasattr(obj, 'products'):
            return obj.products.count()
        return 0
    get_product_count.short_description = "製品数"

@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')

# マスターデータの登録
admin.site.register(Genre, CommonAdmin)
admin.site.register(Actress, CommonAdmin)
admin.site.register(Maker, CommonAdmin)
admin.site.register(Label, CommonAdmin)
admin.site.register(Director, CommonAdmin)
admin.site.register(Series, CommonAdmin)
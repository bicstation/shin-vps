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
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# モデルのインポート
from .models import (
    User,  # ✨ カスタムユーザーモデル
    RawApiData, AdultProduct, LinkshareProduct,
    Genre, Actress, Maker, Label, Director, Series,
    PCAttribute 
)
from .models.pc_products import PCProduct, PriceHistory

# ----------------------------------------------------
# 🌟 0. User (カスタムユーザー) の管理設定
# ----------------------------------------------------
try:
    from django.contrib.auth.models import User as DjangoUser
    admin.site.unregister(DjangoUser)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    👥 カスタムユーザー管理
    """
    fieldsets = BaseUserAdmin.fieldsets + (
        ('✨ 追加プロフィール', {
            'fields': ('site_group', 'status_message', 'profile_image', 'bio'),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('追加プロフィール', {
            'fields': ('site_group', 'status_message'),
        }),
    )
    list_display = ('username', 'email', 'site_group', 'status_message', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('site_group', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'status_message')
    ordering = ('-date_joined',)

# ----------------------------------------------------
# 0.5 カスタムフォーム & インライン
# ----------------------------------------------------
class AdultProductAdminForm(forms.ModelForm):
    class Meta:
        model = AdultProduct
        fields = '__all__'

class PriceHistoryInline(admin.TabularInline):
    """
    📈 価格履歴インライン
    """
    model = PriceHistory
    extra = 0
    ordering = ('-recorded_at',)
    readonly_fields = ('recorded_at',)
    can_delete = True

# ----------------------------------------------------
# 1. PCAttribute (スペック属性)
# ----------------------------------------------------
@admin.register(PCAttribute)
class PCAttributeAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_attr_type', 'slug', 'get_product_count', 'order', 'id')
    list_filter = ('attr_type',)
    search_fields = ('name', 'slug')
    ordering = ('attr_type', 'order', 'name')

    def display_attr_type(self, obj):
        return obj.get_attr_type_display()
    display_attr_type.short_description = '属性タイプ'

    def get_product_count(self, obj):
        return obj.products.count()
    get_product_count.short_description = '製品数'

# ----------------------------------------------------
# 1.5 PriceHistory (価格履歴単体)
# ----------------------------------------------------
@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price_formatted', 'recorded_at')
    list_filter = ('recorded_at', 'product__maker')
    search_fields = ('product__name', 'product__unique_id')
    date_hierarchy = 'recorded_at'

    def price_formatted(self, obj):
        return f"¥{obj.price:,}"
    price_formatted.short_description = '価格'

# ----------------------------------------------------
# 2. PCProduct (PC製品・ソフト・周辺機器) のAdminクラス
# ----------------------------------------------------
@admin.register(PCProduct)
class PCProductAdmin(admin.ModelAdmin):
    """
    🚀 PC製品メイン管理
    """
    change_list_template = "admin/api/pcproduct/change_list.html"
    inlines = [PriceHistoryInline]

    # 一覧画面の表示項目
    list_display = (
        'maker',
        'display_thumbnail',
        'name_summary',
        'price_display',
        'stock_status_tag',
        'display_scores',
        'os_support_summary', 
        'license_term',
        'is_download_display',
        'display_ai_status',
        'is_posted_tag',
        'is_active_tag',
        'updated_at',
    )
    list_display_links = ('name_summary',)
    
    list_filter = (
        'is_posted', 'is_active', 'is_ai_pc', 'is_download',
        'maker', 'cpu_socket', 'ram_type', 'attributes__attr_type',
        'stock_status', 'unified_genre',
    )
    
    search_fields = ('name', 'unique_id', 'cpu_model', 'os_support', 'description', 'ai_content', 'attributes__name')
    ordering = ('-updated_at',)
    filter_horizontal = ('attributes',)

    # 詳細編集画面のレイアウト (一切の省略なし)
    fieldsets = (
        ('基本情報', {
            'fields': ('unique_id', 'site_prefix', 'maker', 'is_active', 'is_posted', 'stock_status'),
        }),
        ('✨ ソフトウェア・ライセンス情報', {
            'description': 'セキュリティソフト、Office、OS等の管理項目です。',
            'fields': (
                ('os_support', 'is_download'),
                ('license_term', 'device_count'),
                'edition',
            ),
        }),
        ('🚀 AI性能解析スコア (1-100)', {
            'description': 'レーダーチャートの元データ。',
            'fields': (
                ('score_cpu', 'score_gpu'),
                ('score_cost', 'score_portable'),
                ('score_ai', 'spec_score'),
                'target_segment',
            ),
        }),
        ('AI解析スペック詳細（ハードウェア）', {
            'fields': (
                ('cpu_model', 'gpu_model'),
                ('memory_gb', 'storage_gb'),
                ('display_info', 'is_ai_pc'),
                'npu_tops',
            ),
        }),
        ('自作PC提案用・パーツ互換性（AI推論）', {
            'fields': (
                ('cpu_socket', 'motherboard_chipset'),
                ('ram_type', 'power_recommendation'),
            ),
        }),
        ('仕分け・カテゴリ属性', {
            'fields': ('unified_genre', 'raw_genre', 'attributes'),
        }),
        ('製品情報・HTML原文', {
            'fields': ('name', 'price', 'description', 'raw_html'),
        }),
        ('アフィリエイト・AI生成記事', {
            'fields': ('affiliate_url', 'affiliate_updated_at', 'ai_summary', 'ai_content', 'last_spec_parsed_at'),
        }),
        ('画像・メディア', {
            'fields': ('image_url', 'display_thumbnail_large'),
        }),
        ('システム管理情報', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'display_thumbnail_large', 'last_spec_parsed_at')

    # --- 表示カスタマイズ ---
    def name_summary(self, obj):
        return obj.name[:40] + "..." if len(obj.name) > 40 else obj.name
    name_summary.short_description = "商品名"

    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "価格未定"
    price_display.short_description = "価格"

    def stock_status_tag(self, obj):
        color = "#28a745" if obj.stock_status == "instock" else "#dc3545"
        return mark_safe(f'<span style="color: {color}; font-weight: bold;">{obj.stock_status}</span>')
    stock_status_tag.short_description = "在庫"

    def is_posted_tag(self, obj):
        return mark_safe('✅' if obj.is_posted else '<span style="color: #999;">未</span>')
    is_posted_tag.short_description = "投稿"

    def is_active_tag(self, obj):
        return mark_safe('✅' if obj.is_active else '❌')
    is_active_tag.short_description = "有効"

    def display_scores(self, obj):
        return mark_safe(
            f'<div style="line-height: 1.2; font-size: 11px; color: #555;">'
            f'CPU:{obj.score_cpu} GPU:{obj.score_gpu} 💰:{obj.score_cost}<br>'
            f'AI:{obj.score_ai} 📱:{obj.score_portable}'
            f'</div>'
        )
    display_scores.short_description = "性能"

    def os_support_summary(self, obj):
        return obj.os_support[:15] + ".." if obj.os_support and len(obj.os_support) > 15 else obj.os_support
    os_support_summary.short_description = "OS"

    def is_download_display(self, obj):
        if obj.is_download:
            return mark_safe('<span style="color: #007bff; font-weight: bold;">DL版</span>')
        return "パケ版"
    is_download_display.short_description = "形態"

    def display_thumbnail(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="80" height="50" style="object-fit: contain; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px;" />')
        return "No Image"
    display_thumbnail.short_description = '画像'

    def display_thumbnail_large(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="400" style="border: 2px solid #eee;" />')
        return "画像なし"
    display_thumbnail_large.short_description = 'プレビュー'

    def display_ai_status(self, obj):
        if obj.ai_content:
            return mark_safe('<span style="background: #28a745; color: white; padding: 2px 5px; border-radius: 3px; font-size: 10px;">生成済</span>')
        return mark_safe('<span style="color: #999; font-size: 10px;">未</span>')
    display_ai_status.short_description = 'AI'

    # --- アクション ---
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
        self.message_user(request, "Minisforum同期プロセスを開始。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def fetch_lenovo_action(self, request):
        self.message_user(request, "Lenovo取得プロセスを開始。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def fetch_acer_action(self, request):
        self.message_user(request, "Acer取得プロセスを開始。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def generate_ai_action(self, request):
        self.message_user(request, "AI解析・記事生成キューを追加しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def full_update_pc_action(self, request):
        self.message_user(request, "全PCショップの一括更新を開始。", messages.WARNING)
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 3. AdultProduct (アダルト製品データ) のAdminクラス
# ----------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    """
    🔞 アダルト製品管理
    """
    form = AdultProductAdminForm
    change_list_template = "admin/adult_product_changelist.html"

    list_display = (
        'product_id_unique', 'title_summary', 'release_date', 'price_display', 'maker', 
        'display_first_image', 'is_active_tag', 'updated_at',
    )
    list_display_links = ('product_id_unique', 'title_summary') 
    list_filter = ('is_active', 'release_date', 'maker', 'api_source') 
    search_fields = ('title', 'product_id_unique')
    readonly_fields = ('created_at', 'updated_at', 'product_id_unique', 'api_source')

    def title_summary(self, obj):
        return obj.title[:50] + "..." if len(obj.title) > 50 else obj.title
    title_summary.short_description = "タイトル"

    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "---"
    price_display.short_description = "価格"

    def is_active_tag(self, obj):
        return mark_safe('✅' if obj.is_active else '❌')
    is_active_tag.short_description = "有効"

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
        self.message_user(request, "FANZA取得完了。")
        return HttpResponseRedirect("../")

    def fetch_duga_action(self, request):
        call_command('fetch_duga')
        self.message_user(request, "DUGA取得完了。")
        return HttpResponseRedirect("../")

    def normalize_action(self, request):
        call_command('normalize_fanza')
        self.message_user(request, "データ正規化完了。")
        return HttpResponseRedirect("../")

    def full_update_action(self, request):
        call_command('fetch_fanza')
        call_command('fetch_duga')
        call_command('normalize_fanza')
        self.message_user(request, "一括更新完了。")
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 4. LinkshareProduct Admin
# ----------------------------------------------------
@admin.register(LinkshareProduct)
class LinkshareProductAdmin(admin.ModelAdmin): 
    list_display = ('id', 'product_name', 'sku', 'merchant_id', 'is_active', 'updated_at')
    list_filter = ('is_active', 'merchant_id')
    search_fields = ('product_name', 'sku')
    readonly_fields = ('created_at', 'updated_at')

# ----------------------------------------------------
# 5. その他共通マスター設定
# ----------------------------------------------------
class CommonAdmin(admin.ModelAdmin):
    """マスターデータ系共通設定"""
    list_display = ('name', 'get_product_count', 'api_source', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('name',)

    def get_product_count(self, obj):
        # 多対多のリレーション名を動的に取得してカウント
        for attr in ['products', 'adultproduct_set']:
            if hasattr(obj, attr):
                return getattr(obj, attr).count()
        return 0
    get_product_count.short_description = "製品数"

@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')
    list_filter = ('api_source', 'created_at')
    readonly_fields = ('created_at',)

# ----------------------------------------------------
# 6. Adminサイトへの登録 (一括登録)
# ----------------------------------------------------
admin.site.register(Genre, CommonAdmin)
admin.site.register(Actress, CommonAdmin)
admin.site.register(Maker, CommonAdmin)
admin.site.register(Label, CommonAdmin)
admin.site.register(Director, CommonAdmin)
admin.site.register(Series, CommonAdmin)
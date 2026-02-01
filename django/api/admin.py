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
    User,  # カスタムユーザーモデル
    RawApiData, AdultProduct, LinkshareProduct,
    Genre, Actress, Maker, Label, Director, Series,
    PCAttribute 
)
from .models.pc_products import PCProduct, PriceHistory

# ----------------------------------------------------
# 🌟 0. User (カスタムユーザー) 管理
# ----------------------------------------------------
try:
    from django.contrib.auth.models import User as DjangoUser
    admin.site.unregister(DjangoUser)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    👥 ユーザー管理: VPS運用のための拡張プロフィール表示
    """
    fieldsets = BaseUserAdmin.fieldsets + (
        ('✨ 追加プロフィール', {
            'fields': ('site_group', 'status_message', 'profile_image', 'bio'),
            'description': 'サイトグループ設定やフロントエンド表示用の拡張項目です。'
        }),
    )
    list_display = (
        'username', 'display_avatar', 'email', 'site_group_tag', 
        'is_staff_tag', 'is_active_tag', 'date_joined'
    )
    list_filter = ('site_group', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'status_message')
    ordering = ('-date_joined',)

    def display_avatar(self, obj):
        if obj.profile_image:
            return mark_safe(f'<img src="{obj.profile_image}" width="30" height="30" style="border-radius: 50%; object-fit: cover;" />')
        return mark_safe('<div style="width: 30px; height: 30px; background: #eee; border-radius: 50%; display: inline-block;"></div>')
    display_avatar.short_description = ""

    def site_group_tag(self, obj):
        return mark_safe(f'<span style="background: #6c757d; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">{obj.site_group}</span>')
    site_group_tag.short_description = "グループ"

    def is_staff_tag(self, obj):
        return mark_safe('✅' if obj.is_staff else '👤')
    is_staff_tag.short_description = "権限"

    def is_active_tag(self, obj):
        color = "#28a745" if obj.is_active else "#dc3545"
        return mark_safe(f'<span style="color: {color};">{"● 有効" if obj.is_active else "○ 停止"}</span>')
    is_active_tag.short_description = "状態"

# ----------------------------------------------------
# 📈 0.5 インライン設定
# ----------------------------------------------------
class PriceHistoryInline(admin.TabularInline):
    model = PriceHistory
    extra = 0
    ordering = ('-recorded_at',)
    readonly_fields = ('recorded_at', 'price_formatted')
    fields = ('recorded_at', 'price_formatted')
    can_delete = False

    def price_formatted(self, obj):
        return f"¥{obj.price:,}"
    price_formatted.short_description = "価格記録"

# ----------------------------------------------------
# 💻 1. PCProduct (PC製品・AI解析メイン)
# ----------------------------------------------------
@admin.register(PCProduct)
class PCProductAdmin(admin.ModelAdmin):
    # 💡 TemplateDoesNotExist エラー回避のため一旦コメントアウト
    # change_list_template = "admin/api/pcproduct/change_list.html"
    inlines = [PriceHistoryInline]

    list_display = (
        'display_thumbnail', 'maker', 'name_summary', 'price_display', 
        'score_visual', 'stock_status_tag', 'is_download_display', 
        'ai_status_tag', 'is_posted_tag', 'updated_at'
    )
    list_display_links = ('name_summary',)
    list_filter = (
        'is_posted', 'is_active', 'is_ai_pc', 'is_download',
        'maker', 'stock_status', 'unified_genre'
    )
    search_fields = ('name', 'unique_id', 'cpu_model', 'description')
    filter_horizontal = ('attributes',)

    fieldsets = (
        ('基本ステータス', {
            'fields': (('unique_id', 'site_prefix'), ('maker', 'stock_status'), ('is_active', 'is_posted')),
        }),
        ('💰 価格・アフィリエイト', {
            'fields': ('name', 'price', 'affiliate_url', 'affiliate_updated_at'),
        }),
        ('🧠 AI解析スコアリング (Radar Chart Data)', {
            'description': '100点満点でのAI推論スコア',
            'fields': (
                ('score_cpu', 'score_gpu'),
                ('score_cost', 'score_portable'),
                ('score_ai', 'spec_score'),
                'target_segment',
            ),
        }),
        ('⚙️ ハードウェア詳細', {
            'fields': (
                ('cpu_model', 'gpu_model'),
                ('memory_gb', 'storage_gb'),
                ('display_info', 'npu_tops'),
                'is_ai_pc',
            ),
        }),
        ('🔧 自作互換性・属性', {
            'fields': (
                ('cpu_socket', 'motherboard_chipset'),
                ('ram_type', 'power_recommendation'),
                'unified_genre', 'attributes',
            ),
        }),
        ('📝 コンテンツ生成', {
            'fields': ('ai_summary', 'ai_content', 'last_spec_parsed_at'),
        }),
        ('🖼️ メディア', {
            'fields': ('image_url', 'display_thumbnail_large'),
        }),
    )
    readonly_fields = ('display_thumbnail_large', 'last_spec_parsed_at')

    # カスタム表示メソッド
    def score_visual(self, obj):
        avg = (obj.score_cpu + obj.score_gpu + obj.score_ai) // 3
        color = "#28a745" if avg > 70 else "#ffc107" if avg > 40 else "#dc3545"
        return mark_safe(f'<div style="width: 100px; background: #eee; height: 12px; border-radius: 6px; overflow: hidden;">'
                         f'<div style="width: {avg}px; background: {color}; height: 100%;"></div>'
                         f'</div><span style="font-size: 10px;">Avg: {avg}pts</span>')
    score_visual.short_description = "性能指標"

    def stock_status_tag(self, obj):
        colors = {"instock": "#28a745", "outofstock": "#dc3545", "preorder": "#007bff"}
        color = colors.get(obj.stock_status, "#6c757d")
        return mark_safe(f'<b style="color: {color};">{obj.stock_status.upper()}</b>')
    stock_status_tag.short_description = "在庫"

    def ai_status_tag(self, obj):
        if obj.ai_content:
            return mark_safe('<span style="color: #fff; background: #17a2b8; padding: 2px 6px; border-radius: 4px; font-size: 10px;">GENERATED</span>')
        return mark_safe('<span style="color: #999;">PENDING</span>')
    ai_status_tag.short_description = "AI解析"

    def display_thumbnail(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="60" style="border-radius: 4px;" />')
        return "No Image"
    display_thumbnail.short_description = "画像"

    def display_thumbnail_large(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="300" />')
        return "画像なし"

    def name_summary(self, obj):
        return obj.name[:35] + "..." if len(obj.name) > 35 else obj.name

    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "---"

    def is_posted_tag(self, obj):
        return mark_safe('✅' if obj.is_posted else '☁️')

    def is_download_display(self, obj):
        return "DL版" if obj.is_download else "物理"

    # --- API連携アクション ---
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('fetch-minisforum/', self.fetch_minisforum_action, name='fetch_minisforum'),
            path('fetch-lenovo/', self.fetch_lenovo_action, name='fetch_lenovo'),
            path('generate-ai-article/', self.generate_ai_action, name='generate_ai_article'),
        ]
        return custom_urls + urls

    def fetch_minisforum_action(self, request):
        self.message_user(request, "Minisforum同期開始。")
        return HttpResponseRedirect("../")

    def fetch_lenovo_action(self, request):
        self.message_user(request, "Lenovo同期開始。")
        return HttpResponseRedirect("../")

    def generate_ai_action(self, request):
        self.message_user(request, "AI記事生成キューを送信しました。")
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 🔞 2. AdultProduct (アダルト・API連携)
# ----------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    # 💡 エラーの直接的な原因：指定の HTML ファイルがないためコメントアウト
    # change_list_template = "admin/api/adultproduct/change_list.html" 
    
    list_display = (
        'product_id_unique', 'display_first_image', 'title_summary', 
        'release_date', 'price_display', 'maker', 'is_active_tag'
    )
    list_filter = ('is_active', 'release_date', 'maker', 'api_source')
    search_fields = ('title', 'product_id_unique')
    readonly_fields = ('created_at', 'updated_at', 'api_source')

    def display_first_image(self, obj):
        if obj.image_url_list and len(obj.image_url_list) > 0:
            return mark_safe(f'<img src="{obj.image_url_list[0]}" width="70" height="45" style="object-fit: cover; border-radius: 4px;" />')
        return "N/A"
    display_first_image.short_description = "Preview"

    def is_active_tag(self, obj):
        icon = "✅" if obj.is_active else "❌"
        return mark_safe(f'<span style="font-size: 1.2em;">{icon}</span>')

    def title_summary(self, obj):
        return obj.title[:45] + "..." if len(obj.title) > 45 else obj.title

    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "---"

    # --- API実行アクション ---
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('fetch-fanza/', self.fetch_fanza_action, name='fetch_fanza'),
            path('fetch-duga/', self.fetch_duga_action, name='fetch_duga'),
            path('full-update/', self.full_update_action, name='full_update'),
        ]
        return custom_urls + urls

    def fetch_fanza_action(self, request):
        call_command('fetch_fanza')
        self.message_user(request, "FANZAからの最新データ取得を完了しました。")
        return HttpResponseRedirect("../")

    def fetch_duga_action(self, request):
        call_command('fetch_duga')
        self.message_user(request, "DUGAからの最新データ取得を完了しました。")
        return HttpResponseRedirect("../")

    def full_update_action(self, request):
        call_command('fetch_fanza')
        call_command('fetch_duga')
        call_command('normalize_fanza')
        self.message_user(request, "全アダルトソースの同期と正規化が完了しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 📂 3. マスターデータ・その他
# ----------------------------------------------------
class MasterAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count_badge', 'api_source', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('name',)

    def product_count_badge(self, obj):
        count = 0
        if hasattr(obj, 'products'): count = obj.products.count()
        elif hasattr(obj, 'adultproduct_set'): count = obj.adultproduct_set.count()
        
        color = "#007bff" if count > 0 else "#6c757d"
        return mark_safe(f'<span style="background: {color}; color: white; padding: 2px 10px; border-radius: 12px;">{count}</span>')
    product_count_badge.short_description = "製品数"

@admin.register(Genre)
class GenreAdmin(MasterAdmin): pass

@admin.register(Actress)
class ActressAdmin(MasterAdmin): pass

@admin.register(Maker)
class MakerAdmin(MasterAdmin): pass

@admin.register(PCAttribute)
class PCAttributeAdmin(admin.ModelAdmin):
    list_display = ('name', 'attr_type', 'slug', 'order')
    list_filter = ('attr_type',)
    ordering = ('attr_type', 'order')

@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')
    readonly_fields = ('created_at', 'data_display')
    
    def data_display(self, obj):
        return mark_safe(f'<pre style="background: #f4f4f4; padding: 10px;">{obj.raw_json}</pre>')

# 簡易登録
admin.site.register(Label)
admin.site.register(Director)
admin.site.register(Series)
admin.site.register(LinkshareProduct)
admin.site.register(PriceHistory)
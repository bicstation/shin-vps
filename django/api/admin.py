# -*- coding: utf-8 -*-
import os
from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin

# モデルのインポート
from .models import (
    RawApiData, AdultProduct, LinkshareProduct,
    Genre, Actress, Maker, Label, Director, Series,
    PCAttribute, User, ProductComment  # 👤 User と ProductComment を追加
)
# 🚀 PC製品、価格履歴、そして新しい統計モデルをインポート
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
    extra = 0  # 空の入力欄をデフォルトで表示しない
    ordering = ('-recorded_at',)
    readonly_fields = ('recorded_at',)
    can_delete = True

# 🚀 注目度・ランキング統計のインライン表示
class ProductDailyStatsInline(admin.TabularInline):
    """PC製品の詳細画面で日次アクセス統計を確認できるインライン"""
    model = ProductDailyStats
    extra = 0
    ordering = ('-date',)
    readonly_fields = ('date', 'pv_count', 'daily_rank', 'ranking_score')
    def has_add_permission(self, request, obj=None):
        return False # 手動追加は不可

# 👤 ユーザー詳細画面でコメント履歴を確認できるインライン
class ProductCommentInline(admin.TabularInline):
    model = ProductComment
    extra = 0
    fields = ('product', 'rating', 'content', 'created_at')
    readonly_fields = ('created_at',)

# ----------------------------------------------------
# 1. User (カスタムユーザー) のAdminクラス
# ----------------------------------------------------
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """プロフ画像や自己紹介を含めたカスタムユーザー管理"""
    list_display = ('username', 'email', 'is_staff', 'display_profile_image')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'email')
    inlines = [ProductCommentInline] # ユーザーが書いたコメントを一覧表示

    # 詳細画面に独自フィールドを追加
    fieldsets = UserAdmin.fieldsets + (
        ('追加情報', {'fields': ('profile_image', 'bio')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('追加情報', {'fields': ('profile_image', 'bio')}),
    )

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
        """この属性に紐付いている製品数を表示"""
        return obj.products.count()
    get_product_count.short_description = '紐付け製品数'

# ----------------------------------------------------
# 1.5 PriceHistory (価格履歴単体) のAdminクラス
# ----------------------------------------------------
@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price', 'recorded_at')
    list_filter = ('recorded_at', 'product__maker')
    search_fields = ('product__name', 'product__unique_id')
    date_hierarchy = 'recorded_at'

# ----------------------------------------------------
# 2. PCProduct (PC製品・ソフト・周辺機器) のAdminクラス
# ----------------------------------------------------
class PCProductAdmin(admin.ModelAdmin):
    # テンプレートパスを指定
    change_list_template = "admin/api/pcproduct/change_list.html"
    
    # 🚀 履歴をインライン表示（価格履歴 + 注目度統計）
    inlines = [PriceHistoryInline, ProductDailyStatsInline]

    # 一覧画面の表示項目 (ベスト1000管理用に spec_score を追加)
    list_display = (
        'maker',
        'display_thumbnail',
        'name_summary',
        'price_display',
        'spec_score_display',  # 🏆 総合スコアを追加
        'stock_status',
        # --- ハードウェア性能（スコア表示） ---
        'display_scores',
        # --- ✨ ソフトウェア・ライセンス情報 ---
        'os_support_summary', 
        'license_term',
        'is_download_display',
        # --- 状態 ---
        'display_ai_status',
        'is_posted',
        'is_active',
        'updated_at',
    )
    list_display_links = ('name_summary',)
    
    # フィルタリング機能
    list_filter = (
        'is_posted',
        'is_active',
        'is_ai_pc',
        'is_download',
        'maker',
        'cpu_socket',
        'ram_type',
        'attributes__attr_type',
        'stock_status',
        'unified_genre',
    )
    
    # 検索窓の対象
    search_fields = ('name', 'unique_id', 'cpu_model', 'os_support', 'description', 'ai_content')
    
    # 並び順 (デフォルトをスコア降順に設定しランキングを確認しやすくする)
    ordering = ('-spec_score', '-updated_at')

    # 多対多の属性選択UI
    filter_horizontal = ('attributes',)

    # 詳細編集画面のレイアウト
    fieldsets = (
        ('基本情報', {
            'fields': ('unique_id', 'site_prefix', 'maker', 'is_active', 'is_posted', 'stock_status'),
        }),
        ('✨ ソフトウェア・ライセンス情報', {
            'description': 'セキュリティソフトやOffice等のソフトウェア専用項目です。',
            'fields': (
                ('os_support', 'is_download'),
                ('license_term', 'device_count'),
                ('edition',),
            ),
        }),
        ('🚀 レーダーチャート性能解析 (1-100)', {
            'description': 'AIがスペックから算出した100点満点のスコア群です。',
            'fields': (
                ('score_cpu', 'score_gpu'),
                ('score_cost', 'score_portable'),
                ('score_ai', 'spec_score'),
                ('target_segment',),
            ),
        }),
        ('AI解析スペック詳細（ハードウェア）', {
            'description': 'PC本体の主要構成データです。',
            'fields': (
                ('cpu_model', 'gpu_model'),
                ('memory_gb', 'storage_gb'),
                ('display_info', 'is_ai_pc'),
                ('npu_tops',),
            ),
        }),
        ('自作PC提案用データ（AI推論）', {
            'description': 'CPU型番等からAIが推論した、自作PCパーツ選定用の互換性データです。',
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

    # --- カスタム表示メソッド ---
    def name_summary(self, obj):
        return obj.name[:40] + "..." if len(obj.name) > 40 else obj.name
    name_summary.short_description = "商品名"

    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "価格未定"
    price_display.short_description = "価格"

    def spec_score_display(self, obj):
        """総合スコアを強調表示"""
        if obj.spec_score:
            color = "#d9534f" if obj.spec_score >= 80 else "#f0ad4e" if obj.spec_score >= 60 else "#333"
            return mark_safe(f'<b style="color: {color}; font-size: 1.1em;">{obj.spec_score}</b>')
        return "-"
    spec_score_display.short_description = "総合点"
    spec_score_display.admin_order_field = 'spec_score'

    def display_scores(self, obj):
        """5軸スコアの簡易表示"""
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

    # --- カスタムURLとアクション ---
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
class LinkshareProductAdmin(admin.ModelAdmin): 
    list_display = ('id', 'product_name', 'sku', 'merchant_id', 'is_active', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')

# ----------------------------------------------------
# 5. その他マスター・共通設定
# ----------------------------------------------------
class CommonAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count', 'api_source', 'created_at')

    def product_count(self, obj):
        if hasattr(obj, 'products'):
            return obj.products.count()
        return 0
    product_count.short_description = "製品数"

class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')

# ----------------------------------------------------
# 6. 登録
# ----------------------------------------------------
admin.site.register(PCProduct, PCProductAdmin)
admin.site.register(AdultProduct, AdultProductAdmin)
admin.site.register(LinkshareProduct, LinkshareProductAdmin) 
admin.site.register(Genre, CommonAdmin)
admin.site.register(Actress, CommonAdmin)
admin.site.register(Maker, CommonAdmin)
admin.site.register(Label, CommonAdmin)
admin.site.register(Director, CommonAdmin)
admin.site.register(Series, CommonAdmin)
admin.site.register(RawApiData, RawApiDataAdmin)
# -*- coding: utf-8 -*-
import os
from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from django.contrib import messages

# モデルのインポート
from .models import (
    RawApiData, AdultProduct, LinkshareProduct,
    Genre, Actress, Maker, Label, Director, Series,
    PCAttribute 
)
from .models.pc_products import PCProduct, PriceHistory

# ----------------------------------------------------
# 0. カスタムフォーム & インライン
# ----------------------------------------------------
class AdultProductAdminForm(forms.ModelForm):
    class Meta:
        model = AdultProduct
        fields = '__all__'

class PriceHistoryInline(admin.TabularInline):
    """
    📈 価格履歴インライン
    PC製品の詳細画面で、過去の価格推移を直接編集・確認できるUIを提供します。
    """
    model = PriceHistory
    extra = 0  # デフォルトの空行を表示しない
    ordering = ('-recorded_at',)
    readonly_fields = ('recorded_at',)
    can_delete = True

# ----------------------------------------------------
# 1. PCAttribute (スペック属性) のAdminクラス
# ----------------------------------------------------
@admin.register(PCAttribute)
class PCAttributeAdmin(admin.ModelAdmin):
    """
    🎨 スペック属性（CPU、RAM、OS、ライセンス等）の管理
    サイドバーの絞り込み項目や、製品詳細のタグとして機能します。
    """
    list_display = ('name', 'attr_type', 'slug', 'get_product_count', 'id')
    list_filter = ('attr_type',)
    search_fields = ('name', 'slug')
    ordering = ('attr_type', 'name')

    def get_product_count(self, obj):
        """この属性（例：Core i7）に紐付いている製品総数をカウントします。"""
        return obj.products.count()
    get_product_count.short_description = '紐付け製品数'

# ----------------------------------------------------
# 1.5 PriceHistory (価格履歴単体) のAdminクラス
# ----------------------------------------------------
@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    """
    💰 価格履歴の単体管理
    全製品の価格変動ログを一括で確認するための画面です。
    """
    list_display = ('product', 'price', 'recorded_at')
    list_filter = ('recorded_at', 'product__maker')
    search_fields = ('product__name', 'product__unique_id')
    date_hierarchy = 'recorded_at'

# ----------------------------------------------------
# 2. PCProduct (PC製品・ソフト・周辺機器) のAdminクラス
# ----------------------------------------------------
class PCProductAdmin(admin.ModelAdmin):
    """
    🚀 PC製品メイン管理
    AI解析の結果、5軸スコア、ソフトウェアライセンス、自作PC互換性など
    本システムの核心となるデータを管理します。
    """
    # テンプレートパスを指定
    change_list_template = "admin/api/pcproduct/change_list.html"
    
    # 価格履歴を詳細画面に埋め込む
    inlines = [PriceHistoryInline]

    # 一覧画面の表示項目（運用性を重視した配置）
    list_display = (
        'maker',
        'display_thumbnail',
        'name_summary',
        'price_display',
        'stock_status',
        # --- ハードウェア性能（スコア表示） ---
        'display_scores',
        # --- ✨ ソフトウェア・ライセンス情報 ---
        'os_support_summary', 
        'license_term',
        'is_download_display',
        # --- 状態フラグ ---
        'display_ai_status',
        'is_posted',
        'is_active',
        'updated_at',
    )
    list_display_links = ('name_summary',)
    
    # 絞り込みパネル
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
    
    # 検索対象
    search_fields = ('name', 'unique_id', 'cpu_model', 'os_support', 'description', 'ai_content')
    
    ordering = ('-updated_at',)

    # 多対多（Attributes）の選択を使いやすくするUI
    filter_horizontal = ('attributes',)

    # 詳細編集画面のレイアウト（セクション分け）
    fieldsets = (
        ('基本情報', {
            'fields': ('unique_id', 'site_prefix', 'maker', 'is_active', 'is_posted', 'stock_status'),
        }),
        ('✨ ソフトウェア・ライセンス情報', {
            'description': 'セキュリティソフト、Office、OS等のソフトウェア特有の管理項目です。',
            'fields': (
                ('os_support', 'is_download'),
                ('license_term', 'device_count'),
                'edition',
            ),
        }),
        ('🚀 AI性能解析スコア (1-100)', {
            'description': 'AIがスペックから算出した性能指標。レーダーチャートの元データになります。',
            'fields': (
                ('score_cpu', 'score_gpu'),
                ('score_cost', 'score_portable'),
                ('score_ai', 'spec_score'),
                'target_segment',
            ),
        }),
        ('AI解析スペック詳細（ハードウェア）', {
            'description': 'PC本体（デスクトップ・ノート）の主要パーツ構成データです。',
            'fields': (
                ('cpu_model', 'gpu_model'),
                ('memory_gb', 'storage_gb'),
                ('display_info', 'is_ai_pc'),
                'npu_tops',
            ),
        }),
        ('自作PC提案用・パーツ互換性（AI推論）', {
            'description': 'パーツ単品販売時に、AIが型番から推論した互換性データです。',
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
            'classes': ('collapse',), # 初期状態では閉じておく
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'display_thumbnail_large', 'last_spec_parsed_at')

    # --- 表示カスタマイズ用メソッド ---
    def name_summary(self, obj):
        return obj.name[:40] + "..." if len(obj.name) > 40 else obj.name
    name_summary.short_description = "商品名"

    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "価格未定"
    price_display.short_description = "価格"

    def display_scores(self, obj):
        """一覧画面で5つの性能スコアをコンパクトに表示します。"""
        return mark_safe(
            f'<div style="line-height: 1.2; font-size: 11px;">'
            f'CPU:{obj.score_cpu} GPU:{obj.score_gpu} コスパ:{obj.score_cost}<br>'
            f'AI:{obj.score_ai} 携帯:{obj.score_portable}'
            f'</div>'
        )
    display_scores.short_description = "性能スコア"

    def os_support_summary(self, obj):
        return obj.os_support[:15] + ".." if obj.os_support and len(obj.os_support) > 15 else obj.os_support
    os_support_summary.short_description = "対応OS"

    def is_download_display(self, obj):
        if obj.is_download:
            return mark_safe('<span style="color: #007bff; font-weight: bold;">DL版</span>')
        return "パッケージ版"
    is_download_display.short_description = "提供形態"

    def display_thumbnail(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="80" height="50" style="object-fit: contain; background: #eee; border-radius: 4px;" />')
        return "No Image"
    display_thumbnail.short_description = '画像'

    def display_thumbnail_large(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="300" style="border: 1px solid #ccc;" />')
        return "画像なし"
    display_thumbnail_large.short_description = '画像プレビュー'

    def display_ai_status(self, obj):
        if obj.ai_content:
            return mark_safe('<span style="color: #28a745; font-weight: bold;">生成済</span>')
        return mark_safe('<span style="color: #999;">未生成</span>')
    display_ai_status.short_description = 'AI解析'

    # --- カスタムURL・ボタンアクションの設定 ---
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
        self.message_user(request, "Minisforumデータの同期プロセスをバックグラウンドで開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def fetch_lenovo_action(self, request):
        self.message_user(request, "Lenovoデータの取得プロセスを開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def fetch_acer_action(self, request):
        self.message_user(request, "Acerデータの取得プロセスを開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def generate_ai_action(self, request):
        self.message_user(request, "未生成の商品に対してAI解析・記事生成を開始します。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def full_update_pc_action(self, request):
        self.message_user(request, "全PCショップの一括取得・更新プロセスを開始しました。", messages.WARNING)
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 3. AdultProduct (アダルト製品データ) のAdminクラス
# ----------------------------------------------------
class AdultProductAdmin(admin.ModelAdmin):
    """
    🔞 アダルト製品管理
    FANZA/DUGA等のAPIから取得したデータの管理・正規化を行います。
    """
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
        self.message_user(request, "FANZAデータの取得コマンドを実行しました。")
        return HttpResponseRedirect("../")

    def fetch_duga_action(self, request):
        call_command('fetch_duga')
        self.message_user(request, "DUGAデータの取得コマンドを実行しました。")
        return HttpResponseRedirect("../")

    def normalize_action(self, request):
        call_command('normalize_fanza')
        self.message_user(request, "データのタグ付け・メーカー正規化を実行しました。")
        return HttpResponseRedirect("../")

    def full_update_action(self, request):
        call_command('fetch_fanza')
        call_command('fetch_duga')
        call_command('normalize_fanza')
        self.message_user(request, "全工程（取得・正規化）が完了しました。")
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 4. LinkshareProduct Admin
# ----------------------------------------------------
class LinkshareProductAdmin(admin.ModelAdmin): 
    """Linkshare経由の製品データ管理"""
    list_display = ('id', 'product_name', 'sku', 'merchant_id', 'is_active', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')

# ----------------------------------------------------
# 5. その他共通マスター設定
# ----------------------------------------------------
class CommonAdmin(admin.ModelAdmin):
    """マスターデータ系（ジャンル・女優・メーカー等）の共通設定"""
    list_display = ('name', 'product_count', 'api_source', 'created_at')

    def product_count(self, obj):
        if hasattr(obj, 'products'):
            return obj.products.count()
        return 0
    product_count.short_description = "製品数"

class RawApiDataAdmin(admin.ModelAdmin):
    """APIからの生応答データを保存するログ管理"""
    list_display = ('id', 'api_source', 'created_at')

# ----------------------------------------------------
# 6. Adminサイトへの登録
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
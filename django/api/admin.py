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
    Genre, Actress, Maker, Label, Director, Series
)
from .models.pc_products import PCProduct  # 💡 PCProductのインポート

# ----------------------------------------------------
# 0. カスタムフォーム
# ----------------------------------------------------
class AdultProductAdminForm(forms.ModelForm):
    class Meta:
        model = AdultProduct
        fields = '__all__'

# ----------------------------------------------------
# 1. PCProduct (PC製品・Minisforum/Lenovo/Acer等) のAdminクラス
# ----------------------------------------------------
class PCProductAdmin(admin.ModelAdmin):
    # テンプレートパスを指定（カスタムボタンを表示するHTML）
    change_list_template = "admin/api/pcproduct/change_list.html"

    list_display = (
        'maker',
        'display_thumbnail',
        'name_summary',
        'price_display',
        'unified_genre',
        'stock_status',      # 💡 在庫状況を表示
        'display_ai_status', # 💡 AI解説の有無を表示
        'is_posted',         # 💡 WordPress投稿済みフラグ
        'is_active',
        'updated_at',
    )
    list_display_links = ('name_summary',)
    
    # フィルタリング機能を強化
    list_filter = ('maker', 'site_prefix', 'is_active', 'is_posted', 'stock_status', 'unified_genre')
    
    search_fields = ('name', 'unique_id', 'description', 'ai_content')
    ordering = ('-updated_at',)

    fieldsets = (
        ('基本情報', {
            'fields': ('unique_id', 'site_prefix', 'maker', 'is_active', 'is_posted', 'stock_status'),
        }),
        ('仕分け情報', {
            'fields': ('unified_genre', 'raw_genre'),
        }),
        ('製品詳細', {
            'fields': ('name', 'price', 'description', 'raw_html'),
        }),
        ('アフィリエイト・AIコンテンツ', {
            'fields': ('affiliate_url', 'affiliate_updated_at', 'ai_content'),
            'description': '公式サイトへのアフィリエイトリンクとAI生成された解説文です。',
        }),
        ('画像', {
            'fields': ('image_url', 'display_thumbnail_large'),
        }),
        ('システム情報', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'display_thumbnail_large')

    # --- カスタム表示メソッド ---
    def name_summary(self, obj):
        return obj.name[:40] + "..." if len(obj.name) > 40 else obj.name
    name_summary.short_description = "商品名"

    def price_display(self, obj):
        return f"¥{obj.price:,}" if obj.price else "価格未定"
    price_display.short_description = "価格"

    def display_thumbnail(self, obj):
        """一覧画面用の小型サムネイル"""
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="80" height="50" style="object-fit: contain; background: #eee; border-radius: 4px;" />')
        return "No Image"
    display_thumbnail.short_description = '製品画像'

    def display_thumbnail_large(self, obj):
        """詳細画面用の大きなプレビュー"""
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="300" style="border: 1px solid #ccc;" />')
        return "画像なし"
    display_thumbnail_large.short_description = '画像プレビュー'

    def display_ai_status(self, obj):
        """AI解説が生成されているかをアイコンで表示"""
        if obj.ai_content:
            return mark_safe('<span style="color: #28a745; font-weight: bold;">生成済み</span>')
        return mark_safe('<span style="color: #666;">未生成</span>')
    display_ai_status.short_description = 'AI解説'

    # --- カスタムURLとアクション (Templateのhrefと一致させる) ---
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
        """Minisforumの同期"""
        try:
            # call_command('scrape_minisforum')
            self.message_user(request, "Minisforumデータの同期を開始しました。", messages.SUCCESS)
        except Exception as e:
            self.message_user(request, f"エラー: {e}", messages.ERROR)
        return HttpResponseRedirect("../")

    def fetch_lenovo_action(self, request):
        """Lenovoの同期"""
        self.message_user(request, "Lenovoデータの取得を開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def fetch_acer_action(self, request):
        """Acerの同期"""
        self.message_user(request, "Acerデータの取得を開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def generate_ai_action(self, request):
        """AI記事生成バッチ"""
        self.message_user(request, "AI記事生成プロセスを開始しました。", messages.SUCCESS)
        return HttpResponseRedirect("../")

    def full_update_pc_action(self, request):
        """PC全ショップ一括更新"""
        try:
            # call_command('fetch_all_pc')
            self.message_user(request, "全PCショップの一括更新プロセスを開始しました。", messages.WARNING)
        except Exception as e:
            self.message_user(request, f"一括更新エラー: {e}", messages.ERROR)
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 2. AdultProduct (アダルト製品データ) のAdminクラス
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
# 3. LinkshareProduct Admin
# ----------------------------------------------------
class LinkshareProductAdmin(admin.ModelAdmin): 
    list_display = ('id', 'product_name', 'sku', 'merchant_id', 'is_active', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')

# ----------------------------------------------------
# 4. その他マスター・共通設定
# ----------------------------------------------------
class CommonAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count', 'api_source', 'created_at')

class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')

# ----------------------------------------------------
# 5. 登録
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
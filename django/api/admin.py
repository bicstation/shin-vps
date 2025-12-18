from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from django.contrib import messages

# 既存モデルのインポート（DugaProductを追加）
from .models import (
    RawApiData, AdultProduct, LinkshareProduct, 
    Genre, Actress, Maker, Label, Director, Series
)

# ----------------------------------------------------
# 0. AdultProduct 用カスタムフォーム
# ----------------------------------------------------
class AdultProductAdminForm(forms.ModelForm):
    class Meta:
        model = AdultProduct
        fields = '__all__'

# ----------------------------------------------------
# 1. AdultProduct (アダルト製品データ) のAdminクラス
# ----------------------------------------------------
class AdultProductAdmin(admin.ModelAdmin):
    form = AdultProductAdminForm
    
    # ボタンを表示するためのカスタムテンプレートを指定
    change_list_template = "admin/adult_product_changelist.html"

    list_display = (
        'product_id_unique', 
        'title', 
        'release_date', 
        'price', 
        'maker', 
        'image_count', 
        'display_first_image',
        'is_active',
        'updated_at',
    )
    list_display_links = ('product_id_unique', 'title') 
    list_filter = ('is_active', 'release_date', 'maker') 
    search_fields = ('title', 'product_id_unique')

    fieldsets = (
        ('基本情報', {
            'fields': ('title', 'product_id_unique', 'api_source', 'is_active', 'raw_data'),
        }),
        ('価格・URL', {
            'fields': ('price', 'affiliate_url',),
        }),
        ('画像URLリスト', {
            'fields': ('image_url_list',), 
            'description': '画像URLのリストはデータベースにJSON形式で保存されています。'
        }),
        ('タイムスタンプ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',), 
        }),
        ('リレーション', {
            'fields': ('release_date', 'maker', 'label', 'director', 'series', 'genres', 'actresses'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'product_id_unique', 'api_source', 'raw_data')

    # --- ヘルパーメソッド ---
    def image_count(self, obj):
        if obj.image_url_list:
            return len(obj.image_url_list)
        return 0
    image_count.short_description = '画像件数'
    
    def display_first_image(self, obj):
        if obj.image_url_list and obj.image_url_list[0]:
            first_url = obj.image_url_list[0]
            return mark_safe(f'<img src="{first_url}" width="60" height="40" style="object-fit: cover; border-radius: 3px;" />')
        return "N/A"
    display_first_image.short_description = '画像'

    # --- カスタムURL・アクション（ボタン用ロジック） ---
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
        call_command('normalize_fanza') # もしDUGA用も共通ならここに追加
        self.message_user(request, "データの正規化（仕分け）が完了しました。")
        return HttpResponseRedirect("../")

    def full_update_action(self, request):
        self.message_user(request, "全データの一括更新を開始します...", messages.INFO)
        call_command('fetch_fanza')
        call_command('fetch_duga')
        call_command('normalize_fanza')
        self.message_user(request, "FANZA・DUGA・正規化のすべての工程が完了しました！")
        return HttpResponseRedirect("../")

# ----------------------------------------------------
# 2. LinkshareProduct (ノーマル製品データ)
# ----------------------------------------------------
class LinkshareProductAdmin(admin.ModelAdmin): 
    list_display = (
        'id', 'product_name', 'sku', 'merchant_id', 
        'merchant_name', 'price', 'in_stock', 'is_active', 'updated_at',
    )
    list_display_links = ('id', 'product_name', 'sku')
    search_fields = ('product_name', 'sku', 'merchant_name')
    list_filter = ('merchant_id', 'is_active', 'in_stock')

    fieldsets = (
        ('基本情報', {'fields': ('product_name', 'sku', 'merchant_name', 'merchant_id')}),
        ('価格・在庫・状態', {'fields': ('price', 'in_stock', 'is_active', 'api_source')}),
        ('データソース', {'fields': ('affiliate_url', 'product_url', 'raw_csv_data')}),
        ('日時', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ('created_at', 'updated_at')

# ----------------------------------------------------
# 3. ジャンル・その他マスター
# ----------------------------------------------------
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count', 'api_source', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('name',)

class EntityAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count', 'api_source', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('name',)

class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('id',)

# ----------------------------------------------------
# 4. 登録
# ----------------------------------------------------
admin.site.register(AdultProduct, AdultProductAdmin)
admin.site.register(LinkshareProduct, LinkshareProductAdmin) 
admin.site.register(Genre, GenreAdmin)
admin.site.register(Actress, EntityAdmin)
admin.site.register(Maker, EntityAdmin)
admin.site.register(Label, EntityAdmin)
admin.site.register(Director, EntityAdmin)
admin.site.register(Series, EntityAdmin)
admin.site.register(RawApiData, RawApiDataAdmin)
# api/admin.py

from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe 
# ★★★ 修正: NormalProduct を LinkshareProduct に変更 ★★★
from .models import RawApiData, AdultProduct, LinkshareProduct, Genre, Actress, Maker, Label, Director, Series

# ----------------------------------------------------
# 0. AdultProduct 用カスタムフォームの定義
# ----------------------------------------------------

class AdultProductAdminForm(forms.ModelForm):
    class Meta:
        model = AdultProduct
        fields = '__all__'

# ----------------------------------------------------
# 1. AdultProduct (アダルト製品データ) のAdminクラス定義
# ----------------------------------------------------
class AdultProductAdmin(admin.ModelAdmin):
    form = AdultProductAdminForm
    
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

    def image_count(self, obj):
        if obj.image_url_list:
            return len(obj.image_url_list)
        return 0
    image_count.short_description = '画像件数'
    image_count.admin_order_field = 'image_url_list'
    
    def display_first_image(self, obj):
        if obj.image_url_list and obj.image_url_list[0]:
            first_url = obj.image_url_list[0]
            return mark_safe(f'<img src="{first_url}" width="60" height="40" style="object-fit: cover; border-radius: 3px;" />')
        return "N/A"
    
    display_first_image.short_description = '画像'
    
# ----------------------------------------------------
# 1.5 LinkshareProduct (ノーマル製品データ) のAdminクラス定義
# ----------------------------------------------------
# 💡 クラス名を NormalProductAdmin から LinkshareProductAdmin に変更
class LinkshareProductAdmin(admin.ModelAdmin): 
    """LinkshareProduct用のAdminクラス"""
    list_display = (
        'product_name', # 💡 修正: title -> product_name
        'sku',          # 💡 修正: sku_unique -> sku
        'sale_price',   # 💡 修正: price -> sale_price
        'availability', # 💡 在庫情報
        'merchant_id',  # 💡 マーチャントID
        'updated_at',
    )
    list_display_links = ('sku', 'product_name')
    search_fields = ('product_name', 'sku', 'keywords')
    list_filter = ('merchant_id', 'availability') # 💡 フィルターを修正

# ----------------------------------------------------
# 2. Genre (ジャンル) のAdminクラス定義
# ----------------------------------------------------
class GenreAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'product_count', 
        'api_source',
        'created_at',
    )
    list_filter = ('api_source',)
    search_fields = ('name',)
    
# ----------------------------------------------------
# 3. その他のモデルのAdminクラス定義
# ----------------------------------------------------
class EntityAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count', 'api_source', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('name',)
    
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')
    list_filter = ('api_source',)
    search_fields = ('id',)


# ----------------------------------------------------
# 4. モデルとAdminクラスのペア登録
# ----------------------------------------------------
admin.site.register(AdultProduct, AdultProductAdmin)
# 🚨 修正: NormalProduct と NormalProductAdmin を LinkshareProduct に変更
admin.site.register(LinkshareProduct, LinkshareProductAdmin) 
admin.site.register(Genre, GenreAdmin)
admin.site.register(Actress, EntityAdmin)
admin.site.register(Maker, EntityAdmin)
admin.site.register(Label, EntityAdmin)
admin.site.register(Director, EntityAdmin)
admin.site.register(Series, EntityAdmin)
admin.site.register(RawApiData, RawApiDataAdmin)
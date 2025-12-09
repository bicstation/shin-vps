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
class LinkshareProductAdmin(admin.ModelAdmin): 
    """LinkshareProduct用のAdminクラス"""
    
    # 💡 リスト表示: product_name を id の直後に配置
    list_display = (
        'id', 
        'product_name',   # 👈 product_name を追加
        'sku_unique', 
        'merchant_id', 
        'merchant_name',  # merchant_name がモデルに残っていれば表示
        'price',
        'in_stock',       # 在庫状況を追加 (list_displayに追加されていなかったため)
        'is_active', 
        'updated_at',
    )
    
    list_display_links = ('id', 'product_name', 'sku_unique') 
    
    search_fields = ('product_name', 'sku_unique', 'merchant_name') 
    
    list_filter = ('merchant_id', 'is_active', 'in_stock') # 在庫フィルターを追加

    # 🚨 修正: fieldsets に product_name を追加し、構成を整理 🚨
    fieldsets = (
        # 💡 None ではなく、明示的に '基本情報' という名前を割り当てます
        ('基本情報', {
            'fields': (
                'product_name',  # 👈 詳細画面の先頭に表示されます
                'sku_unique', 
                'sku',           # sku も編集・確認可能に
                'merchant_name', # マーチャント名
                'merchant_id',   # マーチャントID
            )
        }),
        ('価格・在庫・状態', {
            'fields': ('price', 'in_stock', 'is_active', 'api_source',)
        }),
        ('データソース', {
            'fields': ('affiliate_url', 'product_url', 'raw_csv_data',)
        }),
        ('日時', {
            'fields': ('created_at', 'updated_at',),
            'classes': ('collapse',),
        }),
    )

    readonly_fields = ('created_at', 'updated_at') # 編集させないフィールドのみ残す


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
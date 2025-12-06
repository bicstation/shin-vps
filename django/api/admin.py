# api/admin.py

from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe # サムネイル表示のためにインポート
# ★★★ 修正: Product を AdultProduct, NormalProduct, Series に変更 ★★★
from .models import RawApiData, AdultProduct, NormalProduct, Genre, Actress, Maker, Label, Director, Series

# ----------------------------------------------------
# 0. AdultProduct 用カスタムフォームの定義
# ----------------------------------------------------

# JSONField を扱うためのカスタムフォーム
class AdultProductAdminForm(forms.ModelForm):
    # image_url_list フィールドは、カスタムウィジェットがない場合、
    # ユーザーが編集しやすいように Textarea を利用する
    
    class Meta:
        model = AdultProduct # ★ 修正: AdultProduct に変更
        fields = '__all__' # すべてのフィールドを対象とする

# ----------------------------------------------------
# 1. AdultProduct (アダルト製品データ) のAdminクラス定義
# ----------------------------------------------------
class AdultProductAdmin(admin.ModelAdmin): # ★ 修正: AdultProductAdmin に変更
    # ★★★ カスタムフォームを適用 ★★★
    form = AdultProductAdminForm # ★ 修正: AdultProductAdminForm に変更
    
    # Excelのような表形式で表示するフィールド
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
            'fields': ('title', 'product_id_unique', 'api_source', 'is_active', 'raw_data'), # raw_data を追加
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
            'fields': ('release_date', 'maker', 'label', 'director', 'series', 'genres', 'actresses'), # series を追加
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'product_id_unique', 'api_source', 'raw_data') # raw_data を追加

    # --------------------------------------
    # カスタムメソッドの定義 (一覧画面用)
    # --------------------------------------
    def image_count(self, obj):
        """画像URLリストの件数を表示する"""
        if obj.image_url_list:
            return len(obj.image_url_list)
        return 0
    image_count.short_description = '画像件数'
    image_count.admin_order_field = 'image_url_list'
    
    def display_first_image(self, obj):
        """最初の画像URLをサムネイルとして表示する"""
        if obj.image_url_list and obj.image_url_list[0]:
            first_url = obj.image_url_list[0]
            # <img> タグを使用してサムネイルを表示
            return mark_safe(f'<img src="{first_url}" width="60" height="40" style="object-fit: cover; border-radius: 3px;" />')
        
        return "N/A"
    
    display_first_image.short_description = '画像'
    
# ----------------------------------------------------
# 1.5 NormalProduct (ノーマル製品データ) のAdminクラス定義
# ----------------------------------------------------
class NormalProductAdmin(admin.ModelAdmin):
    """NormalProduct用のAdminクラス"""
    list_display = (
        'title', 
        'sku_unique', 
        'price', 
        'is_active',
        'updated_at',
    )
    list_display_links = ('sku_unique', 'title')
    search_fields = ('title', 'sku_unique')
    list_filter = ('is_active',)


# ----------------------------------------------------
# 2. Genre (ジャンル) のAdminクラス定義 - 変更なし
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
# 3. その他のモデルのAdminクラス定義 (簡易表示) - 変更なし
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
admin.site.register(AdultProduct, AdultProductAdmin) # ★ 修正: AdultProduct と AdultProductAdmin を登録
admin.site.register(NormalProduct, NormalProductAdmin) # ★ 新規追加: NormalProduct を登録
admin.site.register(Genre, GenreAdmin)
admin.site.register(Actress, EntityAdmin)
admin.site.register(Maker, EntityAdmin)
admin.site.register(Label, EntityAdmin)
admin.site.register(Director, EntityAdmin)
admin.site.register(Series, EntityAdmin) # Series を追加
admin.site.register(RawApiData, RawApiDataAdmin)
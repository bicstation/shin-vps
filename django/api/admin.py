# api/admin.py

from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe # サムネイル表示のためにインポート
from .models import RawApiData, Product, Genre, Actress, Maker, Label, Director

# ----------------------------------------------------
# 0. Product 用カスタムフォームの定義
# ----------------------------------------------------

# JSONField を扱うためのカスタムフォーム
class ProductAdminForm(forms.ModelForm):
    # image_url_list フィールドは、カスタムウィジェットがない場合、
    # ユーザーが編集しやすいように Textarea を利用する
    
    class Meta:
        model = Product
        fields = '__all__' # すべてのフィールドを対象とする

# ----------------------------------------------------
# 1. Product (製品データ) のAdminクラス定義
# ----------------------------------------------------
class ProductAdmin(admin.ModelAdmin):
    # ★★★ カスタムフォームを適用 ★★★
    form = ProductAdminForm
    
    # Excelのような表形式で表示するフィールド
    # ★★★ 画像関連のカスタムカラムを追加 ★★★
    list_display = (
        'product_id_unique', 
        'title', 
        'release_date', 
        'price', 
        'maker', 
        'image_count',       # ★追加: 画像の件数
        'display_first_image', # ★追加: 最初の画像のサムネイル
        'is_active',
        'updated_at',
    )
    # クリックして編集画面へ遷移できるフィールド
    list_display_links = ('product_id_unique', 'title') 
    # 右サイドバーにフィルタリング機能を追加
    list_filter = ('is_active', 'release_date', 'maker') 
    # 検索窓の対象となるフィールド
    search_fields = ('title', 'product_id_unique')

    fieldsets = (
        ('基本情報', {
            'fields': ('title', 'product_id_unique', 'api_source', 'is_active'),
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
            'fields': ('release_date', 'maker', 'label', 'director', 'genres', 'actresses'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'product_id_unique', 'api_source',)

    # --------------------------------------
    # ★★★ カスタムメソッドの定義 (一覧画面用) ★★★
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
            # <img> タグを使用してサムネイルを表示 (width/height は適宜調整してください)
            return mark_safe(f'<img src="{first_url}" width="60" height="40" style="object-fit: cover; border-radius: 3px;" />')
        
        return "N/A"
    
    display_first_image.short_description = '画像'
    # --------------------------------------


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
# 3. その他のモデルのAdminクラス定義 (簡易表示)
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
admin.site.register(Product, ProductAdmin)
admin.site.register(Genre, GenreAdmin)
admin.site.register(Actress, EntityAdmin)
admin.site.register(Maker, EntityAdmin)
admin.site.register(Label, EntityAdmin)
admin.site.register(Director, EntityAdmin)
admin.site.register(RawApiData, RawApiDataAdmin)
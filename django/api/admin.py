# api/admin.py

from django.contrib import admin
from .models import RawApiData, Product, Genre, Actress, Maker, Label, Director

# ----------------------------------------------------
# 1. Product (製品データ) のAdminクラス定義
# ----------------------------------------------------
class ProductAdmin(admin.ModelAdmin):
    # Excelのような表形式で表示するフィールド
    list_display = (
        'product_id_unique', 
        'title', 
        'release_date', 
        'price', 
        'maker', 
        'is_active',
        'updated_at',
    )
    # クリックして編集画面へ遷移できるフィールド
    list_display_links = ('product_id_unique', 'title') 
    # 右サイドバーにフィルタリング機能を追加
    list_filter = ('is_active', 'release_date', 'maker') 
    # 検索窓の対象となるフィールド
    search_fields = ('title', 'product_id_unique')

# ----------------------------------------------------
# 2. Genre (ジャンル) のAdminクラス定義
# ----------------------------------------------------
class GenreAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'product_count', # product_countの確認に役立ちます
        'api_source',
        'created_at',
    )
    list_filter = ('api_source',)
    search_fields = ('name',)
    
# ----------------------------------------------------
# 3. その他のモデルのAdminクラス定義 (簡易表示)
# ----------------------------------------------------
class EntityAdmin(admin.ModelAdmin):
    # Maker, Label, Director, Actressに共通で適用できるリスト表示
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
# カスタムAdminクラスを適用
admin.site.register(Product, ProductAdmin)
admin.site.register(Genre, GenreAdmin)

# 共通のEntityAdminを適用
admin.site.register(Actress, EntityAdmin)
admin.site.register(Maker, EntityAdmin)
admin.site.register(Label, EntityAdmin)
admin.site.register(Director, EntityAdmin)

# RawApiDataに専用のAdminクラスを適用
admin.site.register(RawApiData, RawApiDataAdmin)
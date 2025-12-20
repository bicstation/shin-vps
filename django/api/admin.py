from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from django.contrib import messages

# モデルのインポート
from .models import (
    RawApiData, AdultProduct, LinkshareProduct, PCProduct,
    Genre, Actress, Maker, Label, Director, Series
)

# ----------------------------------------------------
# 0. カスタムフォーム
# ----------------------------------------------------
class AdultProductAdminForm(forms.ModelForm):
    class Meta:
        model = AdultProduct
        fields = '__all__'

# ----------------------------------------------------
# 1. PCProduct (PC製品・Acer等) のAdminクラス
# ----------------------------------------------------
# @admin.registerを使わず、最後に一括で登録する方式に統一します
class PCProductAdmin(admin.ModelAdmin):
    # Djangoが自動的に最優先で探すパス形式
    change_list_template = "admin/api/pcproduct/change_list.html"

    list_display = (
        'maker',
        'display_thumbnail',
        'name',
        'price',
        'site_prefix',
        'is_active',
        'updated_at',
    )
    list_display_links = ('name',)
    list_filter = ('maker', 'site_prefix', 'is_active', 'genre')
    search_fields = ('name', 'unique_id', 'description')
    ordering = ('-updated_at',)

    fieldsets = (
        ('基本情報', {
            'fields': ('unique_id', 'site_prefix', 'maker', 'genre', 'is_active'),
        }),
        ('製品詳細', {
            'fields': ('name', 'price', 'description'),
        }),
        ('リンク・画像', {
            'fields': ('url', 'image_url'),
        }),
        ('タイムスタンプ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

    def display_thumbnail(self, obj):
        if obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" width="60" height="40" style="object-fit: contain; border-radius: 3px;" />')
        return "No Image"
    display_thumbnail.short_description = '画像'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('fetch-acer/', self.fetch_acer_action, name='fetch_acer'),
            path('generate-ai-article/', self.generate_ai_action, name='generate_ai_article'),
        ]
        return custom_urls + urls

    def fetch_acer_action(self, request):
        self.message_user(request, "Acerデータの取得プロセスを開始しました。")
        return HttpResponseRedirect("../")

    def generate_ai_action(self, request):
        self.message_user(request, "AI記事生成を開始します...", messages.INFO)
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

    readonly_fields = ('created_at', 'updated_at', 'product_id_unique', 'api_source', 'raw_data')

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
# 3. LinkshareProduct
# ----------------------------------------------------
class LinkshareProductAdmin(admin.ModelAdmin): 
    list_display = ('id', 'product_name', 'sku', 'merchant_name', 'price', 'is_active', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')

# ----------------------------------------------------
# 4. その他マスター・共通設定
# ----------------------------------------------------
class CommonAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count', 'api_source', 'created_at')

class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')

# ----------------------------------------------------
# 5. 登録（ここで一括して登録します）
# ----------------------------------------------------
admin.site.register(PCProduct, PCProductAdmin)  # ここでPCProductを登録
admin.site.register(AdultProduct, AdultProductAdmin)
admin.site.register(LinkshareProduct, LinkshareProductAdmin) 
admin.site.register(Genre, CommonAdmin)
admin.site.register(Actress, CommonAdmin)
admin.site.register(Maker, CommonAdmin)
admin.site.register(Label, CommonAdmin)
admin.site.register(Director, CommonAdmin)
admin.site.register(Series, CommonAdmin)
admin.site.register(RawApiData, RawApiDataAdmin)
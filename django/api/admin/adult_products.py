# -*- coding: utf-8 -*-
from django.contrib import admin
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from ..models import AdultProduct, FanzaProduct

# --------------------------------------------------------------------------
# 1. 🆕 FANZA 最適化商品 (FanzaProduct) 管理画面
# --------------------------------------------------------------------------
@admin.register(FanzaProduct)
class FanzaProductAdmin(admin.ModelAdmin):
    list_display = (
        'display_main_image', 'unique_id', 'title_summary', 
        'price_summary_tag', 'score_radar_tag', 'service_floor_tag', 'is_active_tag', 'release_date'
    )
    list_filter = ('site_code', 'service_code', 'floor_code', 'is_active', 'is_recommend', 'release_date')
    search_fields = ('title', 'unique_id', 'content_id', 'product_description', 'ai_summary')
    filter_horizontal = ('genres', 'actresses', 'authors')
    readonly_fields = ('created_at', 'updated_at', 'raw_item_info')

    fieldsets = (
        ('基本ステータス', {
            'fields': (
                ('unique_id', 'content_id', 'product_id'),
                'title', 'url', 'affiliate_url',
                ('site_code', 'service_code', 'floor_code', 'floor_name'),
                ('is_active', 'is_recommend')
            ),
        }),
        ('🧠 AI解析 & スコアリング', {
            'fields': (
                'product_description', 'ai_summary',
                ('score_visual', 'score_story', 'score_cost'),
                ('score_erotic', 'score_rarity'),
                'radar_chart_data'
            ),
        }),
        ('🏷️ 分類・メディア', {
            'fields': (
                ('maker', 'label'), ('director', 'series'),
                'genres', 'actresses', 'authors', 'volume',
                'price_info', 'image_urls', 'sample_images', 'sample_movie'
            ),
        }),
        ('⚙️ 生データ', {
            'classes': ('collapse',),
            'fields': ('raw_item_info',),
        }),
    )

    def display_main_image(self, obj):
        url = obj.image_urls.get('list') or obj.image_urls.get('small')
        if url:
            return mark_safe(f'<img src="{url}" width="70" style="object-fit: cover; border-radius: 4px;" />')
        return "No Image"
    display_main_image.short_description = "画像"

    def title_summary(self, obj):
        return obj.title[:30] + "..." if len(obj.title) > 30 else obj.title
    title_summary.short_description = "タイトル"

    def price_summary_tag(self, obj):
        price = obj.price_info.get('price', '---')
        is_sale = " (SALE)" if obj.price_info.get('is_sale') else ""
        return f"¥{price}{is_sale}"
    price_summary_tag.short_description = "価格"

    def score_radar_tag(self, obj):
        # 5項目の平均値を算出
        scores = [obj.score_visual, obj.score_story, obj.score_cost, obj.score_erotic, obj.score_rarity]
        avg_score = sum(scores) / len(scores) if scores else 0
        color = "#e83e8c" if avg_score > 75 else "#6f42c1"
        return mark_safe(f'''
            <div style="width: 80px; background: #eee; height: 10px; border-radius: 5px; overflow: hidden;">
                <div style="width: {avg_score}%; background: {color}; height: 100%;"></div>
            </div>
        ''')
    score_radar_tag.short_description = "AIスコア"

    def service_floor_tag(self, obj):
        return mark_safe(f'<span style="font-size: 0.8em; color: #666;">{obj.service_code}<br>{obj.floor_code}</span>')
    service_floor_tag.short_description = "サービス/フロア"

    def is_active_tag(self, obj):
        return mark_safe('✅' if obj.is_active else '❌')
    is_active_tag.short_description = "公開"


# --------------------------------------------------------------------------
# 2. アダルト商品 (AdultProduct - 既存) 管理画面
# --------------------------------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    list_display = ('display_first_image', 'product_id_unique', 'title_summary', 'price_display', 'score_radar_tag', 'is_posted_tag', 'api_source', 'release_date')
    list_filter = ('is_active', 'is_posted', 'api_source', 'maker', 'release_date')
    search_fields = ('title', 'product_id_unique', 'product_description', 'ai_summary')
    filter_horizontal = ('genres', 'actresses', 'attributes')
    readonly_fields = ('created_at', 'updated_at', 'api_source', 'last_spec_parsed_at')

    def score_radar_tag(self, obj):
        val = obj.spec_score or 0
        color = "#e83e8c" if val > 75 else "#6f42c1"
        return mark_safe(f'<div style="width: 80px; background: #eee; height: 10px; border-radius: 5px; overflow: hidden;"><div style="width: {val}%; background: {color}; height: 100%;"></div></div>')

    def display_first_image(self, obj):
        if obj.image_url_list and len(obj.image_url_list) > 0:
            return mark_safe(f'<img src="{obj.image_url_list[0]}" width="70" style="object-fit: cover; border-radius: 4px;" />')
        return "N/A"

    def title_summary(self, obj): return obj.title[:35] + "..." if len(obj.title) > 35 else obj.title
    def price_display(self, obj): return f"¥{obj.price:,}" if obj.price else "---"
    def is_posted_tag(self, obj): return mark_safe('📮' if obj.is_posted else '☁️')

    def get_urls(self):
        return [
            path('fetch-fanza/', self.fetch_fanza_action, name='fetch_fanza'),
            path('fetch-duga/', self.fetch_duga_action, name='fetch_duga'),
        ] + super().get_urls()

    def fetch_fanza_action(self, request):
        call_command('fetch_fanza')
        return HttpResponseRedirect("../")

    def fetch_duga_action(self, request):
        call_command('fetch_duga')
        return HttpResponseRedirect("../")
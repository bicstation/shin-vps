# -*- coding: utf-8 -*-
from django.contrib import admin
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from ..models import AdultProduct, FanzaProduct

# 🌐 フロントエンドのベースURL
FRONTEND_BASE_URL = "https://tiper.live/adults"

class FanzaProductAdmin(admin.ModelAdmin):
    list_display = (
        'display_main_image', 'unique_id', 'title_summary', 
        'price_summary_tag', 'score_radar_tag', 'service_floor_tag', 'is_active_tag', 'release_date'
    )
    list_filter = ('site_code', 'service_code', 'floor_code', 'is_active', 'is_recommend', 'release_date')
    search_fields = ('title', 'unique_id', 'content_id', 'product_description', 'ai_summary')
    filter_horizontal = ('genres', 'actresses', 'authors')
    readonly_fields = ('created_at', 'updated_at', 'raw_item_info')

    def display_main_image(self, obj):
        """JSONField から画像URLを取得し、Next.js詳細ページへのリンクを付与"""
        url = obj.image_urls.get('list') or obj.image_urls.get('small') or obj.image_urls.get('large')
        if url:
            detail_url = f"{FRONTEND_BASE_URL}/{obj.id}"
            return mark_safe(
                f'<a href="{detail_url}" target="_blank">'
                f'<img src="{url}" width="70" style="object-fit: cover; border-radius: 4px; border: 1px solid #333;" '
                f'referrerpolicy="no-referrer" />'
                f'</a>'
            )
        return "No Image"
    display_main_image.short_description = "画像 (LIVE)"

    def title_summary(self, obj):
        """タイトルをクリックでフロントエンドへ飛ばす"""
        detail_url = f"{FRONTEND_BASE_URL}/{obj.id}"
        title = obj.title[:30] + "..." if len(obj.title) > 30 else obj.title
        return mark_safe(f'<a href="{detail_url}" target="_blank" style="font-weight:bold; color:#00d1b2;">{title}</a>')
    title_summary.short_description = "タイトル"

    def price_summary_tag(self, obj):
        price = obj.price_info.get('price', '---')
        is_sale = " (SALE)" if obj.price_info.get('is_sale') else ""
        return f"¥{price}{is_sale}"
    price_summary_tag.short_description = "価格"

    def score_radar_tag(self, obj):
        scores = [obj.score_visual, obj.score_story, obj.score_cost, obj.score_erotic, obj.score_rarity]
        avg_score = sum(scores) / len(scores) if scores else 0
        color = "#e83e8c" if avg_score > 75 else "#6f42c1"
        return mark_safe(
            f'<div style="width: 80px; background: #eee; height: 10px; border-radius: 5px; overflow: hidden;">'
            f'<div style="width: {avg_score}%; background: {color}; height: 100%;"></div>'
            f'</div>'
        )
    score_radar_tag.short_description = "AIスコア"

    def service_floor_tag(self, obj):
        return mark_safe(f'<span style="font-size: 0.8em; color: #666;">{obj.service_code}<br>{obj.floor_code}</span>')
    service_floor_tag.short_description = "サービス/フロア"

    def is_active_tag(self, obj):
        return mark_safe('✅' if obj.is_active else '❌')
    is_active_tag.short_description = "公開"


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
    score_radar_tag.short_description = "スコア"

    def display_first_image(self, obj):
        detail_url = f"{FRONTEND_BASE_URL}/{obj.id}"
        if obj.image_url_list and len(obj.image_url_list) > 0:
            url = obj.image_url_list[0]
            return mark_safe(
                f'<a href="{detail_url}" target="_blank">'
                f'<img src="{url}" width="70" style="object-fit: cover; border-radius: 4px; border: 1px solid #444;" '
                f'referrerpolicy="no-referrer" />'
                f'</a>'
            )
        return "N/A"
    display_first_image.short_description = "画像 (LIVE)"

    def title_summary(self, obj):
        detail_url = f"{FRONTEND_BASE_URL}/{obj.id}"
        title = obj.title[:35] + "..." if len(obj.title) > 35 else obj.title
        return mark_safe(f'<a href="{detail_url}" target="_blank" style="font-weight:bold; color:#e94560;">{title}</a>')
    title_summary.short_description = "タイトル"

    def price_display(self, obj): return f"¥{obj.price:,}" if obj.price else "---"
    price_display.short_description = "価格"

    def is_posted_tag(self, obj): return mark_safe('📮' if obj.is_posted else '☁️')
    is_posted_tag.short_description = "投稿済"

    # カスタムアクションボタンのURL設定
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('fetch-fanza/', self.fetch_fanza_action, name='fetch_fanza'),
            path('fetch-duga/', self.fetch_duga_action, name='fetch_duga'),
        ]
        return custom_urls + urls

    def fetch_fanza_action(self, request):
        call_command('fetch_fanza')
        self.message_user(request, "FANZAデータの取得を開始しました")
        return HttpResponseRedirect("../")

    def fetch_duga_action(self, request):
        call_command('fetch_duga')
        self.message_user(request, "DUGAデータの取得を開始しました")
        return HttpResponseRedirect("../")

# --- 登録セクション ---
# すでに登録されている場合のエラーを回避しつつ登録
if not admin.site.is_registered(FanzaProduct):
    admin.site.register(FanzaProduct, FanzaProductAdmin)

if not admin.site.is_registered(AdultProduct):
    admin.site.register(AdultProduct, AdultProductAdmin)
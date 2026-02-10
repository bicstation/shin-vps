# -*- coding: utf-8 -*-
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from ..models import User, RawApiData, AdultProduct, FanzaProduct

# 🌐 フロントエンドのベースURL設定
FRONTEND_BASE_URL = "https://tiper.live/adults"

# --------------------------------------------------------------------------
# 1. User (ユーザー) 管理画面
# --------------------------------------------------------------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('✨ 追加プロフィール', {
            'fields': ('site_group', 'status_message', 'profile_image', 'bio'),
        }),
    )
    list_display = ('username', 'display_avatar', 'email', 'site_group_tag', 'is_staff_tag', 'is_active_tag', 'date_joined')
    
    def display_avatar(self, obj):
        if obj.profile_image:
            return mark_safe(f'<img src="{obj.profile_image}" width="30" height="30" style="border-radius: 50%; object-fit: cover;" />')
        return mark_safe('<div style="width: 30px; height: 30px; background: #eee; border-radius: 50%; display: inline-block;"></div>')
    display_avatar.short_description = ""

    def site_group_tag(self, obj):
        return mark_safe(f'<span style="background: #6c757d; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">{obj.site_group}</span>')
    site_group_tag.short_description = "グループ"

    def is_staff_tag(self, obj):
        return mark_safe('✅' if obj.is_staff else '👤')

    def is_active_tag(self, obj):
        color = "#28a745" if obj.is_active else "#dc3545"
        return mark_safe(f'<span style="color: {color};">{"● 有効" if obj.is_active else "○ 停止"}</span>')

# --------------------------------------------------------------------------
# 2. FanzaProduct (FANZA最適化) 管理画面
# --------------------------------------------------------------------------
@admin.register(FanzaProduct)
class FanzaProductAdmin(admin.ModelAdmin):
    list_display = (
        'display_main_image', 'unique_id', 'title_summary_link', 
        'price_summary_tag', 'score_radar_tag', 'service_floor_tag', 'is_active_tag', 'release_date'
    )
    list_filter = ('site_code', 'service_code', 'floor_code', 'is_active', 'is_recommend', 'release_date')
    search_fields = ('title', 'unique_id', 'content_id', 'product_description', 'ai_summary')
    filter_horizontal = ('genres', 'actresses', 'authors')
    readonly_fields = ('created_at', 'updated_at', 'raw_item_info')

    def display_main_image(self, obj):
        # 画像URL取得
        url = obj.image_urls.get('list') or obj.image_urls.get('small')
        if url:
            # 🔗 フロントエンド詳細ページへのリンクを画像に付与
            detail_url = f"{FRONTEND_BASE_URL}/{obj.id}"
            return mark_safe(
                f'<a href="{detail_url}" target="_blank">'
                f'<img src="{url}" width="70" style="object-fit: cover; border-radius: 4px; border: 1px solid #333;" '
                f'referrerpolicy="no-referrer" />' # FANZA画像ブロック対策
                f'</a>'
            )
        return "No Image"
    display_main_image.short_description = "画像(LIVE)"

    def title_summary_link(self, obj):
        detail_url = f"{FRONTEND_BASE_URL}/{obj.id}"
        title = obj.title[:30] + "..." if len(obj.title) > 30 else obj.title
        return mark_safe(f'<a href="{detail_url}" target="_blank" style="font-weight:bold; color:#00d1b2;">{title}</a>')
    title_summary_link.short_description = "タイトル"

    def price_summary_tag(self, obj):
        price = obj.price_info.get('price', '---')
        is_sale = " (SALE)" if obj.price_info.get('is_sale') else ""
        return f"¥{price}{is_sale}"
    price_summary_tag.short_description = "価格"

    def score_radar_tag(self, obj):
        scores = [obj.score_visual, obj.score_story, obj.score_cost, obj.score_erotic, obj.score_rarity]
        avg_score = sum(scores) / len(scores) if scores else 0
        color = "#e83e8c" if avg_score > 75 else "#6f42c1"
        return mark_safe(f'<div style="width: 80px; background: #eee; height: 10px; border-radius: 5px; overflow: hidden;"><div style="width: {avg_score}%; background: {color}; height: 100%;"></div></div>')
    score_radar_tag.short_description = "AIスコア"

    def service_floor_tag(self, obj):
        return mark_safe(f'<span style="font-size: 0.8em; color: #666;">{obj.service_code}<br>{obj.floor_code}</span>')
    service_floor_tag.short_description = "サービス/フロア"

    def is_active_tag(self, obj):
        return mark_safe('✅' if obj.is_active else '❌')
    is_active_tag.short_description = "公開"

# --------------------------------------------------------------------------
# 3. AdultProduct (既存アーカイブ) 管理画面
# --------------------------------------------------------------------------
@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    list_display = ('display_first_image', 'product_id_unique', 'title_summary_link', 'price_display', 'score_radar_tag', 'is_posted_tag', 'api_source', 'release_date')
    list_filter = ('is_active', 'is_posted', 'api_source', 'maker', 'release_date')
    search_fields = ('title', 'product_id_unique', 'product_description', 'ai_summary')
    filter_horizontal = ('genres', 'actresses', 'attributes')
    readonly_fields = ('created_at', 'updated_at', 'api_source', 'last_spec_parsed_at')

    def display_first_image(self, obj):
        detail_url = f"{FRONTEND_BASE_URL}/{obj.id}"
        if obj.image_url_list and len(obj.image_url_list) > 0:
            return mark_safe(
                f'<a href="{detail_url}" target="_blank">'
                f'<img src="{obj.image_url_list[0]}" width="70" style="object-fit: cover; border-radius: 4px;" '
                f'referrerpolicy="no-referrer" />'
                f'</a>'
            )
        return "N/A"
    display_first_image.short_description = "画像(LIVE)"

    def title_summary_link(self, obj):
        detail_url = f"{FRONTEND_BASE_URL}/{obj.id}"
        title = obj.title[:35] + "..." if len(obj.title) > 35 else obj.title
        return mark_safe(f'<a href="{detail_url}" target="_blank" style="font-weight:bold; color:#e94560;">{title}</a>')
    title_summary_link.short_description = "タイトル"

    def score_radar_tag(self, obj):
        val = obj.spec_score or 0
        color = "#e83e8c" if val > 75 else "#6f42c1"
        return mark_safe(f'<div style="width: 80px; background: #eee; height: 10px; border-radius: 5px; overflow: hidden;"><div style="width: {val}%; background: {color}; height: 100%;"></div></div>')

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

# --------------------------------------------------------------------------
# 4. RawApiData (生データ) 管理画面
# --------------------------------------------------------------------------
@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')
    readonly_fields = ('created_at',)
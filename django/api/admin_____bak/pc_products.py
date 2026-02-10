# -*- coding: utf-8 -*-
from django.contrib import admin
from django.utils.safestring import mark_safe
from ..models.pc_products import PCProduct, PriceHistory

# 🌐 フロントエンド（PC製品カテゴリ）のベースURL
FRONTEND_PC_URL = "https://tiper.live/pc"

class PriceHistoryInline(admin.TabularInline):
    model = PriceHistory
    extra = 0
    readonly_fields = ('recorded_at', 'price_formatted')
    fields = ('recorded_at', 'price_formatted')
    can_delete = False
    def price_formatted(self, obj): return f"¥{obj.price:,}"

@admin.register(PCProduct)
class PCProductAdmin(admin.ModelAdmin):
    inlines = [PriceHistoryInline]
    # list_display の順序を整理し、視認性を高めました
    list_display = (
        'display_thumbnail', 'maker', 'name_summary_link', 
        'price_display', 'score_visual_tag', 'stock_status_tag', 
        'ai_status_tag', 'updated_at'
    )
    search_fields = ('name', 'unique_id', 'description')
    filter_horizontal = ('attributes',)
    list_filter = ('stock_status', 'maker', 'ai_content')

    def display_thumbnail(self, obj):
        """画像を表示し、クリックでNext.js詳細ページへ飛ばす"""
        if obj.image_url:
            detail_url = f"{FRONTEND_PC_URL}/{obj.id}"
            return mark_safe(
                f'<a href="{detail_url}" target="_blank">'
                f'<img src="{obj.image_url}" width="60" style="border-radius: 4px; border: 1px solid #ddd;" '
                f'referrerpolicy="no-referrer" />' # 🛡️ 画像割れ対策
                f'</a>'
            )
        return "No Image"
    display_thumbnail.short_description = "サムネイル"

    def name_summary_link(self, obj):
        """製品名をクリックでNext.js詳細ページへ飛ばす"""
        detail_url = f"{FRONTEND_PC_URL}/{obj.id}"
        name = obj.name[:35] + "..." if len(obj.name) > 35 else obj.name
        return mark_safe(
            f'<a href="{detail_url}" target="_blank" style="font-weight:bold; color:#007bff; text-decoration:none;">'
            f'{name} <small style="font-weight:normal; color:#999;">🔗</small>'
            f'</a>'
        )
    name_summary_link.short_description = "製品名 (LIVE)"

    def score_visual_tag(self, obj):
        avg = obj.spec_score or 0
        color = "#28a745" if avg > 70 else "#ffc107" if avg > 40 else "#dc3545"
        return mark_safe(
            f'<div style="width: 100px; background: #eee; height: 12px; border-radius: 6px; overflow: hidden;">'
            f'<div style="width: {avg}%; background: {color}; height: 100%;"></div>'
            f'</div>'
        )
    score_visual_tag.short_description = "AIスコア"

    def price_display(self, obj): 
        return f"¥{obj.price:,}" if obj.price else "---"
    price_display.short_description = "価格"

    def stock_status_tag(self, obj):
        # ステータスをタグ風のデザインに変更
        colors = {"instock": "#28a745", "outofstock": "#dc3545"}
        bg_color = colors.get(obj.stock_status, "#6c757d")
        return mark_safe(
            f'<span style="background: {bg_color}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold;">'
            f'{obj.stock_status.upper()}'
            f'</span>'
        )
    stock_status_tag.short_description = "在庫"

    def ai_status_tag(self, obj):
        if obj.ai_content:
            return mark_safe('<span style="background: #17a2b8; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">GEN_AI</span>')
        return mark_safe('<span style="color: #ccc; font-size: 10px;">PENDING</span>')
    ai_status_tag.short_description = "AI解析"
# -*- coding: utf-8 -*-
from django.contrib import admin
from django.utils.safestring import mark_safe
from ..models.pc_products import PCProduct, PriceHistory

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
    list_display = ('display_thumbnail', 'maker', 'name_summary', 'price_display', 'score_visual_tag', 'stock_status_tag', 'ai_status_tag', 'updated_at')
    search_fields = ('name', 'unique_id', 'description')
    filter_horizontal = ('attributes',)

    def score_visual_tag(self, obj):
        avg = obj.spec_score
        color = "#28a745" if avg > 70 else "#ffc107" if avg > 40 else "#dc3545"
        return mark_safe(f'<div style="width: 100px; background: #eee; height: 12px; border-radius: 6px; overflow: hidden;"><div style="width: {avg}px; background: {color}; height: 100%;"></div></div>')

    def display_thumbnail(self, obj):
        if obj.image_url: return mark_safe(f'<img src="{obj.image_url}" width="60" style="border-radius: 4px;" />')
        return "No Image"
    
    def price_display(self, obj): return f"¥{obj.price:,}" if obj.price else "---"
    def name_summary(self, obj): return obj.name[:35] + "..." if len(obj.name) > 35 else obj.name
    def stock_status_tag(self, obj):
        colors = {"instock": "#28a745", "outofstock": "#dc3545"}
        return mark_safe(f'<b style="color: {colors.get(obj.stock_status, "#6c757d")};">{obj.stock_status.upper()}</b>')
    def ai_status_tag(self, obj):
        return mark_safe('<span style="background: #17a2b8; color: white; padding: 2px 6px; border-radius: 4px;">GEN</span>') if obj.ai_content else "PENDING"
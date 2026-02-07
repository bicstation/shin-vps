# -*- coding: utf-8 -*-
from django.contrib import admin
from django.utils.safestring import mark_safe
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.urls import path
from ..models import AdultProduct

@admin.register(AdultProduct)
class AdultProductAdmin(admin.ModelAdmin):
    list_display = ('display_first_image', 'product_id_unique', 'title_summary', 'price_display', 'score_radar_tag', 'is_posted_tag', 'api_source', 'release_date')
    list_filter = ('is_active', 'is_posted', 'api_source', 'maker', 'release_date')
    search_fields = ('title', 'product_id_unique', 'product_description', 'ai_summary')
    filter_horizontal = ('genres', 'actresses', 'attributes')
    readonly_fields = ('created_at', 'updated_at', 'api_source', 'last_spec_parsed_at')

    fieldsets = (
        ('基本ステータス', {
            'fields': (('product_id_unique', 'api_source'), 'title', 'product_description', ('is_active', 'is_posted')),
        }),
        ('🧠 AI解析', {
            'fields': (('score_visual', 'score_story'), ('score_cost', 'score_erotic'), ('score_rarity', 'spec_score'), 'target_segment', 'ai_summary', 'ai_content'),
        }),
        ('🏷️ 分類・メディア', {
            'fields': (('maker', 'label'), ('director', 'series'), 'genres', 'actresses', 'attributes', 'sample_movie_url', 'image_url_list'),
        }),
    )

    def score_radar_tag(self, obj):
        val = obj.spec_score
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
# -*- coding: utf-8 -*-
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.safestring import mark_safe
from ..models import User, RawApiData

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

@admin.register(RawApiData)
class RawApiDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_source', 'created_at')
    readonly_fields = ('created_at',)
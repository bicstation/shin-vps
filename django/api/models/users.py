# -*- coding: utf-8 -*-
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    """
    カスタムユーザーモデル
    """
    SITE_GROUP_CHOICES = [
        ('general', '一般'),
        ('adult', 'アダルト'),
    ]

    # --- 衝突回避のための設定 ---
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="custom_user_set", # 名前を変更して衝突を回避
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_permission_set", # 名前を変更して衝突を回避
        related_query_name="user",
    )

    # --- 既存の追加フィールド ---
    site_group = models.CharField(
        max_length=20, 
        choices=SITE_GROUP_CHOICES, 
        default='general',
        verbose_name="サイト属性"
    )
    origin_domain = models.URLField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name="最終同期ドメイン"
    )
    profile_image = models.ImageField(
        upload_to='profiles/', 
        blank=True, 
        null=True, 
        verbose_name="プロフィール画像"
    )
    bio = models.TextField(
        max_length=500, 
        blank=True, 
        verbose_name="自己紹介"
    )

    # --- 一言コメント ---
    status_message = models.CharField(
        max_length=140, 
        blank=True, 
        verbose_name="一言コメント"
    )

    # --- 管理者用メモ ---
    admin_note = models.TextField(
        blank=True, 
        verbose_name="管理者用メモ"
    )

    class Meta:
        db_table = 'api_user'
        verbose_name = 'ユーザー'
        verbose_name_plural = 'ユーザー'

    def __str__(self):
        return self.username
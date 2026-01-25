# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/models/user.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    カスタムユーザーモデル
    標準のユーザー機能にプロフィール画像や自己紹介を追加。
    さらに、一般系・アダルト系のサイトグループ管理機能を持たせる。
    """
    # --- 既存のプロフィール関連 ---
    profile_image = models.ImageField('プロフィール画像', upload_to='profiles/', null=True, blank=True)
    bio = models.TextField('自己紹介', max_length=500, blank=True)
    is_pc_enthusiast = models.BooleanField('PC愛好家フラグ', default=False)

    # --- 🚀 4ドメイン・分離運用用の追加フィールド ---
    SITE_GROUPS = [
        ('general', '一般系 (BicStation/Saving)'),
        ('adult', 'アダルト系 (Tiper/AVFlash)'),
    ]
    site_group = models.CharField(
        'サイトグループ', 
        max_length=10, 
        choices=SITE_GROUPS, 
        default='general',
        help_text="一般サイトとアダルトサイトのログイン境界線として使用します"
    )
    
    origin_domain = models.CharField(
        '登録元ドメイン', 
        max_length=100, 
        blank=True,
        help_text="最初にユーザーが登録したサイトのドメイン"
    )

    class Meta:
        verbose_name = 'ユーザー'
        verbose_name_plural = 'ユーザー一覧'
        db_table = 'users_user' # テーブル名は維持

    def __str__(self):
        return f"{self.username} ({self.get_site_group_display()})"
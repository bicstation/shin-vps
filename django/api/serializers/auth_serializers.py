# -*- coding: utf-8 -*-
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    カスタムユーザー情報のシリアライザ
    
    サイト分離（一般/アダルト）を安全に行うため、site_group と origin_domain は
    読み取り専用として定義し、View側のロジックでのみ設定可能にしています。
    """
    password = serializers.CharField(
        write_only=True, 
        required=False, 
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password',
            'site_group', 'origin_domain', 'status_message',
            'profile_image', 'bio', 'is_staff', 'is_superuser', 'date_joined'
        )
        # 💡 site_group と origin_domain を読み取り専用に追加。
        # これにより、登録時の不正な書き換えを防止し、サーバー側の判定結果のみを返します。
        read_only_fields = (
            'id', 
            'site_group', 
            'origin_domain', 
            'is_staff', 
            'is_superuser', 
            'date_joined'
        )

    def create(self, validated_data):
        """
        ユーザー作成時のパスワードハッシュ化処理
        """
        password = validated_data.pop('password', None)
        # super().create() でモデルインスタンスを作成
        user = super().create(validated_data)
        
        # パスワードが提供されている場合はハッシュ化して保存
        if password:
            user.set_password(password)
            user.save()
            
        return user

    def update(self, instance, validated_data):
        """
        ユーザー更新時の処理（パスワード変更にも対応）
        """
        password = validated_data.pop('password', None)
        
        # 通常のフィールドを更新
        user = super().update(instance, validated_data)
        
        # パスワードが送信された場合のみ再セット
        if password:
            user.set_password(password)
            user.save()
            
        return user
# -*- coding: utf-8 -*-
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    カスタムユーザー情報のシリアライザ
    
    サイト分離（一般/アダルト）を安全に行うため、site_group と origin_domain は
    読み取り専用として定義し、View側のロジック（middleware判定等）でのみ設定可能にしています。
    """
    password = serializers.CharField(
        write_only=True, 
        required=False, 
        style={'input_type': 'password'},
        help_text="パスワードを変更する場合のみ入力してください。"
    )

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password',
            'site_group', 'origin_domain', 'status_message',
            'profile_image', 'bio', 'is_staff', 'is_superuser', 'date_joined'
        )
        # 💡 セキュリティ：サーバー側で自動決定すべきフィールドをユーザーが書き換えられないように保護
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
        # 💡 Django標準の UserManager を経由させることでバリデーションとハッシュ化を確実に実行
        if password:
            user = User.objects.create_user(**validated_data, password=password)
        else:
            user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        """
        ユーザー更新時の処理（パスワード変更にも対応）
        """
        password = validated_data.pop('password', None)
        
        # 通常のフィールドを更新（validated_dataから順にセット）
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # パスワードが送信された場合のみ再ハッシュ化してセット
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance
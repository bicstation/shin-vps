from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    JWT前提のユーザーシリアライザ（安全版）
    """

    password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'password',
            'is_staff',

            # 公開OKな情報だけ
            'site_group',
            'origin_domain',
            'status_message',
            'profile_image',
            'bio',
            'date_joined',
        )

        read_only_fields = (
            'id',
            'site_group',
            'origin_domain',
            'date_joined',
        )

    # ==========================================================
    # CREATE
    # ==========================================================
    def create(self, validated_data):
        password = validated_data.pop('password', None)

        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()
        return user

    # ==========================================================
    # UPDATE（安全制御）
    # ==========================================================
    def update(self, instance, validated_data):

        # 🔥 更新許可フィールドを限定（ここ重要）
        allowed_fields = [
            'email',
            'status_message',
            'profile_image',
            'bio',
        ]

        for attr, value in validated_data.items():
            if attr in allowed_fields:
                setattr(instance, attr, value)

        # パスワード変更
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])

        instance.save()
        return instance
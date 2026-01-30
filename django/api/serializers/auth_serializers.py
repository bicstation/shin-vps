# -*- coding: utf-8 -*-
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    カスタムユーザー情報のシリアライザ
    """
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password',
            'site_group', 'origin_domain', 'status_message',
            'profile_image', 'bio', 'is_staff', 'is_superuser', 'date_joined'
        )
        read_only_fields = ('id', 'is_staff', 'is_superuser', 'date_joined')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
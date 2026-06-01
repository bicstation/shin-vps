# /home/maya/shin-dev/shin-vps/django/api/models/runtime_models.py

# -*- coding: utf-8 -*-

from django.db import models

class ImageAudit(models.Model):

    entity_type = models.CharField(
        max_length=50,
        db_index=True
    )

    entity_id = models.BigIntegerField(
        null=True,
        blank=True
    )

    product_id_unique = models.CharField(
        max_length=255,
        blank=True,
        default="",
        db_index=True
    )

    image_url = models.URLField(
        max_length=2000,
        blank=True,
        null=True
    )

    image_status = models.CharField(
        max_length=50,
        default="unknown",
        db_index=True
    )

    image_valid = models.BooleanField(
        default=False
    )

    http_status = models.IntegerField(
        null=True,
        blank=True
    )

    width = models.IntegerField(
        null=True,
        blank=True
    )

    height = models.IntegerField(
        null=True,
        blank=True
    )

    failure_reason = models.TextField(
        blank=True,
        default=""
    )

    checked_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )
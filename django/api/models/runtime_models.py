# -*- coding: utf-8 -*-
# /api/models/runtime_models.py

from django.db import models


class ImageAudit(models.Model):
    """
    SHIN CORE LINX Image Runtime

    Backend が
    ユーザーへ提示可能なコンテンツかどうか
    の真実を管理する Runtime テーブル。

    Backend は画像の存在を保証しない。

    Backend はコンテンツ利用可否を保証する。

    Frontend は image_valid のみを参照し、
    表示方法は Frontend が決定する。

    Frontend は image_valid のみ参照する。

    Runtime は以下を記録する。

    - URL有効性
    - HTTP状態
    - CDNリダイレクト
    - Placeholder判定
    - ファイルサイズ
    - 画像サイズ
    """

    # -------------------------------------------------------------------------
    # 監査対象
    # -------------------------------------------------------------------------

    entity_type = models.CharField(
        max_length=50,
        db_index=True,
        help_text="adult_product / actress / maker 等"
    )

    entity_id = models.BigIntegerField(
        null=True,
        blank=True,
        help_text="監査対象ID"
    )

    product_id_unique = models.CharField(
        max_length=255,
        blank=True,
        default="",
        db_index=True,
        help_text="FANZA_xxx / DUGA_xxx 等"
    )

    # -------------------------------------------------------------------------
    # URL情報
    # -------------------------------------------------------------------------

    image_url = models.URLField(
        max_length=2000,
        blank=True,
        null=True,
        help_text="元画像URL"
    )

    final_url = models.URLField(
        max_length=2000,
        blank=True,
        default="",
        help_text="リダイレクト後URL"
    )

    # -------------------------------------------------------------------------
    # Runtime(Content Availability Authority)
    # -------------------------------------------------------------------------

    image_status = models.CharField(
        max_length=50,
        default="unknown",
        db_index=True,
        help_text=(
            "Backend Authority 状態。"
            "ユーザーへ提示可能なコンテンツかを示す。"
            "ok / placeholder / forbidden / "
            "404 / 410 / timeout / http_xxx"
        )
    )

    image_valid = models.BooleanField(
        default=False,
        help_text="Frontend が参照する表示可否"
    )

    failure_reason = models.TextField(
        blank=True,
        default="",
        help_text="失敗理由"
    )

    # -------------------------------------------------------------------------
    # HTTP監査
    # -------------------------------------------------------------------------

    http_status = models.IntegerField(
        null=True,
        blank=True,
        db_index=True
    )

    content_length = models.BigIntegerField(
        null=True,
        blank=True,
        help_text="Content-Length(bytes)"
    )

    # -------------------------------------------------------------------------
    # Image Metadata
    # -------------------------------------------------------------------------

    width = models.IntegerField(
        null=True,
        blank=True,
        help_text="画像幅(px)"
    )

    height = models.IntegerField(
        null=True,
        blank=True,
        help_text="画像高さ(px)"
    )

    # -------------------------------------------------------------------------
    # Runtime Timestamp
    # -------------------------------------------------------------------------

    checked_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
        help_text="最終監査日時"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # -------------------------------------------------------------------------
    # Meta
    # -------------------------------------------------------------------------

    class Meta:
        db_table = "image_audits"

        indexes = [
            models.Index(
                fields=["entity_type", "entity_id"]
            ),
            models.Index(
                fields=["image_status"]
            ),
            models.Index(
                fields=["http_status"]
            ),
            models.Index(
                fields=["checked_at"]
            ),
        ]

        ordering = ["-checked_at"]

    def __str__(self):
        return (
            f"{self.product_id_unique} "
            f"[{self.image_status}]"
        )
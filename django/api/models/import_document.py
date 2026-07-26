# /home/maya/shin-vps/django/api/models/import_document.py
# /home/maya/shin-vps/django/api/models/import_document.py

from django.db import models


class ImportDocument(models.Model):
    """
    Import Document

    ObservationをSHIN CORE LINX Import Contractへ
    翻訳した結果を保存する。

    Integration RuntimeはこのDocumentを入力とする。
    """

    # ==========================================================
    # Source
    # ==========================================================

    source_name = models.CharField(
        max_length=100,
        db_index=True,
    )

    document_type = models.CharField(
        max_length=50,
        db_index=True,
    )

    document_key = models.CharField(
        max_length=255,
        db_index=True,
    )

    # ==========================================================
    # Import Contract
    # ==========================================================

    contract = models.JSONField()

    # ==========================================================
    # Metadata
    # ==========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        db_table = "import_document"

        ordering = [
            "-created_at",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "source_name",
                    "document_type",
                    "document_key",
                ],
                name="unique_import_document",
            )
        ]

    def __str__(self):

        return (
            f"{self.source_name} "
            f"{self.document_type} "
            f"{self.document_key}"
        )
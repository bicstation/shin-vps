# /home/maya/shin-dev/shin-vps/django/api/models/acquisition_document.py

from django.db import models


class AcquisitionDocument(models.Model):
    """
    Raw Acquisition Document

    Reality Sourceから取得した生データをそのまま保存する。
    ObservationやImportは行わない。
    """

    # ==========================================================
    # Source
    # ==========================================================

    source_type = models.CharField(
        max_length=50,
        db_index=True,
        help_text="scraping / api / ftp / file",
    )

    source_name = models.CharField(
        max_length=100,
        db_index=True,
        help_text="geekom / lenovo / linkshare ...",
    )

    # ==========================================================
    # Document
    # ==========================================================

    document_type = models.CharField(
        max_length=50,
        db_index=True,
        help_text="product / category / listing",
    )

    document_key = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Source内で一意となるキー",
    )

    source_url = models.URLField(
        blank=True,
        default="",
    )

    # ==========================================================
    # Raw Content
    # ==========================================================

    content_type = models.CharField(
        max_length=100,
        help_text="text/html, application/json ...",
    )

    content = models.TextField()

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

        db_table = "acquisition_document"

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
                name="unique_acquisition_document",
            )
        ]

    def __str__(self):

        return (
            f"{self.source_name} "
            f"{self.document_type} "
            f"{self.document_key}"
        )
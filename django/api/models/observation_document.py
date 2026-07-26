# /home/maya/shin-dev/shin-vps/django/api/models/observation_document.py

from django.db import models


class ObservationDocument(models.Model):
    """
    Observation Document

    AcquisitionDocumentからRealityを観測した結果を保存する。
    Semantic生成やImportは行わない。
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
    # Observation
    # ==========================================================

    observation = models.JSONField()

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

        db_table = "observation_document"

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
                name="unique_observation_document",
            )
        ]

    def __str__(self):

        return (
            f"{self.source_name} "
            f"{self.document_type} "
            f"{self.document_key}"
        )
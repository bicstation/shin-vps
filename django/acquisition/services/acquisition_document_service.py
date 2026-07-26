# /home/maya/shin-dev/shin-vps/django/acquisition/services/acquisition_document_service.py
"""
acquisition_document_service.py

Acquisition Document Service

Reality Sourceから取得した生データを
AcquisitionDocumentへ保存するサービス。
"""

from api.models import AcquisitionDocument


class AcquisitionDocumentService:
    """
    Raw Acquisition Document Service
    """

    @staticmethod
    def save(
        *,
        source_type: str,
        source_name: str,
        document_type: str,
        document_key: str,
        source_url: str,
        content_type: str,
        content: str,
    ) -> AcquisitionDocument:
        """
        Save or Update Raw Acquisition Document.
        """

        document, _ = AcquisitionDocument.objects.update_or_create(

            source_name=source_name,
            document_type=document_type,
            document_key=document_key,

            defaults={

                "source_type": source_type,

                "source_url": source_url,

                "content_type": content_type,

                "content": content,

            },

        )

        return document
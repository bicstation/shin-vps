#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare FTP Acquire Runtime
# ============================================================================

from __future__ import annotations

import ftplib
import gzip

from api.models.acquisition_document import AcquisitionDocument

from ..settings import (
    FTP_HOST,
    FTP_PORT,
    FTP_USER,
    FTP_PASS,
    FTP_TIMEOUT,
)


class LinkShareFTPAcquireRuntime:
    """
    LinkShare FTP Acquire Runtime

    Responsibilities

    - Connect FTP
    - Download Reality
    - Decompress Transport
    - Persist Acquisition Document

    MUST NOT

    - Formatter
    - Observation
    - Mapping
    - Integration
    """

    # ------------------------------------------------------------------
    # FTP
    # ------------------------------------------------------------------

    def connect(
        self,
    ) -> ftplib.FTP:

        ftp = ftplib.FTP()

        ftp.connect(
            FTP_HOST,
            FTP_PORT,
            FTP_TIMEOUT,
        )

        ftp.login(
            FTP_USER,
            FTP_PASS,
        )

        ftp.set_pasv(True)

        return ftp

    # ------------------------------------------------------------------
    # Download
    # ------------------------------------------------------------------

    def download(
        self,
        ftp: ftplib.FTP,
        *,
        mid: str,
    ) -> AcquisitionDocument:

        filename = f"{mid}_3273700_mp.txt.gz"

        buffer = bytearray()

        ftp.retrbinary(
            f"RETR {filename}",
            buffer.extend,
        )

        # --------------------------------------------------------------
        # Transport -> Reality
        # --------------------------------------------------------------

        raw = gzip.decompress(
            bytes(buffer)
        )

        text = raw.decode(
            "utf-8",
            errors="replace",
        )

        document, _ = AcquisitionDocument.objects.update_or_create(

            source_name="linkshare",

            document_type="product",

            document_key=filename,

            defaults={

                "source_type": "ftp",

                "source_url": "",

                "content_type": "text/plain",

                "content": text,

            },

        )

        return document

    # ------------------------------------------------------------------
    # Runtime
    # ------------------------------------------------------------------

    def run(
        self,
        *,
        mid: str,
    ) -> list[AcquisitionDocument]:

        ftp = self.connect()

        try:

            document = self.download(
                ftp,
                mid=mid,
            )

            return [
                document,
            ]

        finally:

            ftp.quit()


# ============================================================================
# Runtime Entry Point
# ============================================================================

def main(
    *,
    mid: str,
) -> list[AcquisitionDocument]:

    runtime = LinkShareFTPAcquireRuntime()

    return runtime.run(
        mid=mid,
    )
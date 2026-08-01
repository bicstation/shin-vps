#!/usr/bin/env python3
# ============================================================================
# SHIN CORE LINX
# LinkShare FTP Acquire Runtime
# ============================================================================

from __future__ import annotations

import csv
import ftplib
import gzip
from pathlib import Path

from api.models.acquisition_document import AcquisitionDocument

from ..settings import (
    FTP_HOST,
    FTP_PASS,
    FTP_PORT,
    FTP_TIMEOUT,
    FTP_USER,
)


class LinkShareFTPAcquireRuntime:
    """
    LinkShare FTP Acquire Runtime

    Responsibilities

    - FTP Connection
    - Download Reality
    - Persist AcquisitionDocument
    - FTP File Listing
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
    # Advertiser Master
    # ------------------------------------------------------------------

    def load_advertisers(
        self,
    ) -> dict[str, str]:

        advertisers: dict[str, str] = {}

        path = (
            Path(__file__).parent
            / "advertisers.tsv"
        )

        if not path.exists():
            return advertisers

        with path.open(
            encoding="utf-8",
            newline="",
        ) as fp:

            reader = csv.DictReader(
                fp,
                delimiter="\t",
            )

            for row in reader:

                advertisers[
                    row["mid"]
                ] = row["site"]

        return advertisers

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

        raw = gzip.decompress(
            bytes(buffer),
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
    # FTP File List
    # ------------------------------------------------------------------

    def list_files(
        self,
    ) -> list[str]:

        advertisers = self.load_advertisers()

        ftp = self.connect()

        try:

            files = sorted(

                filename

                for filename in ftp.nlst()

                if filename.endswith(
                    "_mp.txt.gz",
                )

            )

            print()

            print("=" * 120)
            print(
                f"{'MID':<8}"
                f"{'SITE':<45}"
                f"{'SIZE':>12}  "
                f"FILE"
            )
            print("=" * 120)

            for filename in files:

                mid = filename.split(
                    "_",
                    1,
                )[0]

                site = advertisers.get(
                    mid,
                    "",
                )

                try:

                    size = ftp.size(
                        filename,
                    ) or 0

                except Exception:

                    size = 0

                print(

                    f"{mid:<8}"

                    f"{site[:45]:<45}"

                    f"{size / 1024 / 1024:10.1f} MB  "

                    f"{filename}"

                )

            print("=" * 120)
            print(
                f"TOTAL PRODUCT FILES : {len(files):,}"
            )
            print("=" * 120)

            return files

        finally:

            ftp.quit()

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

            return [

                self.download(
                    ftp,
                    mid=mid,
                )

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
# /home/maya/shin-dev/shin-vps/django/acquisition/sources/scraping/linkshare/ftp/acquire.py
# ============================================================================
# SHIN CORE LINX
# LinkShare FTP Acquire Runtime
# ============================================================================

import argparse
import ftplib
import gzip
import os
import re
import io
from pathlib import Path

FTP_HOST = os.getenv("LINKSHARE_FTP_HOST")
FTP_USER = os.getenv("LINKSHARE_BC_USER")
FTP_PASS = os.getenv("LINKSHARE_BC_PASS")

FTP_PORT = 21
FTP_TIMEOUT = 180

FULL_DATA_PATTERN = re.compile(r"(\d+)_3273700_mp\.txt\.gz$")
DELTA_DATA_PATTERN = re.compile(r"(\d+)_3273700_delta\.txt\.gz$")


class LinkShareFTPAcquireRuntime:

    def __init__(self, download_dir: str):
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # FTP
    # ------------------------------------------------------------------

    def connect(self) -> ftplib.FTP:

        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT, FTP_TIMEOUT)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)

        return ftp

    # ------------------------------------------------------------------
    # List
    # ------------------------------------------------------------------

    def list_files(self, ftp, mid: str | None = None):

        targets = []

        for name, facts in ftp.mlsd():

            if mid is not None and not name.startswith(f"{mid}_"):
                continue

            if FULL_DATA_PATTERN.match(name):
                targets.append(name)

            elif DELTA_DATA_PATTERN.match(name):
                targets.append(name)

        return sorted(targets)

    # ------------------------------------------------------------------
    # Download
    # ------------------------------------------------------------------

    def download(self, ftp, filename):

        gz_path = self.download_dir / filename

        with open(gz_path, "wb") as fp:
            ftp.retrbinary(
                f"RETR {filename}",
                fp.write,
            )

        return gz_path

    # ------------------------------------------------------------------
    # Extract
    # ------------------------------------------------------------------

    def extract(self, gz_path: Path):

        txt_path = gz_path.with_suffix("")

        with gzip.open(gz_path, "rb") as src:
            with open(txt_path, "wb") as dst:
                dst.write(src.read())

        return txt_path

    # ------------------------------------------------------------------
    # Run
    # ------------------------------------------------------------------

    def run(self, mid: str | None = None):

        print("🚀 LinkShare FTP Acquire Runtime")

        ftp = self.connect()

        try:

            files = self.list_files(
                ftp,
                mid=mid,
            )

            print(f"Found : {len(files)} files")

            acquisitions = []

            for filename in files:

                print(f"↓ {filename}")

                gz = self.download(ftp, filename)
                txt = self.extract(gz)

                acquisitions.append(txt)

            return acquisitions

        finally:

            ftp.quit()
    
    # ------------------------------------------------------------------
    # Advertiser
    # ------------------------------------------------------------------

    def peek_advertiser_name(self, filename):

        name = "Unknown"

        ftp = None

        try:

            ftp = self.connect()

            header = []

            def callback(data):

                header.append(data)

                if sum(len(x) for x in header) > 32768:
                    raise Exception("Stop")

            try:

                ftp.retrbinary(
                    f"RETR {filename}",
                    callback,
                )

            except Exception:
                pass

            with gzip.GzipFile(
                fileobj=io.BytesIO(b"".join(header))
            ) as gz:

                line = gz.readline().decode(
                    "utf-8",
                    errors="ignore",
                )

                if line.startswith("HDR"):

                    cols = line.strip().split("|")

                    if len(cols) > 2:
                        name = cols[2]

        finally:

            if ftp:

                try:
                    ftp.quit()
                except Exception:
                    ftp.close()

        return name


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="SHIN CORE LINX LinkShare FTP Acquire Runtime"
    )

    parser.add_argument(
        "--mid",
        type=str,
        help="対象MIDのみ取得",
    )

    parser.add_argument(
        "--list",
        action="store_true",
        help="取得対象ファイル一覧のみ表示",
    )

    args = parser.parse_args()

    runtime = LinkShareFTPAcquireRuntime(
        download_dir="/tmp/linkshare",
    )

    if args.list:

        ftp = runtime.connect()

        try:

            files = runtime.list_files(
                ftp,
                mid=args.mid,
            )

            print()
            print("MID      Advertiser")
            print("-----------------------------------------------")

            for filename in files:

                mid = filename.split("_")[0]

                advertiser = runtime.peek_advertiser_name(
                    filename,
                )

                print(
                    f"{mid:<8} {advertiser}"
                )

            print("-----------------------------------------------")
            print(f"Total : {len(files)}")

            print()
            print("===== LinkShare FTP Files =====")

            for filename in files:
                print(filename)

            print("--------------------------------")
            print(f"Total : {len(files)}")

        finally:

            ftp.quit()

    else:

        runtime.run(
            mid=args.mid,
        )
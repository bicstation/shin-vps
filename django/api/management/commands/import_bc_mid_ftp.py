import os
import re
import ftplib
import gzip
import csv
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from api.models import PCProduct

# ロガー設定
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'LinkShare FTPから製品データを取得し、PCProductモデルを更新します（Dell/ASUS対応版）'

    # --- 設定定数 ---
    FTP_HOST = "aftp.linksynergy.com"
    FTP_USER = os.getenv("LINKSHARE_BC_USER", "rkp_3273700")
    FTP_PASS = os.getenv("LINKSHARE_BC_PASS", "5OqF1NfuruvJlmuJXKQDRuzh")
    DOWNLOAD_DIR = "/tmp/pc_ftp_import"
    SID = "3273700"  # 共通のSID

    def add_arguments(self, parser):
        # 実行時にMIDを指定できるようにする
        parser.add_argument('--mid', type=str, help='Merchant ID (Dell:2557, ASUS:437088)', default='2557')

    def handle(self, *args, **options):
        target_mid = options['mid']
        # サイト名とメーカー名をMIDから判定
        site_info = {
            "2557": {"prefix": "dell", "maker": "Dell"},
            "437088": {"prefix": "asus", "maker": "ASUS"}
        }.get(target_mid, {"prefix": "etc", "maker": "Unknown"})

        self.stdout.write(self.style.SUCCESS(f"🚀 --- {site_info['maker']} FTP Import Start ({datetime.now()}) ---"))
        
        # 保存先ディレクトリ準備
        if not os.path.exists(self.DOWNLOAD_DIR):
            os.makedirs(self.DOWNLOAD_DIR)
        
        # FTP接続
        ftp = self._connect_ftp()
        if not ftp:
            return

        try:
            # ファイル名の決定（例: 437088_3273700_mp.txt.gz）
            target_filename = f"{target_mid}_{self.SID}_mp.txt.gz"
            local_gz_path = os.path.join(self.DOWNLOAD_DIR, target_filename)
            local_txt_path = local_gz_path.replace('.gz', '.txt')

            # ダウンロード実行
            self.stdout.write(f"📡 Downloading: {target_filename}")
            with open(local_gz_path, 'wb') as f:
                ftp.retrbinary(f'RETR {target_filename}', f.write)

            # 解凍処理
            self.stdout.write("🔓 Decompressing...")
            with gzip.open(local_gz_path, 'rb') as f_in:
                with open(local_txt_path, 'wb') as f_out:
                    f_out.write(f_in.read())

            # 解析とインポート
            self._parse_and_import(local_txt_path, target_mid, site_info)
            self.stdout.write(self.style.SUCCESS(f"✅ {site_info['maker']} Import Completed."))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Error during processing: {str(e)}"))
        finally:
            # ファイルのクリーンアップ
            if os.path.exists(local_gz_path): os.remove(local_gz_path)
            if os.path.exists(local_txt_path): os.remove(local_txt_path)
            if ftp: ftp.quit()

    def _parse_and_import(self, file_path: str, mid: str, site_info: dict):
        batch = []
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter='|')
            
            try:
                next(reader)  # HDR（ヘッダー）行をスキップ
            except StopIteration:
                return

            for row in reader:
                # 最小限のカラムチェックとフッター行(TRL)の回避
                if not row or row[0] == 'TRL' or len(row) < 18:
                    continue

                sku = row[2].strip()
                name = row[1].strip()
                category_path = row[17].strip()

                # 1. 価格の取得 (C14 = index 13)
                price_val = self._clean_price(row[13])

                # 2. 説明文の取得 (C10 または C11)
                raw_description = row[9].strip() or row[10].strip() or ""

                # 3. スペック抽出（正規表現ロジック）
                specs = self._extract_specs(name, raw_description)
                
                parts = []
                if specs['cpu']: parts.append(specs['cpu'])
                if specs['gpu']: parts.append(specs['gpu'])
                if specs['ram']: parts.append(f"{specs['ram']}GB RAM")
                if specs['ssd']: 
                    cap = specs['ssd']
                    s_str = f"{cap/1024}TB" if cap >= 1024 else f"{cap}GB"
                    parts.append(f"{s_str} SSD")
                
                # 4. descriptionカラムの構築
                if parts:
                    parsed_str = " / ".join(parts)
                    full_description = f"{parsed_str} / {raw_description}"
                else:
                    full_description = raw_description

                # 5. ジャンルの自動判定
                unified_genre = "PC"
                if any(x in name for x in ["PowerEdge", "サーバー"]) or "Server" in category_path:
                    unified_genre = "Server"
                elif any(x in name for x in ["Monitor", "モニター"]) or "Monitor" in category_path:
                    unified_genre = "Monitor"
                elif any(x in category_path for x in ["ノート", "Laptop", "Laptop"]):
                    unified_genre = "Laptop"

                # 6. インスタンス生成
                product = PCProduct(
                    unique_id=f"{site_info['prefix']}_{sku}",
                    site_prefix=site_info['prefix'],
                    maker=site_info['maker'],
                    name=name,
                    price=price_val,
                    url=row[8].strip(),
                    image_url=row[6].strip(),
                    affiliate_url=row[5].strip(),
                    description=full_description,
                    raw_genre=category_path,
                    unified_genre=unified_genre,
                    stock_status=row[23].strip() if len(row) > 23 else "在庫あり",
                    is_active=True,
                    updated_at=timezone.now()
                )
                batch.append(product)

                # 100件ごとにバルクアップサート
                if len(batch) >= 100:
                    self._bulk_upsert(batch)
                    batch = []

            if batch:
                self._bulk_upsert(batch)

    def _extract_specs(self, name: str, desc: str) -> Dict[str, Any]:
        """商品名と説明文からスペック情報を抽出"""
        text = f"{name} {desc}"
        cpu = re.search(r'(Core\s?i[3579]|Ryzen\s?[3579]|Ultra\s?\d|Snapdragon|Xeon|Celeron|Pentium)', text, re.I)
        gpu = re.search(r'(RTX\s?\d{4}|GTX\s?\d{4}|Radeon|Iris\s?Xe|Graphics)', text, re.I)
        ram = re.search(r'(\d+)\s?GB\s?(?:RAM|メモリ|DDR)', text, re.I)
        ssd = re.search(r'(\d+)\s?(GB|TB)\s?(?:SSD|NVMe|ストレージ|HDD)', text, re.I)

        ssd_val = 0
        if ssd:
            try:
                v = int(ssd.group(1))
                ssd_val = v * 1024 if ssd.group(2).upper() == 'TB' else v
            except: pass

        return {
            'cpu': cpu.group(1) if cpu else None,
            'gpu': gpu.group(1) if gpu else None,
            'ram': int(ram.group(1)) if ram else 0,
            'ssd': ssd_val
        }

    def _clean_price(self, p_str: str) -> int:
        """価格文字列を数値化"""
        try:
            nums = re.sub(r'[^\d.]', '', p_str)
            return int(float(nums))
        except (ValueError, TypeError):
            return 0

    def _bulk_upsert(self, batch: List[PCProduct]):
        """Djangoのupdate_or_createでバルク更新"""
        with transaction.atomic():
            for item in batch:
                PCProduct.objects.update_or_create(
                    unique_id=item.unique_id,
                    defaults={
                        'site_prefix': item.site_prefix,
                        'maker': item.maker,
                        'name': item.name,
                        'price': item.price,
                        'url': item.url,
                        'image_url': item.image_url,
                        'affiliate_url': item.affiliate_url,
                        'description': item.description,
                        'raw_genre': item.raw_genre,
                        'unified_genre': item.unified_genre,
                        'stock_status': item.stock_status,
                        'is_active': item.is_active,
                        'updated_at': item.updated_at,
                    }
                )

    def _connect_ftp(self) -> Optional[ftplib.FTP]:
        """FTP接続"""
        try:
            ftp = ftplib.FTP(self.FTP_HOST, timeout=60)
            ftp.login(self.FTP_USER, self.FTP_PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ FTP Connection Fail: {e}"))
            return None
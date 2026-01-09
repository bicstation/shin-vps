import os
import re
import ftplib
import gzip
import csv
import logging
import sys
from decimal import Decimal
from datetime import datetime
from typing import List, Dict, Any, Optional

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.conf import settings

# プロジェクトの実際のパスに合わせて調整してください
from api.models import PCProduct

# ロガー設定
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Dell FTPから製品データを取得し、スペックを解析してPCProductモデルにインポートします。'

    # --- 設定定数 ---
    FTP_HOST = "aftp.linksynergy.com"
    # .envから取得。デフォルトはBicstation(bc_)の設定
    FTP_USER = os.getenv("LINKSHARE_BC_USER", "rkp_3273700")
    FTP_PASS = os.getenv("LINKSHARE_BC_PASS", "5OqF1NfuruvJlmuJXKQDRuzh")
    
    DOWNLOAD_DIR = "/tmp/dell_ftp_import"
    DELL_MID = "37509" # デルのマーチャントID
    SID = "3273700"    # BicstationのSID
    EXPECTED_COLUMNS_COUNT = 38

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=None, help='処理する最大件数')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f"--- Dell FTP Import Start ({datetime.now()}) ---"))

        # 1. 準備
        if not os.path.exists(self.DOWNLOAD_DIR):
            os.makedirs(self.DOWNLOAD_DIR)

        # 2. FTP接続
        ftp = self._connect_ftp()
        if not ftp:
            return

        try:
            # 3. ファイル特定 (フルフィード)
            target_filename = f"{self.DELL_MID}_{self.SID}_mp.txt.gz"
            local_gz_path = os.path.join(self.DOWNLOAD_DIR, target_filename)
            local_txt_path = local_gz_path.replace('.gz', '.txt')

            # 4. ダウンロード
            self.stdout.write(f"📡 Downloading: {target_filename}")
            with open(local_gz_path, 'wb') as f:
                ftp.retrbinary(f'RETR {target_filename}', f.write)

            # 5. 解凍
            self.stdout.write("🔓 Decompressing...")
            with gzip.open(local_gz_path, 'rb') as f_in:
                with open(local_txt_path, 'wb') as f_out:
                    f_out.write(f_in.read())

            # 6. パースとDB保存
            self._parse_and_import(local_txt_path, options['limit'])

            self.stdout.write(self.style.SUCCESS("✅ Import Completed successfully."))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Critical Error: {str(e)}"))
            import traceback
            self.stderr.write(traceback.format_exc())

        finally:
            # クリーンアップ
            if os.path.exists(local_gz_path): os.remove(local_gz_path)
            if os.path.exists(local_txt_path): os.remove(local_txt_path)
            ftp.quit()

    def _connect_ftp(self) -> Optional[ftplib.FTP]:
        try:
            ftp = ftplib.FTP(self.FTP_HOST, timeout=60)
            ftp.login(self.FTP_USER, self.FTP_PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"FTP Connection Failed: {e}"))
            return None

    def _parse_and_import(self, file_path: str, limit: Optional[int]):
        batch = []
        count = 0

        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            # デルのフィードはパイプ区切り
            reader = csv.reader(f, delimiter='|')
            
            # HDR行のスキップ判定
            try:
                first_row = next(reader)
                if first_row[0] != 'HDR':
                    f.seek(0) # HDRがない場合は最初から
            except StopIteration:
                return

            for row in reader:
                if not row or row[0] == 'TRL': continue # フッター行スキップ
                if len(row) < self.EXPECTED_COLUMNS_COUNT: continue

                # マッピング
                sku = row[2].strip()          # C3: SKU
                product_name = row[1].strip()  # C2: Name
                aff_url = row[5].strip()      # C6: Affiliate URL
                prod_url = row[8].strip()     # C9: Product URL
                price_raw = row[12].strip()    # C13: Price
                raw_desc = row[3].strip()     # C4: Description
                category = row[17].strip()    # C18: Category Path

                # スペック解析
                specs = self._extract_specs(product_name, raw_desc)
                
                # descriptionカラム用のスラッシュ区切り文字列を構築
                # 例: "Core i7 / RTX 4060 / 16GB RAM / 1TB SSD"
                desc_parts = []
                if specs['cpu']: desc_parts.append(specs['cpu'])
                if specs['gpu']: desc_parts.append(specs['gpu'])
                if specs['ram']: desc_parts.append(f"{specs['ram']}GB RAM")
                if specs['ssd']: 
                    cap = specs['ssd']
                    ssd_str = f"{cap/1024}TB" if cap >= 1024 else f"{cap}GB"
                    desc_parts.append(f"{ssd_str} SSD")
                
                # 最終的な description
                formatted_desc = " / ".join(desc_parts) if desc_parts else raw_desc[:500]

                # PCProductインスタンス準備
                product = PCProduct(
                    unique_id=f"dell_{sku}",
                    site_prefix="dell",
                    maker="Dell",
                    name=product_name,
                    price=self._clean_price(price_raw),
                    url=prod_url,
                    affiliate_url=aff_url,
                    description=formatted_desc,
                    raw_genre=category,
                    stock_status="在庫あり",
                    is_active=True,
                    updated_at=timezone.now()
                )

                batch.append(product)
                count += 1

                if len(batch) >= 500:
                    self._bulk_upsert(batch)
                    self.stdout.write(f"  Processed {count} items...")
                    batch = []

                if limit and count >= limit:
                    break

            if batch:
                self._bulk_upsert(batch)

    def _extract_specs(self, name: str, desc: str) -> Dict[str, Any]:
        """商品名と説明文からスペックを抜き出す"""
        text = f"{name} {desc}"
        
        # CPU: Core i/Ryzen/Core Ultra
        cpu_pattern = r'(Core\s?i[3579]|Ryzen\s?[3579]|Core\s?Ultra\s?\d|Celeron|Pentium)'
        # GPU: RTX/GTX/Radeon/Intel Graphics
        gpu_pattern = r'(RTX\s?\d{4}|GTX\s?\d{4}|Radeon\s?\d{3,4}[M|S]?|Intel\s?Iris\s?Xe|Intel\s?Graphics)'
        # RAM: 8GB, 16GB...
        ram_pattern = r'(\d+)GB\s?(?:RAM|メモリ|DDR)'
        # SSD/Storage: 256GB, 1TB...
        ssd_pattern = r'(\d+)(GB|TB)\s?(?:SSD|NVMe|ストレージ|HDD)'

        cpu_match = re.search(cpu_pattern, text, re.I)
        gpu_match = re.search(gpu_pattern, text, re.I)
        ram_match = re.search(ram_pattern, text, re.I)
        ssd_match = re.search(ssd_pattern, text, re.I)

        ssd_val = 0
        if ssd_match:
            val = int(ssd_match.group(1))
            unit = ssd_match.group(2).upper()
            ssd_val = val * 1024 if unit == 'TB' else val

        return {
            'cpu': cpu_match.group(1) if cpu_match else None,
            'gpu': gpu_match.group(1) if gpu_match else None,
            'ram': int(ram_match.group(1)) if ram_match else 0,
            'ssd': ssd_val
        }

    def _clean_price(self, price_str: str) -> int:
        """価格文字列を整数に変換"""
        try:
            # 数字とドット以外を削除
            nums = re.sub(r'[^\d.]', '', price_str)
            return int(float(nums))
        except (ValueError, TypeError):
            return 0

    def _bulk_upsert(self, batch: List[PCProduct]):
        """unique_idをキーに更新または作成"""
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
                        'affiliate_url': item.affiliate_url,
                        'description': item.description,
                        'raw_genre': item.raw_genre,
                        'stock_status': item.stock_status,
                        'is_active': item.is_active,
                        'updated_at': item.updated_at,
                    }
                )
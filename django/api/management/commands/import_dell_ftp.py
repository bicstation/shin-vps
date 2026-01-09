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
    help = 'Dell FTP (MID:2557) から製品を取得し、PCProductに保存します（全件・ハイブリッド解析版）'

    # --- 設定定数 ---
    FTP_HOST = "aftp.linksynergy.com"
    FTP_USER = os.getenv("LINKSHARE_BC_USER", "rkp_3273700")
    FTP_PASS = os.getenv("LINKSHARE_BC_PASS", "5OqF1NfuruvJlmuJXKQDRuzh")
    DOWNLOAD_DIR = "/tmp/dell_ftp_import"
    DELL_MID = "2557"
    SID = "3273700"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f"--- Dell FTP Import Start ({datetime.now()}) ---"))
        
        # 準備
        if not os.path.exists(self.DOWNLOAD_DIR):
            os.makedirs(self.DOWNLOAD_DIR)
        
        # FTP接続
        ftp = self._connect_ftp()
        if not ftp:
            return

        try:
            target_filename = f"{self.DELL_MID}_{self.SID}_mp.txt.gz"
            local_gz_path = os.path.join(self.DOWNLOAD_DIR, target_filename)
            local_txt_path = local_gz_path.replace('.gz', '.txt')

            # ダウンロード
            self.stdout.write(f"📡 Downloading: {target_filename}")
            with open(local_gz_path, 'wb') as f:
                ftp.retrbinary(f'RETR {target_filename}', f.write)

            # 解凍
            self.stdout.write("🔓 Decompressing...")
            with gzip.open(local_gz_path, 'rb') as f_in:
                with open(local_txt_path, 'wb') as f_out:
                    f_out.write(f_in.read())

            # 解析とインポート
            self._parse_and_import(local_txt_path)
            self.stdout.write(self.style.SUCCESS("✅ Dell All-Product Import Completed."))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Error: {str(e)}"))
        finally:
            # クリーンアップ
            if os.path.exists(local_gz_path): os.remove(local_gz_path)
            if os.path.exists(local_txt_path): os.remove(local_txt_path)
            ftp.quit()

    def _parse_and_import(self, file_path: str):
        batch = []
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter='|')
            
            try:
                next(reader) # HDR行をスキップ
            except StopIteration:
                return

            for row in reader:
                # 最小限のカラムチェックとフッター行(TRL)の回避
                if not row or row[0] == 'TRL' or len(row) < 18:
                    continue

                name = row[1].strip()
                sku = row[2].strip()
                category_path = row[17].strip()

                # --- 1. 価格の取得 (C14 = index 13) ---
                price_val = self._clean_price(row[13])

                # --- 2. 生の説明文の取得 (C10 または C11) ---
                raw_description = row[9].strip() or row[10].strip() or ""

                # --- 3. スペック抽出 (商品名と説明文から) ---
                specs = self._extract_specs(name, raw_description)
                
                parts = []
                if specs['cpu']: parts.append(specs['cpu'])
                if specs['gpu']: parts.append(specs['gpu'])
                if specs['ram']: parts.append(f"{specs['ram']}GB RAM")
                if specs['ssd']: 
                    cap = specs['ssd']
                    s_str = f"{cap/1024}TB" if cap >= 1024 else f"{cap}GB"
                    parts.append(f"{s_str} SSD")
                
                # --- 4. descriptionカラムの構築 (解析結果 + 生テキスト) ---
                if parts:
                    parsed_str = " / ".join(parts)
                    # スペックが判明した場合は「スペック / 公式説明」の形式にする
                    full_description = f"{parsed_str} / {raw_description}"
                else:
                    # 判明しない場合は生データをそのまま保持
                    full_description = raw_description

                # --- 5. ジャンルの自動判定 (マニア向け分類) ---
                unified_genre = "PC"
                if "PowerEdge" in name or "サーバー" in category_path:
                    unified_genre = "Server"
                elif "モニター" in category_path or "Monitor" in name:
                    unified_genre = "Monitor"
                elif "ノート" in category_path or "Laptop" in category_path:
                    unified_genre = "Laptop"

                # --- 6. インスタンス生成 ---
                product = PCProduct(
                    unique_id=f"dell_{sku}",
                    site_prefix="dell",
                    maker="Dell",
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

                # 100件ごとにバルク処理
                if len(batch) >= 100:
                    self._bulk_upsert(batch)
                    batch = []

            if batch:
                self._bulk_upsert(batch)

    def _extract_specs(self, name: str, desc: str) -> Dict[str, Any]:
        """商品名と説明文から主要スペックを抜き出す正規表現"""
        text = f"{name} {desc}"
        
        # CPU: Core i/Ryzen/Ultra/Snapdragon/Xeon(サーバー用)
        cpu = re.search(r'(Core\s?i[3579]|Ryzen\s?[3579]|Ultra\s?\d|Snapdragon|Xeon|Celeron|Pentium)', text, re.I)
        # GPU: RTX/GTX/Radeon/Iris/Graphics
        gpu = re.search(r'(RTX\s?\d{4}|GTX\s?\d{4}|Radeon|Iris\s?Xe|Graphics)', text, re.I)
        # RAM: 「16GB」などを抽出
        ram = re.search(r'(\d+)\s?GB\s?(?:RAM|メモリ|DDR)', text, re.I)
        # SSD/HDD: 容量をTB/GBで抽出
        ssd = re.search(r'(\d+)\s?(GB|TB)\s?(?:SSD|NVMe|ストレージ|HDD)', text, re.I)

        ssd_val = 0
        if ssd:
            try:
                v = int(ssd.group(1))
                ssd_val = v * 1024 if ssd.group(2).upper() == 'TB' else v
            except:
                pass

        return {
            'cpu': cpu.group(1) if cpu else None,
            'gpu': gpu.group(1) if gpu else None,
            'ram': int(ram.group(1)) if ram else 0,
            'ssd': ssd_val
        }

    def _clean_price(self, p_str: str) -> int:
        """価格文字列から数値のみを抽出して整数化"""
        try:
            nums = re.sub(r'[^\d.]', '', p_str)
            return int(float(nums))
        except (ValueError, TypeError):
            return 0

    def _bulk_upsert(self, batch: List[PCProduct]):
        """unique_idをフックに更新または作成"""
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
        """FTP接続とログイン"""
        try:
            ftp = ftplib.FTP(self.FTP_HOST, timeout=60)
            ftp.login(self.FTP_USER, self.FTP_PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"FTP Connection Fail: {e}"))
            return None
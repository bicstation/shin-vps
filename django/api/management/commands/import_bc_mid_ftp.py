import os
import re
import ftplib
import gzip
import csv
import logging
import chardet  # 文字コード判定用
from datetime import datetime
from typing import List, Dict, Any, Optional

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from api.models import PCProduct

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'LinkShare FTPから製品データを取得し、PCProductモデルを更新します'

    FTP_HOST = "aftp.linksynergy.com"
    FTP_USER = os.getenv("LINKSHARE_BC_USER", "rkp_3273700")
    FTP_PASS = os.getenv("LINKSHARE_BC_PASS", "5OqF1NfuruvJlmuJXKQDRuzh")
    DOWNLOAD_DIR = "/tmp/pc_ftp_import"
    SID = "3273700"

    # MAKER_MAPを更新：NEC特選街(2470)を追加
    # キーワード「nec-biz」は manage.sh の maker 配列と一致させます
    MAKER_MAP = {
        # "13730": {"prefix": "nec-biz", "maker": "NEC-SOHO"}, # 2470 から 13730 へ変更
        "2543": {"prefix": "fujitsu", "maker": "FMV"},
        "2557": {"prefix": "dell", "maker": "Dell"},
        "3256": {"prefix": "eizo", "maker": "EIZO"},
        "35909": {"prefix": "hp", "maker": "HP"},
        "36508": {"prefix": "dynabook", "maker": "Dynabook"},
        "42368": {"prefix": "asus", "maker": "ASUS"},
        # "24172": {"prefix": "iodata", "maker": "I-O DATA"}, # 24172 から 43219 (最新) へ変更
        "2633": {"prefix": "sourcenext", "maker": "ソースネクスト"},
        "13786": {"prefix": "trendmicro", "maker": "トレンドマイクロ"},
    }

    def add_arguments(self, parser):
        parser.add_argument('--mid', type=str, help='Merchant ID', required=True)

    def handle(self, *args, **options):
        target_mid = options['mid']
        site_info = self.MAKER_MAP.get(target_mid, {"prefix": f"mid_{target_mid}", "maker": "Unknown"})

        self.stdout.write(self.style.SUCCESS(f"🚀 LinkShare Sync Started: {timezone.now()}"))
        
        if not os.path.exists(self.DOWNLOAD_DIR):
            os.makedirs(self.DOWNLOAD_DIR)
        
        ftp = self._connect_ftp()
        if not ftp: return

        try:
            target_filename = f"{target_mid}_{self.SID}_mp.txt.gz"
            local_gz_path = os.path.join(self.DOWNLOAD_DIR, target_filename)
            local_txt_path = local_gz_path.replace('.gz', '.txt')

            self.stdout.write(f"📡 Downloading: /{target_filename}")
            
            try:
                with open(local_gz_path, 'wb') as f:
                    ftp.retrbinary(f'RETR {target_filename}', f.write)
            except ftplib.error_perm as e:
                self.stderr.write(self.style.ERROR(f"❌ FTP File Not Found: {target_filename} ({e})"))
                return

            self.stdout.write("🔓 Decompressing...")
            with gzip.open(local_gz_path, 'rb') as f_in:
                # 文字化け対策：一度バイナリとしてすべて読み込む
                raw_content = f_in.read()
                
                # 文字コードの判定
                if target_mid == "2470":
                    # NEC特選街はCP932(Shift-JIS拡張)であることが確定しているため強制指定
                    encoding = 'cp932'
                else:
                    # 他のメーカーは自動判定を試みる
                    detected = chardet.detect(raw_content[:10000]) # 先頭1万文字で判定
                    encoding = detected.get('encoding', 'utf-8')
                
                self.stdout.write(f"ℹ️ Detected Encoding: {encoding} for MID {target_mid}")

                # 判定したエンコーディングでデコードして書き出し
                try:
                    decoded_text = raw_content.decode(encoding, errors='replace')
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"⚠️ Decode error with {encoding}, falling back to 'replace'"))
                    decoded_text = raw_content.decode('utf-8', errors='replace')

                with open(local_txt_path, 'w', encoding='utf-8') as f_out:
                    f_out.write(decoded_text)

            count = self._parse_and_import(local_txt_path, target_mid, site_info)
            self.stdout.write(self.style.SUCCESS(f"✅ {site_info['maker']} 完了: {count} 件"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Error: {str(e)}"))
            import traceback
            traceback.print_exc()
        finally:
            if os.path.exists(local_gz_path): os.remove(local_gz_path)
            if os.path.exists(local_txt_path): os.remove(local_txt_path)
            if ftp:
                try: ftp.quit()
                except: ftp.close()

    def _parse_and_import(self, file_path: str, mid: str, site_info: dict) -> int:
        batch = []
        import_count = 0
        # 解凍時にutf-8に変換済みなので、ここではutf-8で開く
        with open(file_path, 'r', encoding='utf-8') as f:
            header_line = f.readline()
            maker_name = site_info['maker']
            
            self.stdout.write(f"📂 Processing as: {maker_name}")

            reader = csv.reader(f, delimiter='|')
            for row in reader:
                if not row or row[0] in ['TRL', 'HDR'] or len(row) < 18:
                    continue

                sku = row[2].strip()
                name = row[1].strip()
                raw_desc = row[9].strip() or row[10].strip() or ""

                # スペック抽出
                specs = self._extract_specs(name, raw_desc)
                spec_parts = []
                if specs['cpu']: spec_parts.append(specs['cpu'])
                if specs['ram']: spec_parts.append(f"{specs['ram']}GB RAM")
                if specs['ssd']: 
                    cap = specs['ssd']
                    s_str = f"{cap/1024}TB" if cap >= 1024 else f"{cap}GB"
                    spec_parts.append(f"{s_str} SSD")
                
                parsed_spec_prefix = " / ".join(spec_parts)
                full_description = f"{parsed_spec_prefix} | {raw_desc}" if parsed_spec_prefix else raw_desc

                product = PCProduct(
                    unique_id=f"{site_info['prefix']}_{sku}",
                    site_prefix=site_info['prefix'],
                    maker=maker_name,
                    name=name,
                    price=self._clean_price(row[13]),
                    url=row[8].strip(),
                    image_url=row[6].strip(),
                    affiliate_url=row[5].strip(),
                    description=full_description,
                    raw_genre=row[17].strip(),
                    unified_genre="PC",
                    is_active=True,
                    updated_at=timezone.now()
                )
                batch.append(product)
                import_count += 1
                
                if len(batch) >= 100:
                    self._bulk_upsert(batch)
                    batch = []

            if batch: self._bulk_upsert(batch)
        return import_count

    def _extract_specs(self, name: str, desc: str) -> Dict[str, Any]:
        text = f"{name} {desc}"
        cpu = re.search(r'(Core\s?i[3579]|Ryzen\s?[3579]|Ultra\s?\d|Snapdragon|Xeon|Celeron|Pentium)', text, re.I)
        ram = re.search(r'(\d+)\s?GB\s?(?:RAM|メモリ|DDR)', text, re.I)
        ssd = re.search(r'(\d+)\s?(GB|TB)\s?(?:SSD|NVMe|ストレージ)', text, re.I)
        ssd_val = 0
        if ssd:
            try:
                v = int(ssd.group(1))
                ssd_val = v * 1024 if ssd.group(2).upper() == 'TB' else v
            except: pass
        return {'cpu': cpu.group(0) if cpu else None, 'ram': int(ram.group(1)) if ram else None, 'ssd': ssd_val}

    def _clean_price(self, p_str: str) -> int:
        try: return int(float(re.sub(r'[^\d.]', '', p_str)))
        except: return 0

    def _bulk_upsert(self, batch: List[PCProduct]):
        with transaction.atomic():
            for item in batch:
                PCProduct.objects.update_or_create(
                    unique_id=item.unique_id,
                    defaults={
                        'site_prefix': item.site_prefix, 'maker': item.maker, 'name': item.name,
                        'price': item.price, 'url': item.url, 'image_url': item.image_url,
                        'affiliate_url': item.affiliate_url, 'description': item.description,
                        'raw_genre': item.raw_genre, 'unified_genre': item.unified_genre,
                        'is_active': item.is_active, 'updated_at': item.updated_at,
                    }
                )

    def _connect_ftp(self) -> Optional[ftplib.FTP]:
        try:
            ftp = ftplib.FTP(self.FTP_HOST, timeout=60)
            ftp.login(self.FTP_USER, self.FTP_PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ FTP Connection Fail: {e}"))
            return None
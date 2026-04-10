import os
import re
import ftplib
import gzip
import csv
import math
import io
from datetime import datetime
from typing import List, Tuple, Dict, Any, Optional
from decimal import Decimal, InvalidOperation

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

# 🚨 モデルのインポート
try:
    from api.models.linkshare_products import LinkshareProduct
except ImportError:
    class LinkshareProduct:
        objects = None

# ==============================================================================
# 設定・定数
# ==============================================================================
FTP_HOST = os.getenv("LINKSHARE_FTP_HOST", "aftp.linksynergy.com")
# FTP_USER = os.getenv("LINKSHARE_BS_USER", "rkp_3750988")
# FTP_PASS = os.getenv("LINKSHARE_BS_PASS", "u5NetPVZEAhABD7HuW2VRymP")
FTP_USER = os.getenv("LINKSHARE_BC_USER", "rkp_3273700")
FTP_PASS = os.getenv("LINKSHARE_BC_PASS", "5OqF1NfuruvJlmuJXKQDRuzh")

FTP_PORT = 21
FTP_TIMEOUT = 180
DOWNLOAD_DIR = "/tmp/ftp_downloads"

FULL_DATA_PATTERN = re.compile(r"(\d+)_3273700_mp\.txt\.gz$")
DELTA_DATA_PATTERN = re.compile(r"(\d+)_3273700_delta\.txt\.gz$")

FIXED_DELIMITER = '|'
EXPECTED_COLUMNS_COUNT = 38
DATE_FORMAT = '%Y%m%d %H:%M:%S'
DATE_REGEX = re.compile(r'^\d{8} \d{2}:\d{2}:\d{2}$')

FIELD_MAPPING = {
    'C1': {'DB_FIELD': 'link_id', 'TYPE': 'str'},
    'C2': {'DB_FIELD': 'manufacturer_name_fallback', 'TYPE': 'str'},
    'C3': {'DB_FIELD': 'sku', 'TYPE': 'str'},
    'C4': {'DB_FIELD': 'product_name', 'TYPE': 'str'}, 
    'C5': {'DB_FIELD': 'primary_category', 'TYPE': 'str'},
    'C6': {'DB_FIELD': 'buy_url', 'TYPE': 'str'},
    'C7': {'DB_FIELD': 'image_url', 'TYPE': 'str'},
    'C8': {'DB_FIELD': 'product_url', 'TYPE': 'str'},
    'C9': {'DB_FIELD': 'short_description', 'TYPE': 'str'},
    'C10': {'DB_FIELD': 'description', 'TYPE': 'str'},
    'C11': {'DB_FIELD': 'discount_amount', 'TYPE': 'str'},
    'C12': {'DB_FIELD': 'discount_type', 'TYPE': 'str'},
    'C13': {'DB_FIELD': 'retail_price', 'TYPE': 'Decimal'},
    'C14': {'DB_FIELD': 'sale_price', 'TYPE': 'Decimal'},
    'C15': {'DB_FIELD': 'begin_date', 'TYPE': 'datetime'},
    'C16': {'DB_FIELD': 'end_date', 'TYPE': 'datetime'},
    'C17': {'DB_FIELD': 'brand_name', 'TYPE': 'str'},
    'C18': {'DB_FIELD': 'shipping', 'TYPE': 'Decimal'},
    'C19': {'DB_FIELD': 'keywords', 'TYPE': 'str'},
    'C20': {'DB_FIELD': 'mpn', 'TYPE': 'str'},
    'C21': {'DB_FIELD': 'manufacturer_name', 'TYPE': 'str'},
    'C22': {'DB_FIELD': 'shipping_information', 'TYPE': 'str'},
    'C23': {'DB_FIELD': 'availability', 'TYPE': 'str'},
    'C24': {'DB_FIELD': 'universal_product_code', 'TYPE': 'str'},
    'C25': {'DB_FIELD': 'class_id', 'TYPE': 'str'},
    'C26': {'DB_FIELD': 'currency', 'TYPE': 'str'},
    'C27': {'DB_FIELD': 'm1', 'TYPE': 'str'},
    'C28': {'DB_FIELD': 'pixel_url', 'TYPE': 'str'},
    'C29': {'DB_FIELD': 'attribute_1', 'TYPE': 'str'},
    'C30': {'DB_FIELD': 'attribute_2', 'TYPE': 'str'},
    'C31': {'DB_FIELD': 'attribute_3', 'TYPE': 'str'},
    'C32': {'DB_FIELD': 'attribute_4', 'TYPE': 'str'},
    'C33': {'DB_FIELD': 'attribute_5', 'TYPE': 'str'},
    'C34': {'DB_FIELD': 'attribute_6', 'TYPE': 'str'},
    'C35': {'DB_FIELD': 'attribute_7', 'TYPE': 'str'},
    'C36': {'DB_FIELD': 'attribute_8', 'TYPE': 'str'},
    'C37': {'DB_FIELD': 'attribute_9', 'TYPE': 'str'},
    'C38': {'DB_FIELD': 'attribute_10', 'TYPE': 'str'},
}

# ==============================================================================
# ユーティリティ
# ==============================================================================
def human_readable_size(size_bytes: int) -> str:
    if size_bytes == 0: return "0B"
    size_name = ("B", "KB", "MB", "GB")
    i = int(math.floor(math.log(size_bytes, 1024)))
    return f"{round(size_bytes / pow(1024, i), 2)} {size_name[i]}"

def safe_cast(value: str, target_type: str) -> Optional[Any]:
    if not value or value.strip().lower() in ('null', 'none', ''): return None
    v = value.strip()
    try:
        if target_type == 'Decimal': 
            return Decimal(v.replace(',', '').replace('$', '').replace('¥', ''))
        if target_type == 'datetime':
            if DATE_REGEX.match(v): 
                return datetime.strptime(v, DATE_FORMAT).replace(tzinfo=timezone.utc)
            return None
    except (InvalidOperation, ValueError): return None
    return v

def get_valid_model_fields(model) -> List[str]:
    if not model or not hasattr(model, '_meta'): return []
    return [f.name for f in model._meta.get_fields()]

def get_ftp_connection():
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, FTP_TIMEOUT)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    return ftp

def peek_advertiser_name(filename: str) -> str:
    """別セッションでファイルのHDR行だけを取得する"""
    name = "Unknown"
    ftp = None
    try:
        ftp = get_ftp_connection()
        header_peek = []
        def peek_cb(data):
            header_peek.append(data)
            if sum(len(b) for b in header_peek) > 16384: raise Exception("PeekDone")
        try: ftp.retrbinary(f'RETR {filename}', peek_cb)
        except: pass
        
        with gzip.GzipFile(fileobj=io.BytesIO(b"".join(header_peek))) as gz:
            line = gz.readline().decode('utf-8', errors='ignore')
            if line.startswith('HDR'):
                cols = line.strip().split(FIXED_DELIMITER)
                if len(cols) > 2: name = cols[2]
    except:
        pass
    finally:
        if ftp:
            try: ftp.quit()
            except: ftp.close()
    return name

# ==============================================================================
# コアロジック
# ==============================================================================
def _display_mapping_for_first_row(row_list: List[str]):
    print("\n--- 最初のデータ行のパースマッピング (デバッグ) ---")
    for i in range(min(len(row_list), EXPECTED_COLUMNS_COUNT)):
        col = f'C{i+1}'
        field = FIELD_MAPPING.get(col, {}).get('DB_FIELD', 'N/A')
        val = row_list[i][:50]
        print(f"{col:<5} | {field:<30} | {val}")

def _parse_single_row(row_list: List[str], mid: str, valid_fields: List[str]) -> Optional[Dict[str, Any]]:
    if len(row_list) != EXPECTED_COLUMNS_COUNT: return None
    data = {'merchant_id': mid, 'created_at': timezone.now(), 'updated_at': timezone.now()}
    
    for i, (col, mapping) in enumerate(FIELD_MAPPING.items()):
        raw = row_list[i]
        field = mapping['DB_FIELD']
        if field not in valid_fields and field not in ['manufacturer_name_fallback', 'universal_product_code']:
            continue
        if field == 'manufacturer_name_fallback':
            if 'manufacturer_name' in valid_fields and not data.get('manufacturer_name'):
                data['manufacturer_name'] = raw.strip()
        else:
            data[field] = safe_cast(raw, mapping['TYPE'])
    return data

def _bulk_import_products(mid: str, product_data_list: List[Dict[str, Any]]) -> Tuple[int, int, int]:
    if not product_data_list or not LinkshareProduct.objects: return 0, 0, 0
    valid_fields = get_valid_model_fields(LinkshareProduct)
    sku_map = {d['sku']: d for d in product_data_list if d.get('sku')}
    existing = {p.sku: p for p in LinkshareProduct.objects.filter(merchant_id=mid, sku__in=sku_map.keys())}
    
    to_create, to_update = [], []
    ignore_on_update = {'id', 'sku', 'merchant_id', 'created_at'}
    sample_data = product_data_list[0]
    update_fields = [f for f in valid_fields if f in sample_data and f not in ignore_on_update]

    for sku, data in sku_map.items():
        clean_data = {k: v for k, v in data.items() if k in valid_fields}
        if sku in existing:
            obj = existing[sku]
            is_diff = any(clean_data.get(k) != getattr(obj, k) for k in update_fields if k in clean_data)
            if is_diff:
                for k in update_fields:
                    if k in clean_data: setattr(obj, k, clean_data[k])
                to_update.append(obj)
        else:
            to_create.append(LinkshareProduct(**clean_data))

    if to_create: LinkshareProduct.objects.bulk_create(to_create, batch_size=2000)
    if to_update: LinkshareProduct.objects.bulk_update(to_update, update_fields, batch_size=2000)
    return len(to_create) + len(to_update), len(to_create), len(to_update)

# ==============================================================================
# Django Command
# ==============================================================================
class Command(BaseCommand):
    help = 'Import product data from LinkShare FTP'

    def add_arguments(self, parser):
        parser.add_argument('--mid', type=str, help='特定商材IDのみ処理')
        parser.add_argument('--limit', type=int, help='処理するファイル数を制限')
        parser.add_argument('--list', action='store_true', help='一覧表示モード')

    def handle(self, *args, **options):
        self.stdout.write("--- LinkShare Import Logic Start ---")
        if not os.path.exists(DOWNLOAD_DIR): os.makedirs(DOWNLOAD_DIR)
        valid_model_fields = get_valid_model_fields(LinkshareProduct)

        # 1. ファイル一覧の取得
        all_remote_files = []
        ftp = None
        try:
            ftp = get_ftp_connection()
            for name, facts in ftp.mlsd():
                match = FULL_DATA_PATTERN.match(name) or DELTA_DATA_PATTERN.match(name)
                if match:
                    mid_id = match.group(1)
                    if options['mid'] and mid_id != options['mid']: continue
                    all_remote_files.append((mid_id, name, int(facts.get('size', 0))))
        except Exception as e:
            self.stderr.write(f"❌ Initial FTP Error: {e}")
            return
        finally:
            if ftp:
                try: ftp.quit()
                except: ftp.close()

        if not all_remote_files:
            self.stdout.write("ℹ️ No target files found.")
            return

        # 2. メインループ
        target_files = all_remote_files
        if options['limit']: target_files = target_files[:options['limit']]

        for mid, filename, file_size in target_files:
            advertiser_name = peek_advertiser_name(filename)

            if options['list']:
                self.stdout.write(f"{mid:<10} | {advertiser_name[:35]:<35} | {human_readable_size(file_size):<10} | {filename}")
                continue

            self.stdout.write(f"\n🚀 [MID: {mid}] Processing {filename} ({human_readable_size(file_size)})...")
            self.stdout.write(f"ℹ️ Advertiser: {advertiser_name}")

            gz_p = os.path.join(DOWNLOAD_DIR, filename)
            txt_p = gz_p.replace('.gz', '.txt')

            # 再接続してダウンロード実行
            ftp = None
            try:
                ftp = get_ftp_connection()
                with open(gz_p, 'wb') as f: ftp.retrbinary(f'RETR {filename}', f.write)
            except Exception as e:
                self.stderr.write(f"❌ Download Error for {filename}: {e}")
                continue
            finally:
                if ftp:
                    try: ftp.quit()
                    except: ftp.close()

            # 解凍
            with gzip.open(gz_p, 'rb') as f_in, open(txt_p, 'w', encoding='utf-8', errors='ignore') as f_out:
                for line in f_in:
                    f_out.write(line.decode('utf-8', errors='ignore'))
            
            # インポート
            total_saved, parsed_count = 0, 0
            first_row_logged, batch = False, []

            with transaction.atomic():
                with open(txt_p, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f, delimiter=FIXED_DELIMITER)
                    try:
                        hdr = next(reader)
                        if hdr[0] != 'HDR': f.seek(0); reader = csv.reader(f, delimiter=FIXED_DELIMITER)
                    except StopIteration: continue

                    for row in reader:
                        if len(row) != EXPECTED_COLUMNS_COUNT: continue
                        parsed_count += 1
                        if not first_row_logged:
                            _display_mapping_for_first_row(row)
                            first_row_logged = True
                        
                        rec = _parse_single_row(row, mid, valid_model_fields)
                        if rec and rec.get('sku'): batch.append(rec)
                        
                        if len(batch) >= 5000:
                            s, c, u = _bulk_import_products(mid, batch)
                            total_saved += s
                            self.stdout.write(f"⏳ Bulk Save: {total_saved:,} records (New:{c}, Upd:{u})")
                            batch = []
                    
                    if batch:
                        s, c, u = _bulk_import_products(mid, batch)
                        total_saved += s

            if os.path.exists(gz_p): os.remove(gz_p)
            if os.path.exists(txt_p): os.remove(txt_p)
            self.stdout.write(self.style.SUCCESS(f"✅ [MID: {mid}] Completed. Total: {total_saved:,}"))

        self.stdout.write("\n🏁 All processes finished.")
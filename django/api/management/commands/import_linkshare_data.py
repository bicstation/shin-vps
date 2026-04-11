import os
import re
import ftplib
import gzip
import csv
import math
import io
import json
from datetime import datetime
from typing import List, Tuple, Dict, Any, Optional
from decimal import Decimal, InvalidOperation

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

# 🚨 モデルのインポート
from api.models.linkshare_products import LinkshareProduct

# ==============================================================================
# 設定・定数
# ==============================================================================
FTP_HOST = os.getenv("LINKSHARE_FTP_HOST", "aftp.linksynergy.com")
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

# 標準的なLinkShareのカラム定義マッピング
FIELD_MAPPING = {
    'C1': {'DB_FIELD': 'link_id', 'TYPE': 'str'},
    'C2': {'DB_FIELD': 'manufacturer_name_fallback', 'TYPE': 'str'},
    'C3': {'DB_FIELD': 'sku', 'TYPE': 'str'},
    'C4': {'DB_FIELD': 'product_name_orig', 'TYPE': 'str'},
    'C5': {'DB_FIELD': 'primary_category', 'TYPE': 'str'},
    'C6': {'DB_FIELD': 'buy_url', 'TYPE': 'str'},
    'C7': {'DB_FIELD': 'image_url', 'TYPE': 'str'},
    'C8': {'DB_FIELD': 'product_url', 'TYPE': 'str'},
    'C9': {'DB_FIELD': 'short_description', 'TYPE': 'str'},
    'C10': {'DB_FIELD': 'description', 'TYPE': 'str'},
    'C13': {'DB_FIELD': 'retail_price', 'TYPE': 'Decimal'},
    'C14': {'DB_FIELD': 'sale_price', 'TYPE': 'Decimal'},
    'C17': {'DB_FIELD': 'brand_name', 'TYPE': 'str'},
    'C21': {'DB_FIELD': 'manufacturer_name', 'TYPE': 'str'},
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
            clean_v = re.sub(r'[^\d.]', '', v)
            return Decimal(clean_v) if clean_v else None
        if target_type == 'datetime':
            if DATE_REGEX.match(v): 
                return datetime.strptime(v, DATE_FORMAT).replace(tzinfo=timezone.utc)
            return None
    except (InvalidOperation, ValueError): return None
    return v

def get_ftp_connection():
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, FTP_TIMEOUT)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    return ftp

def peek_advertiser_name(filename: str) -> str:
    name = "Unknown"
    ftp = None
    try:
        ftp = get_ftp_connection()
        header_peek = []
        def peek_cb(data):
            header_peek.append(data)
            if sum(len(b) for b in header_peek) > 32768: raise Exception("PeekDone")
        try: ftp.retrbinary(f'RETR {filename}', peek_cb)
        except: pass
        
        with gzip.GzipFile(fileobj=io.BytesIO(b"".join(header_peek))) as gz:
            line = gz.readline().decode('utf-8', errors='ignore')
            if line.startswith('HDR'):
                cols = line.strip().split(FIXED_DELIMITER)
                if len(cols) > 2: name = cols[2]
    except: pass
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
        field = FIELD_MAPPING.get(col, {}).get('DB_FIELD', col)
        val = row_list[i][:50]
        print(f"{col:<5} | {field:<30} | {val}")

def _parse_single_row(row_list: List[str], mid: str, valid_fields: List[str]) -> Optional[Dict[str, Any]]:
    if len(row_list) < 5: return None 
    
    # 全カラムを構造化
    full_parsed_dict = {}
    for i in range(len(row_list)):
        col_key = f'C{i+1}'
        field_label = FIELD_MAPPING.get(col_key, {}).get('DB_FIELD', col_key)
        val = row_list[i].strip()
        full_parsed_dict[field_label] = val

    # DB保存用データ
    data = {
        'merchant_id': mid, 
        'api_source': 'ftp',
        # 🌟 修正箇所: JSONFieldには辞書をそのまま渡す（Djangoがシリアライズを担当）
        'raw_csv_data': full_parsed_dict, 
        'updated_at': timezone.now()
    }
    
    # 名称の最適化
    name_c2 = full_parsed_dict.get('manufacturer_name_fallback', '')
    name_c4 = full_parsed_dict.get('product_name_orig', '')
    data['product_name'] = name_c2 if name_c2 else name_c4

    # 価格の統合と型変換
    s_price = safe_cast(full_parsed_dict.get('sale_price', ''), 'Decimal')
    r_price = safe_cast(full_parsed_dict.get('retail_price', ''), 'Decimal')
    data['price'] = s_price if s_price is not None else r_price

    # 個別フィールドの流し込み
    for col_key, mapping in FIELD_MAPPING.items():
        field_name = mapping['DB_FIELD']
        if field_name in valid_fields and field_name not in data:
            data[field_name] = safe_cast(full_parsed_dict.get(field_name, ''), mapping['TYPE'])

    return data

def _bulk_import_products(mid: str, product_data_list: List[Dict[str, Any]]) -> Tuple[int, int, int]:
    if not product_data_list: return 0, 0, 0
    valid_fields = [f.name for f in LinkshareProduct._meta.get_fields()]
    
    sku_map = {d['sku']: d for d in product_data_list if d.get('sku')}
    existing = {p.sku: p for p in LinkshareProduct.objects.filter(merchant_id=mid, sku__in=sku_map.keys())}
    
    to_create, to_update = [], []
    update_fields = ['product_name', 'price', 'image_url', 'product_url', 'raw_csv_data', 'updated_at', 'is_active']

    for sku, data in sku_map.items():
        clean_data = {k: v for k, v in data.items() if k in valid_fields}
        if sku in existing:
            obj = existing[sku]
            for k in update_fields:
                if k in clean_data: setattr(obj, k, clean_data[k])
            to_update.append(obj)
        else:
            to_create.append(LinkshareProduct(**clean_data))

    if to_create: LinkshareProduct.objects.bulk_create(to_create, batch_size=1000)
    if to_update: LinkshareProduct.objects.bulk_update(to_update, update_fields, batch_size=1000)
    
    return len(to_create) + len(to_update), len(to_create), len(to_update)

# ==============================================================================
# Django Command
# ==============================================================================
class Command(BaseCommand):
    help = 'Import LinkShare FTP data with proper JSONField handling'

    def add_arguments(self, parser):
        parser.add_argument('--mid', type=str, help='特定MIDのみ処理')
        parser.add_argument('--limit', type=int, help='ファイル数制限')
        parser.add_argument('--list', action='store_true', help='ファイル一覧を表示')

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("--- LinkShare Import Logic Start ---"))
        if not os.path.exists(DOWNLOAD_DIR): os.makedirs(DOWNLOAD_DIR)
        valid_model_fields = [f.name for f in LinkshareProduct._meta.get_fields()]

        all_remote_files = []
        try:
            ftp = get_ftp_connection()
            for name, facts in ftp.mlsd():
                if FULL_DATA_PATTERN.match(name) or DELTA_DATA_PATTERN.match(name):
                    mid_id = name.split('_')[0]
                    if options['mid'] and mid_id != options['mid']: continue
                    all_remote_files.append((mid_id, name, int(facts.get('size', 0))))
            ftp.quit()
        except Exception as e:
            self.stderr.write(f"❌ FTP Error: {e}"); return

        if not all_remote_files:
            self.stdout.write("ℹ️ No target files found."); return

        target_files = all_remote_files[:options['limit']] if options['limit'] else all_remote_files

        if options['list']:
            for mid, filename, size in target_files:
                name = peek_advertiser_name(filename)
                self.stdout.write(f"{mid:<10} | {name[:30]:<30} | {human_readable_size(size)}")
            return

        for mid, filename, size in target_files:
            advertiser_name = peek_advertiser_name(filename)
            self.stdout.write(self.style.HTTP_INFO(f"\n🚀 [MID: {mid}] {advertiser_name}"))
            
            gz_path = os.path.join(DOWNLOAD_DIR, filename)
            txt_path = gz_path.replace('.gz', '.txt')

            try:
                ftp = get_ftp_connection()
                with open(gz_path, 'wb') as f: ftp.retrbinary(f'RETR {filename}', f.write)
                ftp.quit()

                with gzip.open(gz_path, 'rb') as f_in, open(txt_path, 'w', encoding='utf-8', errors='ignore') as f_out:
                    for line in f_in: f_out.write(line.decode('utf-8', errors='ignore'))

                total_count, batch = 0, []
                with open(txt_path, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f, delimiter=FIXED_DELIMITER)
                    try:
                        hdr = next(reader)
                        if hdr[0] != 'HDR': f.seek(0)
                    except StopIteration: continue

                    first_row_logged = False
                    for row in reader:
                        if len(row) < 5 or row[0] == 'TRL': continue
                        
                        if not first_row_logged:
                            _display_mapping_for_first_row(row)
                            first_row_logged = True
                        
                        rec = _parse_single_row(row, mid, valid_model_fields)
                        if rec and rec.get('sku'): batch.append(rec)
                        
                        if len(batch) >= 5000:
                            s, c, u = _bulk_import_products(mid, batch)
                            total_count += s
                            self.stdout.write(f"⏳ Progress: {total_count:,} records...")
                            batch = []

                    if batch:
                        s, c, u = _bulk_import_products(mid, batch)
                        total_count += s

                self.stdout.write(self.style.SUCCESS(f"✅ Success: {total_count:,} records updated."))

            except Exception as e:
                self.stderr.write(f"❌ Error in {filename}: {e}")
            finally:
                if os.path.exists(gz_path): os.remove(gz_path)
                if os.path.exists(txt_path): os.remove(txt_path)

        self.stdout.write(self.style.MIGRATE_LABEL("\n🏁 All processes finished."))
# /home/maya/shin-vps/django/api/management/commands/import_linkshare_data.py

import os
import re
import ftplib
import time
import gzip
import csv
import traceback
import sys
import subprocess
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional, Set
from decimal import Decimal, InvalidOperation
import math 

# Djangoのコア機能とモデルをインポート
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction, IntegrityError 
from django.utils import timezone
from django.conf import settings 

# 🚨 モデルのダミー定義 (handle実行前のグローバルスコープでのNameErrorを回避するため)
class DummyModel:
    """handle実行前のグローバルスコープでのNameErrorを回避するためのダミー定義"""
    objects = None
    def __init__(self, **kwargs): pass
    # LinkshareProduct が持つことが想定される属性を追加 (hasattrチェック用)
    id = None
    merchant_id = None
    created_at = None
    updated_at = None
    link_id = None
    product_name = None
    sku = None
    primary_category = None
    sub_category = None
    product_url = None
    image_url = None
    buy_url = None
    short_description = None
    description = None
    discount_amount = None
    discount_type = None
    sale_price = None
    retail_price = None
    begin_date = None
    end_date = None
    brand_name = None
    shipping = None
    keywords = None
    manufacturer_part_number = None
    manufacturer_name = None
    shipping_information = None
    availability = None
    universal_product_code = None
    class_id = None
    currency = None
    m1 = None
    pixel_url = None
    attribute_1 = None
    attribute_2 = None
    attribute_3 = None
    attribute_4 = None
    attribute_5 = None
    attribute_6 = None
    attribute_7 = None
    attribute_8 = None
    attribute_9 = None
    attribute_10 = None
    # ❌ 修正: api_source フィールドはモデルにないため削除
    
LinkshareProduct = DummyModel

# ==============================================================================
# 接続・ファイル設定 (定数)
# ==============================================================================
# 環境変数がない場合のデフォルト値を設定
FTP_HOST = os.getenv("LINKSHARE_FTP_HOST", "aftp.linksynergy.com")
FTP_USER = os.getenv("LINKSHARE_BS_USER", "rkp_3750988") 
FTP_PASS = os.getenv("LINKSHARE_BS_PASS", "u5NetPVZEAhABD7HuW2VRymP") 
FTP_PORT = 21
FTP_TIMEOUT = 180

MAX_SIZE_BYTES = 1073741824 # 1 GB のバイト値
DOWNLOAD_DIR = "/tmp/ftp_downloads"

# LinkShareファイル名のパターン
FULL_DATA_PATTERN = re.compile(r"(\d+)_3750988_mp\.txt\.gz$")
DELTA_DATA_PATTERN = re.compile(r"(\d+)_3750988_delta\.txt\.gz$")

FIXED_DELIMITER = '|'
FIXED_DELIMITER_NAME = 'PIPE'
FIELD_MAPPING = {
    'C1': {'DB_FIELD': 'link_id', 'TYPE': 'str', 'DESCRIPTION': 'リンクID'},
    # LinkshareProductモデルに manufacturer_name フィールドは一つ
    'C2': {'DB_FIELD': 'product_name', 'TYPE': 'str', 'DESCRIPTION': '商品名 (旧メーカー名)'},
    'C3': {'DB_FIELD': 'sku', 'TYPE': 'str', 'PK': True, 'DESCRIPTION': '商品コード (SKU)'},
    'C4': {'DB_FIELD': 'sub_category', 'TYPE': 'str', 'DESCRIPTION': 'カテゴリ2 (旧商品名)'},
    'C5': {'DB_FIELD': 'primary_category', 'TYPE': 'str', 'DESCRIPTION': 'カテゴリ1'},
    
    # 🚨 修正ゾーン 1: URLと説明文のズレを解消
    'C6': {'DB_FIELD': 'buy_url', 'TYPE': 'str', 'DESCRIPTION': '購入URL (旧カテゴリ2)'}, 
    'C7': {'DB_FIELD': 'image_url', 'TYPE': 'str', 'DESCRIPTION': '画像URL (旧商品URL)'}, 
    'C8': {'DB_FIELD': 'product_url', 'TYPE': 'str', 'DESCRIPTION': '商品URL (旧画像URL)'},
    'C9': {'DB_FIELD': 'short_description', 'TYPE': 'str', 'DESCRIPTION': '短い商品説明 (旧購入URL)'},
    'C10': {'DB_FIELD': 'description', 'TYPE': 'str', 'DESCRIPTION': '詳細な商品説明 (旧短い商品説明)'},
    'C11': {'DB_FIELD': 'discount_amount', 'TYPE': 'str', 'DESCRIPTION': '値引金額/率'},
    
    # 🚨 修正ゾーン 2: 価格と割引情報のズレを解消 (C13とC15に数値が入っていたため)
    'C12': {'DB_FIELD': 'discount_type', 'TYPE': 'str', 'DESCRIPTION': '割引タイプ (旧割引額)'}, 
    'C13': {'DB_FIELD': 'retail_price', 'TYPE': 'Decimal', 'DESCRIPTION': '定価 (旧割引タイプ)'}, 
    'C14': {'DB_FIELD': 'sale_price', 'TYPE': 'Decimal', 'DESCRIPTION': '販売価格 (旧販売価格, ズレ修正)'},
    # 'C15': {'DB_FIELD': 'discount_amount', 'TYPE': 'Decimal', 'DESCRIPTION': '割引額 (旧定価)'},
    
    'C15': {'DB_FIELD': 'begin_date', 'TYPE': 'datetime', 'DESCRIPTION': '販売開始日'},
    'C16': {'DB_FIELD': 'brand_name', 'TYPE': 'datetime', 'DESCRIPTION': 'ブランド名'},
    'C17': {'DB_FIELD': 'brand_name', 'TYPE': 'str', 'DESCRIPTION': 'ブランド名'},
    'C18': {'DB_FIELD': 'shipping', 'TYPE': 'Decimal', 'DESCRIPTION': '送料'},
    'C19': {'DB_FIELD': 'keywords', 'TYPE': 'str', 'DESCRIPTION': '検索キーワード'},
    'C20': {'DB_FIELD': 'manufacturer_part_number', 'TYPE': 'str', 'DESCRIPTION': '製造品番'}, 
    # C22: manufacturer_name (C2より優先)
    'C21': {'DB_FIELD': 'manufacturer_name', 'TYPE': 'str', 'PRIMARY': True, 'DESCRIPTION': '製造メーカー名'},
    'C22': {'DB_FIELD': 'shipping_information', 'TYPE': 'str', 'DESCRIPTION': '配送追加情報'},
    'C23': {'DB_FIELD': 'availability', 'TYPE': 'str', 'DESCRIPTION': '在庫情報'},
    # 🚨 修正: C25を dual purpose のカスタムフィールドに
    'C24': {'DB_FIELD': 'common_product_code_dual', 'TYPE': 'str', 'DESCRIPTION': 'JAN/UPC (universal_product_code と class_id の両方にマッピング)'}, 
    'C25': {'DB_FIELD': 'class_id', 'TYPE': 'str', 'DESCRIPTION': '追加属性コード'}, 
    'C26': {'DB_FIELD': 'currency', 'TYPE': 'str', 'DESCRIPTION': '通貨単位 (JPY, USD, etc.)'}, 
    'C27': {'DB_FIELD': 'm1', 'TYPE': 'str', 'DESCRIPTION': 'M1 フィールド (カスタム属性)'},
    'C28': {'DB_FIELD': 'pixel_url', 'TYPE': 'str', 'DESCRIPTION': 'インプレッション計測 URL'},
    'C29': {'DB_FIELD': 'attribute_1', 'TYPE': 'str', 'DESCRIPTION': '追加属性1 (旧M2)'}, 
    'C30': {'DB_FIELD': 'attribute_2', 'TYPE': 'str', 'DESCRIPTION': '追加属性2 (旧M3)'},
    'C31': {'DB_FIELD': 'attribute_3', 'TYPE': 'str', 'DESCRIPTION': '追加属性3 (旧M4)'},
    'C32': {'DB_FIELD': 'attribute_4', 'TYPE': 'str', 'DESCRIPTION': '追加属性4 (旧M5)'},
    'C33': {'DB_FIELD': 'attribute_5', 'TYPE': 'str', 'DESCRIPTION': '追加属性5 (旧M6)'},
    'C34': {'DB_FIELD': 'attribute_6', 'TYPE': 'str', 'DESCRIPTION': '追加属性6 (旧M7)'},
    'C35': {'DB_FIELD': 'attribute_7', 'TYPE': 'str', 'DESCRIPTION': '追加属性7 (旧M8)'},
    'C36': {'DB_FIELD': 'attribute_8', 'TYPE': 'str', 'DESCRIPTION': '追加属性8 (旧M9)'},
    'C37': {'DB_FIELD': 'attribute_9', 'TYPE': 'str', 'DESCRIPTION': '追加属性9 (旧M10)'},
    'C38': {'DB_FIELD': 'attribute_10', 'TYPE': 'str', 'DESCRIPTION': '追加属性10 (旧M11)'},
}
EXPECTED_COLUMNS_COUNT = 38
DATE_FORMAT = '%Y%m%d %H:%M:%S'
DATE_REGEX = re.compile(r'^\d{8} \d{2}:\d{2}:\d{2}$')


# ==============================================================================
# ヘルパー関数群
# ==============================================================================
def human_readable_size(size_bytes: int) -> str:
    """バイト数をKB, MB, GBなどに変換して可読性の高い文字列を返す"""
    size_name = ("B", "KB", "MB", "GB", "TB")
    if size_bytes == 0:
        return "0B"
    try:
        i = int(math.floor(math.log(size_bytes, 1024)))
        p = pow(1024, i) 
        s = round(size_bytes / p, 2)
        
        if i >= len(size_name):
            return f"{size_bytes} B"
            
        return f"{s:,.2f} {size_name[i]}"
    except ValueError:
        return f"{size_bytes} B"
    except Exception:
        return f"{size_bytes} B"

def _get_ftp_client() -> Optional[ftplib.FTP]:
    """FTPクライアントの接続・ログイン処理"""
    try:
        ftp_client = ftplib.FTP()
        ftp_client.set_pasv(True) 
        ftp_client.set_debuglevel(0)
        
        ftp_client.connect(FTP_HOST, FTP_PORT, FTP_TIMEOUT)
        ftp_client.login(FTP_USER, FTP_PASS)
        
        return ftp_client
        
    except ftplib.all_errors as e:
        print(f"❌ [ERROR] FTP接続またはログイン失敗: {e}", file=sys.stderr)
        return None
        
    except Exception as e:
        print(f"❌ [ERROR] FTP接続処理中に予期せぬエラー: {e}", file=sys.stderr)
        return None

def get_ftp_mid_list(ftp_client: ftplib.FTP) -> List[Tuple[str, str, str, Optional[datetime], int]]:
    """
    FTPから対象のマーチャンダイザーファイル一覧を取得する。
    MLSDコマンドを使用してファイルの詳細（サイズ、タイムスタンプ）を取得する。
    
    戻り値のタプル形式: (mid, filename, file_type, mtime_dt, file_size)
    """
    file_list = []
    
    try:
        print("📡 [FTP] ファイル一覧 (MLSD) を取得中...", file=sys.stdout, flush=True)
        # MLSDを使用してファイルの詳細情報を取得
        for filename, facts in ftp_client.mlsd():
            
            # ファイルタイプが 'file' でない、またはサイズが取得できない場合はスキップ
            if facts.get('type') != 'file' or 'size' not in facts:
                continue
                
            is_full_data = FULL_DATA_PATTERN.match(filename)
            is_delta_data = DELTA_DATA_PATTERN.match(filename)
            
            if is_full_data or is_delta_data:
                mid = is_full_data.group(1) if is_full_data else is_delta_data.group(1)
                file_type = 'full' if is_full_data else 'delta'
                
                # サイズと更新時刻を取得
                try:
                    file_size = int(facts.get('size', 0))
                except ValueError:
                    file_size = 0
                
                mtime_str = facts.get('modify')
                mtime_dt = None
                if mtime_str:
                    try:
                        # MLSD timestamp format: YYYYMMDDhhmmss
                        mtime_dt = datetime.strptime(mtime_str, '%Y%m%d%H%M%S').replace(tzinfo=timezone.utc)
                    except ValueError:
                        pass
                        
                file_list.append((mid, filename, file_type, mtime_dt, file_size))
                
        print(f"✅ [FTP] {len(file_list)} 件の対象ファイルが見つかりました。", file=sys.stdout, flush=True)
                
    except ftplib.all_errors as e:
        print(f"❌ [ERROR] FTPファイルリスト取得失敗: {e}", file=sys.stderr)
        return []
        
    return file_list

def safe_cast(value: str, target_type: str, field_name: str) -> Optional[Any]:
    """LinkShareのCSV値をご希望の型に安全に変換する。"""
    if not value or value.strip().lower() in ('null', 'none', 'n/a', ''):
        return None
        
    stripped_value = value.strip()
    
    if target_type == 'Decimal':
        try:
            temp_value = stripped_value.replace(',', '').replace('$', '').replace('¥', '')
            if not temp_value:
                return None
            return Decimal(temp_value)
        except InvalidOperation:
            return None
            
    elif target_type == 'datetime':
        if not DATE_REGEX.match(stripped_value):
            return None
        try:
            dt = datetime.strptime(stripped_value, DATE_FORMAT)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            return None
            
    return stripped_value


# ==============================================================================
# データパースロジック
# ==============================================================================

def _display_mapping_for_first_row(row_list: List[str]):
    """最初のデータ行のパース結果を表示し、カラムズレの確認を助ける。（デバッグ出力）"""
    print("\n--- 最初のデータ行のパースマッピング (デバッグ出力: LinkShare Column -> DB Field -> Raw Value) ---", file=sys.stdout, flush=True)
    print(f"総カラム数: {len(row_list)} / 期待値: {EXPECTED_COLUMNS_COUNT}", file=sys.stdout, flush=True)
    
    print(f"{'LS-COL':<7} | {'DB FIELD':<35} | {'RAW VALUE (先頭50文字)':<50}", file=sys.stdout, flush=True)
    print("-" * 98, file=sys.stdout, flush=True)
    
    for i in range(EXPECTED_COLUMNS_COUNT):
        col_name = f'C{i+1}'
        mapping = FIELD_MAPPING.get(col_name, {'DB_FIELD': 'N/A', 'TYPE': 'str'})
        db_field = mapping.get('DB_FIELD', 'N/A')
        
        # manufacturer_name_fallback は DB フィールドではないため、実際の manufacturer_name を表示
        if db_field == 'manufacturer_name_fallback':
            db_field = 'manufacturer_name (fallback)'
        elif db_field == 'common_product_code_dual': # 💡 修正: C25 の表示を明確に
            db_field = 'universal_product_code & class_id'
        
        raw_value = row_list[i] if i < len(row_list) else ""
        
        display_value = raw_value.replace('\n', '\\n').replace('\r', '\\r')
        if len(display_value) > 50:
            display_value = display_value[:47] + "..."
            
        print(f"{col_name:<7} | {db_field:<35} | '{display_value}'", file=sys.stdout, flush=True)
    print("--------------------------------------------------------------------------------------------------", file=sys.stdout, flush=True)


def _parse_single_row(row_list: List[str], mid: str, advertiser_name: str) -> Optional[Dict[str, Any]]:
    """単一行のCSVデータをパースし、DB保存用の辞書形式に変換する。"""
    if len(row_list) != EXPECTED_COLUMNS_COUNT:
        return None 

    data: Dict[str, Any] = {
        'merchant_id': mid, 
        'created_at': timezone.now(), 
        'updated_at': timezone.now(),
        # ❌ 修正: api_source フィールドを明示的に設定する行を削除
    }
    
    # manufacturer_name の初期値は C22 (PRIMARY) が設定され、C2 (FALLBACK) はその後に設定される

    for i, (col_name, mapping) in enumerate(FIELD_MAPPING.items()):
        raw_value = row_list[i]
        db_field = mapping.get('DB_FIELD')
        data_type = mapping.get('TYPE')

        if not db_field:
            continue
        
        # manufacturer_name の特殊処理
        if db_field == 'manufacturer_name' and 'PRIMARY' in mapping:
            # C22 (PRIMARY) の値が存在すればそれを採用
            if raw_value.strip():
                data['manufacturer_name'] = raw_value.strip()
                continue
            
        # manufacturer_name_fallback の特殊処理
        elif db_field == 'manufacturer_name_fallback' and 'FALLBACK' in mapping:
            # C2 (FALLBACK) の値があり、かつ PRIMARY (C22) の値がセットされていない場合のみ採用
            if raw_value.strip() and 'manufacturer_name' not in data:
                data['manufacturer_name'] = raw_value.strip()
                continue
            
        # 💡 修正: C25 の二重マッピング処理 (universal_product_code と class_id)
        elif db_field == 'common_product_code_dual':
            casted_value = safe_cast(raw_value, data_type, db_field)
            if casted_value:
                data['universal_product_code'] = casted_value
                data['class_id'] = casted_value
            continue
            
        # 通常のフィールド処理
        elif db_field and db_field != 'manufacturer_name_fallback':
            data[db_field] = safe_cast(raw_value, data_type, db_field)

    return data


def _bulk_import_products(mid: str, product_data_list: List[Dict[str, Any]]) -> Tuple[int, int, int]:
    """
    収集された商品データをバルクでDBに保存/更新する。
    LinkshareProductモデルのみに保存処理を行う。
    """
    if not product_data_list or LinkshareProduct == DummyModel:
        # モデルがダミーの場合、処理件数をログに出力するのみ
        print(f"⚠️ [BULK] LinkshareProductモデル未定義のため、DB保存をスキップ。処理件数: {len(product_data_list)}", file=sys.stderr, flush=True)
        return len(product_data_list), len(product_data_list), 0 

    incoming_sku_map = {data['sku']: data for data in product_data_list if data.get('sku')}
    skus_to_check = list(incoming_sku_map.keys())
    
    to_create_linkshare: List[LinkshareProduct] = []
    to_update_linkshare: List[LinkshareProduct] = []

    # 1. LinkshareProduct の Upsert 準備
    existing_products = LinkshareProduct.objects.filter(
        merchant_id=mid,
        sku__in=skus_to_check
    )
    
    # merchant_id と sku の複合ユニークキーで検索
    existing_sku_map = {p.sku: p for p in existing_products}
    
    # 🚨 修正: update_fields リストから 'api_source' を削除
    update_fields = [
        'link_id', 'product_name', 'primary_category', 'sub_category',
        'product_url', 'image_url', 'buy_url', 'short_description', 'description', 
        'discount_amount', 'discount_type', 'sale_price', 'retail_price', 'begin_date', 
        'end_date', 'brand_name', 'shipping', 'keywords', 
        'manufacturer_part_number', 'manufacturer_name',
        'shipping_information', 'availability', 
        'universal_product_code', 'class_id', 
        'currency', 'm1', 'pixel_url',
        'attribute_1', 'attribute_2', 'attribute_3', 'attribute_4', 'attribute_5', 
        'attribute_6', 'attribute_7', 'attribute_8', 'attribute_9', 'attribute_10',
        'updated_at' 
    ]

    for sku, data in incoming_sku_map.items():
        # LinkshareProductが持つ属性のみをフィルタリング
        # 🚨 manufacturer_name_fallback や common_product_code_dual はモデルにないので、除外
        clean_data = {
            k: v for k, v in data.items() 
            if hasattr(LinkshareProduct, k) and k not in ('manufacturer_name_fallback', 'common_product_code_dual')
        }
        clean_data['updated_at'] = timezone.now() 
        
        if sku in existing_sku_map:
            product_instance = existing_sku_map[sku]
            is_updated = False
            
            for key in update_fields:
                # clean_data にキーが存在しない場合、フィールド更新の対象外
                if key not in clean_data:
                    continue
                
                current_value = getattr(product_instance, key)
                new_value = clean_data[key]
                
                # Decimal型または datetime型の比較で、値が異なるかチェック
                is_diff = True
                if current_value == new_value:
                    is_diff = False
                elif isinstance(current_value, Decimal) and isinstance(new_value, Decimal):
                     # Decimal型の比較: Decimal('0') と None が異なると判定されないように
                     if current_value.compare(new_value) == 0:
                         is_diff = False
                elif current_value is None and new_value == '': # 空文字列とNoneの区別を無くす
                     is_diff = False
                elif new_value is None and current_value == '':
                     is_diff = False
                     
                if is_diff:
                    setattr(product_instance, key, new_value)
                    is_updated = True
            
            if is_updated:
                to_update_linkshare.append(product_instance)
        else:
            to_create_linkshare.append(LinkshareProduct(**clean_data))
    
    updated_count = 0
    if to_update_linkshare:
        try:
            # `update_fields` にない `created_at` や `merchant_id`, `sku` は更新されない
            LinkshareProduct.objects.bulk_update(to_update_linkshare, update_fields, batch_size=5000)
            updated_count = len(to_update_linkshare)
        except Exception as e:
            print(f" ❌ [MID: {mid}] バルク更新中にエラーが発生しました: {e}", file=sys.stderr)
            
    created_count = 0
    if to_create_linkshare:
        try:
            LinkshareProduct.objects.bulk_create(to_create_linkshare, batch_size=5000)
            created_count = len(to_create_linkshare)
        except IntegrityError as e:
            # 複合ユニークキー (merchant_id, sku) の重複が発生した場合
            print(f" ❌ [MID: {mid}] バルク作成中にIntegrityErrorが発生しました: {e}", file=sys.stderr)
            
    return created_count + updated_count, created_count, updated_count


# ==============================================================================
# データパースと保存を統合したメイン処理 
# ==============================================================================

def parse_and_process_file(local_path: str, mid: str) -> Tuple[bool, int]:
    """CSVファイルをパースし、DBに保存する。"""
    
    current_batch: List[Dict[str, Any]] = []
    parsed_count = 0
    total_saved_rows = 0
    advertiser_name: str = 'N/A'
    first_row_logged = False
    
    delimiter = FIXED_DELIMITER 
    
    try:
        # ダウンロード時にUTF-8で保存されているため、'r' (UTF-8) で読み込む
        with open(local_path, 'r', encoding='utf-8', newline='') as f:
            reader = csv.reader(f, delimiter=delimiter)
            
            # 1. HDR行の処理 (1行目)
            try:
                hdr_row = next(reader)
                if hdr_row[0].strip() == 'HDR':
                    advertiser_name = hdr_row[2].strip() if len(hdr_row) > 2 else 'N/A'
                    print(f"💡 [MID: {mid}] Advertiser Nameを取得: '{advertiser_name}'。次の行からデータ開始（カラム名無し）。", file=sys.stdout, flush=True)
                else:
                    print(f"⚠️ [MID: {mid}] HDR行が見つかりませんでした。ファイル先頭からデータとして処理します。", file=sys.stderr, flush=True)
                    f.seek(0) # ファイルポインタを先頭に戻す
                    reader = csv.reader(f, delimiter=delimiter)

            except StopIteration:
                print(f"❌ [MID: {mid}] ファイルが空です。", file=sys.stderr, flush=True)
                return False, 0
                
            # 2. データ行の処理
            for row in reader:
                if len(row) != EXPECTED_COLUMNS_COUNT:
                    continue
                    
                parsed_count += 1

                # データベース書き込みとは別に、パース件数のみで進捗を出す
                if parsed_count % 50000 == 0:
                    print(f"🔄 [MID: {mid}] **現在パース済み {parsed_count:,} 件**。次のDB書き込みバッチを待機中...", file=sys.stdout, flush=True)
                
                
                # 🚨 デバッグ出力: 最初のデータ行のみ、全カラムをデバッグ表示
                if not first_row_logged:
                    _display_mapping_for_first_row(row)
                    first_row_logged = True
                
                # 3. 単一行のパース
                record = _parse_single_row(row, mid, advertiser_name)
                
                # LinkshareProductには 'merchant_id' フィールドを使用
                if not record or not record.get('sku') or not record.get('merchant_id'):
                    continue

                current_batch.append(record)
                
                # バッチ処理
                if len(current_batch) >= 5000:
                    saved, created, updated = _bulk_import_products(mid, current_batch)
                    total_saved_rows += saved
                    print(f"⏳ [MID: {mid}] 処理済み {parsed_count:,} 件。保存: {saved:,} (新規:{created:,}, 更新:{updated:,})", file=sys.stdout, flush=True)
                    current_batch = []

            # 4. 最終バッチの処理
            if current_batch:
                saved, created, updated = _bulk_import_products(mid, current_batch)
                total_saved_rows += saved

            print(f"✅ [MID: {mid}] ファイルパース完了。総パース件数: {parsed_count:,} 件", file=sys.stdout, flush=True)
            return True, total_saved_rows

    except Exception as e:
        print(f"❌ [MID: {mid}] パース処理中に予期せぬエラー: {e}", file=sys.stderr, flush=True)
        print(traceback.format_exc(), file=sys.stderr, flush=True)
        return False, 0


def download_file(ftp_client: ftplib.FTP, filename: str, local_path_gz: str, local_path_txt: str, mid: str, file_size: int) -> Tuple[bool, int]:
    """
    FTPからファイルをダウンロードし、gzipで解凍してローカルに保存する。
    UTF-8デコード時に不正なバイトシーケンスを無視するよう修正。
    """
    print(f"📡 [MID: {mid}] ファイル {filename} ({human_readable_size(file_size)}) のダウンロードを開始...", file=sys.stdout, flush=True)
    
    # ユーザーの確認に基づき、UTF-8 (エラー無視) を使用する
    ENCODING = 'utf-8'
    ERROR_HANDLING = 'ignore' 
    
    try:
        # 1. GZファイルのダウンロード
        with open(local_path_gz, 'wb') as f:
            ftp_client.retrbinary(f'RETR {filename}', f.write)

        print(f"📦 [MID: {mid}] ダウンロード完了。解凍中...", file=sys.stdout, flush=True)
        
        # 2. GZファイルの解凍とデコード (エラー無視)
        decompressed_size = 0
        
        # GZファイルをバイナリモードで開き、中身を読み込む
        with gzip.open(local_path_gz, 'rb') as f_in:
            # デコードされた結果をUTF-8でローカルのテキストファイルとして書き出す
            with open(local_path_txt, 'w', encoding='utf-8', newline='') as f_out:
                
                buffer_size = 1024 * 1024 # 1MB chunk
                while True:
                    chunk = f_in.read(buffer_size)
                    if not chunk:
                        break
                    
                    # 💡 修正: errors='ignore' を使用し、不正なUTF-8バイトシーケンスを無視する
                    text_chunk = chunk.decode(ENCODING, errors=ERROR_HANDLING) 
                    f_out.write(text_chunk)
                    
                    # 書き込まれたデータのサイズを計算 (無視されたバイトは含まれない)
                    decompressed_size += len(text_chunk)
                        
        print(f"✅ [MID: {mid}] 解凍・デコード完了 (エンコーディング: {ENCODING}, エラー処理: {ERROR_HANDLING})。TXTファイルサイズ: {human_readable_size(decompressed_size)}", file=sys.stdout, flush=True)
        
        # 3. GZファイルの削除
        os.remove(local_path_gz)
        
        return True, decompressed_size

    except ftplib.all_errors as e:
        print(f"❌ [MID: {mid}] FTPダウンロード失敗: {e}", file=sys.stderr)
        if os.path.exists(local_path_gz): os.remove(local_path_gz)
        if os.path.exists(local_path_txt): os.remove(local_path_txt)
        return False, 0
    except Exception as e:
        print(f"❌ [MID: {mid}] ダウンロード/解凍中に予期せぬエラー: {e}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        if os.path.exists(local_path_gz): os.remove(local_path_gz)
        if os.path.exists(local_path_txt): os.remove(local_path_txt)
        return False, 0


# ==============================================================================
# Django Management Command の定義
# ==============================================================================
class Command(BaseCommand):
    """LinkShare FTPからマーチャンダイザーをダウンロードし、DBにバルクインポートするDjangoコマンド"""
    help = 'LinkShare FTPからマーチャンダイザーをダウンロードし、LinkshareProductモデルにバルクインポートします。'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mid', 
            type=str, 
            help='処理する特定のマーチャントID (MID) を指定します。', 
            default=None
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='処理するファイルの最大数。デバッグやテスト時に便利です。',
            default=None
        )

    def handle(self, *args, **options):
        
        self.stdout.write("--- LinkShare データインポートコマンド開始 (バルク処理) ---")

        # 🚨 モデルのインポートとグローバルスコープの置き換え
        try:
            # 実際のプロジェクト構造に合わせてインポートパスを修正してください
            # 例: from app_name.models import LinkshareProduct as RealLinkshareProduct
            from api.models.linkshare_products import LinkshareProduct as RealLinkshareProduct
            
            globals()['LinkshareProduct'] = RealLinkshareProduct
            self.stdout.write("✅ モデル (LinkshareProduct) のインポート成功。")
            
        except ImportError as e:
            self.stdout.write(self.style.ERROR(f"🚨 CRITICAL: モデルのインポートに失敗しました。DBへの保存は行われません。"))
            self.stderr.write(self.style.ERROR(f"エラー詳細: {e}"))
        
        # ダウンロードディレクトリの作成
        if not os.path.exists(DOWNLOAD_DIR):
            os.makedirs(DOWNLOAD_DIR)
            self.stdout.write(f"📁 ダウンロードディレクトリ {DOWNLOAD_DIR} を作成しました。")

        # FTP接続
        ftp_client = _get_ftp_client()

        if not ftp_client:
            self.stdout.write(self.style.ERROR("🚨 FTP接続に失敗しました。処理を終了します。"))
            return

        total_processed_files = 0
        total_saved_rows = 0
        mid_list: List[Tuple[str, str, str, Optional[datetime], int]] = [] 

        try:
            # 1. FTPファイル一覧の取得
            mid_list = get_ftp_mid_list(ftp_client) 
            
            limit = options['limit']

            if options['mid']:
                mid_list = [item for item in mid_list if item[0] == options['mid']]

            # --limit の適用
            if limit is not None and limit > 0:
                mid_list = mid_list[:limit]

            if not mid_list:
                self.stdout.write(self.style.WARNING("❌ 処理対象となるLinkShareマーチャンダイザーファイルが見つかりませんでした。"))
                return

            self.stdout.write(f"✅ {len(mid_list)} 件のMIDファイル処理を開始します。")

            # FTPファイル一覧の表示
            self.stdout.write(self.style.NOTICE("\n--- 処理対象のLinkShare FTPファイル一覧 ---"))
            self.stdout.write(f"{'MID':<6} | {'ファイル名':<40} | {'サイズ':<10} | 最終更新 (UTC)")
            self.stdout.write("-" * 75)
            for mid_id, filename, file_type, mtime_dt, file_size in mid_list:
                size_hr = human_readable_size(file_size)
                mtime_str = mtime_dt.strftime('%Y-%m-%d %H:%M:%S') if mtime_dt else 'N/A'
                self.stdout.write(f"{mid_id:<6} | {filename:<40} | {size_hr:<10} | {mtime_str}")
            self.stdout.write("----------------------------------------------\n")
            
            # --- ファイル処理ループの開始 ---
            for mid, filename, file_type, mtime_dt, file_size in mid_list:
                self.stdout.write(f"\n--- [MID: {mid}] 処理開始 ({filename}) ---")
                
                # ローカルパスの決定
                local_gz_path = os.path.join(DOWNLOAD_DIR, filename)
                local_txt_path = local_gz_path.replace('.gz', '.txt')

                # トランザクション処理 (Atomic: 失敗時ロールバック)
                with transaction.atomic():
                    success = False
                    current_saved_rows = 0
                    try:
                        # 1. ダウンロードと解凍 (UTF-8, errors='ignore')
                        is_downloaded, downloaded_size = download_file(
                            ftp_client, 
                            filename, 
                            local_gz_path, 
                            local_txt_path, 
                            mid, 
                            file_size
                        )
                        
                        if is_downloaded:
                            # 2. パースと保存 
                            success, current_saved_rows = parse_and_process_file(local_txt_path, mid) 
                            
                            # 3. 処理済みTXTファイルのクリーンアップ
                            if os.path.exists(local_txt_path):
                                os.remove(local_txt_path)
                                # 🚨 修正: Django OutputWrapper.write() のため、fileとflush引数を削除
                                self.stdout.write(f"🧹 [MID: {mid}] 処理済みファイル {os.path.basename(local_txt_path)} を削除しました。") 

                        
                    except Exception as e:
                        # 処理中の致命的なエラーを捕捉し、ロールバック
                        self.stderr.write(self.style.ERROR(f"\n[MID: {mid}] 処理中に致命的な例外が発生しました。トランザクションはロールバックされます。"))
                        self.stderr.write(self.style.ERROR(f"エラータイプ: {type(e).__name__}, メッセージ: {str(e)}"))
                        self.stderr.write(traceback.format_exc()) 

                    if success:
                        total_processed_files += 1
                        total_saved_rows += current_saved_rows
                        self.stdout.write(self.style.SUCCESS(f"\n[MID: {mid}] 処理完了。DB保存件数: {current_saved_rows:,} 件"))
                    else:
                        self.stdout.write(self.style.ERROR(f"\n[MID: {mid}] 処理失敗 (トランザクション ロールバック)。"))

        finally:
            # FTP接続の終了処理
            if ftp_client:
                try:
                    ftp_client.quit()
                    self.stdout.write("\n📡 FTP接続を閉じました。")
                except ftplib.all_errors:
                    pass
            
        self.stdout.write(f"\n==================================================================================")
        self.stdout.write(f"--- 最終結果: インポートコマンド完了 ---")
        self.stdout.write(f"正常処理ファイル数: {total_processed_files} / {len(mid_list)} 件")
        self.stdout.write(self.style.SUCCESS(f"合計保存行数: {total_saved_rows:,} 行"))
        self.stdout.write("==================================================================================")
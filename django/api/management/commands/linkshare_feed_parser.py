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
    # LinkshareProduct が持つことが想定される属性を追加
    id = None
    merchant_id = None
    created_at = None
    updated_at = None
    sku_unique = None 
    price = None
    in_stock = None
    is_active = None
    affiliate_url = None 
    sku = None
    product_url = None
    raw_csv_data = None 
    merchant_name = None 
    product_name = None # 👈 新しくDBに追加されたため、ダミーにも追加

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

# 🚀 修正: C4 (商品名) を DBフィールド 'product_name' にマッピング
FIELD_MAPPING = {
    # C3: SKU -> sku_unique (PKとして使用)
    'C3': {'DB_FIELD': 'sku_unique', 'TYPE': 'str', 'PK': True, 'DESCRIPTION': '商品コード (SKU、新ユニークキー)'},
    # 💡 修正: C4 を product_name フィールドにマッピング
    'C2': {'DB_FIELD': 'product_name', 'TYPE': 'str', 'DESCRIPTION': '商品名'},
    'C13': {'DB_FIELD': 'price', 'TYPE': 'Decimal', 'DESCRIPTION': '価格 (旧定価)'},
    # C6: affiliate_url を DBフィールドとして復帰
    'C6': {'DB_FIELD': 'affiliate_url', 'TYPE': 'str', 'DESCRIPTION': 'アフィリエイトURL'}, 
    # 'C9': {'DB_FIELD': 'product_url', 'TYPE': 'str', 'DESCRIPTION': '製品URL'}, # C9 は product_url に対応することが多いですが、ここでは省略されているためそのまま
}

EXPECTED_COLUMNS_COUNT = 38 
DATE_FORMAT = '%Y%m%d %H:%M:%S'
DATE_REGEX = re.compile(r'^\d{8} \d{2}:\d{2}:\d{2}$')


# ==============================================================================
# ヘルパー関数群
# ==============================================================================
def human_readable_size(size_bytes: int) -> str:
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
    file_list = []
    
    try:
        print("📡 [FTP] ファイル一覧 (MLSD) を取得中...", file=sys.stdout, flush=True)
        # MLSDを使用してファイルの詳細情報を取得
        for filename, facts in ftp_client.mlsd():
            
            if facts.get('type') != 'file' or 'size' not in facts:
                continue
                
            is_full_data = FULL_DATA_PATTERN.match(filename)
            is_delta_data = DELTA_DATA_PATTERN.match(filename)
            
            if is_full_data or is_delta_data:
                mid = is_full_data.group(1) if is_full_data else is_delta_data.group(1)
                file_type = 'full' if is_full_data else 'delta'
                
                try:
                    file_size = int(facts.get('size', 0))
                except ValueError:
                    file_size = 0
                
                mtime_str = facts.get('modify')
                mtime_dt = None
                if mtime_str:
                    try:
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
    
    # コアフィールドのパース表示
    for i in range(EXPECTED_COLUMNS_COUNT):
        col_name = f'C{i+1}'
        mapping = FIELD_MAPPING.get(col_name)
        
        # 💡 修正: C4 (product_name) を通常のマッピングとして表示
        if mapping:
            db_field = mapping.get('DB_FIELD', 'N/A')
        else:
            continue
            
        raw_value = row_list[i] if i < len(row_list) else ""
        
        display_value = raw_value.replace('\n', '\\n').replace('\r', '\\r')
        if len(display_value) > 50:
            display_value = display_value[:47] + "..."
            
        print(f"{col_name:<7} | {db_field:<35} | '{display_value}'", file=sys.stdout, flush=True)
            
    print(f"{'ALL':<7} | {'raw_csv_data':<35} | '全カラムの生データ'", file=sys.stdout, flush=True)
    print("--------------------------------------------------------------------------------------------------", file=sys.stdout, flush=True)


def _parse_single_row(row_list: List[str], mid: str, advertiser_name: str) -> Optional[Dict[str, Any]]:
    """単一行のCSVデータをパースし、DB保存用の辞書形式に変換する。"""
    if len(row_list) != EXPECTED_COLUMNS_COUNT:
        return None 

    data: Dict[str, Any] = {
        'merchant_id': mid, 
        'created_at': timezone.now(), 
        'updated_at': timezone.now(),
        'is_active': True,
        'in_stock': True, 
        'sku': 'NON-SKU', 
        'product_url': '', 
        'product_name': '', # 💡 修正: DB保存するため、初期値は残す
        'affiliate_url': '', 
        'merchant_name': advertiser_name, 
    }
    
    data['raw_csv_data'] = FIXED_DELIMITER.join(row_list)

    # コアフィールドのパース
    for i in range(EXPECTED_COLUMNS_COUNT):
        col_name = f'C{i+1}'
        raw_value = row_list[i]
        
        mapping = FIELD_MAPPING.get(col_name)
        if not mapping:
            continue
            
        db_field = mapping.get('DB_FIELD')
        data_type = mapping.get('TYPE')

        if not db_field:
            continue
        
        # 'sku_unique' が存在すれば、'sku' フィールドにも同じ値を設定
        if db_field == 'sku_unique':
            casted_value = safe_cast(raw_value, data_type, db_field)
            if casted_value:
                data[db_field] = casted_value 
                data['sku'] = casted_value 
            continue
            
        # 💡 修正: product_name (C4) や price (C13), affiliate_url (C6) などのコアフィールド処理
        data[db_field] = safe_cast(raw_value, data_type, db_field)

    # 必須チェック: sku_unique, product_name, price は必須
    if not data.get('sku_unique'):
        return None
    # 💡 修正: product_name の必須チェックを復帰/維持
    if not data.get('product_name'):
        return None
    if data.get('price') is None:
        return None
    
    # 🚨 修正: DBに存在するようになったため、 product_name の削除 (del data['product_name']) は行わない
    # del data['product_name'] 

    return data


def _bulk_import_products(mid: str, product_data_list: List[Dict[str, Any]]) -> Tuple[int, int, int]:
    
    if not product_data_list or LinkshareProduct == DummyModel:
        print(f"⚠️ [BULK] LinkshareProductモデル未定義のため、DB保存をスキップ。処理件数: {len(product_data_list)}", file=sys.stderr, flush=True)
        return len(product_data_list), len(product_data_list), 0 

    incoming_sku_map = {data['sku_unique']: data for data in product_data_list if data.get('sku_unique')}
    skus_to_check = list(incoming_sku_map.keys())
    
    to_create_linkshare: List[LinkshareProduct] = []
    to_update_linkshare: List[LinkshareProduct] = []

    # 1. LinkshareProduct の Upsert 準備
    
    # 🚨 修正: .only() に product_name を含める
    existing_products = LinkshareProduct.objects.filter(
        merchant_id=mid,
        sku_unique__in=skus_to_check
    ).only(
        'sku_unique', 
        'id', 
        'price', 
        'in_stock', 
        'is_active', 
        'sku', 
        'product_url',
        'affiliate_url', 
        'raw_csv_data',
        'merchant_id',
        'created_at',
        'updated_at',
        'merchant_name',
        'product_name', # 👈 復帰/追加
    )
    
    existing_sku_map = {p.sku_unique: p for p in existing_products}
    
    # 💡 修正: update_fields に product_name を含める
    update_fields = [
        'price', 'in_stock', 'is_active', 
        'sku', 'product_url', 'affiliate_url', 
        'raw_csv_data',
        'updated_at',
        'merchant_name',
        'product_name', # 👈 復帰/追加
    ]
    
    # 💡 修正: required_fields に product_name を含める
    required_fields = [
        'price', 'in_stock', 'is_active', 'sku', 'product_url', 
        'raw_csv_data', 'affiliate_url', 'merchant_name', 'product_name'
    ] 
    
    for sku_unique, data in incoming_sku_map.items():
        
        # Djangoモデルが持つフィールドのみを厳密にフィルタリング
        allowed_fields = set(required_fields + ['merchant_id', 'created_at', 'updated_at', 'sku_unique'])
        
        clean_data = {
            k: v for k, v in data.items() 
            if hasattr(LinkshareProduct, k) and k in allowed_fields
        }
        
        clean_data['updated_at'] = timezone.now() 

        if 'created_at' not in clean_data:
            clean_data['created_at'] = timezone.now() 
        
        if sku_unique in existing_sku_map:
            product_instance = existing_sku_map[sku_unique]
            is_updated = False
            
            for key in update_fields:
                if key not in clean_data:
                    continue
                
                current_value = getattr(product_instance, key)
                new_value = clean_data[key]
                
                is_diff = True
                if current_value == new_value:
                    is_diff = False
                elif isinstance(current_value, Decimal) and isinstance(new_value, Decimal):
                    if current_value.compare(new_value) == 0:
                        is_diff = False
                elif current_value is None and new_value == '': 
                    is_diff = False
                elif new_value is None and current_value == '':
                    is_diff = False
                        
                if is_diff:
                    setattr(product_instance, key, new_value)
                    is_updated = True
            
            if is_updated:
                to_update_linkshare.append(product_instance)
        else:
            # 新規インスタンスを作成
            new_instance = LinkshareProduct(**clean_data)
            
            # 🌟 修正点: delattr(new_instance, 'merchant_name') は以前の修正で削除済みのため、ここでは何もしない
            # (merchant_name, product_name ともに DB カラムとして存在する)
                
            to_create_linkshare.append(new_instance)
    
    updated_count = 0
    if to_update_linkshare:
        try:
            LinkshareProduct.objects.bulk_update(to_update_linkshare, update_fields, batch_size=5000)
            updated_count = len(to_update_linkshare)
        except Exception as e:
            print(f" ❌ [MID: {mid}] バルク更新中にエラーが発生しました: {e}", file=sys.stderr)
            
    created_count = 0
    if to_create_linkshare:
        try:
            LinkshareProduct.objects.bulk_create(
                to_create_linkshare, 
                batch_size=5000 
            )
            created_count = len(to_create_linkshare)
        except IntegrityError as e:
            print(f" ❌ [MID: {mid}] バルク作成中にIntegrityErrorが発生しました: {e}", file=sys.stderr)
            
    return created_count + updated_count, created_count, updated_count


# ==============================================================================
# データパースと保存を統合したメイン処理 (変更なし)
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
                    f.seek(0) 
                    reader = csv.reader(f, delimiter=delimiter)

            except StopIteration:
                print(f"❌ [MID: {mid}] ファイルが空です。", file=sys.stderr, flush=True)
                return False, 0
                
            # 2. データ行の処理
            for row in reader:
                if len(row) != EXPECTED_COLUMNS_COUNT:
                    continue
                    
                parsed_count += 1

                if parsed_count % 50000 == 0:
                    print(f"🔄 [MID: {mid}] **現在パース済み {parsed_count:,} 件**。次のDB書き込みバッチを待機中...", file=sys.stdout, flush=True)
                
                
                # 🚨 デバッグ出力: 最初のデータ行のみ、全カラムをデバッグ表示
                if not first_row_logged:
                    _display_mapping_for_first_row(row)
                    first_row_logged = True
                
                # 3. 単一行のパース
                record = _parse_single_row(row, mid, advertiser_name)
                
                if not record or not record.get('sku_unique') or not record.get('merchant_id'):
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
    print(f"📡 [MID: {mid}] ファイル {filename} ({human_readable_size(file_size)}) のダウンロードを開始...", file=sys.stdout, flush=True)
    
    ENCODING = 'utf-8'
    ERROR_HANDLING = 'ignore' 
    
    try:
        # 1. GZファイルのダウンロード
        with open(local_path_gz, 'wb') as f:
            ftp_client.retrbinary(f'RETR {filename}', f.write)

        print(f"📦 [MID: {mid}] ダウンロード完了。解凍中...", file=sys.stdout, flush=True)
        
        # 2. GZファイルの解凍とデコード (エラー無視)
        decompressed_size = 0
        
        with gzip.open(local_path_gz, 'rb') as f_in:
            with open(local_path_txt, 'w', encoding='utf-8', newline='') as f_out:
                
                buffer_size = 1024 * 1024 # 1MB chunk
                while True:
                    chunk = f_in.read(buffer_size)
                    if not chunk:
                        break
                    
                    text_chunk = chunk.decode(ENCODING, errors=ERROR_HANDLING) 
                    f_out.write(text_chunk)
                    
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
                        # 1. ダウンロードと解凍
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
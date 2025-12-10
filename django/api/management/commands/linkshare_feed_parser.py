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
import logging 
from logging import Logger

# ⭐ tqdmのインポート
from tqdm import tqdm 

# Djangoのコア機能とモデルをインポート
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction, IntegrityError 
from django.utils import timezone
from django.conf import settings 

# ==============================================================================
# グローバル設定と初期化
# ==============================================================================

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
    price = None
    in_stock = None
    is_active = None
    affiliate_url = None 
    sku = None
    product_url = None
    raw_csv_data = None 
    merchant_name = None 
    product_name = None 

LinkshareProduct = DummyModel

# ロガーの初期化 (handle内で設定を上書き)
logger: Logger = logging.getLogger(__name__)

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

# 🚀 修正: メモリ効率化のためバッチサイズと報告頻度を削減
BATCH_SIZE = 1000 # DBへのバルク処理件数
ROWS_PER_REPORT = 10000 # 進行状況を報告する頻度 (現在は主にデバッグ用途)
FIELD_MAPPING = {
    # C3: SKU -> sku (新しいユニークキーの一部)
    'C3': {'DB_FIELD': 'sku', 'TYPE': 'str', 'PK': True, 'DESCRIPTION': '商品コード (SKU、新ユニークキー)'},
    # 💡 修正: C2 を product_name フィールドにマッピング
    'C2': {'DB_FIELD': 'product_name', 'TYPE': 'str', 'DESCRIPTION': '商品名'},
    'C13': {'DB_FIELD': 'price', 'TYPE': 'Decimal', 'DESCRIPTION': '価格 (旧定価)'},
    # C6: affiliate_url を DBフィールドとして復帰
    'C6': {'DB_FIELD': 'affiliate_url', 'TYPE': 'str', 'DESCRIPTION': 'アフィリエイトURL'}, 
    # 'C9': {'DB_FIELD': 'product_url', 'TYPE': 'str', 'DESCRIPTION': '製品URL'}, 
    # 追加: デバッグ強化のため、必須フィールド以外もマッピングに追加することが望ましい
    'C4': {'DB_FIELD': 'description', 'TYPE': 'str', 'DESCRIPTION': '説明/補足価格'},
    'C9': {'DB_FIELD': 'product_url', 'TYPE': 'str', 'DESCRIPTION': '製品URL'},
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
        logger.error(f"❌ [ERROR] FTP接続またはログイン失敗: {e}", exc_info=False)
        return None
        
    except Exception as e:
        logger.error(f"❌ [ERROR] FTP接続処理中に予期せぬエラー: {e}", exc_info=False)
        return None

def get_ftp_mid_list(ftp_client: ftplib.FTP) -> List[Tuple[str, str, str, Optional[datetime], int]]:
    file_list = []
    
    try:
        logger.info("📡 [FTP] ファイル一覧 (MLSD) を取得中...")
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
                        
        logger.info(f"✅ [FTP] {len(file_list)} 件の対象ファイルが見つかりました。")
                
    except ftplib.all_errors as e:
        logger.error(f"❌ [ERROR] FTPファイルリスト取得失敗: {e}", exc_info=False)
        return []
        
    return file_list

def safe_cast(value: str, target_type: str, field_name: str) -> Optional[Any]:
    if not value or value.strip().lower() in ('null', 'none', 'n/a', ''):
        return None
        
    stripped_value = value.strip()
    
    # 💡 修正: 非破壊的な方法で不可視文字 (U+00A0など) を標準のスペースに置き換える
    stripped_value = stripped_value.replace('\u00a0', ' ')
    
    if target_type == 'Decimal':
        try:
            # カンマ、通貨記号、スペースを取り除く
            temp_value = stripped_value.replace(',', '').replace('$', '').replace('¥', '').strip()
            if not temp_value:
                return None
            return Decimal(temp_value)
        except InvalidOperation:
            # logger.debug(f"⚠️ [SAFE_CAST] Decimal変換失敗 ({field_name}): '{stripped_value}'")
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
    
    # 💡 修正: デバッグログとして出力
    logger.debug("\n--- 最初のデータ行のパースマッピング (デバッグ出力: LinkShare Column -> DB Field -> Raw Value) ---")
    logger.debug(f"総カラム数: {len(row_list)} / 期待値: {EXPECTED_COLUMNS_COUNT}")
    
    # 標準出力に直接書く（logging.debugでは表形式の整列が難しい場合があるため）
    sys.stdout.write(f"{'LS-COL':<7} | {'DB FIELD':<35} | {'RAW VALUE (先頭50文字)':<50}\n")
    sys.stdout.write("-" * 98 + "\n")
    
    # コアフィールドのパース表示
    for i in range(EXPECTED_COLUMNS_COUNT):
        col_name = f'C{i+1}'
        mapping = FIELD_MAPPING.get(col_name)
        
        if mapping:
            db_field = mapping.get('DB_FIELD', 'N/A')
        else:
            continue
            
        raw_value = row_list[i] if i < len(row_list) else ""
        
        display_value = raw_value.replace('\n', '\\n').replace('\r', '\\r')
        if len(display_value) > 50:
            display_value = display_value[:47] + "..."
            
        sys.stdout.write(f"{col_name:<7} | {db_field:<35} | '{display_value}'\n")
            
    sys.stdout.write(f"{'ALL':<7} | {'raw_csv_data':<35} | '全カラムの生データ'\n")
    sys.stdout.write("--------------------------------------------------------------------------------------------------\n")
    sys.stdout.flush()


def _parse_single_row(row_list: List[str], mid: str, advertiser_name: str) -> Optional[Dict[str, Any]]:
    """単一行のCSVデータをパースし、DB保存用の辞書形式に変換する。"""
    if len(row_list) != EXPECTED_COLUMNS_COUNT:
        # この処理は parse_and_process_file で既にスキップされているが、念のため
        return None 

    data: Dict[str, Any] = {
        'merchant_id': mid, 
        'created_at': timezone.now(), 
        'updated_at': timezone.now(),
        'is_active': True,
        'in_stock': True, 
        'sku': None, 
        'product_url': '', 
        'product_name': None, 
        'affiliate_url': '', 
        'merchant_name': advertiser_name, 
        'price': None, 
    }
    
    data['raw_csv_data'] = FIXED_DELIMITER.join(row_list)

    # コアフィールドのパース (price以外)
    for i in range(EXPECTED_COLUMNS_COUNT):
        col_name = f'C{i+1}'
        raw_value = row_list[i] if i < len(row_list) else '' # インデックス範囲外の場合は空文字列
        
        mapping = FIELD_MAPPING.get(col_name)
        if not mapping:
            continue
            
        db_field = mapping.get('DB_FIELD')
        data_type = mapping.get('TYPE')

        # C13 (price) は多重チェックのため、ここではスキップする
        if db_field == 'price':
             continue

        if not db_field:
            continue
        
        parsed_value = safe_cast(raw_value, data_type, db_field)
        if parsed_value is not None:
            data[db_field] = parsed_value

    # --- 必須チェック: sku, product_name は必須 ---
    
    # 1. SKUチェック (C3)
    if not data.get('sku'):
        raw_c3 = row_list[2] if len(row_list) > 2 else 'N/A'
        raw_c3_clean = raw_c3.replace('\n', '\\n').replace('\r', '\\r')
        logger.debug(f"[MID: {mid}] スキップ: SKU (C3) がNone。Raw C3: '{raw_c3_clean}'")
        return None
        
    # 2. Product Nameチェック (C2)
    if not data.get('product_name'):
        raw_c2 = row_list[1] if len(row_list) > 1 else 'N/A'
        raw_c2_clean = raw_c2.replace('\n', '\\n').replace('\r', '\\r')
        logger.debug(f"[MID: {mid}] スキップ: Product Name (C2) がNone。Raw C2: '{raw_c2_clean}'")
        return None
        
    # 3. Priceチェック (C13, C14) - 優先順位に従ってチェックし、データに格納
    
    # 価格が格納される可能性のあるカラムのインデックスと、チェック優先順位 (C1 = index 0)
    # ユーザーのデバッグログに基づいて C14 を優先
    price_check_indices = {
        'C14 (Price Candidate)': 13,   # ⬅️ 1. C14を最初に確認 (インデックス 13)
        'C13 (Original Price)': 12,    # ⬅️ 2. C13を次に確認 (インデックス 12)
        'C12': 11,
        'C4 (Description/Price?)': 3,
        'C5 (Category/Price?)': 4,
    }
    
    # 優先度順にカラムをチェックし、最初に見つかった有効な価格を採用
    for name, index in price_check_indices.items():
        if index < len(row_list):
            raw_value = row_list[index]
            # Priceには Decimal型を期待しているため、safe_castを使用
            parsed_price = safe_cast(raw_value, 'Decimal', name)
            
            # 価格が有効な Decimal値としてパースされたら採用
            if parsed_price is not None:
                data['price'] = parsed_price
                break # 価格が見つかったのでループを終了

    # 4. Priceの最終チェック (必須フィールドとして)
    if data.get('price') is None:
        
        # ログ出力用の生データを収集
        debug_info = {}
        for name, index in price_check_indices.items():
            if index < len(row_list):
                # 特殊文字をエスケープし、長すぎる場合は切り詰める
                raw_value = row_list[index].replace('\n', '\\n').replace('\r', '\\r')
                debug_info[name] = raw_value[:30] + ('...' if len(raw_value) > 30 else '')
            else:
                debug_info[name] = 'INDEX_OUT_OF_BOUNDS'
        
        debug_log_str = " | ".join([f"{k}: '{v}'" for k, v in debug_info.items()])
        
        # ログメッセージを修正: C13だけでなく、価格全体がNoneであること示す
        logger.debug(f"[MID: {mid}] スキップ: Price がNone。生データチェック: {debug_log_str}")
        return None
    
    return data


def _bulk_import_products(mid: str, product_data_list: List[Dict[str, Any]]) -> Tuple[int, int, int]:
    
    if not product_data_list or LinkshareProduct == DummyModel:
        # 💡 修正: ロギングに置き換え
        logger.warning(f"⚠️ [BULK] LinkshareProductモデル未定義のため、DB保存をスキップ。処理件数: {len(product_data_list)}")
        return len(product_data_list), len(product_data_list), 0 

    # 辞書のキーは 'sku'
    incoming_sku_map = {data['sku']: data for data in product_data_list if data.get('sku')} 
    skus_to_check = list(incoming_sku_map.keys())
    
    to_create_linkshare: List[LinkshareProduct] = []
    to_update_linkshare: List[LinkshareProduct] = []

    # 1. LinkshareProduct の Upsert 準備
    
    # フィルタリングは 'sku__in'
    existing_products = LinkshareProduct.objects.filter(
        merchant_id=mid,
        sku__in=skus_to_check
    ).only(
        'sku', 
        'id', 
        'price', 
        'in_stock', 
        'is_active', 
        'product_url',
        'affiliate_url', 
        'raw_csv_data',
        'merchant_id',
        'created_at',
        'updated_at',
        'merchant_name',
        'product_name',
    )
    
    existing_sku_map = {p.sku: p for p in existing_products}
    
    # 更新対象フィールド
    update_fields = [
        'price', 'in_stock', 'is_active', 
        'sku', 'product_url', 'affiliate_url', 
        'raw_csv_data',
        'updated_at',
        'merchant_name',
        'product_name',
    ]
    
    # 必須フィールド
    required_fields = [
        'price', 'in_stock', 'is_active', 'sku', 'product_url', 
        'raw_csv_data', 'affiliate_url', 'merchant_name', 'product_name'
    ] 
    
    for sku, data in incoming_sku_map.items():
        
        # Djangoモデルが持つフィールドのみを厳密にフィルタリング
        allowed_fields = set(required_fields + ['merchant_id', 'created_at', 'updated_at', 'sku']) 
        
        clean_data = {
            k: v for k, v in data.items() 
            if hasattr(LinkshareProduct, k) and k in allowed_fields
        }
        
        clean_data['updated_at'] = timezone.now() 

        if 'created_at' not in clean_data:
            clean_data['created_at'] = timezone.now() 
        
        if sku in existing_sku_map:
            product_instance = existing_sku_map[sku]
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
            to_create_linkshare.append(new_instance)
    
    updated_count = 0
    if to_update_linkshare:
        try:
            # bulk_update の batch_size を BATCH_SIZE (1000) に設定
            LinkshareProduct.objects.bulk_update(to_update_linkshare, update_fields, batch_size=BATCH_SIZE)
            updated_count = len(to_update_linkshare)
        except Exception as e:
            logger.error(f" ❌ [MID: {mid}] バルク更新中にエラーが発生しました: {e}", exc_info=True)
            
    created_count = 0
    if to_create_linkshare:
        try:
            # bulk_create の batch_size を BATCH_SIZE (1000) に設定
            LinkshareProduct.objects.bulk_create(
                to_create_linkshare, 
                batch_size=BATCH_SIZE 
            )
        # IntegrityError はバルク作成で捕捉されます
        except IntegrityError as e:
            logger.error(f" ❌ [MID: {mid}] バルク作成中にIntegrityErrorが発生しました: {e}", exc_info=True)
            
        created_count = len(to_create_linkshare)
            
    return created_count + updated_count, created_count, updated_count


# ==============================================================================
# データパースと保存を統合したメイン処理 (tqdm対応版)
# ==============================================================================

def parse_and_process_file(local_path: str, mid: str) -> Tuple[bool, int]:
    """CSVファイルをパースし、DBに保存する。"""
    
    current_batch: List[Dict[str, Any]] = []
    total_saved_rows = 0
    advertiser_name: str = 'N/A'
    first_row_logged = False
    
    delimiter = FIXED_DELIMITER 
    
    try:
        # ファイルの全行数を取得 (tqdmのTotal設定のため)
        # 💡 修正: 空のファイルを扱う際のエラー回避
        try:
            with open(local_path, 'r', encoding='utf-8') as f:
                # 行数を正確に数える (HDR行や末尾の空行を考慮)
                total_lines = sum(1 for line in f if line.strip())
        except Exception as e:
            logger.error(f"❌ [MID: {mid}] ファイルの行数カウント中にエラー: {e}")
            return False, 0
        
        if total_lines == 0:
            logger.warning(f"⚠️ [MID: {mid}] ファイルは空です。処理をスキップします。")
            return True, 0

        data_lines_to_process = total_lines # 初期値
        
        with open(local_path, 'r', encoding='utf-8', newline='') as f:
            reader = csv.reader(f, delimiter=delimiter)
            
            # 1. HDR行の処理 (1行目)
            try:
                hdr_row = next(reader)
                
                is_hdr_present = False
                if hdr_row and hdr_row[0].strip() == 'HDR':
                    advertiser_name = hdr_row[2].strip() if len(hdr_row) > 2 else 'N/A'
                    logger.info(f"💡 [MID: {mid}] Advertiser Nameを取得: '{advertiser_name}'。次の行からデータ開始。")
                    is_hdr_present = True
                else:
                    logger.warning(f"⚠️ [MID: {mid}] HDR行が見つかりませんでした。ファイル先頭からデータとして処理します。")
                    f.seek(0) # ファイルポインタを先頭に戻す
                    reader = csv.reader(f, delimiter=delimiter)
                    
                if is_hdr_present:
                    data_lines_to_process -= 1 # データ行の総数からHDR行を引く
                    
            except StopIteration:
                logger.error(f"❌ [MID: {mid}] ファイルが空です。")
                return False, 0
                
            # ⭐ 2. データ行の処理 (tqdmでラップ)
            progress_bar = tqdm(
                reader, # readerを直接渡す
                desc=f"📦 Parsing MID {mid}",
                unit=" lines",
                file=sys.stdout,
                total=data_lines_to_process, # totalを設定
                leave=True, 
            )
            
            for row in progress_bar:
                
                # 行が空だったり、カラム数が不正な場合はスキップ
                if not row or not row[0].strip() or len(row) != EXPECTED_COLUMNS_COUNT:
                    continue
                
                # 🚨 デバッグ出力: 最初のデータ行のみ、全カラムをデバッグ表示
                # tqdmループの最初のイテレーション (progress_bar.n == 1) で表示
                if not first_row_logged and progress_bar.n == 1 and logger.getEffectiveLevel() <= logging.DEBUG:
                    _display_mapping_for_first_row(row)
                    first_row_logged = True
                
                # 3. 単一行のパース
                record = _parse_single_row(row, mid, advertiser_name)
                
                # 必須チェックが失敗した場合、_parse_single_row内でログが出力され、ここでスキップされる
                # priceのチェックは _parse_single_row の中で行われている
                if not record or not record.get('sku') or not record.get('merchant_id') or record.get('price') is None:
                    continue

                current_batch.append(record)
                
                # 4. バッチ処理
                if len(current_batch) >= BATCH_SIZE:
                    saved, created, updated = _bulk_import_products(mid, current_batch)
                    total_saved_rows += saved
                    
                    # ⭐ DB書き込み完了情報をプログレスバーの右側に表示
                    progress_bar.set_postfix_str(f"DB Save: {saved:,} (New:{created:,}, Upd:{updated:,})")
                    
                    current_batch = []

            # 5. 最終バッチの処理
            if current_batch:
                saved, created, updated = _bulk_import_products(mid, current_batch)
                total_saved_rows += saved
                # 最終バッチの処理完了ログ
                logger.info(f"⏳ [MID: {mid}] 最終バッチ完了。保存: {saved:,} (新規:{created:,}, 更新:{updated:,})")

            # 最終完了ログ (tqdmのカウントを使用)
            logger.info(f"✅ [MID: {mid}] ファイルパース完了。総パース件数: {progress_bar.n:,} 件")
            return True, total_saved_rows

    except Exception as e:
        logger.error(f"❌ [MID: {mid}] パース処理中に予期せぬエラー: {e}", exc_info=True)
        return False, 0


def download_file(ftp_client: ftplib.FTP, filename: str, local_path_gz: str, local_path_txt: str, mid: str, file_size: int) -> Tuple[bool, int]:
    logger.info(f"📡 [MID: {mid}] ファイル {filename} ({human_readable_size(file_size)}) のダウンロードを開始...")
    
    ENCODING = 'utf-8'
    ERROR_HANDLING = 'ignore' 
    
    try:
        # 1. GZファイルのダウンロード
        with open(local_path_gz, 'wb') as f:
            ftp_client.retrbinary(f'RETR {filename}', f.write)

        logger.info(f"📦 [MID: {mid}] ダウンロード完了。解凍中...")
        
        # 2. GZファイルの解凍とデコード (エラー無視)
        decompressed_size = 0
        
        with gzip.open(local_path_gz, 'rb') as f_in:
            with open(local_path_txt, 'w', encoding='utf-8', newline='') as f_out:
                
                buffer_size = 1024 * 1024 # 1MB chunk
                
                # GZファイルのサイズを approximate totalとして使用 
                with tqdm(total=file_size, unit='B', unit_scale=True, desc=f"🔓 Decompressing {mid}", file=sys.stdout, leave=False) as t:
                    while True:
                        chunk = f_in.read(buffer_size)
                        if not chunk:
                            break
                        
                        text_chunk = chunk.decode(ENCODING, errors=ERROR_HANDLING) 
                        f_out.write(text_chunk)
                        
                        decompressed_size += len(text_chunk)
                        t.update(len(chunk)) # 圧縮されたバイト数でプログレスバーを更新
                        
        logger.info(f"✅ [MID: {mid}] 解凍・デコード完了 (エンコーディング: {ENCODING}, エラー処理: {ERROR_HANDLING})。TXTファイルサイズ: {human_readable_size(decompressed_size)}")
        
        # 3. GZファイルの削除
        os.remove(local_path_gz)
        
        return True, decompressed_size

    except ftplib.all_errors as e:
        logger.error(f"❌ [MID: {mid}] FTPダウンロード失敗: {e}")
        if os.path.exists(local_path_gz): os.remove(local_path_gz)
        if os.path.exists(local_path_txt): os.remove(local_path_txt)
        return False, 0
    except Exception as e:
        logger.error(f"❌ [MID: {mid}] ダウンロード/解凍中に予期せぬエラー: {e}", exc_info=True)
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
        # verbosityはBaseCommandにデフォルトで定義されています (0=ERROR, 1=INFO, 2=DEBUG, 3=TRACE)

    def handle(self, *args, **options):
        
        # 💡 ステップ 1: ロガーのレベル設定
        verbosity = int(options.get('verbosity', 1)) # デフォルトは 1 (INFO)
        
        # ログレベルの調整 (verbosity=2 で DEBUG レベル)
        if verbosity >= 2:
            log_level = logging.DEBUG
        elif verbosity == 1:
            log_level = logging.INFO
        else: # verbosity = 0
            log_level = logging.ERROR

        # ロガーとハンドラーを設定
        logger.setLevel(log_level)
        if not logger.handlers:
            # Djangoのstdout/stderrを使用するハンドラー
            class DjangoConsoleHandler(logging.StreamHandler):
                def __init__(self, stdout, stderr):
                    super().__init__(self._get_stream(stdout, stderr))
                    self.stdout = stdout
                    self.stderr = stderr
                
                def _get_stream(self, stdout, stderr):
                    # INFO/DEBUGレベルのログを標準出力に送る
                    return sys.stdout 
                
                def emit(self, record):
                    # エラーレベルの場合、BaseCommandのstderrを利用
                    if record.levelno >= logging.ERROR:
                        stream = self.stderr
                    else:
                        stream = self.stdout
                    self.stream = stream
                    super().emit(record)


            handler = DjangoConsoleHandler(self.stdout, self.stderr)
            # フォーマットを変更してロギングから print と似た出力を得る
            formatter = logging.Formatter('%(message)s')
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        logger.info("--- LinkShare データインポートコマンド開始 (バルク処理) ---")

        # 🚨 モデルのインポートとグローバルスコープの置き換え
        try:
            # 適切なインポートパスに修正してください
            # from api.models.linkshare_products import LinkshareProduct as RealLinkshareProduct
            from api.models import LinkshareProduct as RealLinkshareProduct # 仮定
            
            globals()['LinkshareProduct'] = RealLinkshareProduct
            logger.info("✅ モデル (LinkshareProduct) のインポート成功。")
            
        except ImportError as e:
            logger.error(f"🚨 CRITICAL: モデルのインポートに失敗しました。DBへの保存は行われません。")
            logger.error(f"エラー詳細: {e}")
        
        # ダウンロードディレクトリの作成
        if not os.path.exists(DOWNLOAD_DIR):
            os.makedirs(DOWNLOAD_DIR)
            logger.info(f"📁 ダウンロードディレクトリ {DOWNLOAD_DIR} を作成しました。")

        # FTP接続
        ftp_client = _get_ftp_client()

        if not ftp_client:
            logger.error("🚨 FTP接続に失敗しました。処理を終了します。")
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
                logger.warning("❌ 処理対象となるLinkShareマーチャンダイザーファイルが見つかりませんでした。")
                return

            logger.info(f"✅ {len(mid_list)} 件のMIDファイル処理を開始します。")

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
                logger.info(f"\n--- [MID: {mid}] 処理開始 ({filename}) ---")
                
                # ローカルパスの決定
                local_gz_path = os.path.join(DOWNLOAD_DIR, filename)
                local_txt_path = local_gz_path.replace('.gz', '.txt')

                # トランザクション処理 (Atomic: 失敗時ロールバック)
                with transaction.atomic():
                    success = False
                    current_saved_rows = 0
                    try:
                        # 1. ダウンロードと解凍 (tqdm対応)
                        is_downloaded, downloaded_size = download_file(
                            ftp_client, 
                            filename, 
                            local_gz_path, 
                            local_txt_path, 
                            mid, 
                            file_size
                        )
                        
                        if is_downloaded:
                            # 2. パースと保存 (tqdm対応)
                            success, current_saved_rows = parse_and_process_file(local_txt_path, mid) 
                            
                            # 3. 処理済みTXTファイルのクリーンアップ
                            if os.path.exists(local_txt_path):
                                os.remove(local_txt_path)
                                logger.info(f"🧹 [MID: {mid}] 処理済みファイル {os.path.basename(local_txt_path)} を削除しました。") 

                        
                    except Exception as e:
                        # 処理中の致命的なエラーを捕捉し、ロールバック
                        logger.error(f"\n[MID: {mid}] 処理中に致命的な例外が発生しました。トランザクションはロールバックされます。", exc_info=True)
                        logger.error(f"エラータイプ: {type(e).__name__}, メッセージ: {str(e)}")

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
                    logger.info("\n📡 FTP接続を閉じました。")
                except ftplib.all_errors:
                    pass
            
        self.stdout.write(f"\n==================================================================================")
        self.stdout.write(f"--- 最終結果: インポートコマンド完了 ---")
        self.stdout.write(f"正常処理ファイル数: {total_processed_files} / {len(mid_list)} 件")
        self.stdout.write(self.style.SUCCESS(f"合計保存行数: {total_saved_rows:,} 行"))
        self.stdout.write("==================================================================================")
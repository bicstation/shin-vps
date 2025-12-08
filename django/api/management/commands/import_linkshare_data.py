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
from typing import List, Tuple, Dict, Any, Optional
from decimal import Decimal, InvalidOperation

# Djangoのコア機能とモデルをインポート
from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError 
from django.utils import timezone

# 🚨 【重要：修正箇所 1】実際のモデルをインポートする
# 実際のプロジェクト構造に合わせて、api.models.products から LinkshareProduct をインポートします。
try:
    # モデルのインポートは仮定に基づいています。実際のプロジェクト構造に合わせてください。
    from api.models.linkshare_products import LinkshareProduct 
    from api.models.raw_and_entities import RawApiData
except ImportError:
    # 実行環境がない場合のダミー定義 (コード実行環境でエラーにならないように)
    class DummyModel:
        objects = None
        def __init__(self, **kwargs): pass
    LinkshareProduct = DummyModel
    RawApiData = DummyModel


# ==============================================================================
# 接続・ファイル設定 (定数)
# ==============================================================================
FTP_HOST = os.getenv("LINKSHARE_FTP_HOST", "aftp.linksynergy.com")
FTP_USER = os.getenv("LINKSHARE_BS_USER", "rkp_3750988")
FTP_PASS = os.getenv("LINKSHARE_BS_PASS", "u5NetPVZEAhABD7HuW2VRymP")
FTP_PORT = 21
FTP_TIMEOUT = 180

MAX_SIZE_BYTES = 1073741824 # 1 GB のバイト値
DOWNLOAD_DIR = "/tmp/ftp_downloads"

FULL_DATA_PATTERN = r"(\d+)_3750988_mp\.txt\.gz$"
DELTA_DATA_PATTERN = r"(\d+)_3750988_delta\.txt\.gz$"

FIXED_DELIMITER = '|'
FIXED_DELIMITER_NAME = 'PIPE'

# ==============================================================================
# ヘルパー関数群 (ユーティリティ、データ型変換、FTP接続)
# ==============================================================================

def human_readable_size(size_bytes):
    """バイト値を人が読みやすい形式に変換する"""
    if size_bytes is None or size_bytes == 0:
        return "0 B"
    size_name = ("B", "KB", "MB", "GB", "TB")
    i = 0
    size_bytes = float(size_bytes)
    while size_bytes >= 1024 and i < len(size_name) - 1:
        size_bytes /= 1024
        i += 1
    return f"{size_bytes:,.2f} {size_name[i]}"

def _get_ftp_client() -> Optional[ftplib.FTP]:
    """FTPクライアントを取得し、接続・ログインする"""
    print(f"🌐 [DEBUG] _get_ftp_client 呼び出し開始。", file=sys.stdout, flush=True)

    if not all([FTP_HOST, FTP_USER, FTP_PASS]):
        print("🚨 [DEBUG] 接続情報が不足しています。", file=sys.stderr, flush=True)
        return None

    ftp_client = None
    try:
        print(f"📡 [DEBUG] 接続試行: {FTP_HOST}:{FTP_PORT}, ユーザー: {FTP_USER}")

        ftp_client = ftplib.FTP(timeout=FTP_TIMEOUT)
        print("💡 [DEBUG] ftplib.FTP クライアント生成成功。", file=sys.stdout, flush=True)
        
        ftp_client.connect(FTP_HOST, FTP_PORT)
        print("💡 [DEBUG] ftp_client.connect 成功。", file=sys.stdout, flush=True)
        
        ftp_client.login(FTP_USER, FTP_PASS)
        print("💡 [DEBUG] ftp_client.login 成功。", file=sys.stdout, flush=True)

        # パッシブモード (PASV) を強制設定する
        ftp_client.set_pasv(True) 
        print("✅ [DEBUG] パッシブモード (PASV) を設定しました。", file=sys.stdout, flush=True)
        
        print("✅ [DEBUG] FTP接続およびログイン成功。_get_ftp_client 終了。", file=sys.stdout, flush=True)
        return ftp_client

    except ftplib.all_errors as e:
        print(f"❌ [DEBUG] FTP接続/ログイン失敗 (ftplib.all_errors): {type(e).__name__} - {e}", file=sys.stderr, flush=True)
        if ftp_client:
            try: ftp_client.quit()
            except Exception: pass
        return None
    except Exception as e:
        print(f"❌ [DEBUG] FTP接続/ログイン失敗 (予期せぬエラー): {type(e).__name__} - {e}", file=sys.stderr, flush=True)
        return None

def get_ftp_mid_list(data_path: str = "") -> List[Tuple[str, str, str, Optional[datetime], int]]:
    """FTPサーバーからMIDごとの最新ファイルリストを取得する"""
    print(f"📋 [DEBUG] get_ftp_mid_list 呼び出し開始。データパス: '{data_path}'", file=sys.stdout, flush=True)
    
    ftp = _get_ftp_client()
    if not ftp:
        print("❌ [DEBUG] get_ftp_mid_list 終了 (FTP接続失敗)。", file=sys.stdout, flush=True)
        return []

    if data_path:
        # ディレクトリ変更ロジック
        try:
            ftp.cwd(data_path)
            print(f"💡 [DEBUG] ディレクトリを '{data_path}' に変更しました。", file=sys.stdout, flush=True)
        except Exception as e:
            print(f"❌ [DEBUG] ディレクトリ変更失敗: {e}", file=sys.stderr, flush=True)
            ftp.quit()
            return []
    
    try:
        file_names = ftp.nlst()
        print(f"📋 [DEBUG] ファイルリスト取得成功。ファイル数: {len(file_names)}", file=sys.stdout, flush=True)
    except Exception as e:
        print(f"❌ [DEBUG] ファイルリスト取得失敗: {e}", file=sys.stderr, flush=True)
        ftp.quit()
        return []

    ftp.voidcmd('TYPE I')
    print("💡 [DEBUG] TYPE I (バイナリ転送モード) を設定。", file=sys.stdout, flush=True)

    # {MID: (filename, file_type, mtime_ts, file_size)}
    mid_file_details: Dict[str, Tuple[str, str, float, int]] = {}

    for filename in file_names:
        match_full = re.match(FULL_DATA_PATTERN, filename)
        match_delta = re.match(DELTA_DATA_PATTERN, filename)
        match = match_full or match_delta
        if not match: continue
        
        current_id = match.group(1)
        file_type = "FULL" if match_full else "DELTA"
        mtime_ts: float = 0.0
        file_size: int = 0
        
        # ファイルサイズとタイムスタンプを取得
        try:
            file_size = ftp.size(filename)
            if file_size > MAX_SIZE_BYTES: 
                print(f"⚠️ [DEBUG] ファイルサイズ超過でスキップ: {filename} ({human_readable_size(file_size)})", file=sys.stdout, flush=True)
                continue
        except Exception: 
            continue
            
        try:
            mtime_response = ftp.sendcmd('MDTM ' + filename)
            if mtime_response.startswith('213 '):
                # YYYYMMDDHHMMSS 形式
                mtime_str = mtime_response[4:].strip()
                mtime_dt_naive = datetime.strptime(mtime_str, '%Y%m%d%H%M%S')
                mtime_ts = mtime_dt_naive.replace(tzinfo=timezone.utc).timestamp()
        except Exception: 
            pass
            
        if mtime_ts <= 0.0: continue
        
        # 最新のファイルを選択するロジック
        if current_id not in mid_file_details:
            mid_file_details[current_id] = (filename, file_type, mtime_ts, file_size)
        else:
            existing_filename, existing_type, existing_ts, existing_size = mid_file_details[current_id]
            
            # FULLファイルはDELTAファイルより優先（ロジックの簡略化のため、ここでは単純に上書き）
            if file_type == "FULL" and existing_type == "DELTA":
                 mid_file_details[current_id] = (filename, file_type, mtime_ts, file_size)
            # 同じタイプなら新しいものを採用
            elif file_type == existing_type and mtime_ts > existing_ts:
                mid_file_details[current_id] = (filename, file_type, mtime_ts, file_size)

    try:
        ftp.quit()
        print("💡 [DEBUG] FTP接続を切断しました。", file=sys.stdout, flush=True)
    except Exception:
        pass

    final_list = []
    for current_id, details in mid_file_details.items():
        filename, file_type, mtime_ts, file_size = details
        mtime_dt = datetime.fromtimestamp(mtime_ts, tz=timezone.utc) if mtime_ts > 0.0 else None
        final_list.append((current_id, filename, file_type, mtime_dt, file_size))

    print(f"✅ [DEBUG] get_ftp_mid_list 終了。有効なMIDファイル数: {len(final_list)}", file=sys.stdout, flush=True)
    return sorted(final_list, key=lambda x: x[0])


def _parse_linkshare_date(date_str: Optional[str]) -> Optional[datetime]:
    """Linkshareの日付文字列をUTCのdatetimeオブジェクトに変換する"""
    if not date_str: return None
    try:
        # Linkshareのデータファイルで一般的に使われる形式
        return datetime.strptime(date_str, '%m/%d/%Y %H:%M:%S').replace(tzinfo=timezone.utc)
    except ValueError:
        return None

def _clean_decimal_field(value: Optional[str]) -> Optional[Decimal]:
    """金額フィールドの文字列をDecimalに変換する"""
    if not value or not value.strip(): return None
    try:
        # カンマを除去してDecimalに変換
        cleaned_value = value.strip().replace(',', '')
        return Decimal(cleaned_value)
    except (InvalidOperation, ValueError):
        return None

# ==============================================================================
# データパースロジック (バルク処理のためにDictを返すように変更)
# ==============================================================================

def _parse_single_row(row_list: List[str], mid: str) -> Optional[Dict[str, Any]]:
    """1行の商品データをパースし、DB保存用の辞書データに変換する"""
    
    # LinkShare商品データは基本38フィールド
    if len(row_list) != 38: 
        return None
    
    sku = row_list[2].strip()
    if not sku: return None
    
    # 🚨 修正: 型変換のインデックスを仕様に合わせて修正
    discount_amount_dec = _clean_decimal_field(row_list[11]) # C12: Discount Amount
    sale_price_dec = _clean_decimal_field(row_list[13])      # C14: Sale Price
    retail_price_dec = _clean_decimal_field(row_list[14])     # C15: Retail Price
    shipping_dec = _clean_decimal_field(row_list[18])       # C19: Shipping
    begin_date_dt = _parse_linkshare_date(row_list[15])      # C16: Begin Date
    end_date_dt = _parse_linkshare_date(row_list[16])        # C17: End Date
    
    # LinkshareProductモデルのフィールド名にマッピング
    data = {
        # Key Fields
        'merchant_id': mid,
        'sku': sku,
        # C1: Link ID
        'link_id': row_list[0].strip(),
        # C2/C22: Manufacturer Name (C22を優先し、C2が空の場合はC2を使用)
        # Note: 既存のコードはC22をC2より後に使用していましたが、Linkshareの仕様に従いPrimary/Fallbackとして扱います。
        'manufacturer_name': row_list[21].strip() if row_list[21].strip() else row_list[1].strip(), 
        # C4: Product Name
        'product_name': row_list[3].strip(), 
        # C5: Primary Category
        'primary_category': row_list[4].strip(),
        # C6: Sub Category
        'sub_category': row_list[5].strip(),
        # C7: Product URL
        'product_url': row_list[6].strip(),
        # C8: Image URL
        'image_url': row_list[7].strip(),
        # C9: Buy URL
        'buy_url': row_list[8].strip(),
        # C10: Short Description
        'short_description': row_list[9].strip(),
        # C11: Description
        'description': row_list[10].strip(),
        # C12: Discount Amount
        'discount_amount': discount_amount_dec,
        # C13: Discount Type
        'discount_type': row_list[12].strip(),
        # C14: Sale Price
        'sale_price': sale_price_dec,
        # C15: Retail Price
        'retail_price': retail_price_dec,
        # C16: Begin Date
        'begin_date': begin_date_dt,
        # C17: End Date
        'end_date': end_date_dt,
        # C18: Brand Name
        'brand_name': row_list[17].strip(),
        # C19: Shipping
        'shipping': shipping_dec,
        # C20: Keywords
        'keywords': row_list[19].strip(),
        # C25: Common Product Code
        'class_id': row_list[24].strip(),
        # 他のフィールド (C21, C23, C24, C26-C38) は未使用として除外
    }
    return data

def _display_mapping_for_first_row(row_list: List[str]):
    """最初のデータ行の各カラムとDBフィールドのマッピングを表示する"""
    # LinkShareマーチャンダイザーのフィールドマッピング (0から始まるインデックス)
    
    # 🚨 修正: too many values to unpack (expected 4)エラー回避のため、すべてのタプルを4要素に統一
    if len(row_list) != 38:
        print(f"\n[データマッピング確認] ⚠️ 不正なフィールド数 ({len(row_list)} / 38) のためスキップしました。", file=sys.stdout, flush=True)
        return

    # (インデックス, DB Field Name (Source Col), データ型, Raw Value) の4要素タプルで統一
    mapping_data = [
        (0, "link_id (C1: Link ID)", "str", row_list[0].strip()),
        (1, "manufacturer_name (C2: Merchant Name, Fallback)", "str", row_list[1].strip()),
        (2, "sku (C3: SKU, Primary Key)", "str", row_list[2].strip()),
        (3, "product_name (C4: Product Name)", "str", row_list[3].strip()),
        (4, "primary_category (C5: Primary Category)", "str", row_list[4].strip()),
        (5, "sub_category (C6: Sub Category)", "str", row_list[5].strip()),
        (6, "product_url (C7: Product URL)", "str", row_list[6].strip()),
        (7, "image_url (C8: Image URL)", "str", row_list[7].strip()),
        (8, "buy_url (C9: Buy URL)", "str", row_list[8].strip()),
        (9, "short_description (C10: Short Description)", "str", row_list[9].strip()),
        (10, "description (C11: Description)", "str", row_list[10].strip()),
        (11, "discount_amount (C12: Discount Amount)", "Decimal", row_list[11].strip()),
        (12, "discount_type (C13: Discount Type)", "str", row_list[12].strip()),
        (13, "sale_price (C14: Sale Price)", "Decimal", row_list[13].strip()),
        (14, "retail_price (C15: Retail Price)", "Decimal", row_list[14].strip()),
        (15, "begin_date (C16: Begin Date)", "datetime (UTC)", row_list[15].strip()),
        (16, "end_date (C17: End Date)", "datetime (UTC)", row_list[16].strip()),
        (17, "brand_name (C18: Brand Name)", "str", row_list[17].strip()),
        (18, "shipping (C19: Shipping)", "Decimal", row_list[18].strip()),
        (19, "keywords (C20: Keywords)", "str", row_list[19].strip()),
        # 5要素のタプルを4要素に修正: "C21 (Skipped)"をフィールド名に含める
        (20, "C21 (Skipped)", "str", row_list[20].strip()),
        (21, "manufacturer_name (C22: Manufacturer Name, Primary)", "str", row_list[21].strip()),
        (22, "C23 (Skipped)", "str", row_list[22].strip()),
        (23, "C24 (Skipped)", "str", row_list[23].strip()),
        (24, "class_id (C25: Common Product Code)", "str", row_list[24].strip()),
        (25, "C26: Currency Unit (Skipped)", "str", row_list[25].strip()),
        (26, "C27: M1 (Skipped)", "str", row_list[26].strip()),
        (27, "C28: Impression URL (Skipped)", "str", row_list[27].strip()),
        (28, "C29 (Skipped)", "str", row_list[28].strip()),
        (29, "C30 (Skipped)", "str", row_list[29].strip()),
        (30, "C31 (Skipped)", "str", row_list[30].strip()),
        (31, "C32 (Skipped)", "str", row_list[31].strip()),
        (32, "C33 (Skipped)", "str", row_list[32].strip()),
        (33, "C34 (Skipped)", "str", row_list[33].strip()),
        (34, "C35 (Skipped)", "str", row_list[34].strip()),
        (35, "C36 (Skipped)", "str", row_list[35].strip()),
        (36, "C37 (Skipped)", "str", row_list[36].strip()),
        (37, "C38 (Skipped)", "str", row_list[37].strip()),
    ]
    
    print("\n" + "=" * 80, file=sys.stdout, flush=True)
    print("📋 CSVデータ行 (最初の1行) のフィールドマッピングと値の確認", file=sys.stdout, flush=True)
    print("=" * 80, file=sys.stdout, flush=True)
    print("{:<5} {:<45} {:<30}".format("Idx", "DB Field Name (Source Col)", "Raw Value (Truncated)"), file=sys.stdout, flush=True)
    print("-" * 80, file=sys.stdout, flush=True)

    for index, db_field, data_type, raw_value in mapping_data:
        # 長すぎる値は切り詰めて表示
        display_value = raw_value.replace('\n', ' ').replace('\r', ' ')
        if len(display_value) > 30:
            display_value = display_value[:27] + "..."
            
        print("{:<5} {:<45} {:<30}".format(
            index, 
            f"{db_field} [{data_type}]", 
            f"'{display_value}'"
        ), file=sys.stdout, flush=True)

    print("-" * 80, file=sys.stdout, flush=True)
    print("💡 DBフィールド名が太字で、括弧内がLinkShareのカラム名とデータ型です。未使用カラムはスキップされます。", file=sys.stdout, flush=True)
    print("=" * 80 + "\n", file=sys.stdout, flush=True)


def _bulk_import_products(mid: str, product_data_list: List[Dict[str, Any]]) -> Tuple[int, int, int]:
    """
    収集された商品データをバルクでDBに保存/更新する。
    返り値: (合計処理行数, 作成行数, 更新行数)
    """
    if not product_data_list or LinkshareProduct == DummyModel:
        return 0, 0, 0

    incoming_sku_map = {data['sku']: data for data in product_data_list}
    skus_to_check = list(incoming_sku_map.keys())
    
    to_create = []
    to_update = []
    
    # 1. 既存製品のクエリ
    # Command.handleでトランザクションが開始されているため、select_for_update()は排他ロックをかける
    existing_products = LinkshareProduct.objects.filter(
        merchant_id=mid,
        sku__in=skus_to_check
    )
    
    existing_sku_map = {p.sku: p for p in existing_products}
    
    # 2. 作成/更新の分類とインスタンスの準備
    # bulk_updateの更新対象フィールドリスト
    update_fields = [
        'link_id', 'manufacturer_name', 'product_name', 'primary_category', 'sub_category',
        'product_url', 'image_url', 'buy_url', 'short_description', 'description', 
        'discount_amount', 'discount_type', 'sale_price', 'retail_price', 'begin_date', 
        'end_date', 'brand_name', 'shipping', 'keywords', 'class_id',
    ]

    for sku, data in incoming_sku_map.items():
        if sku in existing_sku_map:
            # 更新 (既存インスタンスのフィールドを上書き)
            product_instance = existing_sku_map[sku]
            for key, value in data.items():
                # SKUとMIDは更新対象外
                if key in update_fields:
                    setattr(product_instance, key, value)
            to_update.append(product_instance)
        else:
            # 作成 (新規インスタンス)
            to_create.append(LinkshareProduct(**data))
    
    created_count = 0
    updated_count = 0
    
    # 3. バルク作成
    if to_create:
        try:
            LinkshareProduct.objects.bulk_create(to_create, batch_size=5000)
            created_count = len(to_create)
        except IntegrityError as e:
            print(f" ❌ バルク作成中にIntegrityErrorが発生しました: {e}", file=sys.stderr)
    
    # 4. バルク更新
    if to_update:
        try:
            # bulk_updateはインスタンスリストと更新フィールドを渡す
            LinkshareProduct.objects.bulk_update(to_update, update_fields, batch_size=5000)
            updated_count = len(to_update)
        except Exception as e:
            print(f" ❌ バルク更新中にエラーが発生しました: {e}", file=sys.stderr)
            
    return created_count + updated_count, created_count, updated_count

# ==============================================================================
# データパースと保存を統合したメイン処理 (バルク処理対応)
# ==============================================================================

def parse_and_process_file(local_path: str, mid: str) -> Tuple[bool, int]:
    """ダウンロードしたファイルを解凍、パースし、DBにバルクで保存する"""
    print(f"💾 [DEBUG {mid}] STARTING PARSE: {os.path.basename(local_path)}.", file=sys.stdout, flush=True)

    delimiter = FIXED_DELIMITER
    delimiter_name = FIXED_DELIMITER_NAME
    encoding_list = ['utf-8', 'cp932', 'shift_jis', 'euc_jp','latin-1']
    total_saved_rows = 0
    
    temp_txt_path = None
    path_to_open = local_path
    file_open_func = lambda path, enc: open(path, 'r', encoding=enc, errors='replace')
    
    try:
        # GZIPファイルの処理 (gunzip外部コマンドを使用)
        if local_path.endswith('.gz'):
            print(f"🔥 [MID: {mid}] .gzファイルを外部のgunzipで一時的に解凍します。", file=sys.stdout, flush=True)
            
            temp_txt_path = local_path.replace('.gz', '.txt') 
            
            print(f">>> [MID: {mid}] DECOMPRESS CALL (gunzip) -> {temp_txt_path}", file=sys.stdout, flush=True) 

            try:
                with open(temp_txt_path, 'wb') as f_out:
                    subprocess.run(
                        ['gunzip', '-c', local_path], 
                        stdout=f_out, 
                        check=True, 
                        timeout=300 # タイムアウトを長めに設定
                    )
                print(f"<<< [MID: {mid}] DECOMPRESS SUCCESS ({human_readable_size(os.path.getsize(temp_txt_path))})", file=sys.stdout, flush=True)
                path_to_open = temp_txt_path
            except subprocess.CalledProcessError as e:
                print(f"❌ [MID: {mid}] gunzipコマンド失敗: {e}.", file=sys.stdout, flush=True)
                return False, 0
            except FileNotFoundError:
                # 🚨 gunzipコマンドがない場合の明確なエラーメッセージ
                print(f"❌ [MID: {mid}] **gunzipコマンドが見つかりません。** (Dockerコンテナに`gzip`をインストールする必要があります。)", file=sys.stdout, flush=True)
                return False, 0
            except subprocess.TimeoutExpired:
                print(f"❌ [MID: {mid}] gunzipコマンドがタイムアウトしました。", file=sys.stdout, flush=True)
                return False, 0
            
        # --- エンコーディングを推測しながらファイルを処理するループ ---
        for encoding in encoding_list:
            try:
                processed_rows = 0
                product_data_list: List[Dict[str, Any]] = []
                is_likely_delimiter = False
                advertiser_name = ""
                
                print(f"🔎 [DEBUG {mid}] 試行開始 (ENC: {encoding}): OPENING {os.path.basename(path_to_open)}", file=sys.stdout, flush=True)

                # 1. サンプル読み込みとデリミタ/エンコーディング検証 
                with file_open_func(path_to_open, encoding) as f_text_test:
                    print(f"<<< [MID: {mid}] OPEN SUCCESS (ENC: {encoding})", file=sys.stdout, flush=True) 
                    
                    sample_lines: List[str] = []
                    for _ in range(50):
                        line = f_text_test.readline()
                        if not line: break
                        sample_lines.append(line)
                    
                    if not sample_lines:
                        print(f" ❌ [DEBUG {mid}] 早期検証失敗 (ENC: {encoding}): ファイルが空です。", file=sys.stdout, flush=True)
                        continue

                    # 🚨 修正: 1行目 (HDR) から Advertiser Name (メーカー名) を取得
                    header_line = sample_lines[0].strip()
                    if header_line.startswith('HDR'): 
                        header_fields = header_line.split(delimiter)
                        # HDR|MID|Advertiser Name|Timestamp
                        if len(header_fields) >= 3:
                            advertiser_name = header_fields[2].strip()
                            print(f"💡 [DEBUG {mid}] HDRレコードからAdvertiser Nameを取得しました: '{advertiser_name}'", file=sys.stdout, flush=True)
                        else:
                            print(f" ❌ [DEBUG {mid}] ヘッダー検証失敗 (ENC: {encoding}): HDRフィールド数 ({len(header_fields)}) が不正です。", file=sys.stdout, flush=True)
                            continue
                    else:
                        print(f" ❌ [DEBUG {mid}] ヘッダー検証失敗 (ENC: {encoding}): HDRで始まっていません。", file=sys.stdout, flush=True)
                        continue
                        
                    # 2行目 (カラム名ヘッダー) の存在チェック
                    if len(sample_lines) < 2:
                        print(f" ❌ [DEBUG {mid}] 早期検証失敗 (ENC: {encoding}): カラム名ヘッダー行が見つかりません。", file=sys.stdout, flush=True)
                        continue

                    # データ行検証 (38フィールド) は3行目から行う
                    valid_data_lines = 0
                    for line in sample_lines[2:]: # 3行目 (インデックス2) から開始
                        fields = line.strip().split(delimiter)
                        if len(fields) != 38: break
                        # C1 (Link ID) が整数であることをチェック
                        try:
                            # 1行でも38フィールドで構成されていれば、そのエンコーディングを採用
                            int(fields[0].strip()) 
                            is_likely_delimiter = True
                            valid_data_lines += 1
                        except ValueError: break
                        
                        if valid_data_lines >= 5: break # 5行検証できたら十分
                        
                    if is_likely_delimiter:
                        print(f"🔎 [DEBUG {mid}] 早期検証成功: ENC: {encoding}, DELIM: {delimiter_name}", file=sys.stdout, flush=True)
                    
                    if not is_likely_delimiter:
                        continue # 次のエンコーディングを試行

                print(f" ➡️ [MID: {mid}] 試行: ENC: {encoding}, DELIM: {delimiter_name}。本番パース開始...", file=sys.stdout, flush=True)

                # 2. 本番パース: 成功したエンコーディングでファイルを再度開き、CSVリーダーでデータ収集
                with file_open_func(path_to_open, encoding) as f_main:
                    f_main.readline() # 1行目: HDRレコードをスキップ (すでに読み込み済み)
                    
                    # 2行目: カラム名ヘッダー行をスキップ
                    column_header_line = f_main.readline()
                    print(f"💡 [MID: {mid}] カラム名ヘッダー行をスキップしました (例: {column_header_line.strip()[:60]}...)。", file=sys.stdout, flush=True)
                    
                    csv_reader = csv.reader(f_main, delimiter=delimiter, quotechar='"')
                    
                    # 最初のデータ行を読み込み、マッピングを表示し、リストに追加
                    first_row: Optional[List[str]] = None
                    try:
                        # 最初の行を読み込み
                        current_row = next(csv_reader) 
                        
                        # ヘッダー行が漏れている場合を考慮し、有効なデータ行が見つかるまでスキップする
                        max_skip_count = 5
                        current_skip_count = 0
                        
                        while current_skip_count < max_skip_count:
                            if not current_row or current_row[0].strip().startswith('TRL'):
                                break # ファイルの終端またはトレーラーレコード
                            
                            if len(current_row) != 38:
                                # データ行のフィールド数が不正な場合、スキップして次の行へ
                                print(f" ⚠️ [MID: {mid}] 行のフィールド数が不正です ({len(current_row)} / 38)。スキップします。", file=sys.stdout, flush=True)
                                current_skip_count += 1
                                current_row = next(csv_reader)
                                continue
                                
                            # C14 (Sale Price, Index 13) がヘッダー文字列の場合、ヘッダーと見なしてスキップ
                            # 'amount', 'price', 'retail_price' など
                            sale_price_raw = current_row[13].strip().lower()
                            if sale_price_raw and not sale_price_raw.replace(',', '', 1).replace('.', '', 1).isdigit(): 
                                print(f" ⚠️ [MID: {mid}] C14 (Sale Price) の値がヘッダー文字列のようです ('{sale_price_raw[:20]}')。スキップします。", file=sys.stdout, flush=True)
                                current_skip_count += 1
                                current_row = next(csv_reader)
                                continue
                            
                            # 有効なデータ行が見つかった
                            first_row = current_row
                            break
                        
                        if not first_row:
                             print(f" ❌ [MID: {mid}] ファイルにデータ行が見つかりませんでした。", file=sys.stdout, flush=True)
                             continue

                    except StopIteration:
                        print(f" ❌ [MID: {mid}] ファイルにデータ行が見つかりませんでした。", file=sys.stdout, flush=True)
                        continue
                    except Exception as e:
                        print(f" ❌ [MID: {mid}] 最初のデータ行の読み込み中に予期せぬエラーが発生しました: {e}", file=sys.stdout, flush=True)
                        continue

                    # 1行目のマッピングと値の表示
                    if first_row:
                        try:
                            _display_mapping_for_first_row(first_row) 
                            
                            # 1行目のデータをリストに追加
                            parsed_data = _parse_single_row(first_row, mid)
                            if parsed_data:
                                product_data_list.append(parsed_data)
                                processed_rows += 1
                        except Exception as e:
                            # 修正したはずの unpacking エラーがまだ出る場合はここで捕捉
                            print(f" ❌ [MID: {mid}] 最初のデータ行のパース/表示中にエラーが発生しました: {e}", file=sys.stdout, flush=True)
                            traceback.print_exc(file=sys.stdout)
                            continue # 次のエンコーディングへ

                    # 2行目以降の処理
                    for row in csv_reader:
                        # 空行またはトレーラー行 (TRL) の処理
                        if not row or (len(row) == 1 and not row[0].strip()):
                            continue 
                        if row[0].strip().startswith('TRL'):
                            continue
                        
                        # データ行 (38フィールド) のみを処理
                        if len(row) == 38:
                            parsed_data = _parse_single_row(row, mid)
                            if parsed_data:
                                product_data_list.append(parsed_data)
                            
                            processed_rows += 1
                        
                        if processed_rows % 10000 == 0 and processed_rows > 0:
                            print(f" 🔄 [MID: {mid}] 処理中... {processed_rows:,} 行パース済み", file=sys.stdout, flush=True)

                print(f" ✅ [MID: {mid}] ファイルパース完了。収集データ件数: {len(product_data_list):,} 件", file=sys.stdout, flush=True)
                
                # 3. バルクインポートの実行
                total_saved_rows, created_count, updated_count = _bulk_import_products(mid, product_data_list)
                
                print(f"✅ [MID: {mid}] DBインポート完了。作成: {created_count:,} 件, 更新: {updated_count:,} 件, 合計: {total_saved_rows:,} 件", file=sys.stdout, flush=True)

                return True, total_saved_rows

            except Exception as e:
                # パース/保存中のエラーはログに出力し、次のエンコーディングを試す
                print(f" ❌ 試行失敗 (ENC: {encoding}, DELIM: {delimiter_name}): {type(e).__name__} - {e}", file=sys.stdout, flush=True)
                pass

        print(f" ⚠️ [MID: {mid}] 全てのエンコーディング試行でデータの読み込みまたは保存に失敗しました。", file=sys.stdout, flush=True)
        return False, 0

    except Exception as fatal_e:
        # 致命的なファイル処理クラッシュ
        print(f"❌ [MID: {mid}] 処理中に致命的なクラッシュが発生しました。原因不明の場所でのエラー。", file=sys.stdout, flush=True)
        print("--- FATAL ERROR TRACEBACK START ---", file=sys.stdout, flush=True)
        traceback.print_exc(file=sys.stdout)
        print("--- FATAL ERROR TRACEBACK END ---", file=sys.stdout, flush=True)
        return False, 0

    finally:
        # ファイル削除処理
        try:
            if os.path.exists(local_path):
                os.remove(local_path)
                print(f"🗑️ [MID: {mid}] ダウンロード元ファイル ({os.path.basename(local_path)}) を削除しました。", file=sys.stdout, flush=True)
        except Exception as e:
            print(f"⚠️ [MID: {mid}] ダウンロード元ファイル削除に失敗しました: {os.path.basename(local_path)} ({e})", file=sys.stdout, flush=True)

        try:
            if temp_txt_path and os.path.exists(temp_txt_path):
                os.remove(temp_txt_path)
                print(f"🗑️ [MID: {mid}] 一時ファイル ({os.path.basename(temp_txt_path)}) を削除しました。", file=sys.stdout, flush=True)
        except Exception as e:
            print(f"⚠️ [MID: {mid}] 一時ファイル削除に失敗しました: {os.path.basename(temp_txt_path)} ({e})", file=sys.stdout, flush=True)
        
# ==============================================================================
# ダウンロード機能
# ==============================================================================

class DownloadProgress:
    """ダウンロード進捗表示用のヘルパークラス"""
    def __init__(self, total_size: int, file_pointer: Any):
        self.total_size = total_size
        self.downloaded = 0
        self.start_time = time.time()
        self.last_print_len = 0
        self.file_pointer = file_pointer
    
    def update(self, data: bytes):
        """FTPのretrbinaryコールバック関数。データの書き込みと進捗表示を行う。"""
        self.file_pointer.write(data)
        self.downloaded += len(data)
        # 1MBごと、または完了時に進捗を更新
        if self.downloaded % (1024 * 1024) == 0 or self.downloaded == self.total_size:
            percent = (self.downloaded / self.total_size) * 100 if self.total_size > 0 else 0
            elapsed = time.time() - self.start_time
            speed = (self.downloaded / elapsed) if elapsed > 0 else 0
            progress_str = (
                f"ダウンロード中: {human_readable_size(self.downloaded)} "
                f"/ {human_readable_size(self.total_size)} "
                f"({percent:3.1f}%) "
                f"速度: {human_readable_size(speed).replace(' B', 'B/s')}"
            )
            # キャリッジリターンで上書き表示
            print('\r' + progress_str, end='', flush=True)
            self.last_print_len = len(progress_str)

def download_file(filename: str, local_path: str, file_size: int, mid: str) -> Tuple[bool, int]:
    """FTPからファイルをダウンロードし、パース処理に渡す"""
    print(f"\n📥 ダウンロード開始: {filename} -> {local_path} ({human_readable_size(file_size)})", file=sys.stdout, flush=True)
    print(f"💡 [DEBUG {mid}] download_file 呼び出し開始。", file=sys.stdout, flush=True)

    ftp = _get_ftp_client()
    if not ftp:
        print("❌ [DEBUG] download_file 終了 (FTP接続失敗)。", file=sys.stderr, flush=True)
        return False, 0

    download_success = False
    downloaded_size = 0
    saved_rows = 0

    try:
        print(f"💡 [DEBUG {mid}] open('{local_path}', 'wb') 開始。", file=sys.stdout, flush=True)
        with open(local_path, 'wb') as fp:
            print(f"💡 [DEBUG {mid}] open 成功。ftp.retrbinary 呼び出し開始。", file=sys.stdout, flush=True)
            progress = DownloadProgress(file_size, fp)
            # バイナリモードでダウンロード
            ftp.retrbinary(f'RETR {filename}', progress.update)
            downloaded_size = progress.downloaded
        print(f"💡 [DEBUG {mid}] open/ftp.retrbinary ブロック終了。", file=sys.stdout, flush=True)

        # 進捗表示のクリアと完了メッセージ
        print("\r" + " " * progress.last_print_len, end='', flush=True)
        print("\r✅ ダウンロード完了。", file=sys.stdout, flush=True)
        download_success = True

    except ftplib.all_errors as e:
        print(f"\n❌ ダウンロード中にFTPエラーが発生しました (MID: {mid}): {type(e).__name__} - {e}", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"\n❌ 予期せぬエラーが発生しました (MID: {mid}): {type(e).__name__} - {e}", file=sys.stderr, flush=True)
    finally:
        try:
            ftp.quit()
        except Exception:
            pass
        print(f"💡 [DEBUG {mid}] finallyブロック終了 (ftp.quit実行済み)。", file=sys.stdout, flush=True)

    # ダウンロード後の検証とパース
    print(f"📏 [DEBUG {mid}] 検証: 期待サイズ={file_size}, 実サイズ={downloaded_size}", file=sys.stdout, flush=True)

    if download_success and os.path.exists(local_path): 
        
        if downloaded_size != file_size:
            # サイズ不一致の場合、警告ログを出力しつつ処理を続行 (Linkshare FTPではサイズが変動することがあるため)
            print(f"⚠️ [DEBUG {mid}] サイズ不一致を検出 (期待: {file_size}, 実測: {downloaded_size})。パースを続行します。", file=sys.stdout, flush=True)
        else:
            print(f"💡 [DEBUG {mid}] ダウンロード成功条件チェック通過。サイズ: {downloaded_size} バイト。", file=sys.stdout, flush=True)

        # パースと保存処理を実行
        try:
            print(f"👉 [DEBUG {mid}] PARSE_FUNC_CALL TRYブロック開始。", file=sys.stdout, flush=True) 

            # 本来の処理: parse_and_process_file を実行
            success, saved_rows = parse_and_process_file(local_path, mid)
            
            print(f"👈 [DEBUG {mid}] PARSE_FUNC_CALL END (Success: {success})", file=sys.stdout, flush=True)

            if success:
                print(f"💡 [DEBUG {mid}] download_file 正常終了 (True, {saved_rows})", file=sys.stdout, flush=True)
                return success, saved_rows

        except Exception as e:
            # parse_and_process_file内でのエラーを捕捉
            print(f"\n❌ [MID: {mid}] parse_and_process_file の呼び出し中に例外が発生しました。", file=sys.stdout, flush=True)
            print(f"エラータイプ: {type(e).__name__}, メッセージ: {str(e)}", file=sys.stdout, flush=True)
            print("--- CALL ERROR TRACEBACK START ---", file=sys.stdout, flush=True)
            traceback.print_exc(file=sys.stdout)
            print("--- CALL ERROR TRACEBACK END ---", file=sys.stdout, flush=True)

    print(f"💡 [DEBUG {mid}] download_file 終了 (False, 0) またはダウンロード失敗。", file=sys.stdout, flush=True)
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
            default=5,
            help='テスト実行のため、処理するファイルの最大数を指定します (デフォルト: 5)。'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("--- LinkShare データインポートコマンド開始 (バルク処理) ---"))
        print(f"💡 [DEBUG] Command.handle 実行開始。", file=sys.stdout, flush=True)

        # ダウンロードディレクトリの自動作成
        if not os.path.exists(DOWNLOAD_DIR):
            try:
                os.makedirs(DOWNLOAD_DIR)
                self.stdout.write(self.style.SUCCESS(f"📂 ダウンロードディレクトリ {DOWNLOAD_DIR} を作成しました。"))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"🚨 ダウンロードディレクトリの作成に失敗しました: {DOWNLOAD_DIR} ({e})"))
                return
        
        target_mid = options['mid']
        limit = options['limit']

        # 1. FTPファイルリストの取得
        self.stdout.write("🔍 FTPサーバーから処理対象ファイルリストを取得中... (1GB未満のファイルに限定)")
        DATA_PATH = os.getenv("LINKSHARE_BS_DATA_PATH", "")

        try:
            mid_list = get_ftp_mid_list(DATA_PATH)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"FTPファイルリスト取得エラー: {e}"))
            print("--- get_ftp_mid_list ERROR TRACEBACK START ---", file=sys.stdout, flush=True)
            traceback.print_exc(file=sys.stdout)
            print("--- get_ftp_mid_list ERROR TRACEBACK END ---", file=sys.stdout, flush=True)
            return

        if not mid_list:
            self.stdout.write(self.style.WARNING("処理対象ファイルが見つからなかったか、FTP接続に失敗しました。"))
            return

        self.stdout.write(f"\n✅ FTPから以下の **{len(mid_list)}** 件の処理可能ファイルが見つかりました (1GB未満):")
        # リスト表示
        self.stdout.write("{:<10} {:<10} {:<60}".format("MID", "SIZE", "FILENAME"))
        self.stdout.write("-" * 80)
        for mid, filename, file_type, mtime_dt, file_size in mid_list:
            size_hr = human_readable_size(file_size)
            self.stdout.write("{:<10} {:<10} {:<60}".format(mid, size_hr, filename))
        self.stdout.write("-" * 80)

        # フィルタリングと制限
        if target_mid:
            mid_list = [item for item in mid_list if item[0] == target_mid]
            if not mid_list:
                self.stdout.write(self.style.WARNING(f"指定されたMID ({target_mid}) に該当するファイルが見つかりませんでした。"))
                return
        
        files_to_process = mid_list[:limit]
        if not files_to_process:
            self.stdout.write(self.style.WARNING(f"制限数 ({limit}) により、処理対象ファイルがありません。"))
            return

        total_processed_files = 0
        total_saved_rows = 0

        self.stdout.write(f"\n🚀 上位 {len(files_to_process)} 件のファイルをダウンロードして処理します。")

        # 2. ダウンロードとパースの実行 (トランザクション処理)
        for mid, filename, file_type, _, file_size in files_to_process:
            local_file_path = os.path.join(DOWNLOAD_DIR, filename)
            print(f"⭐ [DEBUG {mid}] download_file 呼び出し前。", file=sys.stdout, flush=True)

            current_saved_rows = 0
            success = False

            try: 
                # ファイル処理全体をアトミックなトランザクションで囲む
                with transaction.atomic():
                    success, current_saved_rows = download_file(filename, local_file_path, file_size, mid)
                print(f"⭐ [DEBUG {mid}] download_file 呼び出し後。結果: ({success}, {current_saved_rows})", file=sys.stdout, flush=True)
            
            except Exception as e:
                # download_file内の予期せぬエラーや、DB操作中のIntegrityErrorなどを捕捉
                self.stderr.write(self.style.ERROR(f"\n[MID: {mid}] 処理中に致命的な例外が発生しました。トランザクションはロールバックされます。"))
                self.stderr.write(self.style.ERROR(f"エラータイプ: {type(e).__name__}, メッセージ: {str(e)}"))
                self.stderr.write(self.style.ERROR("--- download_file CALL ERROR TRACEBACK START ---"))
                self.stderr.write(traceback.format_exc()) 
                self.stderr.write(self.style.ERROR("--- download_file CALL ERROR TRACEBACK END ---"))
                success = False
                current_saved_rows = 0 # ロールバックされるため 0 にリセット
            
            print(f"⭐ [DEBUG {mid}] 結果処理中。Success: {success}", file=sys.stdout, flush=True)

            if success:
                total_processed_files += 1
                total_saved_rows += current_saved_rows
                self.stdout.write(self.style.SUCCESS(f"\n[MID: {mid}] 処理完了。DB保存件数: {current_saved_rows:,} 件"))
            else:
                self.stdout.write(self.style.ERROR(f"\n[MID: {mid}] 処理失敗 (トランザクション ロールバック)。"))

        self.stdout.write(self.style.SUCCESS(f"\n--- インポートコマンド完了: {total_processed_files} / {len(files_to_process)} 件のファイルが正常に処理されました (合計 {total_saved_rows:,} 行保存) ---"))
        print(f"💡 [DEBUG] Command.handle 実行終了。", file=sys.stdout, flush=True)
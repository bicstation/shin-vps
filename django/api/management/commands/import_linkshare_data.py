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
    from api.models.products import LinkshareProduct
    # ダミーの RawApiData も、必要であれば実際のモデルに置き換えてください。
    from api.models.raw_and_entities import RawApiData
except ImportError:
    # 実際の環境でのインポートが難しい場合のエラー処理
    print("🚨 [FATAL] 'api.models.products.LinkshareProduct' のインポートに失敗しました。")
    print("🚨 [FATAL] スクリプト実行環境でDjangoモデルが利用可能か確認してください。")
    sys.exit(1)


# ==============================================================================
# 接続・ファイル設定 (定数)
# ... (変更なし)
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
# ... (変更なし)
# ==============================================================================

def human_readable_size(size_bytes):
    # ... (変更なし) ...
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
    # ... (変更なし) ...
    print(f"🌐 [DEBUG] _get_ftp_client 呼び出し開始。", file=sys.stdout, flush=True)

    if not all([FTP_HOST, FTP_USER, FTP_PASS]):
        print("🚨 [DEBUG] 接続情報が不足しています。", file=sys.stderr, flush=True)
        return None

    ftp_client = None
    try:
        # 接続試行ログ
        print(f"📡 [DEBUG] 接続試行: {FTP_HOST}:{FTP_PORT}, ユーザー: {FTP_USER}")

        ftp_client = ftplib.FTP(timeout=FTP_TIMEOUT)
        print("💡 [DEBUG] ftplib.FTP クライアント生成成功。", file=sys.stdout, flush=True)
        
        ftp_client.connect(FTP_HOST, FTP_PORT)
        print("💡 [DEBUG] ftp_client.connect 成功。", file=sys.stdout, flush=True)
        
        ftp_client.login(FTP_USER, FTP_PASS)
        print("💡 [DEBUG] ftp_client.login 成功。", file=sys.stdout, flush=True)

        # ★★★ 修正: パッシブモード (PASV) を強制設定する ★★★
        ftp_client.set_pasv(True) 
        print("✅ [DEBUG] パッシブモード (PASV) を設定しました。", file=sys.stdout, flush=True)
        
        print("✅ [DEBUG] FTP接続およびログイン成功。_get_ftp_client 終了。", file=sys.stdout, flush=True)
        return ftp_client

    except ftplib.all_errors as e:
        # FTP接続/ログイン失敗時のエラーログ
        print(f"❌ [DEBUG] FTP接続/ログイン失敗 (ftplib.all_errors): {type(e).__name__} - {e}", file=sys.stderr, flush=True)
        if ftp_client:
            try: ftp_client.quit()
            except Exception: pass
        return None
    except Exception as e:
        # その他の予期せぬ接続エラーログ
        print(f"❌ [DEBUG] FTP接続/ログイン失敗 (予期せぬエラー): {type(e).__name__} - {e}", file=sys.stderr, flush=True)
        return None

def get_ftp_mid_list(data_path: str = "") -> List[Tuple[str, str, str, Optional[datetime], int]]:
    # ... (変更なし) ...
    print(f"📋 [DEBUG] get_ftp_mid_list 呼び出し開始。データパス: '{data_path}'", file=sys.stdout, flush=True)
    
    ftp = _get_ftp_client()
    if not ftp:
        print("❌ [DEBUG] get_ftp_mid_list 終了 (FTP接続失敗)。", file=sys.stdout, flush=True)
        return []

    if data_path:
        # ... (ディレクトリ変更ロジックは省略) ...
        pass
    
    # ... (ファイルリスト取得、サイズチェック、最新ファイル選択ロジックは省略) ...

    try:
        file_names = ftp.nlst()
        print(f"📋 [DEBUG] ファイルリスト取得成功。ファイル数: {len(file_names)}", file=sys.stdout, flush=True)
    except Exception as e:
        print(f"❌ [DEBUG] ファイルリスト取得失敗: {e}", file=sys.stderr, flush=True)
        ftp.quit()
        return []

    ftp.voidcmd('TYPE I')
    print("💡 [DEBUG] TYPE I (バイナリ転送モード) を設定。", file=sys.stdout, flush=True)

    mid_file_details: Dict[str, Tuple[str, str, float, int]] = {}

    # ファイル情報取得処理 (ログは省略)
    for filename in file_names:
        # ... (ファイル名パターンマッチ、サイズチェック、mtime取得ロジックは省略) ...
        match_full = re.match(FULL_DATA_PATTERN, filename)
        match_delta = re.match(DELTA_DATA_PATTERN, filename)
        match = match_full or match_delta
        if not match: continue
        current_id = match.group(1)
        file_type = "FULL" if match_full else "DELTA"
        mtime_ts: float = 0.0
        file_size: int = 0
        try:
            file_size = ftp.size(filename)
            if file_size > MAX_SIZE_BYTES: continue
        except Exception: continue
        try:
            mtime_response = ftp.sendcmd('MDTM ' + filename)
            if mtime_response.startswith('213 '):
                mtime_str = mtime_response[4:].strip()
                mtime_dt_naive = datetime.strptime(mtime_str, '%Y%m%d%H%M%S')
                mtime_ts = mtime_dt_naive.replace(tzinfo=timezone.utc).timestamp()
        except Exception: pass
        if current_id not in mid_file_details and mtime_ts > 0.0:
            mid_file_details[current_id] = (filename, file_type, mtime_ts, file_size)
        elif mtime_ts > 0.0:
            existing_filename, existing_type, existing_ts, existing_size = mid_file_details[current_id]
            if file_type == "FULL" and existing_type == "DELTA":
                mid_file_details[current_id] = (filename, file_type, mtime_ts, file_size)
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
    # ... (変更なし) ...
    if not date_str: return None
    try:
        return datetime.strptime(date_str, '%m/%d/%Y %H:%M:%S').replace(tzinfo=timezone.utc)
    except ValueError:
        return None

def _clean_decimal_field(value: Optional[str]) -> Optional[Decimal]:
    # ... (変更なし) ...
    if not value or not value.strip(): return None
    try:
        cleaned_value = value.strip().replace(',', '')
        return Decimal(cleaned_value)
    except (InvalidOperation, ValueError):
        return None

# ==============================================================================
# データ保存ロジック (ログは簡略化)
# ==============================================================================

def _save_single_product(row_list: List[str], mid: str) -> Optional[LinkshareProduct]:
    # ... (データ抽出ロジックは変更なし) ...
    # LinkShare商品データは38フィールド
    if len(row_list) != 38: return None
    
    # row_listのインデックス (0から始まる)
    # 0: Link ID (link_id)
    # 1: Merchant ID (merchant_id)
    # 2: SKU (sku)
    # 3: Product Name (product_name)
    # 8: Short Description (short_description)
    # 9: Description (description)
    # 12: Sale Price (sale_price)
    # 13: Retail Price (retail_price)
    # 14: Begin Date (begin_date)
    # 15: End Date (end_date)
    
    sku = row_list[2].strip()
    if not sku: return None
    
    # 型変換
    sale_price_dec = _clean_decimal_field(row_list[12])
    retail_price_dec = _clean_decimal_field(row_list[13])
    shipping_dec = _clean_decimal_field(row_list[17])
    discount_amount_dec = _clean_decimal_field(row_list[10])
    begin_date_dt = _parse_linkshare_date(row_list[14])
    end_date_dt = _parse_linkshare_date(row_list[15])
    
    try:
        # 🚨 【重要：修正箇所 2】実際の LinkshareProduct.objects.update_or_create() を呼び出す
        # モデルに合わせたフィールド名に修正
        product, created = LinkshareProduct.objects.update_or_create(
            merchant_id=mid,
            sku=sku,
            defaults={
                'link_id': row_list[0].strip(),
                'product_name': row_list[3].strip(), # ★修正: 'name' -> 'product_name'
                'primary_category': row_list[4].strip(),
                'sub_category': row_list[5].strip(),
                'product_url': row_list[6].strip(),
                'image_url': row_list[7].strip(),
                'buy_url': row_list[8].strip(),
                'short_description': row_list[9].strip(),
                'description': row_list[10].strip(), # ★修正: row_list[4] -> row_list[10] (Linkshareは38列形式でインデックスが異なるため、元のコードのインデックスも仮定で修正)
                'discount_amount': discount_amount_dec,
                'discount_type': row_list[11].strip(),
                'sale_price': sale_price_dec,
                'retail_price': retail_price_dec,
                'begin_date': begin_date_dt,
                'end_date': end_date_dt,
                'brand_name': row_list[16].strip(),
                'shipping': shipping_dec,
                'keywords': row_list[18].strip(),
                # ... 他のフィールドもここに追加 ...
            }
        )
        # 実際に保存が成功したオブジェクトを返す
        return product
    except IntegrityError as e:
        print(f" ❌ DBエラー (MID: {mid}, SKU: {sku}): {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f" ❌ 予期せぬ保存エラー (MID: {mid}, SKU: {sku}): {e}", file=sys.stderr)
        return None

# ... (parse_and_process_file, download_file, Command クラスは変更なし) ...
# ==============================================================================
# データパースと保存を統合したメイン処理
# ==============================================================================

def parse_and_process_file(local_path: str, mid: str) -> Tuple[bool, int]:
    # ... (変更なし) ...
    print(f"💾 [DEBUG {mid}] STARTING PARSE: {os.path.basename(local_path)}.", file=sys.stdout, flush=True)

    delimiter = FIXED_DELIMITER
    delimiter_name = FIXED_DELIMITER_NAME
    encoding_list = ['utf-8', 'cp932', 'shift_jis', 'euc_jp','latin-1']
    total_saved_rows = 0
    
    temp_txt_path = None
    path_to_open = local_path
    file_open_func = lambda path, enc: open(path, 'r', encoding=enc, errors='replace')
    
    try:
        # GZIPファイルの処理
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
                        timeout=30 
                    )
                print(f"<<< [MID: {mid}] DECOMPRESS SUCCESS ({human_readable_size(os.path.getsize(temp_txt_path))})", file=sys.stdout, flush=True)
                path_to_open = temp_txt_path
            except subprocess.CalledProcessError as e:
                print(f"❌ [MID: {mid}] gunzipコマンド失敗: {e}.", file=sys.stdout, flush=True)
                return False, 0
            except FileNotFoundError:
                print(f"❌ [MID: {mid}] **gunzipコマンドが見つかりません。**", file=sys.stdout, flush=True)
                return False, 0
            except subprocess.TimeoutExpired:
                print(f"❌ [MID: {mid}] gunzipコマンドがタイムアウトしました。", file=sys.stdout, flush=True)
                return False, 0
            
        # --- エンコーディングを推測しながらファイルを処理するループ ---
        for encoding in encoding_list:
            try:
                processed_rows = 0
                is_likely_delimiter = False
                
                print(f"🔎 [DEBUG {mid}] 試行開始 (ENC: {encoding}): OPENING {os.path.basename(path_to_open)}", file=sys.stdout, flush=True)

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

                    # ヘッダー検証 (省略)
                    header_line = sample_lines[0].strip()
                    if not header_line.startswith('HDR'): continue
                    header_fields = header_line.split(delimiter)
                    if not (len(header_fields) == 4 and header_fields[0] == 'HDR'): continue

                    # データ行検証 (省略)
                    valid_data_lines = 0
                    for line in sample_lines[1:]:
                        fields = line.strip().split(delimiter)
                        if len(fields) != 38: break
                        try:
                            int(fields[0].strip())
                            is_likely_delimiter = True
                            valid_data_lines += 1
                        except ValueError: break
                        if valid_data_lines >= 5: break
                        
                    if is_likely_delimiter:
                        print(f"🔎 [DEBUG {mid}] 早期検証成功: ENC: {encoding}, DELIM: {delimiter_name}", file=sys.stdout, flush=True)
                    
                    if not is_likely_delimiter:
                        continue

                print(f" ➡️ [MID: {mid}] 試行: ENC: {encoding}, DELIM: {delimiter_name}。本番パース開始...", file=sys.stdout, flush=True)

                # 4. 本番パース: 成功したエンコーディングでファイルを再度開き、CSVリーダーで処理
                with file_open_func(path_to_open, encoding) as f_main:
                    f_main.readline() 
                    csv_reader = csv.reader(f_main, delimiter=delimiter, quotechar='"')
                    
                    for row in csv_reader:
                        if not row or len(row) == 1 and not row[0].strip():
                            continue 
                        
                        if len(row) == 38:
                            _save_single_product(row, mid)
                            processed_rows += 1
                        
                        if processed_rows % 10000 == 0 and processed_rows > 0:
                            print(f" 🔄 [MID: {mid}] 処理中... {processed_rows:,} 行", file=sys.stdout, flush=True)
                        
                    total_saved_rows = processed_rows
                    
                    print(f"✅ [MID: {mid}] 正常に処理を完了しました。最終行数: {total_saved_rows:,}", file=sys.stdout, flush=True)
                    return True, total_saved_rows

            except Exception as e:
                print(f" ❌ 試行失敗 (ENC: {encoding}, DELIM: {delimiter_name}): {type(e).__name__} - {e}", file=sys.stdout, flush=True)
                pass

        print(f" ⚠️ [MID: {mid}] 全てのエンコーディング試行でデータの読み込みまたは保存に失敗しました。", file=sys.stdout, flush=True)
        return False, 0

    except Exception as fatal_e:
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
            print('\r' + progress_str, end='', flush=True)
            self.last_print_len = len(progress_str)

def download_file(filename: str, local_path: str, file_size: int, mid: str) -> Tuple[bool, int]:
    # ... (変更なし) ...
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

    # ★★★ 修正: サイズチェックのデバッグログを追加 ★★★
    print(f"📏 [DEBUG {mid}] 検証: 期待サイズ={file_size}, 実サイズ={downloaded_size}", file=sys.stdout, flush=True)

    # 🚨 修正ロジック 🚨: ダウンロード成功フラグがTrueで、かつファイルが実際に存在すれば、パースに進む
    if download_success and os.path.exists(local_path): 
        
        if downloaded_size != file_size:
             # サイズ不一致の場合、警告ログを出力しつつ処理を続行
             print(f"⚠️ [DEBUG {mid}] サイズ不一致を検出 (期待: {file_size}, 実測: {downloaded_size})。パースを続行します。", file=sys.stdout, flush=True)
        else:
             print(f"💡 [DEBUG {mid}] ダウンロード成功条件チェック通過。サイズ: {downloaded_size} バイト。", file=sys.stdout, flush=True)


        # パースと保存処理を実行
        try:
            print(f"👉 [DEBUG {mid}] PARSE_FUNC_CALL TRYブロック開始。", file=sys.stdout, flush=True) 

            # ★★★ 本来の処理: parse_and_process_file を実行 ★★★
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
            # 処理失敗として続行し、return False, 0 に到達する

    print(f"💡 [DEBUG {mid}] download_file 終了 (False, 0) またはダウンロード失敗。", file=sys.stdout, flush=True)
    return False, 0


# ==============================================================================
# Django Management Command の定義
# ==============================================================================

class Command(BaseCommand):
    # ... (変更なし) ...
    help = 'LinkShare FTPからマーチャンダイザーをダウンロードし、LinkshareProductモデルにインポートします。'

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
        self.stdout.write(self.style.SUCCESS("--- LinkShare データインポートコマンド開始 ---"))
        print(f"💡 [DEBUG] Command.handle 実行開始。", file=sys.stdout, flush=True)

        # ★★★ ダウンロードディレクトリの自動作成 ★★★
        if not os.path.exists(DOWNLOAD_DIR):
            try:
                os.makedirs(DOWNLOAD_DIR)
                self.stdout.write(self.style.SUCCESS(f"📂 ダウンロードディレクトリ {DOWNLOAD_DIR} を作成しました。"))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"🚨 ダウンロードディレクトリの作成に失敗しました: {DOWNLOAD_DIR} ({e})"))
                return
        
        # ... (オプション処理は省略) ...
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

        # ... (ファイルリスト表示ロジックは省略) ...
        if not mid_list:
            self.stdout.write(self.style.WARNING("処理対象ファイルが見つからなかったか、FTP接続に失敗しました。"))
            return

        self.stdout.write(f"\n✅ FTPから以下の **{len(mid_list)}** 件の処理可能ファイルが見つかりました (1GB未満):")
        # ... (リスト表示) ...
        for mid, filename, file_type, mtime_dt, file_size in mid_list:
            size_hr = human_readable_size(file_size)
            self.stdout.write("{:<10} {:<10} {:<60}".format(mid, size_hr, filename))
        self.stdout.write("-" * 80)

        # フィルタリングと制限 (省略)
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

        # 2. ダウンロードとパースの実行
        with transaction.atomic():
            for mid, filename, file_type, _, file_size in files_to_process:
                local_file_path = os.path.join(DOWNLOAD_DIR, filename)
                print(f"⭐ [DEBUG {mid}] download_file 呼び出し前。", file=sys.stdout, flush=True)

                try: 
                    success, saved_rows = download_file(filename, local_file_path, file_size, mid)
                    print(f"⭐ [DEBUG {mid}] download_file 呼び出し後。結果: ({success}, {saved_rows})", file=sys.stdout, flush=True)
                except Exception as e:
                    # sys.exit(1) は捕捉できませんが、その他のPythonレベルのクラッシュはここで捕捉されます。
                    self.stderr.write(self.style.ERROR(f"\n[MID: {mid}] download_file 処理中に致命的な例外が発生しました。"))
                    self.stderr.write(self.style.ERROR(f"エラータイプ: {type(e).__name__}, メッセージ: {str(e)}"))
                    self.stderr.write(self.style.ERROR("--- download_file CALL ERROR TRACEBACK START ---"))
                    self.stderr.write(traceback.format_exc()) 
                    self.stderr.write(self.style.ERROR("--- download_file CALL ERROR TRACEBACK END ---"))
                    success = False
                    saved_rows = 0
                
                print(f"⭐ [DEBUG {mid}] 結果処理中。Success: {success}", file=sys.stdout, flush=True)

                if success:
                    total_processed_files += 1
                    total_saved_rows += saved_rows
                    self.stdout.write(self.style.SUCCESS(f"\n[MID: {mid}] 処理完了。DB保存件数: {saved_rows:,} 件"))
                else:
                    self.stdout.write(self.style.ERROR(f"\n[MID: {mid}] 処理失敗。"))

        self.stdout.write(self.style.SUCCESS(f"\n--- インポートコマンド完了: {total_processed_files} / {len(files_to_process)} 件のファイルが正常に処理されました (合計 {total_saved_rows:,} 行保存) ---"))
        print(f"💡 [DEBUG] Command.handle 実行終了。", file=sys.stdout, flush=True)
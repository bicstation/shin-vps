import os
import re
import ftplib
import time
import gzip
import csv
import traceback
import sys
import subprocess # ★★★ 追加: gunzip実行用
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional
from decimal import Decimal, InvalidOperation

# Djangoのコア機能とモデルをインポート
from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError
from django.utils import timezone

# apiアプリのモデルをインポート
# NOTE: モデルの実際のインポートは環境により異なるため、ここではダミーモデルとして定義します。
class LinkshareProduct:
    @staticmethod
    def objects():
        class DummyManager:
            def update_or_create(self, merchant_id, sku, defaults):
                return (None, True)
        return DummyManager()
class RawApiData:
    pass


# ==============================================================================
# 接続・ファイル設定 (定数)
# ==============================================================================
FTP_HOST = os.getenv("LINKSHARE_FTP_HOST", "aftp.linksynergy.com")
FTP_USER = os.getenv("LINKSHARE_BS_USER", "rkp_3750988")
FTP_PASS = os.getenv("LINKSHARE_BS_PASS", "u5NetPVZEAhABD7HuW2VRymP")
FTP_PORT = 21
FTP_TIMEOUT = 180

MAX_SIZE_BYTES = 1073741824 # 1 GB のバイト値
# ★★★ 修正: ダウンロードディレクトリをコンテナ内部の一時的な場所に設定 ★★★
DOWNLOAD_DIR = "/tmp/ftp_downloads"

FULL_DATA_PATTERN = r"(\d+)_3750988_mp\.txt\.gz$"
DELTA_DATA_PATTERN = r"(\d+)_3750988_delta\.txt\.gz$"

# ★★★ デリミタをパイプに固定 ★★★
FIXED_DELIMITER = '|'
FIXED_DELIMITER_NAME = 'PIPE'

# ==============================================================================
# ヘルパー関数群 (ユーティリティ、データ型変換、FTP接続)
# ==============================================================================

def human_readable_size(size_bytes):
    """バイト単位のサイズをKB, MB, GBに変換して表示する"""
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
    """FTPクライアントを初期化し、接続・ログインを試行する"""
    if not all([FTP_HOST, FTP_USER, FTP_PASS]):
        print("🚨 [DEBUG] 接続情報が不足しています。", file=sys.stderr, flush=True)
        return None

    ftp_client = None
    try:
        # 接続試行ログ
        print(f"📡 [DEBUG] 接続試行: {FTP_HOST}:{FTP_PORT}, ユーザー: {FTP_USER}")

        ftp_client = ftplib.FTP(timeout=FTP_TIMEOUT)
        ftp_client.connect(FTP_HOST, FTP_PORT)
        ftp_client.login(FTP_USER, FTP_PASS)

        print("✅ [DEBUG] FTP接続およびログイン成功。")
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
    """FTPサーバーからMIDリストを取得し、1GB超のファイルをフィルタリングする。"""
    ftp = _get_ftp_client()
    if not ftp:
        return []

    if data_path:
        try:
            ftp.cwd(data_path)
            print(f"📁 [DEBUG] ディレクトリ変更: {data_path}")
        except ftplib.error_perm as e:
            print(f"❌ [DEBUG] ディレクトリ変更失敗 (Error): {e}", file=sys.stderr, flush=True)
            ftp.quit()
            return []
        except Exception as e:
            print(f"❌ [DEBUG] ディレクトリ変更失敗 (Unexpected Error): {e}", file=sys.stderr, flush=True)
            ftp.quit()
            return []

    try:
        file_names = ftp.nlst()
        print(f"📋 [DEBUG] ファイルリスト取得成功。ファイル数: {len(file_names)}")
    except Exception as e:
        print(f"❌ [DEBUG] ファイルリスト取得失敗: {e}", file=sys.stderr, flush=True)
        ftp.quit()
        return []

    ftp.voidcmd('TYPE I')

    mid_file_details: Dict[str, Tuple[str, str, float, int]] = {}

    for filename in file_names:
        match_full = re.match(FULL_DATA_PATTERN, filename)
        match_delta = re.match(DELTA_DATA_PATTERN, filename)
        match = match_full or match_delta

        if not match:
            continue

        current_id = match.group(1)
        file_type = "FULL" if match_full else "DELTA"
        mtime_ts: float = 0.0
        file_size: int = 0

        try:
            file_size = ftp.size(filename)
            # ★★★ 1GB超のファイルをここでフィルタリング ★★★
            if file_size > MAX_SIZE_BYTES:
                continue
        except Exception:
            continue

        # MDTM (ファイル最終更新日時) を取得
        try:
            mtime_response = ftp.sendcmd('MDTM ' + filename)
            if mtime_response.startswith('213 '):
                mtime_str = mtime_response[4:].strip()
                mtime_dt_naive = datetime.strptime(mtime_str, '%Y%m%d%H%M%S')
                mtime_ts = mtime_dt_naive.replace(tzinfo=timezone.utc).timestamp()
        except Exception:
            pass

        # 既存のファイルと比較し、FULLファイル優先/最新ファイルを残すロジック
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
    except Exception:
        pass

    final_list = []
    for current_id, details in mid_file_details.items():
        filename, file_type, mtime_ts, file_size = details
        mtime_dt = datetime.fromtimestamp(mtime_ts, tz=timezone.utc) if mtime_ts > 0.0 else None
        final_list.append((current_id, filename, file_type, mtime_dt, file_size))

    return sorted(final_list, key=lambda x: x[0])


def _parse_linkshare_date(date_str: Optional[str]) -> Optional[datetime]:
    """LinkShareの日付フォーマット 'mm/dd/yyyy hh:mm:ss' をパースする"""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, '%m/%d/%Y %H:%M:%S').replace(tzinfo=timezone.utc)
    except ValueError:
        return None

def _clean_decimal_field(value: Optional[str]) -> Optional[Decimal]:
    """金額フィールドをクリーンアップし、Decimal型に変換する"""
    if not value or not value.strip():
        return None
    try:
        cleaned_value = value.strip().replace(',', '')
        return Decimal(cleaned_value)
    except (InvalidOperation, ValueError):
        return None

# ==============================================================================
# データ保存ロジック
# ==============================================================================

def _save_single_product(row_list: List[str], mid: str) -> Optional[LinkshareProduct]:
    """
    パースされた単一の行データ (38フィールド) をLinkshareProductモデルに保存する。
    """
    if len(row_list) != 38:
        return None

    sku = row_list[2].strip()
    if not sku:
        return None

    # 価格と日付のクリーンアップ
    sale_price_dec = _clean_decimal_field(row_list[12])
    retail_price_dec = _clean_decimal_field(row_list[13])
    shipping_dec = _clean_decimal_field(row_list[17])
    discount_amount_dec = _clean_decimal_field(row_list[10])

    begin_date_dt = _parse_linkshare_date(row_list[14])
    end_date_dt = _parse_linkshare_date(row_list[15])

    try:
        # LinkshareProductをSKUとMIDをキーとして更新または作成
        # ダミー処理
        return LinkshareProduct()

    except IntegrityError as e:
        print(f"  ❌ DBエラー (MID: {mid}, SKU: {sku}): {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  ❌ 予期せぬ保存エラー (MID: {mid}, SKU: {sku}): {e}", file=sys.stderr)
        return None

# ==============================================================================
# データパースと保存を統合したメイン処理
# ==============================================================================

def parse_and_process_file(local_path: str, mid: str) -> Tuple[bool, int]:
    """
    ダウンロードしたファイルをパースし、全データ行をデータベースに保存する。
    gunzipクラッシュを避けるため、subprocessでgunzipを実行し、解凍済みファイルを読み込む。
    """

    # 1. 処理開始デバッグログを標準出力に強制出力
    print(f"💾 [DEBUG {mid}] STARTING PARSE: {os.path.basename(local_path)}.", file=sys.stdout, flush=True)

    delimiter = FIXED_DELIMITER
    delimiter_name = FIXED_DELIMITER_NAME
    encoding_list = ['utf-8', 'cp932', 'shift_jis', 'euc_jp']
    total_saved_rows = 0
    temp_local_path = local_path # 処理対象ファイルパスの初期値

    try:
        # ★★★ 修正: GZIPファイルを事前にgunzipで解凍するブロック ★★★
        if local_path.endswith('.gz'):
            uncompressed_path = local_path[:-3] # .gzを削除したファイル名
            print(f"🔥 [MID: {mid}] .gzファイルをgunzipで事前解凍中... -> {os.path.basename(uncompressed_path)}", file=sys.stdout, flush=True)
            
            try:
                # gunzipコマンドを実行し、標準出力をキャプチャ
                # -c: 標準出力に書き出す, -f: 強制 (ほとんど不要だが安全のため)
                result = subprocess.run(
                    ['gunzip', '-c', local_path], 
                    capture_output=True, 
                    check=True # ゼロ以外の終了コードでCalledProcessErrorを発生させる
                )
                
                # 解凍されたバイトデータを一時ファイルに書き込む (バイナリモード)
                with open(uncompressed_path, 'wb') as f:
                    f.write(result.stdout)
                
                # 処理対象ファイルを解凍されたファイルに切り替える
                temp_local_path = uncompressed_path
                print(f"✅ [MID: {mid}] 事前解凍成功。処理ファイル: {os.path.basename(temp_local_path)}", file=sys.stdout, flush=True)
                
            except subprocess.CalledProcessError as e:
                # gunzipの実行に失敗した場合
                print(f"❌ [MID: {mid}] gunzip解凍中にエラーが発生しました。", file=sys.stderr, flush=True)
                print(f"Stderr: {e.stderr.decode('utf-8', errors='replace')}", file=sys.stderr, flush=True)
                return False, 0
            except Exception as e:
                # その他のI/Oエラーなど
                print(f"❌ [MID: {mid}] 事前解凍時に予期せぬエラーが発生しました: {type(e).__name__} - {e}", file=sys.stderr, flush=True)
                return False, 0
        
        # --- ここから通常のパース処理 (open() を使用) ---

        for encoding in encoding_list:
            try:
                processed_rows = 0
                is_likely_delimiter = False
                
                # 2. ファイルを通常の open() で開き、エンコーディングとデリミタを検証
                print(f"🔎 [DEBUG {mid}] 試行開始 (ENC: {encoding}): OPENING {os.path.basename(temp_local_path)}", file=sys.stdout, flush=True)

                # ファイルをテキストモードで開く
                with open(temp_local_path, 'r', encoding=encoding, errors='replace') as f_text_test:
                    
                    # 最初の50行を検証
                    sample_lines: List[str] = []
                    for _ in range(50):
                        line = f_text_test.readline()
                        if not line: break
                        sample_lines.append(line)
                    
                    if not sample_lines:
                        # ファイルが空の場合
                        continue

                    # ヘッダー行を検証（'|' 区切りで38フィールドあるか）
                    header_line = sample_lines[0].strip()
                    if header_line.startswith('HDR'):
                        header_fields = header_line.split(delimiter)
                        if len(header_fields) == 4 and header_fields[0] == 'HDR':
                             # 2行目以降のデータ行を検証
                            valid_data_lines = 0
                            for line in sample_lines[1:]:
                                fields = line.strip().split(delimiter)
                                # データ行は38フィールド
                                if len(fields) == 38: 
                                    is_likely_delimiter = True
                                    valid_data_lines += 1
                                    # LinkID (1フィールド目) が数値であることを確認
                                    try:
                                        int(fields[0].strip())
                                    except ValueError:
                                        is_likely_delimiter = False
                                        break
                                
                                if valid_data_lines >= 5: # 5行以上正常ならOKとする
                                    break
                            
                            if is_likely_delimiter:
                                print(f"🔎 [DEBUG {mid}] 早期検証成功: ENC: {encoding}, DELIM: {delimiter_name}", file=sys.stdout, flush=True)

                
                if not is_likely_delimiter:
                    print(f"  ❌ [DEBUG {mid}] 早期検証失敗 (ENC: {encoding}): フィールド数が不正 (38以外) または LinkIDが数値でない。", file=sys.stdout, flush=True)
                    continue

                print(f"  ➡️ [MID: {mid}] 試行: ENC: {encoding}, DELIM: {delimiter_name}。本番パース開始...", file=sys.stdout, flush=True)

                # ★★★ 本番パース: 成功したエンコーディングでファイルを再度開き、CSVリーダーで処理 ★★★
                with open(temp_local_path, 'r', encoding=encoding, errors='replace') as f_main:
                    # ヘッダー行 (HDR) をスキップ
                    f_main.readline() 
                    
                    csv_reader = csv.reader(f_main, delimiter=delimiter, quotechar='"')
                    
                    for row in csv_reader:
                        if not row or len(row) == 1 and not row[0].strip():
                            continue # 空行をスキップ
                        
                        # 38フィールドあることを確認
                        if len(row) == 38:
                            # データベース保存処理
                            _save_single_product(row, mid)
                            processed_rows += 1
                        
                        if processed_rows % 10000 == 0 and processed_rows > 0:
                            print(f"  🔄 [MID: {mid}] 処理中... {processed_rows:,} 行", file=sys.stdout, flush=True)
                
                total_saved_rows = processed_rows
                
                # 処理に成功したらループを抜ける
                print(f"✅ [MID: {mid}] 正常に処理を完了しました。最終行数: {total_saved_rows:,}", file=sys.stdout, flush=True)
                return True, total_saved_rows

            except Exception as e:
                # デコード/CSV読み取りエラーが発生した場合、次のエンコーディングを試行
                print(f"  ❌ 試行失敗 (ENC: {encoding}, DELIM: {delimiter_name}): {type(e).__name__} - {e}", file=sys.stdout, flush=True)
                pass

        print(f"  ⚠️ [MID: {mid}] 全てのエンコーディング試行でデータの読み込みまたは保存に失敗しました。", file=sys.stdout, flush=True)
        return False, 0

    except Exception as fatal_e:
        # 致命的なエラーが発生した場合、標準出力に強制的にトレースバックを出力
        print(f"❌ [MID: {mid}] 処理中に致命的なクラッシュが発生しました。原因不明の場所でのエラー。", file=sys.stdout, flush=True)
        print("--- FATAL ERROR TRACEBACK START ---", file=sys.stdout, flush=True)
        traceback.print_exc(file=sys.stdout) # 標準出力にトレースバックを出力
        print("--- FATAL ERROR TRACEBACK END ---", file=sys.stdout, flush=True)
        return False, 0

    finally:
        # ファイル削除処理
        try:
            # ダウンロードしたファイル（.gz）を削除
            if os.path.exists(local_path):
                os.remove(local_path)
            
            # 事前解凍したファイル（.txt）も削除
            if local_path.endswith('.gz'):
                uncompressed_path = local_path[:-3]
                if os.path.exists(uncompressed_path):
                    os.remove(uncompressed_path)

        except Exception as e:
            # ファイル削除失敗ログも標準出力に強制出力
            print(f"⚠️ [MID: {mid}] ファイル削除に失敗しました: {local_path} / {temp_local_path} ({e})", file=sys.stdout, flush=True)

# ==============================================================================
# ダウンロード機能
# ==============================================================================

class DownloadProgress:
    """ダウンロード進捗を管理し、ファイル書き込みを行うクラス"""
    def __init__(self, total_size: int, file_pointer: Any):
        self.total_size = total_size
        self.downloaded = 0
        self.start_time = time.time()
        self.last_print_len = 0
        self.file_pointer = file_pointer

    def update(self, data: bytes):
        """データチャンクを受信するたびに呼び出され、進捗を更新・表示し、ファイルに書き込む"""
        self.file_pointer.write(data)
        self.downloaded += len(data)

        # 1MBごとに進捗表示を更新
        if self.downloaded % (1024 * 1024) == 0 or self.downloaded == self.total_size:
            percent = (self.downloaded / self.total_size) * 100
            elapsed = time.time() - self.start_time
            speed = (self.downloaded / elapsed) if elapsed > 0 else 0

            progress_str = (
                f"ダウンロード中: {human_readable_size(self.downloaded)} "
                f"/ {human_readable_size(self.total_size)} "
                f"({percent:3.1f}%) "
                f"速度: {human_readable_size(speed).replace(' B', 'B/s')}"
            )
            # 古い行をスペースで上書きせず、キャリッジリターンで更新
            print('\r' + progress_str, end='', flush=True)
            self.last_print_len = len(progress_str)

def download_file(filename: str, local_path: str, file_size: int, mid: str) -> Tuple[bool, int]:
    """FTPからファイルをダウンロードし、進捗を表示し、その後パース・保存を行う"""
    print(f"\n📥 ダウンロード開始: {filename} -> {local_path} ({human_readable_size(file_size)})")

    ftp = _get_ftp_client()
    if not ftp:
        print("❌ FTP接続に失敗しました。（ダウンロード開始前）")
        return False, 0

    download_success = False
    downloaded_size = 0
    saved_rows = 0

    try:
        # download_file内でのディレクトリ作成は不要（handleで実施済み）

        with open(local_path, 'wb') as fp:
            progress = DownloadProgress(file_size, fp)
            ftp.retrbinary(f'RETR {filename}', progress.update)
            downloaded_size = progress.downloaded

        print("\r" + " " * progress.last_print_len, end='', flush=True)
        print("\r✅ ダウンロード完了。")
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

    # ダウンロードが成功した場合のみ、パース機能の呼び出し
    if download_success and downloaded_size == file_size:

        # パースと保存処理を実行
        try:
            # ★★★ ログ追加: parse_and_process_file 呼び出し直前 ★★★
            print(f"👉 [DEBUG {mid}] PARSE_FUNC_CALL START", file=sys.stdout, flush=True) 

            success, saved_rows = parse_and_process_file(local_path, mid)
            
            # ★★★ ログ追加: parse_and_process_file 呼び出し直後（成功時） ★★★
            print(f"👈 [DEBUG {mid}] PARSE_FUNC_CALL END (Success: {success})", file=sys.stdout, flush=True)

            if success:
                return success, saved_rows

        except Exception as e:
            # download_file内で捕捉された致命的クラッシュログはparse_and_process_file内で処理される
            pass

    return False, 0


# ==============================================================================
# Django Management Command の定義
# ==============================================================================

class Command(BaseCommand):
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

        # ★★★ ダウンロードディレクトリの自動作成 ★★★
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
            return

        # ファイルリスト表示ロジック
        if not mid_list:
            self.stdout.write(self.style.WARNING("処理対象ファイルが見つからなかったか、FTP接続に失敗しました。"))
            return

        self.stdout.write(f"\n✅ FTPから以下の **{len(mid_list)}** 件の処理可能ファイルが見つかりました (1GB未満):")

        # リストを整形して表示
        self.stdout.write("-" * 80)
        self.stdout.write("{:<10} {:<10} {:<60}".format("MID", "サイズ", "ファイル名"))
        self.stdout.write("{:<10} {:<10} {:<60}".format("-" * 3, "-" * 6, "-" * 60))

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

        # 2. ダウンロードとパースの実行
        with transaction.atomic():
            for mid, filename, file_type, _, file_size in files_to_process:
                local_file_path = os.path.join(DOWNLOAD_DIR, filename)

                success, saved_rows = download_file(filename, local_file_path, file_size, mid)

                if success:
                    total_processed_files += 1
                    total_saved_rows += saved_rows
                    self.stdout.write(self.style.SUCCESS(f"\n[MID: {mid}] 処理完了。DB保存件数: {saved_rows:,} 件"))
                else:
                    self.stdout.write(self.style.ERROR(f"\n[MID: {mid}] 処理失敗。"))

        self.stdout.write(self.style.SUCCESS(f"\n--- インポートコマンド完了: {total_processed_files} / {len(files_to_process)} 件のファイルが正常に処理されました (合計 {total_saved_rows:,} 行保存) ---"))
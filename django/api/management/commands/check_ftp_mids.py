import os
import re
import ftplib
import time
import gzip
import csv
import traceback 
import sys 
import shutil # 追加: ファイルコピー用
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional
from decimal import Decimal, InvalidOperation 

# Djangoのコア機能とモデルをインポート
# 注: 環境に応じて、この行はコメントアウトまたは調整が必要な場合があります
# from django.core.management.base import BaseCommand
# from django.db import transaction, IntegrityError
# from django.utils import timezone
# from api.models import LinkshareProduct, RawApiData 

# === ダミーのDjango依存クラス (デバッグ実行用) ===
class DummyBaseCommand: pass
class DummyTransaction:
    def atomic(self):
        class Dummy:
            def __enter__(self): pass
            def __exit__(self, exc_type, exc_val, exc_tb): pass
        return Dummy()
transaction = DummyTransaction()
class DummyModel:
    objects = None
LinkshareProduct = RawApiData = DummyModel
# ===============================================


# ==============================================================================
# 接続・ファイル設定 (定数)
# ==============================================================================
FTP_HOST = os.getenv("LINKSHARE_FTP_HOST", "aftp.linksynergy.com") 
FTP_USER = os.getenv("LINKSHARE_BS_USER", "rkp_3750988") 
# ★注意: FTP_PASSは表示しないようにします。
FTP_PASS = os.getenv("LINKSHARE_BS_PASS", "u5NetPVZEAhABD7HuW2VRymP") 
FTP_PORT = 21 
FTP_TIMEOUT = 180 

MAX_SIZE_BYTES = 1073741824 # 1 GB のバイト値
# ★★★ 修正箇所: ダウンロード先をコンテナ内部の/tmpディレクトリに変更 ★★★
DOWNLOAD_DIR = "/tmp/ftp_downloads" 
# ★★★ 修正箇所ここまで ★★★

FULL_DATA_PATTERN = r"(\d+)_3750988_mp\.txt\.gz$"
DELTA_DATA_PATTERN = r"(\d+)_3750988_delta\.txt\.gz$"

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
                # タイムゾーン情報を付加
                mtime_dt_utc = mtime_dt_naive.replace(tzinfo=timezone.utc)
                # mtime_ts = mtime_dt_utc.timestamp() 
                mtime_ts = (mtime_dt_utc - datetime(1970, 1, 1, tzinfo=timezone.utc)).total_seconds()
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
        # Djangoのtimezone.utcを使用
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
# データ保存ロジック (ダミーのLinkshareProductモデル依存)
# ==============================================================================

def _save_single_product(row_list: List[str], mid: str) -> Optional[LinkshareProduct]:
    """
    パースされた単一の行データ (38フィールド) をLinkshareProductモデルに保存する。
    **デバッグ中のため、実際には呼び出されない**
    """
    return None

# ==============================================================================
# データパースと保存を統合したメイン処理 (完全にスキップされる)
# ==============================================================================

def parse_and_process_file(local_path: str, mid: str): 
    """ダウンロードしたファイルをパースし、全データ行をデータベースに保存する"""
    # I/Oテストフェーズではこの関数は呼ばれない
    return False, 0

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
            print('\r' + ' ' * self.last_print_len, end='', flush=True) 
            print('\r' + progress_str, end='', flush=True)
            self.last_print_len = len(progress_str)

def download_file(filename: str, local_path: str, file_size: int, mid: str) -> Tuple[bool, int]: 
    """FTPからファイルをダウンロードし、進捗を表示し、その後ファイルI/Oテストを行う"""
    # ★重要: DOWNLOAD_DIRの変更により、local_pathは /tmp/... になっているはずです。
    print(f"\n📥 ダウンロード開始: {filename} -> {local_path} ({human_readable_size(file_size)})")
    
    # download_file内でも再度FTP接続を試みる
    ftp = _get_ftp_client() 
    if not ftp:
        print("❌ FTP接続に失敗しました。（ダウンロード開始前）")
        return False, 0

    download_success = False
    downloaded_size = 0
    saved_rows = 0
    
    try:
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        with open(local_path, 'wb') as fp:
            progress = DownloadProgress(file_size, fp) 
            ftp.retrbinary(f'RETR {filename}', progress.update) 
            downloaded_size = progress.downloaded
        
        # プログレスバーを上書き
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

    # ★★★ ダウンロード成功後の処理 (ファイルコピー+I/Oテスト) ★★★
    if download_success and downloaded_size == file_size:
        
        # 新規追加: コピー先のパスを定義 (これも /tmp のサブディレクトリになる)
        temp_local_path = local_path + ".temp_test"
        
        # このログが出力されれば、クラッシュは gzip.open 実行時と確定
        print(f"💾 [DEBUG {mid}] STARTING COPY TEST. Forcing print flush.", file=sys.stderr, flush=True) 
        
        saved_rows = 0 
        success = False # 初期化
        
        try:
            # 1. ダウンロードしたファイルを別名でコピーする (ファイルシステムレベルのテスト)
            shutil.copyfile(local_path, temp_local_path)
            print(f"📝 [DEBUG {mid}] FILE COPY SUCCESS.", file=sys.stderr, flush=True)
            
            # 2. コピーしたファイルに対して gzip.open のテストを行う
            with gzip.open(temp_local_path, 'rb') as f_test:
                # ここでクラッシュするかをテスト
                first_line = f_test.readline() 
                
            # 3. テストが成功したら、ダミーの成功を返す
            success = True
            saved_rows = 1 
            print(f"📝 [DEBUG {mid}] GZIP TEST SUCCESS (COPIED). Returning fake success.", file=sys.stderr, flush=True)

            # 4. コピーしたファイルを削除
            os.remove(temp_local_path)
            
            # 5. 元のファイルも削除してクリーンアップ
            os.remove(local_path)
            
            # -------------------------------
            
            return success and saved_rows > 0, saved_rows 
            
        except BaseException as e: 
            # 6. 低レベルなクラッシュ/エラーを捕捉し、トレースバックを出力
            print(f"💥 [MID: {mid}] COPY/GZIP I/O ERROR/CRASH: {type(e).__name__} - {e}", file=sys.stderr, flush=True)
            traceback.print_exc(file=sys.stderr)
            
            # 7. エラーが発生した場合でも、一時ファイルをクリーンアップを試みる (重要)
            try:
                if os.path.exists(temp_local_path):
                    os.remove(temp_local_path)
                if os.path.exists(local_path):
                    os.remove(local_path)
            except Exception:
                pass

            return False, 0
            
    # ダウンロードに失敗した場合、またはサイズが一致しない場合
    return download_success and saved_rows > 0, saved_rows
# ★★★ 修正箇所ここまで ★★★


# ==============================================================================
# Django Management Command の定義
# ==============================================================================

# class Command(BaseCommand): # Django環境がない場合はこの行をコメントアウト
class Command(DummyBaseCommand): # ダミーのコマンドクラスを使用
    help = 'LinkShare FTPからマーチャンダイザーをダウンロードし、LinkshareProductモデルにインポートします。'

    def add_arguments(self, parser):
        # parserが提供されない環境でエラーにならないよう、ダミー引数を処理
        if not hasattr(parser, 'add_argument'): return
        
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
        # 必要なオプションをデフォルト値で設定
        target_mid = options.get('mid')
        limit = options.get('limit', 5)
        
        # Djangoのself.stdout.writeの代わりに標準print文を使用
        self_stdout_write = lambda msg: print(msg)
        self_stderr_write = lambda msg: print(msg, file=sys.stderr)
        
        self_stdout_write("--- LinkShare データインポートコマンド開始 ---")
        
        # 環境定数 (デバッグ情報) 
        self_stdout_write("\n--- 環境定数 (デバッグ情報) ---")
        self_stdout_write(f"🌐 FTP HOST:      {FTP_HOST}:{FTP_PORT}")
        self_stdout_write(f"👤 FTP USER:      {FTP_USER}")
        self_stdout_write(f"📏 MAX FILE SIZE: {human_readable_size(MAX_SIZE_BYTES)} (1GB)")
        self_stdout_write(f"⏱️ FTP TIMEOUT:   {FTP_TIMEOUT} 秒")
        self_stdout_write(f"📂 DOWNLOAD DIR:  {DOWNLOAD_DIR}") # ダウンロード先パスを表示
        self_stdout_write("------------------------------------")
        
        # 1. FTPファイルリストの取得
        self_stdout_write("\n🔍 FTPサーバーから処理対象ファイルリストを取得中... (1GB未満のファイルに限定)") 
        DATA_PATH = os.getenv("LINKSHARE_BS_DATA_PATH", "")
        
        try:
            # 実際のFTP接続を行い、ファイルリストを取得
            mid_list = get_ftp_mid_list(DATA_PATH)
        except Exception as e:
            self_stderr_write(f"FTPファイルリスト取得エラー: {e}")
            return

        # ファイルリストの表示ロジック
        if not mid_list:
            self_stdout_write("⚠️ 処理対象ファイルが見つからなかったか、FTP接続に失敗しました。")
            return

        self_stdout_write(f"\n✅ FTPから以下の **{len(mid_list)}** 件の処理可能ファイルが見つかりました (1GB未満):")
        
        # リストを整形して表示
        self_stdout_write("-" * 80)
        self_stdout_write("{:<10} {:<10} {:<60}".format("MID", "サイズ", "ファイル名"))
        self_stdout_write("{:<10} {:<10} {:<60}".format("-" * 3, "-" * 6, "-" * 60))

        for mid_item, filename, file_type, mtime_dt, file_size in mid_list:
            size_hr = human_readable_size(file_size)
            self_stdout_write("{:<10} {:<10} {:<60}".format(mid_item, size_hr, filename))

        self_stdout_write("-" * 80)
        
        # フィルタリングと制限
        if target_mid:
            mid_list = [item for item in mid_list if item[0] == target_mid]
            if not mid_list:
                self_stdout_write(f"⚠️ 指定されたMID ({target_mid}) に該当するファイルが見つかりませんでした。")
                return

        files_to_process = mid_list[:limit]
        
        if not files_to_process:
            self_stdout_write(f"⚠️ 制限数 ({limit}) により、処理対象ファイルがありません。")
            return

        total_processed_files = 0
        total_saved_rows = 0
        
        self_stdout_write(f"\n🚀 上位 {len(files_to_process)} 件のファイルをダウンロードして処理します。")
        
        # 2. ダウンロードとパースの実行
        # Django環境でなければ transaction.atomic() はダミーオブジェクトを使用
        with transaction.atomic():
            for mid_item, filename, file_type, _, file_size in files_to_process:
                # local_file_path は /tmp/ftp_downloads/... になる
                local_file_path = os.path.join(DOWNLOAD_DIR, filename)
                
                # 修正後の download_file を呼び出し
                success, saved_rows = download_file(filename, local_file_path, file_size, mid_item)
                
                if success:
                    total_processed_files += 1
                    total_saved_rows += saved_rows
                    self_stdout_write(f"\n[MID: {mid_item}] 処理完了。DB保存件数: {saved_rows:,} 件 (※I/Oテストのためダミー値)")
                else:
                    self_stderr_write(f"\n[MID: {mid_item}] 処理失敗。")

        self_stdout_write(f"\n--- インポートコマンド完了: {total_processed_files} / {len(files_to_process)} 件のファイルが正常に処理されました (合計 {total_saved_rows:,} 行保存) ---")

# ==============================================================================
# コマンドの実行 (デバッグ環境用)
# ==============================================================================
if __name__ == '__main__':
    # 実際には Django の管理コマンドとして実行されますが、スタンドアロンテストのため直接呼び出し
    cmd = Command()
    # 制限数をハードコードしてテスト実行
    cmd.handle(limit=5)
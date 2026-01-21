import os
import re
import ftplib
import gzip
import csv
import shutil
import logging
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from api.models import PCProduct

# === [メーカー・リファレンス設定] ===
# 2026/01/16版 CSVリストに基づき、PC・家電関連を中心に全MIDをマッピング
MAKER_MAP = {
    "2442":  {"prefix": "e87",      "maker": "e87.com(千趣会イイハナ)"},
    "2543":  {"prefix": "fujitsu",  "maker": "富士通 WEB MART"},
    "2557":  {"prefix": "dell",     "maker": "デル株式会社"},
    "2563":  {"prefix": "nissen",   "maker": "ニッセン"},
    "2633":  {"prefix": "sourcenext", "maker": "ソースネクスト"},
    "2780":  {"prefix": "nec",      "maker": "NEC「得選街」"},
    "2880":  {"prefix": "hmv",      "maker": "HMV&BOOKS online"},
    "2928":  {"prefix": "belle",    "maker": "ベルメゾンネット"},
    "3039":  {"prefix": "cecile",   "maker": "セシール"},
    "3256":  {"prefix": "eizo",     "maker": "EIZOダイレクト"},
    "13730": {"prefix": "edion",    "maker": "エディオンネットショップ"},
    "13786": {"prefix": "fanccl",   "maker": "ファンケルオンライン"},
    "13972": {"prefix": "yamada",   "maker": "ヤマダウェブコム"},
    "13993": {"prefix": "kojima",   "maker": "コジマネット"},
    "14050": {"prefix": "tsukumo",  "maker": "ツクモネットショップ"},
    "24361": {"prefix": "look",     "maker": "LOOK@E-SHOP"},
    "24501": {"prefix": "felissimo", "maker": "フェリシモ"},
    "24577": {"prefix": "onward",   "maker": "ONWARD CROSSET"},
    "35265": {"prefix": "takasago", "maker": "高砂熱学オンラインショップ"},
    "35340": {"prefix": "asics",    "maker": "アシックスオンラインストア"},
    "35364": {"prefix": "mizuno",   "maker": "ミズノ公式オンライン"},
    "35909": {"prefix": "hp",       "maker": "HP Directplus"},
    "36009": {"prefix": "p-one",    "maker": "P-oneモール"},
    "36187": {"prefix": "dospara",  "maker": "ドスパラ"},
    "36426": {"prefix": "matsukiyo", "maker": "マツモトキヨシ公式"},
    "36508": {"prefix": "dynabook", "maker": "Dynabook Direct"},
    "36559": {"prefix": "suntory",  "maker": "サントリーウエルネス公式"},
    "36806": {"prefix": "lenovo",   "maker": "レノボ・ジャパン"},
    "37641": {"prefix": "sofmap",   "maker": "ソフマップ・ドットコム"},
    "37667": {"prefix": "esthe",    "maker": "エステプロ・ラボ公式"},
    "38221": {"prefix": "mouse",    "maker": "マウスコンピューター"},
    "39165": {"prefix": "crocs",    "maker": "クロックス公式"},
    "39942": {"prefix": "apple",    "maker": "Apple公式サイト"},
    "40386": {"prefix": "ankey",    "maker": "Anker Japan公式サイト"},
    "40622": {"prefix": "sony",     "maker": "ソニーストア"},
    "41679": {"prefix": "buffalo",  "maker": "バッファロー公式"},
    "42127": {"prefix": "lenovo_c", "maker": "Lenovo 広告限定ストア"},
    "42368": {"prefix": "asus",     "maker": "ASUS Online Store"},
    "42376": {"prefix": "iherb",    "maker": "iHerb"},
    "42408": {"prefix": "microsoft", "maker": "Microsoft Store"},
    "42549": {"prefix": "s-sneakers", "maker": "S-SNEAKERS"},
    "42687": {"prefix": "nojima",   "maker": "ノジマオンライン"},
    "42884": {"prefix": "sanwa",    "maker": "サンワダイレクト"},
    "43098": {"prefix": "edion_a",  "maker": "エディオン(Affiliate)"},
    "43219": {"prefix": "trend",    "maker": "トレンドマイクロ"},
    "43618": {"prefix": "adobe",    "maker": "Adobe公式"},
    "43708": {"prefix": "asus_s",   "maker": "ASUS Store Online"},
    "43742": {"prefix": "petgo",    "maker": "ペットゴー"},
    "44144": {"prefix": "casetify", "maker": "CASETiFY"},
    "44632": {"prefix": "webpo",    "maker": "ウェブポ"},
    "45396": {"prefix": "coen",     "maker": "coen ONLINE STORE"},
    "45802": {"prefix": "tatras",   "maker": "TATRAS CONCEPT STORE"},
    "46274": {"prefix": "freaks",   "maker": "FREAK'S STORE"},
    "46704": {"prefix": "readyfor", "maker": "READYFOR"},
    "47492": {"prefix": "isetan",   "maker": "ISETAN BEAUTY"},
    "47506": {"prefix": "mitsukoshi", "maker": "三越伊勢丹オンラインストア"},
    "47673": {"prefix": "honeys",   "maker": "Honeys公式通販"},
    "47858": {"prefix": "united",   "maker": "UNITED ARROWS"},
    "50052": {"prefix": "loft",     "maker": "ロフト公式"},
    "50342": {"prefix": "muji",     "maker": "無印良品"},
    "50416": {"prefix": "sogo",     "maker": "西武・そごうのe.デパート"},
    "50572": {"prefix": "jshoppers", "maker": "JSHOPPERS"},
    "50588": {"prefix": "tokyu",    "maker": "東急百貨店ネットショッピング"},
    "50644": {"prefix": "takashimaya", "maker": "高島屋オンラインストア"},
    "50692": {"prefix": "daimaru",  "maker": "大丸松坂屋オンラインストア"},
    "50818": {"prefix": "hankyu",   "maker": "阪急百貨店オンラインストア"},
    "52983": {"prefix": "kinokuniya", "maker": "紀伊國屋書店"},
    "53011": {"prefix": "tsutaya",  "maker": "TSUTAYA オンラインショッピング"},
    "53146": {"prefix": "bookoff",  "maker": "ブックオフ公式オンライン"},
    "53216": {"prefix": "netoff",   "maker": "ネットオフ"},
    "53442": {"prefix": "surugaya", "maker": "駿河屋"},
    "53445": {"prefix": "amiami",   "maker": "あみあみ"},
    "53500": {"prefix": "animate",  "maker": "アニメイト通販"},
}

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "LinkShare FTPから製品データを取得し、PC製品のみをDBに保存します。"

    FTP_HOST = os.getenv("LINKSHARE_FTP_HOST", "aftp.linksynergy.com")
    FTP_USER = os.getenv("LINKSHARE_BC_USER", "rkp_3273700")
    FTP_PASS = os.getenv("LINKSHARE_BC_PASS", "5OqF1NfuruvJlmuJXKQDRuzh")
    DOWNLOAD_DIR = "/tmp/linkshare_import"

    def add_arguments(self, parser):
        parser.add_argument('--mids', type=str, help='MIDをカンマ区切りで指定')
        parser.add_argument('--limit', type=int, default=10, help='処理するメーカー数')
        parser.add_argument('--force', action='store_true', help='既存ファイルを無視してDL')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f"🚀 LinkShare Sync Started: {timezone.now()}"))
        os.makedirs(self.DOWNLOAD_DIR, exist_ok=True)

        ftp = self._connect_ftp()
        if not ftp: return

        try:
            # 1. FTP走査 (_template.txt.gz は除外、実体ファイルのみ)
            mid_files = self._scan_ftp_files(ftp, options['mids'])
            self._print_summary_table(mid_files)

            if not mid_files:
                self.stdout.write(self.style.WARNING("⚠️ 対象となる実データ(mp.txt.gz)が見つかりませんでした。"))
                return

            # 2. メイン処理
            processed = 0
            for mid, filename, f_type, f_size, path in mid_files:
                if processed >= options['limit']: break
                
                info = MAKER_MAP.get(mid, {"prefix": f"mid_{mid}", "maker": f"Unknown({mid})"})
                local_gz = os.path.join(self.DOWNLOAD_DIR, filename)
                local_txt = local_gz.replace('.gz', '.txt')

                self.stdout.write(f"\n>>> Processing: {info['maker']} ({mid})")

                if not options['force'] and os.path.exists(local_gz) and os.path.getsize(local_gz) == f_size:
                    self.stdout.write(f"⏩ Cached: {filename}")
                else:
                    if not self._download(ftp, path, filename, local_gz): continue

                if self._decompress(local_gz, local_txt):
                    count = self._parse_and_save(local_txt, mid, info)
                    self.stdout.write(self.style.SUCCESS(f"✅ {count} items stored."))
                    processed += 1
                    if os.path.exists(local_txt): os.remove(local_txt)

            self.stdout.write(self.style.SUCCESS(f"\n✨ 同期完了: {processed} サイトの処理に成功しました。"))

        finally:
            ftp.quit()

    def _scan_ftp_files(self, ftp, target_mids_str):
        """実データファイル (*_mp.txt.gz) のみを取得"""
        target_mids = target_mids_str.split(',') if target_mids_str else []
        results = {}
        # _template を含まない正規の実ファイルを抽出する正規表現
        pattern = re.compile(r"^(\d+)_3273700_(mp|delta)\.txt\.gz$")

        try:
            ftp.voidcmd('TYPE I')
            ftp.cwd("/")
            files = ftp.nlst()
            for f in files:
                match = pattern.search(f)
                if not match: continue
                
                mid, suffix = match.groups()
                if target_mids and mid not in target_mids: continue
                
                try: f_size = ftp.size(f)
                except: f_size = 0
                
                # 0バイトや空のテンプレートファイルを除外
                if f_size > 100: 
                    f_type = "FULL" if suffix == "mp" else "DELTA"
                    if mid not in results or f_type == "FULL":
                        results[mid] = (mid, f, f_type, f_size, "/")
        except Exception as e:
            self.stderr.write(f"❌ FTP Scan Error: {e}")
        
        return sorted(results.values(), key=lambda x: x[0])

    def _download(self, ftp, path, filename, local_path):
        try:
            ftp.voidcmd('TYPE I')
            ftp.cwd(path)
            with open(local_path, 'wb') as f:
                ftp.retrbinary(f'RETR {filename}', f.write)
            return True
        except Exception as e:
            self.stderr.write(f"❌ Download error: {e}")
            return False

    def _decompress(self, gz_path, txt_path):
        try:
            with gzip.open(gz_path, 'rb') as f_in, open(txt_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
            return True
        except Exception as e:
            self.stderr.write(f"❌ Gzip error: {e}")
            return False

    def _parse_and_save(self, file_path, mid, info):
        batch = []
        imported_count = 0
        # 商品名、型番、価格、URL、画像URLの列を抽出
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter='|')
            try: next(reader)
            except: return 0
            
            for row in reader:
                if not row or row[0] == 'TRL' or len(row) < 18: continue
                
                name, sku = row[1].strip(), row[2].strip()
                raw_desc = (row[9] or row[10] or "").strip()
                
                # PC・モニター関連のみフィルタ
                keywords = ['pc', 'laptop', 'パソコン', 'ノート', 'monitor', 'ディスプレイ', 'desktop', 'ワークステーション']
                if not any(k in (name + raw_desc).lower() for k in keywords):
                    continue

                price = self._clean_price(row[13])
                specs = self._extract_specs(f"{name} {raw_desc}")

                batch.append(PCProduct(
                    unique_id=f"{info['prefix']}_{sku}",
                    site_prefix=info['prefix'],
                    maker=info['maker'],
                    name=name, price=price,
                    url=row[8].strip(), image_url=row[6].strip(), affiliate_url=row[5].strip(),
                    description=f"{specs} / {raw_desc}"[:1000],
                    unified_genre=self._judge_genre(name, row[17]),
                    is_active=True, updated_at=timezone.now()
                ))

                if len(batch) >= 200:
                    self._bulk_upsert(batch)
                    imported_count += len(batch)
                    batch = []

            if batch:
                self._bulk_upsert(batch)
                imported_count += len(batch)
        return imported_count

    def _extract_specs(self, text):
        cpu = re.search(r'(Core\s?i[3579]|Ryzen\s?[3579]|Ultra\s?\d|M[123])', text, re.I)
        ram = re.search(r'(\d+)\s?GB\s?(?:RAM|メモリ)', text, re.I)
        ssd = re.search(r'(\d+)\s?(?:GB|TB)\s?(?:SSD|NVMe|ストレージ)', text, re.I)
        res = [m.group(0) for m in [cpu, ram, ssd] if m]
        return " / ".join(res)

    def _judge_genre(self, name, cat):
        n = name.lower()
        if any(x in n for x in ["monitor", "モニター", "ディスプレイ"]): return "Monitor"
        if any(x in n for x in ["laptop", "ノート"]): return "Laptop"
        if any(x in n for x in ["desktop", "デスクトップ"]): return "Desktop"
        return "PC"

    def _clean_price(self, p_str):
        try: return int(float(re.sub(r'[^\d.]', '', p_str)))
        except: return 0

    def _bulk_upsert(self, batch):
        with transaction.atomic():
            for item in batch:
                PCProduct.objects.update_or_create(
                    unique_id=item.unique_id,
                    defaults={
                        'maker': item.maker, 'name': item.name, 'price': item.price,
                        'url': item.url, 'image_url': item.image_url, 'affiliate_url': item.affiliate_url,
                        'description': item.description, 'unified_genre': item.unified_genre,
                        'is_active': True, 'updated_at': item.updated_at
                    }
                )

    def _connect_ftp(self):
        try:
            ftp = ftplib.FTP(self.FTP_HOST, timeout=60)
            ftp.login(self.FTP_USER, self.FTP_PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception as e:
            self.stderr.write(f"❌ FTP Connection Fail: {e}")
            return None

    def _print_summary_table(self, mid_files):
        self.stdout.write("\n" + "="*100)
        self.stdout.write(f"{'MID':<10} | {'Manufacturer Name (Updated)':<30} | {'Type':<6} | {'Size(MB)':<10}")
        self.stdout.write("-" * 100)
        for mid, fname, f_type, f_size, path in mid_files:
            m_name = MAKER_MAP.get(mid, {}).get('maker', f'Unknown({mid})')
            size_mb = f"{f_size / 1024**2:,.2f}"
            self.stdout.write(f"{mid:<10} | {m_name[:30]:<30} | {f_type:<6} | {size_mb:<10}")
        self.stdout.write("="*100 + "\n")
import os
import re
import ftplib
import gzip
import csv
import logging
import chardet
from datetime import datetime
from typing import List, Dict, Any, Optional

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from api.models import PCProduct, PCAttribute  # PCAttributeを追加

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'LinkShare FTPから製品データを取得し、TSVマスターに基づいて属性を自動判定・更新します'

    FTP_HOST = "aftp.linksynergy.com"
    FTP_USER = os.getenv("LINKSHARE_BC_USER", "rkp_3273700")
    FTP_PASS = os.getenv("LINKSHARE_BC_PASS", "5OqF1NfuruvJlmuJXKQDRuzh")
    DOWNLOAD_DIR = "/tmp/pc_ftp_import"
    SID = "3273700"
    
    # 属性定義TSVのパス
    # TSV_PATH = "/home/maya/dev/shin-vps/django/master_data/attributes.tsv"
    TSV_PATH = "/usr/src/app/master_data/attributes.tsv"

    MAKER_MAP = {
        "2543": {"prefix": "fujitsu", "maker": "FMV"},
        "2557": {"prefix": "dell", "maker": "Dell"},
        "3256": {"prefix": "eizo", "maker": "EIZO"},
        "35909": {"prefix": "hp", "maker": "HP"},
        "36508": {"prefix": "dynabook", "maker": "Dynabook"},
        "42368": {"prefix": "asus", "maker": "ASUS"},
        "2633": {"prefix": "sourcenext", "maker": "ソースネクスト"},
        "24501": {"prefix": "trendmicro", "maker": "トレンドマイクロ"},
        "2470": {"prefix": "nec-biz", "maker": "NEC-SOHO"},
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attr_rules = []

    def add_arguments(self, parser):
        parser.add_argument('--mid', type=str, help='Merchant ID', required=True)

    def _load_attr_rules(self):
        """TSVファイルを読み込んで判定ルールを作成する"""
        rules = []
        if not os.path.exists(self.TSV_PATH):
            self.stdout.write(self.style.WARNING(f"⚠️ TSVファイルが見つかりません: {self.TSV_PATH}"))
            return rules

        with open(self.TSV_PATH, 'r', encoding='utf-8') as f:
            # タブ区切り(TSV)として読み込み
            reader = csv.DictReader(f, delimiter='\t')
            for row in reader:
                # search_keywordsをカンマで分割してリスト化
                keywords = [k.strip() for k in row['search_keywords'].split(',') if k.strip()]
                rules.append({
                    'slug': row['slug'],
                    'keywords': keywords,
                    'attr_type': row['attr_type']
                })
        self.stdout.write(self.style.SUCCESS(f"📖 TSVから {len(rules)} 個の判定ルールを読み込みました"))
        return rules

    def _determine_attributes(self, text: str) -> List[str]:
        """テキストから合致する全属性スラッグを抽出する"""
        matched_slugs = []
        lower_text = text.lower()
        for rule in self.attr_rules:
            # いずれかのキーワードが含まれているかチェック
            if any(kw.lower() in lower_text for kw in rule['keywords']):
                matched_slugs.append(rule['slug'])
        return matched_slugs

    def handle(self, *args, **options):
        # 1. ルールをロード
        self.attr_rules = self._load_attr_rules()

        target_mid = options['mid']
        site_info = self.MAKER_MAP.get(target_mid, {"prefix": f"mid_{target_mid}", "maker": "Unknown"})

        self.stdout.write(self.style.SUCCESS(f"🚀 LinkShare Sync Started: {timezone.now()}"))
        
        if not os.path.exists(self.DOWNLOAD_DIR):
            os.makedirs(self.DOWNLOAD_DIR)
        
        ftp = self._connect_ftp()
        if not ftp: return

        try:
            target_filename = f"{target_mid}_{self.SID}_mp.txt.gz"
            local_gz_path = os.path.join(self.DOWNLOAD_DIR, target_filename)
            local_txt_path = local_gz_path.replace('.gz', '.txt')

            self.stdout.write(f"📡 Downloading: /{target_filename}")
            
            try:
                with open(local_gz_path, 'wb') as f:
                    ftp.retrbinary(f'RETR {target_filename}', f.write)
            except ftplib.error_perm as e:
                self.stderr.write(self.style.ERROR(f"❌ FTP File Not Found: {target_filename} ({e})"))
                return

            self.stdout.write("🔓 Decompressing and Encoding Check...")
            with gzip.open(local_gz_path, 'rb') as f_in:
                raw_content = f_in.read()
                
                if target_mid == "2470":
                    encoding = 'cp932'
                else:
                    detected = chardet.detect(raw_content[:10000])
                    encoding = detected.get('encoding', 'utf-8')
                
                decoded_text = raw_content.decode(encoding, errors='replace')
                with open(local_txt_path, 'w', encoding='utf-8') as f_out:
                    f_out.write(decoded_text)

            count = self._parse_and_import(local_txt_path, target_mid, site_info)
            self.stdout.write(self.style.SUCCESS(f"✅ {site_info['maker']} 完了: {count} 件"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Error: {str(e)}"))
            import traceback
            traceback.print_exc()
        finally:
            if os.path.exists(local_gz_path): os.remove(local_gz_path)
            if os.path.exists(local_txt_path): os.remove(local_txt_path)
            if ftp:
                try: ftp.quit()
                except: ftp.close()

    def _parse_and_import(self, file_path: str, mid: str, site_info: dict) -> int:
        batch = []
        import_count = 0
        with open(file_path, 'r', encoding='utf-8') as f:
            f.readline() # ヘッダー
            reader = csv.reader(f, delimiter='|')
            
            for row in reader:
                if not row or row[0] in ['TRL', 'HDR'] or len(row) < 18:
                    continue

                sku = row[2].strip()
                name = row[1].strip()
                raw_desc = row[9].strip() or row[10].strip() or ""

                # スペック抽出
                specs = self._extract_specs(name, raw_desc)
                spec_parts = []
                if specs['cpu']: spec_parts.append(specs['cpu'])
                if specs['ram']: spec_parts.append(f"{specs['ram']}GB RAM")
                if specs['ssd']: 
                    cap = specs['ssd']
                    s_str = f"{cap/1024}TB" if cap >= 1024 else f"{cap}GB"
                    spec_parts.append(f"{s_str} SSD")
                
                parsed_spec_prefix = " / ".join(spec_parts)
                full_description = f"{parsed_spec_prefix} | {raw_desc}" if parsed_spec_prefix else raw_desc

                # 代表的なジャンル判定（TSVのスラッグからPC形状を優先して1つ抽出）
                search_text = f"{name} {full_description}"
                matched_slugs = self._determine_attributes(search_text)
                
                # type-laptop 等の形状スラッグがあれば unified_genre にセット、なければデフォルト "PC"
                main_genre = "PC"
                for s in matched_slugs:
                    if s.startswith('type-'):
                        main_genre = s
                        break

                product_data = {
                    'unique_id': f"{site_info['prefix']}_{sku}",
                    'site_prefix': site_info['prefix'],
                    'maker': site_info['maker'],
                    'name': name,
                    'price': self._clean_price(row[13]),
                    'url': row[8].strip(),
                    'image_url': row[6].strip(),
                    'affiliate_url': row[5].strip(),
                    'description': full_description,
                    'raw_genre': row[17].strip(),
                    'unified_genre': main_genre,
                    'is_active': True,
                    'updated_at': timezone.now(),
                    'matched_slugs': matched_slugs # 一時的に保持
                }
                
                batch.append(product_data)
                import_count += 1
                
                if len(batch) >= 100:
                    self._bulk_upsert(batch)
                    batch = []

            if batch: self._bulk_upsert(batch)
        return import_count

    def _extract_specs(self, name: str, desc: str) -> Dict[str, Any]:
        text = f"{name} {desc}"
        cpu = re.search(r'(Core\s?i[3579]|Ryzen\s?[3579]|Ultra\s?\d|Snapdragon|Xeon|Celeron|Pentium)', text, re.I)
        ram = re.search(r'(\d+)\s?GB\s?(?:RAM|メモリ|DDR)', text, re.I)
        ssd = re.search(r'(\d+)\s?(GB|TB)\s?(?:SSD|NVMe|ストレージ)', text, re.I)
        ssd_val = 0
        if ssd:
            try:
                v = int(ssd.group(1))
                ssd_val = v * 1024 if ssd.group(2).upper() == 'TB' else v
            except: pass
        return {'cpu': cpu.group(0) if cpu else None, 'ram': int(ram.group(1)) if ram else None, 'ssd': ssd_val}

    def _clean_price(self, p_str: str) -> int:
        try: return int(float(re.sub(r'[^\d.]', '', p_str)))
        except: return 0

    def _bulk_upsert(self, batch: List[Dict]):
        with transaction.atomic():
            for item in batch:
                matched_slugs = item.pop('matched_slugs')
                product, created = PCProduct.objects.update_or_create(
                    unique_id=item['unique_id'],
                    defaults=item
                )
                
                # 多対多のリレーション (PCAttribute) を更新
                if matched_slugs:
                    attrs = PCAttribute.objects.filter(slug__in=matched_slugs)
                    product.attributes.set(attrs)

    def _connect_ftp(self) -> Optional[ftplib.FTP]:
        try:
            ftp = ftplib.FTP(self.FTP_HOST, timeout=60)
            ftp.login(self.FTP_USER, self.FTP_PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ FTP Connection Fail: {e}"))
            return None
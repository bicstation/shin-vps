import os
import django
import requests
from bs4 import BeautifulSoup
import hashlib
import time
import re
import urllib.parse
import html

# --- Django環境セットアップ ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models.pc_products import PCProduct

MAKER_NAME = "Sycom"
SITE_PREFIX = "SYCOM"
A8_BASE_URL = "https://px.a8.net/svt/ejp?a8mat=2ZCPLP+CO42OY+34WQ+BW8O2&a8ejpredirect="
FIXED_IMAGE_URL = "https://www.sycom.co.jp/custom/files_rs01/RaptorLake-S-Refresh/G-Master_Spear_B760-D4/gallery/001.jpg"

def clean_html_tags(text):
    """HTMLタグと不要な空白を徹底的に除去"""
    if not text: return ""
    text = re.sub(r'<[^>]+>', '', text) # タグ除去
    text = html.unescape(text)
    text = re.sub(r'[\r\n\t\xa0]+', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def clean_name(text):
    if not text: return ""
    text = clean_html_tags(text)
    text = re.sub(r'★.*?迄\)', '', text)
    text = text.replace("BTO パソコン(PC)の【@Sycom】(サイコム)", "")
    return text.strip().strip("｜")

def run_sycom_crawler():
    target_urls = [
        "https://www.sycom.co.jp/bto/game_pc/",
        "https://www.sycom.co.jp/bto/middle_tower/",
        "https://www.sycom.co.jp/ranking/",
        "https://www.sycom.co.jp/bto/dual_water_cooling/",
        "https://www.sycom.co.jp/bto/silent_pc/"
    ]
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    KW_RE = re.compile(r'(CPU|マザーボード|メモリ|ストレージ|グラフィック|OS|外形寸法|電源|ケース|フォームファクタ|ビデオカード|SSD|標準)')

    print(f"\n🚀 {SITE_PREFIX} 標準構成・完全補完解析モード起動...")

    # 1. リンク収集
    product_urls = []
    for start_url in target_urls:
        try:
            res = requests.get(start_url, headers=headers, timeout=15)
            soup = BeautifulSoup(res.text, 'html.parser')
            for a in soup.find_all('a', href=re.compile(r'/custom/model\?no=\d+')):
                url = urllib.parse.urljoin("https://www.sycom.co.jp", a.get('href'))
                if url not in product_urls: product_urls.append(url)
        except: continue

    print(f"✅ 解析対象: {len(product_urls)} 件\n" + "="*70)

    total_saved = 0
    for p_url in product_urls:
        try:
            time.sleep(1.0)
            res = requests.get(p_url, headers=headers, timeout=15)
            soup = BeautifulSoup(res.text, 'html.parser')
            name = clean_name(soup.title.string.split('｜')[0] if soup.title else "Sycom PC")
            
            specs = []

            # --- 抽出ロジック：サイコムの「標準構成」エリアを網羅 ---
            # 戦略1: table内のth/td構造を狙う
            for table in soup.find_all('table'):
                for row in table.find_all('tr'):
                    cells = row.find_all(['th', 'td'])
                    if len(cells) >= 2:
                        label = clean_html_tags(cells[0].get_text())
                        value = clean_html_tags(cells[1].get_text())
                        if KW_RE.search(label) or "標準構成" in label:
                            # 変更ボタンなどのゴミを排除
                            val_clean = value.split("詳細はこちら")[0].split("変更する")[0].strip()
                            if len(val_clean) > 2:
                                specs.append(f"【{label}】{val_clean}")

            # 戦略2: dl/dt/dd 構造（Radiantシリーズ等）を狙う
            for dl in soup.find_all('dl'):
                dt = dl.find('dt')
                dd = dl.find('dd')
                if dt and dd:
                    label = clean_html_tags(dt.get_text())
                    value = clean_html_tags(dd.get_text())
                    if KW_RE.search(label):
                        specs.append(f"【{label}】{value.strip()}")

            # 戦略3: spec_list などの箇条書きを狙う
            for li in soup.select('.spec_list li, .standard_spec li, .spec_box li'):
                txt = clean_html_tags(li.get_text())
                if '：' in txt or ':' in txt:
                    if KW_RE.search(txt): specs.append(txt)

            unique_specs = list(dict.fromkeys(specs))
            
            # --- コンソール出力 ---
            print(f"📦 [MODEL] {name}")
            if unique_specs:
                for s in unique_specs:
                    print(f"   ✨ {s}")
            else:
                print(f"   ⚠️ キーワード抽出失敗 -> ページ内テキストから全件救済を試みます")
                # 最終手段：テキスト中に「CPU：」などのパターンがあれば全部拾う
                page_text = soup.get_text()
                for line in page_text.split('\n'):
                    line = clean_html_tags(line)
                    if KW_RE.search(line) and ('：' in line or ':' in line):
                        if 10 < len(line) < 150: # 適切な長さのものだけ
                            print(f"   ✨ (補完) {line}")
                            specs.append(line)
            
            description = "\n".join(list(dict.fromkeys(specs)))

            # --- DB保存 ---
            uid = "sycom-" + hashlib.md5(p_url.encode()).hexdigest()[:12]
            PCProduct.objects.update_or_create(
                unique_id=uid,
                defaults={
                    'site_prefix': SITE_PREFIX, 'maker': MAKER_NAME, 'name': name,
                    'price': 0, 'url': p_url, 'image_url': FIXED_IMAGE_URL,
                    'affiliate_url': f"{A8_BASE_URL}{urllib.parse.quote(p_url)}",
                    'description': description, 'is_active': True, 'stock_status': "要在庫確認"
                }
            )
            print(f"✅ DB同期完了: {uid}\n" + "-"*60)
            total_saved += 1

        except Exception as e:
            print(f"❌ エラー ({p_url}): {e}")

    print(f"\n✨ ミッション完了！ 合計 {total_saved} 件の構成を完全に補完しました。")

if __name__ == "__main__":
    run_sycom_crawler()
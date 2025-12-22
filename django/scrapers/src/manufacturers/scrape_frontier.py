import csv
import os
import subprocess
import requests
import time
import re
from bs4 import BeautifulSoup

def run_docker_import_frontier(csv_path):
    container_name = "api_django_v2"
    container_csv_path = "/usr/src/app/scrapers/frontier_products.csv"
    print(f"🚀 Dockerコンテナ ({container_name}) へデータを転送・DB更新中...")
    try:
        subprocess.run(["docker", "exec", container_name, "mkdir", "-p", "/usr/src/app/scrapers"], check=True)
        subprocess.run(["docker", "cp", csv_path, f"{container_name}:{container_csv_path}"], check=True)
        import_cmd = ["docker", "exec", container_name, "python", "manage.py", "import_frontier"]
        subprocess.run(import_cmd, check=True)
        print(f"✅ Djangoインポート完了！")
    except Exception as e:
        print(f"❌ Docker連携エラー: {e}")

def get_frontier_category(name, url_hint):
    n = name.upper()
    # 1. 周辺機器・椅子
    if any(k in n for k in ["モニター", "ディスプレイ", "DISPLAY"]): return "monitor"
    if any(k in n for k in ["マウス", "MOUSE", "キーボード", "KEYBOARD", "ヘッドセット", "チェア", "椅子", "QUADCAST"]): return "peripheral"
    if "タブレット" in n: return "peripheral"

    # 2. ノートPC (型番FRNS, FRLNやインチ数表記で判定)
    is_note_keyword = any(k in n for k in ["ノート", "NOTEBOOK", "14型", "15.6型", "16型"])
    is_note_model = any(k in n for k in ["FRNS", "FRLN", "FRNA", "FRXNR"])
    if is_note_keyword or is_note_model or url_hint == "laptop":
        return "laptop"

    # 3. デスクトップ
    if any(k in n for k in ["FRG", "FRB", "FRS", "FRM", "FRZ", "FRX"]):
        return "desktop"

    return url_hint

def scrape_frontier_deep():
    list_urls = [
        "https://www.frontier-direct.jp/direct/e/ejFREXAR/",
        "https://www.frontier-direct.jp/direct/e/ejGame/",
        "https://www.frontier-direct.jp/direct/e/ej-month/",
        "https://www.frontier-direct.jp/direct/e/ejNote/",
        "https://www.frontier-direct.jp/direct/e/ej-sale/"
    ]
    output_csv = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontier_products.csv")
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"}
    product_map = {} 

    print("🔍 URL収集...")
    for list_url in list_urls:
        hint = "laptop" if "ejNote" in list_url else "desktop"
        try:
            res = requests.get(list_url, headers=headers, timeout=10)
            soup = BeautifulSoup(res.text, "html.parser")
            links = soup.select('div.iw-goods a[href*="/direct/g/g"]')
            for l in links:
                p_url = "https://www.frontier-direct.jp" + l['href']
                if p_url not in product_map: product_map[p_url] = hint
        except: pass

    all_data = []
    for i, (p_url, url_hint) in enumerate(product_map.items()):
        try:
            time.sleep(0.5)
            res = requests.get(p_url, headers=headers, timeout=10)
            soup = BeautifulSoup(res.text, "html.parser")
            name_tag = soup.find("h1", class_="iw-goods-detail-h1")
            name = name_tag.get_text(strip=True) if name_tag else ""
            price_tag = soup.find("span", class_="iw-number")
            if not price_tag or not name: continue
            price = int(re.sub(r'\D', '', price_tag.get_text()))
            
            final_category = get_frontier_category(name, url_hint)
            
            img_tag = soup.select_one(".iw-goods-detail-slideshow-thumbnav img")
            image_url = "https://www.frontier-direct.jp" + img_tag.get("src") if img_tag else ""

            all_data.append([final_category, name, price, p_url, image_url, ""])
            print(f"[{i+1}] {final_category} | {name[:30]}")
        except: pass

    if all_data:
        with open(output_csv, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow(['category', 'name', 'price', 'url', 'image_url', 'description'])
            writer.writerows({d[1]: d for d in all_data}.values())
        run_docker_import_frontier(output_csv)

if __name__ == "__main__":
    scrape_frontier_deep()
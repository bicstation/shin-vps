import os
import django
import re
import time
import subprocess
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# --- Django設定 ---
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def get_windows_host_ip():
    """WSL2から見たWindowsホストのIPを取得"""
    try:
        # nameserverのIPを取得
        res = subprocess.check_output("cat /etc/resolv.conf | grep nameserver | awk '{print $2}'", shell=True)
        return res.decode().strip()
    except:
        return "127.0.0.1"

def run_acer_crawler():
    host_ip = get_windows_host_ip()
    # 💡 もし自動取得のIPでダメなら "localhost" も試せるように設定
    cdp_urls = [f"http://{host_ip}:9222", "http://127.0.0.1:9222", "http://localhost:9222"]
    
    base_categories = [
        {"url": "https://store.acer.com/ja-jp/notebooks", "genre": "laptop"},
        {"url": "https://store.acer.com/ja-jp/monitors", "genre": "monitor"},
    ]

    with sync_playwright() as p:
        browser = None
        for url in cdp_urls:
            print(f"🔗 接続試行中: {url}")
            try:
                browser = p.chromium.connect_over_cdp(url, timeout=5000)
                print(f"✅ 接続成功: {url}")
                break
            except:
                continue

        if not browser:
            print("❌ Windows側のChromeに接続できませんでした。")
            print("1. Windows側で --remote-debugging-port=9222 --address=0.0.0.0 を付けてChromeを起動しているか")
            print("2. Windowsのファイアウォールで9222ポートを許可しているか（パブリック/プライベート両方）")
            return

        context = browser.contexts[0] if browser.contexts else browser.new_context()
        page = context.new_page()

        for cat in base_categories:
            current_page = 1
            while True:
                target_url = f"{cat['url']}?p={current_page}"
                print(f"📂 巡回中: {target_url}")
                
                try:
                    # Windows側のブラウザで開くので、ネットワーク制限を受けません
                    page.goto(target_url, wait_until="load", timeout=60000)
                    page.wait_for_timeout(3000)

                    soup = BeautifulSoup(page.content(), 'html.parser')
                    products = soup.select(".item.product.product-item")
                    
                    if not products:
                        print("   ℹ️ 製品が見つかりませんでした。")
                        break

                    for product in products:
                        try:
                            link_tag = product.select_one("a.product-item-link")
                            name = link_tag.get_text(strip=True)
                            detail_url = link_tag['href'].split('?')[0]
                            unique_id = f"ACR_{detail_url.split('/')[-1].replace('.html', '')}"
                            
                            price_tag = product.select_one('[data-price-type="finalPrice"] .price')
                            price = int(re.sub(r'[^\d]', '', price_tag.get_text())) if price_tag else 0
                            
                            img_tag = product.select_one("img.product-image-photo")
                            image_url = img_tag['src'] if img_tag else ""
                            
                            desc_tag = product.select_one(".product-item-details .description")
                            description = desc_tag.get_text(" / ", strip=True)[:500] if desc_tag else ""

                            PCProduct.objects.update_or_create(unique_id=unique_id, defaults={
                                'site_prefix': 'ACR', 'maker': 'Acer', 'raw_genre': cat['genre'],
                                'unified_genre': cat['genre'], 'name': name, 'price': price,
                                'url': detail_url, 'image_url': image_url, 'description': description,
                                'stock_status': '在庫あり' if price > 0 else '在庫切れ', 'is_active': True,
                            })
                            print(f"      ✅ {name[:20]}... | ¥{price:,}")
                        except: continue

                    if not soup.select_one(".pages a.next"): break
                    current_page += 1
                except Exception as e:
                    print(f"   ❌ エラー: {e}")
                    break
        
        browser.close()

if __name__ == "__main__":
    run_acer_crawler()
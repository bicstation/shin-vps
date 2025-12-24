import os
import re
import time
from django.core.management.base import BaseCommand
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from api.models import PCProduct

class Command(BaseCommand):
    help = 'Lenovo公式サイトから製品情報をスクレイピングしてDBに保存します'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- Lenovo Scraper 開始 ---'))
        self.run_crawler()
        self.stdout.write(self.style.SUCCESS('--- Lenovo Scraper 完了 ---'))

    def get_genre_from_url(self, url):
        if "/laptops/" in url or "/yoga/" in url or "/thinkpad/" in url:
            return "laptop"
        if "/desktops/" in url or "/legion/" in url:
            return "desktop"
        if "/workstations/" in url:
            return "workstation"
        if "/servers/" in url:
            return "server"
        if "/tablets/" in url:
            return "tablet"
        return "pc"

    def extract_specs(self, soup):
        specs_list = []
        container = soup.select_one('.sph-o-overview, .overview, [class*="overview"]')
        if container:
            ul = container.find('ul')
            if ul:
                for li in ul.find_all('li'):
                    for sup in li.find_all('sup'):
                        sup.decompose()
                    text = li.get_text(" ", strip=True)
                    text = re.sub(r'\s+', ' ', text)
                    if len(text) > 3:
                        specs_list.append(text)
        return " / ".join(list(dict.fromkeys(specs_list)))

    def extract_image_url(self, page):
        selector = ".gallery-canvas .canvas-item img, .gallery-container img"
        try:
            img_handle = page.wait_for_selector(selector, timeout=5000)
            if img_handle:
                src = img_handle.get_attribute("src")
                if src:
                    if src.startswith('//'): return "https:" + src
                    if src.startswith('/'): return "https://www.lenovo.com" + src
                    return src
        except:
            pass
        return ""

    def extract_price(self, soup):
        for element in soup.find_all(['span', 'dd', 'div', 'p']):
            text = element.get_text()
            if '販売価格' in text:
                digits = re.sub(r'[^\d]', '', text)
                if digits and 30000 < int(digits) < 2000000:
                    return int(digits)
        return 0

    def scrape_detail_page(self, page, url):
        self.stdout.write(f"🔎 巡回中... {url}")
        try:
            unique_id = url.split('/')[-1]
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            page.evaluate("window.scrollBy(0, 500)")
            page.wait_for_timeout(2000)
            
            soup = BeautifulSoup(page.content(), 'html.parser')
            
            genre = self.get_genre_from_url(url)
            price = self.extract_price(soup)
            image_url = self.extract_image_url(page)
            specs_text = self.extract_specs(soup)
            
            save_data = {
                'unique_id': unique_id,
                'site_prefix': 'LEN',
                'maker': 'Lenovo',
                'raw_genre': genre,
                'unified_genre': genre,
                'name': page.title().split('|')[0].strip(),
                'price': price,
                'url': url,
                'image_url': image_url,
                'description': specs_text,
                'raw_html': page.content(),
                'stock_status': '在庫あり' if price > 0 else '受注停止',
                'is_active': True,
            }

            PCProduct.objects.update_or_create(unique_id=unique_id, defaults=save_data)
            self.stdout.write(self.style.SUCCESS(f"✅ 保存: [{genre}] {save_data['name']}"))
            return True
        except Exception as e:
            self.stdout.write(self.style.ERROR(f" ❌ エラー: {e}"))
            return False

    def run_crawler(self):
        target_categories = [
            "https://www.lenovo.com/jp/ja/c/laptops/thinkpad/",
            "https://www.lenovo.com/jp/ja/c/laptops/yoga/",
            "https://www.lenovo.com/jp/ja/d/deals/ai-pc/",
            "https://www.lenovo.com/jp/ja/d/standard-laptops/",
            "https://www.lenovo.com/jp/ja/d/mobile-laptops/",
            "https://www.lenovo.com/jp/ja/d/convertible-2-in-1-notebooks/",
            "https://www.lenovo.com/jp/ja/d/thinkpad-p-series/",
            "https://www.lenovo.com/jp/ja/d/chromebook-laptops/",
            "https://www.lenovo.com/jp/ja/c/laptops/lenovo-legion-laptops/",
            "https://www.lenovo.com/jp/ja/c/desktops/legion-desktops/",
            "https://www.lenovo.com/jp/ja/workstations/",
            "https://www.lenovo.com/jp/ja/servers-storage/",
        ]

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            # サーバー環境での403回避のためUser-Agentを設定
            context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            page = context.new_page()
            
            all_product_urls = set()
            for cat_url in target_categories:
                self.stdout.write(f"📂 カテゴリースキャン: {cat_url}")
                try:
                    page.goto(cat_url, wait_until="domcontentloaded")
                    page.wait_for_timeout(5000)
                    hrefs = page.eval_on_selector_all('a[href*="/p/"]', 'elements => elements.map(e => e.href)')
                    all_product_urls.update({url.split('?')[0].rstrip('/') for url in hrefs if "/p/" in url})
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f" ❌ 取得失敗: {e}"))
            
            self.stdout.write(f"🚀 合計 {len(all_product_urls)}件の製品詳細を巡回します")
            for url in all_product_urls:
                self.scrape_detail_page(page, url)
                time.sleep(2)
            browser.close()
import os
import re
import time
from django.core.management.base import BaseCommand
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from api.models.pc_products import PCProduct

os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

class Command(BaseCommand):
    help = 'Dell公式サイトからセール・製品情報をスクレイピングしてDBに保存します'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- Dell Scraper 開始 ---'))
        self.run_crawler()
        self.stdout.write(self.style.SUCCESS('--- Dell Scraper 完了 ---'))

    def get_genre_from_url(self, url):
        """URLや文字列から製品ジャンルを厳密に判定"""
        url_lower = url.lower()
        if "monitor" in url_lower:
            return "monitor"
        if "accessory" in url_lower or "mouse" in url_lower or "keyboard" in url_lower:
            return "accessory"
        if "alienware" in url_lower or "g-series" in url_lower or "gaming" in url_lower:
            return "gaming_pc"
        if "inspiron" in url_lower or "xps" in url_lower:
            return "laptop"
        if "vostro" in url_lower or "latitude" in url_lower:
            return "business_laptop"
        if "optiplex" in url_lower or "precision" in url_lower:
            return "desktop"
        return "pc"

    def extract_specs(self, page):
        """デルの動的なスペック表をPlaywrightで抽出"""
        specs_list = []
        try:
            # スペックが表示されるまで待機するセレクター候補
            selectors = [
                'div[data-testid="shared-spec-list"]',
                '.technical-specifications',
                '#specs-section',
                '.spec-column'
            ]
            
            for sel in selectors:
                if page.query_selector(sel):
                    # テキスト情報を一括取得
                    specs = page.eval_on_selector_all(f'{sel} .spec-item, {sel} dt, {sel} dd, {sel} li', 
                        'elements => elements.map(e => e.innerText)')
                    if specs:
                        # 重複削除とクリーニング
                        unique_specs = list(dict.fromkeys([s.strip() for s in specs if s.strip()]))
                        specs_list = unique_specs
                        break
        except:
            pass
        
        return " / ".join(specs_list) if specs_list else "詳細スペックは公式サイトをご確認ください"

    def extract_price(self, soup):
        """割引後価格を優先的に抽出"""
        # 1. Dell特有の価格データ属性を狙う
        price_element = soup.select_one('[data-testid="shared-ps-dell-price"], .ps-dell-price, .dell-price, .ps-title-price')
        if price_element:
            text = price_element.get_text()
            digits = re.sub(r'[^\d]', '', text)
            if digits:
                return int(digits)
        
        # 2. 通貨記号からの抽出（フォールバック）
        for element in soup.find_all(['span', 'div', 'p']):
            text = element.get_text()
            if '￥' in text or '¥' in text:
                # 「税込」等の文字を除去して数字だけ抽出
                digits = re.sub(r'[^\d]', '', text)
                if digits and 5000 < int(digits) < 4000000:
                    return int(digits)
        return 0

    def scrape_detail_page(self, page, url):
        self.stdout.write(f"🔎 Dell詳細ページ巡回中... {url}")
        try:
            # URLから一意のIDを生成
            unique_id = "dell-" + url.split('/')[-1].split('?')[0]
            
            # ページ遷移（ネットワークが落ち着くまで待機）
            page.goto(url, wait_until="networkidle", timeout=60000)
            
            # 邪魔なポップアップやバナーがあれば閉じる
            try:
                close_btn = page.query_selector('#net-banner-close, .close-modal, .soft-cookie-close')
                if close_btn:
                    close_btn.click()
            except: pass

            # 動的要素のロード待ち
            page.evaluate("window.scrollBy(0, 800)")
            page.wait_for_timeout(3000)
            
            soup = BeautifulSoup(page.content(), 'html.parser')
            
            genre = self.get_genre_from_url(url)
            price = self.extract_price(soup)
            
            # 画像URLの取得
            image_url = ""
            img_sel = 'img[data-testid="shared-ps-image"], .product-image img, .main-image img'
            img_handle = page.query_selector(img_sel)
            if img_handle:
                image_url = img_handle.get_attribute("src")
                if image_url and image_url.startswith('//'):
                    image_url = "https:" + image_url

            specs_text = self.extract_specs(page)
            
            save_data = {
                'unique_id': unique_id,
                'site_prefix': 'DELL',
                'maker': 'Dell',
                'raw_genre': genre,
                'unified_genre': genre,
                'name': page.title().split('|')[0].replace('Dell 日本', '').strip(),
                'price': price,
                'url': url,
                'image_url': image_url,
                'description': specs_text,
                'stock_status': '在庫あり' if price > 0 else '詳細確認',
                'is_active': True,
            }

            PCProduct.objects.update_or_create(unique_id=unique_id, defaults=save_data)
            self.stdout.write(self.style.SUCCESS(f"✅ 保存完了: {save_data['name']} (価格: {price}円)"))
            return True
        except Exception as e:
            self.stdout.write(self.style.ERROR(f" ❌ Dell詳細エラー: {url} -> {e}"))
            return False

    def run_crawler(self):
        # ターゲットカテゴリー（セールページを含む戦略的なリスト）
        target_categories = [
            "https://www.dell.com/ja-jp/shop/deals/top-pc-deals",        # PCセール
            "https://www.dell.com/ja-jp/shop/scc/sc/laptops",           # ノートPC
            # "https://www.dell.com/ja-jp/shop/scc/sc/desktops",          # デスクトップ
            # "https://www.dell.com/ja-jp/shop/deals/gaming-deals",       # ゲーミング
            # "https://www.dell.com/ja-jp/shop/deals/business-pc-deals",  # ビジネスパソコン
            # "https://www.dell.com/ja-jp/shop/deals/monitors-deals",     # モニター
            # "https://www.dell.com/ja-jp/shop/deals/pc-accessories-deals",# 周辺機器
            # "https://www.dell.com/ja-jp/shop/deals/clearance-pc-deals", # クリアランスセール
        ]

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={'width': 1280, 'height': 800}
            )
            page = context.new_page()
            
            all_product_urls = set()
            for cat_url in target_categories:
                self.stdout.write(f"📂 Dellカテゴリースキャン: {cat_url}")
                try:
                    page.goto(cat_url, wait_until="networkidle", timeout=60000)
                    
                    # デルのショップURLパターンを持つリンクをすべて抽出
                    hrefs = page.eval_on_selector_all('a[href*="/ja-jp/shop/"]', 
                        'elements => elements.map(e => e.href)')
                    
                    # 詳細ページ（cp=構成、pd=製品詳細）をフィルタリング
                    for url in hrefs:
                        if "/cp/" in url or "/pd/" in url:
                            # クエリパラメータを除去して重複防止
                            clean_url = url.split('?')[0].rstrip('/')
                            all_product_urls.add(clean_url)
                            
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f" ❌ カテゴリ取得失敗: {e}"))
            
            self.stdout.write(f"🚀 合計 {len(all_product_urls)}件の候補が見つかりました。解析を開始します。")
            
            # サーバー負荷と実行時間のバランスを考え、まずはリスト化された順に処理
            # テスト時は list(all_product_urls)[:5] などで制限してください
            # for url in list(all_product_urls): 
            for url in list(all_product_urls)[:5]:
                self.scrape_detail_page(page, url)
                time.sleep(2) # デルのサーバーに優しく
            
            browser.close()
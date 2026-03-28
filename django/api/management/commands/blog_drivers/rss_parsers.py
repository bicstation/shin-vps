# -*- coding: utf-8 -*-
import requests, re, time
from bs4 import BeautifulSoup

class RSSParserFactory:
    @staticmethod
    def get_parser(url):
        u = url.lower()
        # --- DMM / FANZA / ニュース 判定 ---
        if any(domain in u for domain in ['dmm.co.jp', 'dmm.com', 'fanza.jp', 'fanza.news']):
            return FanzaParser()
        
        # --- IT/Tech系 判定 ---
        if 'impress.co.jp' in u: return ImpressParser()
        if 'itmedia.co.jp' in u: return ITmediaParser()
        if 'ascii.jp' in u: return ASCIIParser()
        if 'phileweb.com' in u: return PhileWebParser()
        
        return DefaultParser()

class DefaultParser:
    def parse(self, url):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            res = requests.get(url, timeout=15, headers=headers)
            
            # 汎用エンコード処理
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            
            og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            img_url = og_img["content"] if og_img else ""
            
            area = soup.find('article') or soup.find('main') or soup.find('div', class_=re.compile(r'article|post|entry|content'))
            if not area: area = soup.body

            if area:
                for s in area(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'form']):
                    s.decompose()
                body_text = area.get_text(separator='\n', strip=True)
            else:
                body_text = ""

            return {'img': img_url, 'body': body_text[:5000]}
        except Exception as e:
            print(f"DEBUG: DefaultParser Error [{url}]: {e}")
            return None

class FanzaParser(DefaultParser):
    def parse(self, url):
        """
        DMM/FANZA 特化型スクラッパー（文字化け徹底対策版）
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Cookie': 'age_check_done=1; is_adult=1; check_age=1; ckcy=1; dmm_app_id=1; has_visited=1',
                'Referer': 'https://www.dmm.co.jp/'
            }
            
            res = requests.get(url, timeout=15, headers=headers, allow_redirects=True)

            # --- 🛠 文字化け対策: res.textを使わず、バイナリから強制デコード ---
            if 'dmm.co.jp' in url or 'dmm.com' in url:
                try:
                    # DMM/FANZAの基本はEUC-JP。errors='replace'で壊れたバイトを無視
                    html_content = res.content.decode('euc-jp', errors='replace')
                except:
                    html_content = res.content.decode(res.apparent_encoding, errors='replace')
            else:
                html_content = res.content.decode(res.apparent_encoding, errors='replace')

            soup = BeautifulSoup(html_content, 'html.parser')

            # --- 1. 画像取得 (高画質化) ---
            img_url = ""
            selectors = [
                '#sample-video img', '.p-article__visual img', 
                'a[name="package-image"] img', '#package-src',
                '.main-visual img', 'meta[property="og:image"]'
            ]
            
            for sel in selectors:
                tag = soup.select_one(sel)
                if not tag: continue
                
                if sel.startswith('meta'):
                    img_candidate = tag.get('content')
                else:
                    img_candidate = tag.get('src') or tag.get('data-src')
                
                if img_candidate:
                    img_url = img_candidate
                    break

            if img_url:
                # 高画質化置換
                img_url = re.sub(r'p([s|t|m])\.jpg', 'pl.jpg', img_url)
                img_url = img_url.replace('small.jpg', 'large.jpg')
                if 'cms' in img_url:
                    img_url = img_url.replace('-thumb', '-full')

            # --- 2. 本文取得 ---
            body_text = ""
            content_selectors = [
                '.mg-b20.lh4',          # ビデオ詳細
                '.common-description',   # 電子書籍
                '.p-article__body',      # FANZAニュース
                '#mu .mg-b20',           # 旧タイプ
                '.product_description',  # 通販
                '#item-info'             # 共通
            ]
            
            for sel in content_selectors:
                area = soup.select_one(sel)
                if area:
                    body_text = area.get_text(separator='\n', strip=True)
                    break
            
            if not body_text:
                # フォールバック: DefaultParserのロジックを手動適用（エンコード済みHTMLを使用）
                area = soup.find('article') or soup.find('main') or soup.body
                if area:
                    for s in area(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                        s.decompose()
                    body_text = area.get_text(separator='\n', strip=True)

            return {
                'img': img_url,
                'body': body_text[:8000]
            }
            
        except Exception as e:
            print(f"DEBUG: FanzaParser Error on {url}: {e}")
            return None

# --- 特定メディア用 (Defaultを継承) ---
class ImpressParser(DefaultParser):
    def parse(self, url):
        return super().parse(url)

class ITmediaParser(DefaultParser):
    def parse(self, url):
        return super().parse(url)

class ASCIIParser(DefaultParser):
    def parse(self, url):
        return super().parse(url)

class PhileWebParser(DefaultParser):
    def parse(self, url):
        return super().parse(url)
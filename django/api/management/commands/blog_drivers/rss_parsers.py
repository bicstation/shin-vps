# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/blog_drivers/rss_parsers.py
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
    def parse(self, url, rss_description=""):
        """
        rss_description: RSSの <description> タグの中身を受け取れるように拡張
        """
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
    def parse(self, url, rss_description=""):
        """
        DMM/FANZA 特化型スクラッパー
        RSSの description から「コメント」と「サンプル画像」を抽出して合成する
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Cookie': 'age_check_done=1; is_adult=1; check_age=1; ckcy=1; dmm_app_id=1; has_visited=1',
                'Referer': 'https://www.dmm.co.jp/'
            }
            
            res = requests.get(url, timeout=15, headers=headers, allow_redirects=True)

            # --- 🛠 文字化け対策 ---
            if 'dmm.co.jp' in url or 'dmm.com' in url:
                try:
                    html_content = res.content.decode('euc-jp', errors='replace')
                except:
                    html_content = res.content.decode(res.apparent_encoding, errors='replace')
            else:
                html_content = res.content.decode(res.apparent_encoding, errors='replace')

            soup = BeautifulSoup(html_content, 'html.parser')

            # --- 1. メイン画像取得 ---
            img_url = ""
            selectors = [
                'meta[property="og:image"]',
                '#sample-video img', 
                '.p-article__visual img', 
                'a[name="package-image"] img', 
                '#package-src',
                '.main-visual img'
            ]
            
            for sel in selectors:
                tag = soup.select_one(sel)
                if not tag: continue
                img_candidate = tag.get('content') if sel.startswith('meta') else (tag.get('src') or tag.get('data-src'))
                if img_candidate:
                    img_url = img_candidate
                    break

            if img_url:
                # 高画質化・パス修正
                img_url = img_url.replace('pics.dmm.co.jp', 'pics.dmm.com')
                if re.search(r'p[s|t|m]\.jpg$', img_url):
                    img_url = re.sub(r'p[s|t|m]\.jpg$', 'pl.jpg', img_url)
                
                # n_ 重複問題の解消
                parts = img_url.split('/')
                if len(parts) >= 2:
                    folder_name = parts[-2]
                    file_name = parts[-1]
                    if folder_name.startswith('n_') and file_name.startswith('n_'):
                        parts[-1] = file_name.replace('n_', '', 1)
                        img_url = '/'.join(parts)

            # --- 2. RSS description から「熱いコメント」と「サンプル画像」を抽出 ---
            extra_comment = ""
            sample_images = []
            if rss_description:
                # メーカーコメント抽出 (<strong>コメント：</strong>以降)
                comment_match = re.search(r'<strong>コメント：</strong><br/>(.*?)<br/>', rss_description, re.DOTALL)
                if comment_match:
                    # HTMLタグを除去してテキストのみにする
                    raw_comment = comment_match.group(1)
                    extra_comment = re.sub(r'<[^>]+>', '', raw_comment).strip()
                
                # サンプル画像 (ムービープレビュー) 抽出
                # description内の全てのimgタグのsrcを取得
                samples = re.findall(r'src="(https://pics.dmm.co.jp/[^"]+/video/[^"]+-\d+\.jpg)"', rss_description)
                if samples:
                    sample_images = list(dict.fromkeys(samples)) # 重複排除

            # --- 3. 本文取得 (サイト側) ---
            body_text = ""
            content_selectors = ['.mg-b20.lh4', '.common-description', '.p-article__body', '#mu .mg-b20', '.product_description']
            
            for sel in content_selectors:
                area = soup.select_one(sel)
                if area:
                    body_text = area.get_text(separator='\n', strip=True)
                    break
            
            if not body_text:
                area = soup.find('article') or soup.find('main') or soup.body
                if area:
                    for s in area(['script', 'style', 'nav', 'header', 'footer', 'aside']): s.decompose()
                    body_text = area.get_text(separator='\n', strip=True)

            # --- 4. データの統合 ---
            # AIが読みやすいように、コメントを先頭に配置
            full_body = ""
            if extra_comment:
                full_body += f"【メーカー推薦コメント】\n{extra_comment}\n\n"
            full_body += f"【詳細情報】\n{body_text}"

            return {
                'img': img_url,
                'body': full_body[:8000],
                'samples': sample_images[:10], # 最大10枚まで
                'raw_comment': extra_comment
            }
            
        except Exception as e:
            print(f"DEBUG: FanzaParser Error on {url}: {e}")
            return None

# --- 特定メディア用 ---
class ImpressParser(DefaultParser):
    def parse(self, url, rss_description=""): return super().parse(url, rss_description)

class ITmediaParser(DefaultParser):
    def parse(self, url, rss_description=""): return super().parse(url, rss_description)

class ASCIIParser(DefaultParser):
    def parse(self, url, rss_description=""): return super().parse(url, rss_description)

class PhileWebParser(DefaultParser):
    def parse(self, url, rss_description=""): return super().parse(url, rss_description)
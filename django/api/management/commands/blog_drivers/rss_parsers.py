# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/blog_drivers/rss_parsers.py
import requests, re, time
from bs4 import BeautifulSoup

class RSSParserFactory:
    @staticmethod
    def get_parser(url):
        u = url.lower()
        # 1. アダルト系 (FANZA/DMM)
        if any(domain in u for domain in ['dmm.co.jp', 'dmm.com', 'fanza.jp', 'fanza.news']):
            return FanzaParser()
        # 2. Yahoo!ニュース系 (FX・経済トピックス・各メディア提携記事)
        if 'yahoo.co.jp' in u: 
            return YahooParser()
        # 3. IT・専門系 (将来の個別調整用フックを維持)
        if 'impress.co.jp' in u: return ImpressParser()
        if 'itmedia.co.jp' in u: return ITmediaParser()
        if 'ascii.jp' in u: return ASCIIParser()
        if 'phileweb.com' in u: return PhileWebParser()
        
        return DefaultParser()

class DefaultParser:
    def parse(self, url, rss_description="", rss_image=""):
        time.sleep(1) # サーバー負荷低減
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            res = requests.get(url, timeout=15, headers=headers)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # 画像取得：RSS側の高画質を優先
            img_url = rss_image
            if not img_url:
                og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
                img_url = og_img["content"] if og_img else ""
            
            # 本文エリア特定
            area = soup.find('article') or soup.find('main') or \
                   soup.find('div', class_=re.compile(r'article|post|entry|content'))
            if not area: area = soup.body

            if area:
                for s in area(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'form']):
                    s.decompose()
                body_text = area.get_text(separator='\n', strip=True)
            else:
                body_text = rss_description
            return {'img': img_url, 'body': body_text[:5000]}
        except Exception as e:
            print(f"DEBUG: DefaultParser Error [{url}]: {e}")
            return None

class YahooParser(DefaultParser):
    def parse(self, url, rss_description="", rss_image=""):
        time.sleep(1)
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            res = requests.get(url, timeout=15, headers=headers, allow_redirects=True)
            soup = BeautifulSoup(res.text, 'html.parser')

            # --- 重要：中継ページ(pickup)突破ロジック ---
            if 'news.yahoo.co.jp/pickup/' in res.url or 'pickup' in url:
                article_link_tag = soup.select_one('a[data-ylk*="r_art"], a[class*="pickupMain_articleLink"]')
                if article_link_tag and article_link_tag.get('href'):
                    url = article_link_tag['href']
                    res = requests.get(url, timeout=15, headers=headers)
                    soup = BeautifulSoup(res.text, 'html.parser')

            # 画像：ダミー回避
            img_url = rss_image
            if not img_url or "yjnews_s.gif" in img_url:
                og_img = soup.find("meta", property="og:image")
                img_url = og_img["content"] if og_img else ""

            # 本文：FX・ビジネス・ガジェット全媒体の「網」
            area = soup.find('div', class_=re.compile(r'DirectEditArea|article-body|article_body|ContentBox')) or \
                   soup.find('article') or \
                   soup.find('div', class_=re.compile(r'sc-'))

            if area:
                for s in area(['script', 'style', 'aside', 'footer', 'nav', 'button', 'form']):
                    s.decompose()
                # ページネーション・広告リンク・SNS・関連記事の徹底除去
                for sel in ['[class*="Pagination"]', '[class*="articleMore"]', '[data-ylk*="r_full"]', '.original-link', '.vrtcl-view', '.article-image-caption']:
                    for tag in area.select(sel): tag.decompose()

                body_text = area.get_text(separator='\n', strip=True)
                # 文末クリーニング（関連記事以降を削除）
                body_text = re.sub(r'\n(関連記事|【関連記事】|あわせて読みたい|外部リンク|【あわせて読みたい】).*$', '', body_text, flags=re.DOTALL)
            else:
                body_text = rss_description

            return {'img': img_url, 'body': body_text[:5000]}
        except Exception as e:
            print(f"DEBUG: YahooParser Error on {url}: {e}")
            return None

class FanzaParser(DefaultParser):
    def parse(self, url, rss_description="", rss_image=""):
        time.sleep(1.5)
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Cookie': 'age_check_done=1; is_adult=1; check_age=1; ckcy=1; dmm_app_id=1; has_visited=1',
                'Referer': 'https://www.dmm.co.jp/'
            }
            res = requests.get(url, timeout=15, headers=headers, allow_redirects=True)
            # 文字コード特化処理
            try: html_content = res.content.decode('euc-jp', errors='replace')
            except: html_content = res.content.decode(res.apparent_encoding, errors='replace')
            soup = BeautifulSoup(html_content, 'html.parser')

            # --- 画像抽出：pl.jpg 優先ロジック ---
            img_url = rss_image
            pl_match = re.search(r'href="(https://pics\.dmm\.co\.jp/[^"]+pl\.jpg)"', rss_description)
            package_match = re.search(r'<(?:package|link)>(https://pics\.dmm\.co\.jp/[^<]+)</(?:package|link)>', rss_description)
            
            if pl_match: img_url = pl_match.group(1)
            elif package_match and not img_url: img_url = package_match.group(1)
            
            if not img_url or "noimage" in img_url:
                for sel in ['meta[property="og:image"]', 'a[name="package-image"] img', '#package-src', '.tdmm-ext-artwork img']:
                    tag = soup.select_one(sel)
                    if not tag: continue
                    candidate = tag.get('content') if sel.startswith('meta') else (tag.get('src') or tag.get('data-src'))
                    if candidate and "noimage" not in candidate:
                        img_url = candidate; break

            # 高画質置換処理
            if img_url:
                img_url = img_url.replace('pics.dmm.co.jp', 'pics.dmm.com')
                img_url = re.sub(r'p[s|t|m]\.jpg$', 'pl.jpg', img_url)

            # --- RSS追加情報（DOTALL 保持） ---
            extra_comment = ""
            sample_images = []
            if rss_description:
                # メーカーコメント抽出（赤文字削除含む）
                comment_match = re.search(r'<strong>コメント：</strong>.*?<br/>(.*?)<br/>', rss_description, re.DOTALL)
                if comment_match:
                    raw_c = re.sub(r'<span style="color:red">.*?</span>', '', comment_match.group(1), flags=re.DOTALL)
                    extra_comment = re.sub(r'<[^>]+>', '', raw_c).strip()
                
                # サンプル画像リスト
                samples = re.findall(r'src="(https://pics\.dmm\.co\.jp/[^"]+-[0-9]+\.jpg)"', rss_description)
                sample_images = list(dict.fromkeys([s.replace('pics.dmm.co.jp', 'pics.dmm.com') for s in samples]))

            # 本文抽出（DMM/FANZA 特化セレクタ）
            body_text = ""
            for sel in ['.mg-b20.lh4', '.common-description', '.p-article__body', '#mu .mg-b20', '.product_description']:
                area = soup.select_one(sel)
                if area:
                    body_text = area.get_text(separator='\n', strip=True)
                    break

            # 最終本文合成（重複チェックあり）
            full_body = ""
            if extra_comment: full_body += f"【メーカー推薦コメント】\n{extra_comment}\n\n"
            if body_text:
                if body_text.replace('\n', '')[:50] != extra_comment.replace('\n', '')[:50]:
                    full_body += f"【詳細情報】\n{body_text}"

            return {
                'img': img_url, 
                'body': full_body[:8000], 
                'samples': sample_images[:20], 
                'raw_comment': extra_comment
            }
        except Exception as e:
            print(f"DEBUG: FanzaParser Error on {url}: {e}"); return None

# 専門サイト用（Defaultを継承し、今後の拡張性を維持）
class ImpressParser(DefaultParser): pass
class ITmediaParser(DefaultParser): pass
class ASCIIParser(DefaultParser): pass
class PhileWebParser(DefaultParser): pass
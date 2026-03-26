# -*- coding: utf-8 -*-
import requests, re
from bs4 import BeautifulSoup

class RSSParserFactory:
    @staticmethod
    def get_parser(url):
        if 'impress.co.jp' in url: return ImpressParser()
        if 'itmedia.co.jp' in url: return ITmediaParser()
        if 'ascii.jp' in url: return ASCIIParser()
        if 'phileweb.com' in url: return PhileWebParser()
        # --- FANZA/DMM 判定を追加 ---
        if 'dmm.co.jp' in url or 'lovecul.dmm.co.jp' in url: return FanzaParser()
        return DefaultParser()

class DefaultParser:
    def parse(self, url):
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            res = requests.get(url, timeout=10, headers=headers)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            
            og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            img_url = og_img["content"] if og_img else ""
            
            area = soup.find('article') or soup.find('main') or soup.find('div', class_='article-body') or soup.body
            if area:
                for s in area(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                    s.decompose()
                body_text = area.get_text(separator='\n', strip=True)
            else:
                body_text = ""
            return {'img': img_url, 'body': body_text[:5000]}
        except:
            return None

# --- 新設: FANZA専用パーサー ---
class FanzaParser(DefaultParser):
    def parse(self, url):
        """
        FANZA/DMMの個別ページから情報を抜くロジック。
        RSS側で既に情報が取れている場合でも、高画質画像取得のためにこちらで補完します。
        """
        try:
            # 年齢確認をパスするCookieを強制セット
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': 'age_check_done=1; is_adult=1; check_age=1'
            }
            res = requests.get(url, timeout=10, headers=headers)
            res.encoding = 'euc-jp' # FANZAはEUC-JPが標準
            soup = BeautifulSoup(res.text, 'html.parser')

            # 1. 最高画質の画像URLを取得
            # プレビュー画像(pt.jpgなど)をパッケージ画像(pl.jpg)に置換して最高画質化
            img_tag = soup.select_one('#sample-video img') or soup.select_one('.p-article__visual img') or soup.select_one('a[name="package-image"] img')
            img_url = ""
            if img_tag:
                img_url = img_tag.get('src', '')
                # 置換ルール: ps.jpg(小) -> pl.jpg(大) / pt.jpg -> pl.jpg
                img_url = re.sub(r'p([a-z])\.jpg', 'pl.jpg', img_url)

            # 2. 本文（商品の詳細説明）を取得
            # FANZA特有の「商品の説明」エリアを狙い撃ち
            desc_area = soup.select_one('.mg-b20.lh4') or soup.select_one('.common-description') or soup.select_one('#mu .mg-b20')
            if desc_area:
                body_text = desc_area.get_text(separator='\n', strip=True)
            else:
                # 取れない場合はDefaultのロジックに任せる
                temp_data = super().parse(url)
                body_text = temp_data['body'] if temp_data else ""

            return {'img': img_url, 'body': body_text[:8000]}
        except Exception as e:
            print(f"DEBUG: FanzaParser Error: {e}")
            return None

class ImpressParser(DefaultParser):
    # (既存のコードと同じ)
    pass

class ITmediaParser(DefaultParser): pass
class ASCIIParser(DefaultParser):
    # (既存のコードと同じ)
    pass
class PhileWebParser(DefaultParser): pass
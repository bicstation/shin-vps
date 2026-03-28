# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/blog_drivers/rss_extractors.py

import re
import requests
from bs4 import BeautifulSoup

class BaseExtractor:
    """基本のエクストラクター（全サービス共通ロジック）"""
    
    @classmethod
    def get_ogp_image(cls, url):
        """記事のURLからOGP画像を直接取得する（ニュース・金融・テック用）"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
            # タイムアウト10秒。ネットワーク遅延によるプロセス停止を防止。
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                # property='og:image' または name='og:image' を両方チェック
                og_image = soup.find('meta', property='og:image') or soup.find('meta', attrs={'name': 'og:image'})
                if og_image and og_image.get('content'):
                    return og_image['content'].strip()
        except Exception as e:
            # 運用環境に合わせてprintまたはloggingを使用
            print(f"OGP取得失敗 [{url}]: {e}")
        return ""

    @classmethod
    def extract(cls, content_val, entry=None):
        """
        RSS構造から最適なメイン画像を抽出する
        :param content_val: content:encoded または description の文字列
        :param entry: feedparser の entry オブジェクト
        """
        if not entry:
            return ""

        # 1. <package> タグを最優先 (DMM通販・グッズ・予約・書籍RSSで非常に有効)
        if hasattr(entry, 'package'):
            return entry.package.strip()

        # 2. HTML内のimgタグから抽出 (フォールバック用)
        img_candidates = re.findall(r'<img [^>]*src="([^"]+)"', content_val)
        for candidate in img_candidates:
            c_lower = candidate.lower()
            
            # スキップ判定: ロゴ、ダミー、バナー、アイコン、計測用gif等
            if any(x in c_lower for x in ["dummy", "pixel.gif", "common/images", "logo", "banner", "ad_banner", "icon"]):
                continue
                
            # サンプル画像(プレビュー連番)の除外
            if re.search(r'-\d{1,2}\.(jpg|jpeg|png|gif|webp)$', c_lower):
                continue
            
            return candidate.strip()
            
        return ""

class FanzaVideoExtractor(BaseExtractor):
    """DMM/FANZA/らぶカル用: 高画質化 (ps/pt/pm/pb -> pl)"""
    @classmethod
    def extract(cls, content_val, entry=None):
        # 共通ロジックで画像パスを取得
        url = super().extract(content_val, entry)
        if url:
            # 識別子を 'pl' (最高画質) に変換
            # 例: xxxxxps.jpg -> xxxxxpl.jpg
            return re.sub(r'p([s|t|m|b])\.jpg', 'pl.jpg', url)
        return url

class FanzaBooksExtractor(BaseExtractor):
    """FANZA電子書籍（Digital Book）専用"""
    @classmethod
    def extract(cls, content_val, entry=None):
        return FanzaVideoExtractor.extract(content_val, entry)

class NewsExtractor(BaseExtractor):
    """BicStation & Bic-Saving (ニュース・テック・金融) 専用"""
    @classmethod
    def extract(cls, content_val, entry=None):
        # 1. 記事URLからOGP画像（アイキャッチ）を直接取得 (ニュース系の取りこぼし対策)
        if entry and hasattr(entry, 'link'):
            ogp_url = cls.get_ogp_image(entry.link)
            if ogp_url:
                return ogp_url
        
        # 2. OGP失敗時、RSS標準タグ(media:thumbnail)を確認
        if entry and hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
            return entry.media_thumbnail[0]['url']
            
        # 3. 最後にHTML本文内の解析へフォールバック
        return super().extract(content_val, entry)

class ExtractorFactory:
    """URLとドメインから適切な抽出器を自動選択する"""
    @staticmethod
    def get_extractor(url, category):
        target_url = (url or "").lower()
        target_cat = (category or "").lower()

        # --- DMM/FANZA/らぶカル系の判定 ---
        if any(domain in target_url for domain in ["dmm.co", "fanza.com", "lovecul"]):
            # 電子書籍と通販書籍の判別
            if 'book' in target_cat and 'mono' not in target_url:
                return FanzaBooksExtractor
            return FanzaVideoExtractor
            
        # --- BicStation & Bic-Saving (ニュース・金融・テック) の一括判定 ---
        integrated_domains = [
            # BicStation
            "ascii.jp", "itmedia.co", "impress.co", "gizmodo.jp", "techcrunch.com", "phileweb.com",
            # Bic-Saving
            "sbbit.jp", "zuuonline.com", "financial-field.com", "moneytalksnews.com", 
            "nerdwallet.com", "moneyunder30.com", "yahoo.co.jp", "limo.media", "theguardian.com"
        ]
        
        if any(domain in target_url for domain in integrated_domains):
            return NewsExtractor
            
        return BaseExtractor
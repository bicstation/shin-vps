# /mnt/c/dev/SHIN-VPS/django/api/management/commands/linkshare_bc_client.py

import os
import base64
import requests
from xml.etree import ElementTree as ET
from urllib.parse import urljoin
from tqdm import tqdm 
from datetime import datetime, timedelta, timezone

class LinkShareAPIClient:
    """
    LinkShare APIとの通信を管理するクライアントクラス。
    仕様書に基づき、Bearer認証とscope(SID:3273700)を使用してBicstation名義のリンクを取得します。
    """
    BASE_URL = "https://api.linksynergy.com/"
    
    def __init__(self):
        # 💡 Bicstation (bc_) 用の SID を取得 (デフォルト 3273700)
        self.account_id = os.environ.get('LINKSHARE_BC_SID', '3273700')
        self.client_id = os.environ.get('LS_CLIENT_ID')
        self.client_secret = os.environ.get('LS_CLIENT_SECRET')
        self.token_url = urljoin(self.BASE_URL, 'token')
        
        self.access_token = None
        self.token_expiry_time = None 

        if not all([self.client_id, self.client_secret, self.account_id]):
            raise ValueError("LinkShare APIの認証情報(LS_CLIENT_ID, LS_CLIENT_SECRET, LINKSHARE_BC_SID)が設定されていません。")

    def _generate_token_key(self):
        """
        仕様書通り: client_id:client_secret を Base64 エンコードして 87 文字の文字列を作成
        Linuxの echo -n {id}:{secret}|base64 と同等の処理
        """
        auth_string = f"{self.client_id}:{self.client_secret}"
        return base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

    def _is_token_expired(self, buffer_seconds=60):
        """トークンの有効期限チェック"""
        if not self.access_token or not self.token_expiry_time:
            return True
        return datetime.now(timezone.utc) >= (self.token_expiry_time - timedelta(seconds=buffer_seconds))

    def refresh_token_if_expired(self):
        """期限切れの場合に自動リフレッシュ"""
        if self._is_token_expired():
            self._fetch_access_token()
            
    def _fetch_access_token(self):
        """
        仕様書の Step 5 に完全に準拠したリクエスト。
        1. Authorization: Bearer {token-key}
        2. POSTデータに grant_type=password と scope={account-id} を含める
        """
        token_key = self._generate_token_key()
        
        headers = {
            'Authorization': f'Bearer {token_key}',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        
        # 💡 仕様書通り、grant_type=password と scope を POST データとして送信
        data = {
            'grant_type': 'password',
            'scope': self.account_id  
        }
        
        tqdm.write(f"📡 アクセストークンをリクエスト中... (SID: {self.account_id})")

        try:
            response = requests.post(self.token_url, headers=headers, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            new_token = token_data.get('access_token')
            expires_in = token_data.get('expires_in', 3600)
            
            if new_token:
                self.access_token = new_token
                self.token_expiry_time = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                tqdm.write(f"✅ トークン取得成功。有効期限: {expires_in}秒")
            else:
                raise Exception("レスポンスにトークンが含まれていません。")
                
        except Exception as e:
            tqdm.write(f"❌ トークン取得エラー: {e}")
            if hasattr(e, 'response') and e.response is not None:
                tqdm.write(f"Response Detail: {e.response.text}")
            raise

    def get_access_token(self):
        """外部からトークンが必要な場合に呼び出し"""
        if not self.access_token:
            self._fetch_access_token()

    def fetch_raw_xml(self, keyword=None, mid=None, cat=None, pagenumber=1, max_results=1):
        """
        💡 新規追加: APIレスポンスのXMLを一切加工せず、生の文字列のまま取得する。
        デバッグや解析用。
        """
        self.refresh_token_if_expired()
        endpoint = urljoin(self.BASE_URL, 'productsearch/1.0')
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        params = {'max': max_results, 'pagenumber': pagenumber}
        if keyword: params['keyword'] = keyword
        if mid: params['mid'] = mid
        if cat: params['cat'] = cat
        
        try:
            response = requests.get(endpoint, headers=headers, params=params)
            response.raise_for_status()
            return response.text
        except Exception as e:
            tqdm.write(f"❌ 生データ取得エラー: {e}")
            return str(e)
            
    def get_advertiser_list(self):
        """広告主一覧（マーチャント）を取得"""
        self.refresh_token_if_expired() 
        endpoint = urljoin(self.BASE_URL, 'advertisersearch/1.0')
        headers = {'Authorization': f'Bearer {self.access_token}'}
        try:
            response = requests.get(endpoint, headers=headers)
            response.raise_for_status()
            return self._parse_advertiser_xml(response.text)
        except Exception as e:
            tqdm.write(f"❌ 広告主取得エラー: {e}")
            return []
            
    def _parse_advertiser_xml(self, xml_string):
        """XMLレスポンスからMIDと名称を抽出"""
        advertisers = []
        try:
            root = ET.fromstring(xml_string)
            for merchant_elem in root.findall('.//merchant'):
                mid = merchant_elem.findtext('mid') or 'N/A'
                name = merchant_elem.findtext('merchantname') or 'N/A'
                advertisers.append({'mid': mid, 'merchantname': name})
            return advertisers
        except Exception:
            return []
    
    def _extract_item_data(self, item_elem: ET.Element) -> dict:
        """APIから返ってきた各商品データをパース"""
        category_elem = item_elem.find('category')
        primary_cat = category_elem.findtext('primary') if category_elem is not None else ''
        secondary_cat = category_elem.findtext('secondary') if category_elem is not None else ''
        full_category = f"{primary_cat}~~{secondary_cat}".strip("~~")
        
        price_elem = item_elem.find('price')
        sale_price_elem = item_elem.find('saleprice')

        return {
            'mid': item_elem.findtext('mid'),
            'merchantname': item_elem.findtext('merchantname'),
            'linkid': item_elem.findtext('linkid'),
            'createdon': item_elem.findtext('createdon'),
            'sku': item_elem.findtext('sku'),
            'productname': (item_elem.findtext('productname') or 'N/A').strip(),
            'category': full_category,
            'price': {
                'value': price_elem.text if price_elem is not None else None,
                'currency': price_elem.get('currency') if price_elem is not None else None
            },
            'saleprice': {
                'value': sale_price_elem.text if sale_price_elem is not None else None,
                'currency': sale_price_elem.get('currency') if sale_price_elem is not None else None
            },
            'upccode': item_elem.findtext('upccode'),
            'description_short': item_elem.findtext('description/short'),
            'description_long': item_elem.findtext('description/long'),
            'keywords': item_elem.findtext('keywords'),
            'linkurl': item_elem.findtext('linkurl'), # 💡 ここに Bicstation の SID が反映されることを期待
            'imageurl': item_elem.findtext('imageurl'),
        }

    def _fetch_product_page(self, params: dict) -> tuple[dict, int, int]:
        """指定した条件で1ページ分の商品情報を取得"""
        self.refresh_token_if_expired() 
        endpoint = urljoin(self.BASE_URL, 'productsearch/1.0')
        headers = {'Authorization': f'Bearer {self.access_token}'}
        try:
            response = requests.get(endpoint, headers=headers, params=params)
            response.raise_for_status()
            root = ET.fromstring(response.text)
            total_matches = int(root.findtext('TotalMatches') or 0)
            total_pages = int(root.findtext('TotalPages') or 0)
            product_items = [self._extract_item_data(item_elem) for item_elem in root.findall('.//item')]
            
            page_result = {
                'TotalMatches': total_matches,
                'TotalPages': total_pages,
                'PageNumber': int(root.findtext('PageNumber') or 1),
                'items': product_items
            }
            return page_result, total_matches, total_pages
        except Exception:
            return {}, 0, 0
            
    def search_products(self, keyword=None, mid=None, cat=None, page_size=100, max_pages=0):
        """複数ページにわたる検索結果を取得"""
        all_page_results = []
        params = {'max': min(page_size, 100), 'pagenumber': 1}
        if keyword: params['keyword'] = keyword
        if mid: params['mid'] = mid
        if cat: params['cat'] = cat
        
        # 1ページ目
        page_result_1, total_matches, total_pages = self._fetch_product_page(params)
        if total_matches == 0:
            return []

        all_page_results.append(page_result_1)
        
        # 2ページ目以降
        pages_to_fetch = min(total_pages, max_pages) if max_pages > 0 else total_pages
        if pages_to_fetch > 1:
            for page in tqdm(range(2, pages_to_fetch + 1), desc=f"📚 MID {mid or 'ALL'} 取得"):
                params['pagenumber'] = page
                page_result_n, _, _ = self._fetch_product_page(params)
                if page_result_n.get('items'):
                    all_page_results.append(page_result_n)
                else:
                    break
        return all_page_results
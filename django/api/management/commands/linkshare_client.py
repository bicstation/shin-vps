import os
import base64
import requests
from xml.etree import ElementTree as ET
from urllib.parse import urljoin, urlencode
from tqdm import tqdm 
import time
from datetime import datetime, timedelta, timezone

class LinkShareAPIClient:
    """
    LinkShare APIとの通信を管理するクライアントクラス。
    トークン取得、広告主一覧取得、商品検索のロジックを実装。
    """
    BASE_URL = "https://api.linksynergy.com/"
    
    def __init__(self):
        # 環境変数から認証情報を取得
        self.client_id = os.environ.get('LS_CLIENT_ID')
        self.client_secret = os.environ.get('LS_CLIENT_SECRET')
        self.account_id = os.environ.get('LS_ACCOUNT_ID')
        self.token_url = os.environ.get('LS_TOKEN_URL', urljoin(self.BASE_URL, 'token'))
        
        # 💡 トークンと有効期限情報を保持
        self.access_token = None
        self.token_expiry_time = None # datetimeオブジェクトで有効期限を保持

        if not all([self.client_id, self.client_secret, self.account_id]):
            raise ValueError("LinkShare APIの認証情報 (LS_CLIENT_ID, LS_CLIENT_SECRET, LS_ACCOUNT_ID) が設定されていません。")

    def _generate_token_key(self):
        auth_string = f"{self.client_id}:{self.client_secret}"
        return base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

    def _is_token_expired(self, buffer_seconds=60):
        """
        トークンが期限切れかどうか、または期限切れが近いか (バッファ時間内) をチェックする。
        """
        if not self.access_token or not self.token_expiry_time:
            return True
            
        # 期限切れ時刻からバッファ秒を引いた時刻と比較
        return datetime.now(timezone.utc) >= (self.token_expiry_time - timedelta(seconds=buffer_seconds))

    def refresh_token_if_expired(self):
        if self._is_token_expired():
            tqdm.write("⚠️ アクセストークンが期限切れまたは期限切れ間近です。自動で再取得します。")
            self._fetch_access_token()
            
    def _fetch_access_token(self):
        """実際にトークンを取得し、インスタンス変数に保存する"""
        token_key = self._generate_token_key()
        
        headers = {
            'Authorization': f'Bearer {token_key}',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        data = {
            'grant_type': 'password',
            'scope': self.account_id
        }
        
        tqdm.write(f"📡 アクセストークンを {self.token_url} にリクエスト中...")

        try:
            response = requests.post(self.token_url, headers=headers, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            new_token = token_data.get('access_token')
            expires_in = token_data.get('expires_in', 3600) # デフォルト60分
            
            if new_token:
                self.access_token = new_token
                # 💡 有効期限時刻を UTC で計算して保存
                self.token_expiry_time = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                tqdm.write(f"✅ アクセストークン取得成功。有効期限: {expires_in} 秒 ({self.token_expiry_time.strftime('%Y-%m-%d %H:%M:%S')} UTC)")
            else:
                tqdm.write(f"❌ アクセストークン取得失敗。レスポンス: {token_data}")
                raise Exception("アクセストークンがレスポンスに含まれていません。")
                
        except requests.exceptions.RequestException as e:
            tqdm.write(f"❌ アクセストークンリクエスト中にエラーが発生しました: {e}")
            raise

    def get_access_token(self):
        if not self.access_token:
            self._fetch_access_token()
            
    # --- 広告主一覧取得メソッド (get_advertiser_list / _parse_advertiser_xml) ---
    def get_advertiser_list(self):
        self.refresh_token_if_expired() 

        endpoint = urljoin(self.BASE_URL, 'advertisersearch/1.0')
        headers = {
            'Authorization': f'Bearer {self.access_token}',
        }
        
        tqdm.write(f"📡 広告主一覧を {endpoint} にリクエスト中...")

        try:
            response = requests.get(endpoint, headers=headers)
            response.raise_for_status()
            return self._parse_advertiser_xml(response.text)

        except requests.exceptions.RequestException as e:
            tqdm.write(f"❌ 広告主一覧リクエスト中にエラーが発生しました: {e}")
            return []
            
    def _parse_advertiser_xml(self, xml_string):
        advertisers = []
        try:
            root = ET.fromstring(xml_string)
            for merchant_elem in root.findall('.//merchant'):
                mid = merchant_elem.find('mid').text if merchant_elem.find('mid') is not None else 'N/A'
                name = merchant_elem.find('merchantname').text if merchant_elem.find('merchantname') is not None else 'N/A'
                advertisers.append({'mid': mid, 'merchantname': name})
            return advertisers
        except ET.ParseError as e:
            tqdm.write(f"❌ XMLパースエラー: {e}")
            return []
    
    # ----------------------------------------------------------------------------------
    # ページネーションとXMLパース (商品検索関連)
    # ----------------------------------------------------------------------------------
            
    def _extract_item_data(self, item_elem: ET.Element) -> dict:
        """単一の <item> 要素から必要なフィールドを抽出して辞書形式で返す"""
        
        # カテゴリの処理: <category><primary>と<secondary>を結合
        category_elem = item_elem.find('category')
        primary_cat = category_elem.findtext('primary') if category_elem is not None else ''
        secondary_cat = category_elem.findtext('secondary') if category_elem is not None else ''
        full_category = f"{primary_cat}~~{secondary_cat}".strip("~~")

        # 価格の処理: 通貨属性も抽出
        price_elem = item_elem.find('price')
        sale_price_elem = item_elem.find('saleprice')

        # 商品情報辞書を構築（FTP形式に近づける）
        product_data = {
            'mid': item_elem.findtext('mid'),
            'merchantname': item_elem.findtext('merchantname'),
            'linkid': item_elem.findtext('linkid'),
            'createdon': item_elem.findtext('createdon'),
            'sku': item_elem.findtext('sku'),
            'productname': item_elem.findtext('productname').strip() if item_elem.findtext('productname') else 'N/A',
            'category': full_category,
            'price': {
                'value': price_elem.text,
                'currency': price_elem.get('currency')
            } if price_elem is not None else None,
            'saleprice': {
                'value': sale_price_elem.text,
                'currency': sale_price_elem.get('currency')
            } if sale_price_elem is not None else None,
            'upccode': item_elem.findtext('upccode'),
            'description_short': item_elem.findtext('description/short'),
            'description_long': item_elem.findtext('description/long'),
            'keywords': item_elem.findtext('keywords'),
            'linkurl': item_elem.findtext('linkurl'),
            'imageurl': item_elem.findtext('imageurl'),
        }
        return product_data

    def _fetch_product_page(self, params: dict) -> tuple[dict, int, int]:
        """
        商品検索APIの単一ページをフェッチし、メタデータと商品リストを含む辞書を返す
        """
        self.refresh_token_if_expired() 

        endpoint = urljoin(self.BASE_URL, 'productsearch/1.0')
        headers = {'Authorization': f'Bearer {self.access_token}'}
        url_with_params = f"{endpoint}?{urlencode(params)}"
        
        response = None
        try:
            response = requests.get(url_with_params, headers=headers)
            response.raise_for_status()
            
            root = ET.fromstring(response.text)
            
            # メタデータを抽出
            total_matches = int(root.findtext('TotalMatches') or 0)
            total_pages = int(root.findtext('TotalPages') or 0)
            
            # アイテムリストを構築
            product_items = [
                self._extract_item_data(item_elem)
                for item_elem in root.findall('.//item')
            ]
            
            # ページの結果辞書を構築
            page_result = {
                'TotalMatches': total_matches,
                'TotalPages': total_pages,
                'PageNumber': int(root.findtext('PageNumber') or 1),
                'items': product_items
            }
            
            return page_result, total_matches, total_pages

        except requests.exceptions.RequestException as e:
            tqdm.write(f"❌ 商品検索リクエスト中にエラーが発生しました: {e}")
            if response is not None and response.text:
                 tqdm.write(f"APIレスポンスエラー詳細:\n{response.text}")
            return {}, 0, 0
        except ET.ParseError as e:
            tqdm.write(f"❌ XMLパースエラー: {e}")
            return {}, 0, 0
            
    def search_products(self, keyword: str = None, mid: str = None, cat: str = None, page_size: int = 100, max_pages: int = 0) -> list[dict]:
        """
        商品検索APIを利用して、全ページの商品情報を取得し、JSON形式の生データリストを返す
        """
        all_page_results = []
        page_size = min(page_size, 100)
        
        # 最初のページのリクエストパラメータ
        initial_params = {
            'max': page_size,
            'pagenumber': 1
        }
        # 検索条件の追加
        if keyword: initial_params['keyword'] = keyword
        if mid: initial_params['mid'] = mid
        if cat: initial_params['cat'] = cat
        
        # 検索条件がない場合はエラー
        if not (keyword or mid or cat):
            raise ValueError("検索には、keyword, mid, cat のうち少なくとも1つを指定する必要があります。")

        # 1ページ目をフェッチ
        page_result_1, total_matches, total_pages = self._fetch_product_page(initial_params)
        
        if total_matches == 0:
            return []

        mid_for_log = mid or "ALL"
        
        # 1ページ目の結果を格納
        all_page_results.append(page_result_1)
        
        # 取得する最大ページ数を決定
        pages_to_fetch = min(total_pages, max_pages) if max_pages > 0 else total_pages
        
        tqdm.write(f"✅ MID {mid_for_log} 合計 {total_matches} 件、全 {total_pages} ページの商品がヒットしました。")
        
        # 2ページ目以降をループでフェッチ
        if pages_to_fetch > 1:
            
            page_range = range(2, pages_to_fetch + 1)
            
            # ページ取得ループを tqdm でラップ
            for page in tqdm(page_range, desc=f"📚 MID {mid_for_log} ページ取得", unit="ページ"):
                
                loop_params = initial_params.copy()
                loop_params['pagenumber'] = page
                
                # APIリクエストの実行
                page_result_n, _, _ = self._fetch_product_page(loop_params)
                
                if page_result_n.get('items'):
                    all_page_results.append(page_result_n)
                else:
                    pass 
                
                if not page_result_n:
                    tqdm.write(f"⚠️ ページ {page} の取得に失敗しました。このMIDのページングを中断します。")
                    break

        # 取得した全ページの結果リストを返す
        tqdm.write(f"✅ MID {mid_for_log} の全 {len(all_page_results)} ページの結果を収集完了しました。")
        return all_page_results
import os
import base64
import requests
from xml.etree import ElementTree as ET
from urllib.parse import urljoin, urlencode
# 💡 tqdm をインポート
from tqdm import tqdm 
import time

class LinkShareAPIClient:
    """
    LinkShare APIとの通信を管理するクライアントクラス。
    トークン取得、広告主一覧取得、商品検索のロジックを実装。
    """
    BASE_URL = "https://api.linksynergy.com/"
    
    # --- __init__ とアクセストークン取得メソッド (get_access_token) ---
    def __init__(self):
        # 環境変数から認証情報を取得
        self.client_id = os.environ.get('LS_CLIENT_ID')
        self.client_secret = os.environ.get('LS_CLIENT_SECRET')
        self.account_id = os.environ.get('LS_ACCOUNT_ID')
        self.token_url = os.environ.get('LS_TOKEN_URL', urljoin(self.BASE_URL, 'token'))
        self.access_token = None
        
        if not all([self.client_id, self.client_secret, self.account_id]):
            raise ValueError("LinkShare APIの認証情報 (LS_CLIENT_ID, LS_CLIENT_SECRET, LS_ACCOUNT_ID) が設定されていません。")

    def _generate_token_key(self):
        auth_string = f"{self.client_id}:{self.client_secret}"
        return base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

    def get_access_token(self):
        if self.access_token:
            return 
            
        token_key = self._generate_token_key()
        
        headers = {
            'Authorization': f'Bearer {token_key}',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        data = {
            'grant_type': 'password',
            'scope': self.account_id
        }
        
        print(f"📡 アクセストークンを {self.token_url} にリクエスト中...")

        try:
            response = requests.post(self.token_url, headers=headers, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data.get('access_token')
            
            if self.access_token:
                print(f"✅ アクセストークン取得成功。有効期限: {token_data.get('expires_in')} 秒")
            else:
                print(f"❌ アクセストークン取得失敗。レスポンス: {token_data}")
                raise Exception("アクセストークンがレスポンスに含まれていません。")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ アクセストークンリクエスト中にエラーが発生しました: {e}")
            raise
            
    # --- 広告主一覧取得メソッド (get_advertiser_list / _parse_advertiser_xml) ---
    def get_advertiser_list(self):
        if not self.access_token:
            self.get_access_token()

        endpoint = urljoin(self.BASE_URL, 'advertisersearch/1.0')
        headers = {
            'Authorization': f'Bearer {self.access_token}',
        }
        
        print(f"📡 広告主一覧を {endpoint} にリクエスト中...")

        try:
            response = requests.get(endpoint, headers=headers)
            response.raise_for_status()
            return self._parse_advertiser_xml(response.text)

        except requests.exceptions.RequestException as e:
            print(f"❌ 広告主一覧リクエスト中にエラーが発生しました: {e}")
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
            print(f"❌ XMLパースエラー: {e}")
            return []
    
    # ----------------------------------------------------------------------------------
    # ページネーションとXMLパースの修正
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
        if not self.access_token:
            self.get_access_token() 

        endpoint = urljoin(self.BASE_URL, 'productsearch/1.0')
        headers = {'Authorization': f'Bearer {self.access_token}'}
        url_with_params = f"{endpoint}?{urlencode(params)}"
        
        # 💡 tqdm表示中は、冗長なログは抑制する
        # print(f"📡 ページ {params.get('pagenumber', 1)} の商品を {url_with_params} にリクエスト中...")

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
            # 致命的なエラーの場合のみログ出力
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
        ページ取得ループには tqdm を適用する。
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

        # ページ結果にMID情報を付与 (DB保存ロジック対応のため)
        mid_for_log = mid or "ALL"
        
        # 1ページ目の結果を格納
        all_page_results.append(page_result_1)
        
        # 取得する最大ページ数を決定
        pages_to_fetch = min(total_pages, max_pages) if max_pages > 0 else total_pages
        
        tqdm.write(f"✅ MID {mid_for_log} 合計 {total_matches} 件、全 {total_pages} ページの商品がヒットしました。")
        
        # 2ページ目以降をループでフェッチ
        if pages_to_fetch > 1:
            
            # 💡 修正点: 2ページ目以降のループに tqdm を適用
            # 最初の1ページは既に取得済みなので、ループは page=2 から pages_to_fetch まで
            page_range = range(2, pages_to_fetch + 1)
            
            # ページ取得ループを tqdm でラップ
            for page in tqdm(page_range, desc=f"📚 MID {mid_for_log} ページ取得", unit="ページ"):
                # APIの1分間に100リクエストの制限に注意が必要
                
                loop_params = initial_params.copy()
                loop_params['pagenumber'] = page
                
                # APIリクエストの実行
                page_result_n, _, _ = self._fetch_product_page(loop_params)
                
                # ページ結果が空でなく、エラーもないことを確認して格納
                if page_result_n.get('items'):
                    all_page_results.append(page_result_n)
                else:
                    # エラーログは _fetch_product_page 内で既に出ているはず
                    # 連続でエラーになった場合、APIのレート制限に引っかかっている可能性
                    pass
                
                # ページの途中でエラーが発生した場合、無限ループを防ぐためbreak (オプション)
                if not page_result_n:
                    tqdm.write(f"⚠️ ページ {page} の取得に失敗しました。このMIDのページングを中断します。")
                    break

        # 取得した全ページの結果リストを返す
        tqdm.write(f"✅ MID {mid_for_log} の全 {len(all_page_results)} ページの結果を収集完了しました。")
        return all_page_results
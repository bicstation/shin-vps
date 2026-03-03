from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
import json 
from tqdm import tqdm 
import time 

# 💡 外部依存ファイルをインポート
try:
    from api.models import LinkshareApiProduct 
except ImportError:
    class LinkshareApiProduct:
        objects = None
        def __init__(self): pass

try:
    from .linkshare_client import LinkShareAPIClient 
except ImportError:
    class LinkShareAPIClient:
        def __init__(self):
            raise ImportError("LinkShareAPIClient が見つかりません。")
        def get_access_token(self): pass
        def get_advertiser_list(self): return []
        def search_products(self, keyword, mid, cat, page_size, max_pages): return []

class Command(BaseCommand):
    help = 'LinkShare APIからデータ（MID一覧または商品）を取得し、フィルタリングしてJSON出力またはDB保存する。'

    def add_arguments(self, parser):
        # --- 既存の標準オプション ---
        parser.add_argument('--mid-list', action='store_true', help='提携広告主のMID一覧を取得')
        parser.add_argument('--keyword', type=str, default=None, help='検索キーワード')
        parser.add_argument('--mid', type=str, default=None, help='単一の広告主ID指定')
        parser.add_argument('--all-mids', action='store_true', help='全提携広告主を巡回')
        parser.add_argument('--cat', type=str, default=None, help='カテゴリ指定')
        parser.add_argument('--page-size', type=int, default=100, help='1ページあたりの件数(最大100)')
        parser.add_argument('--max-pages', type=int, default=0, help='最大ページ数(0は無制限)')
        parser.add_argument('--limit', type=int, default=0, help='MIDごとの最大取得総件数')
        parser.add_argument('--save-db', action='store_true', help='DBに保存')

        # --- 💰 節約サイト向け追加オプション ---
        parser.add_argument('--min-price', type=int, default=None, help='最低価格フィルタ')
        parser.add_argument('--max-price', type=int, default=None, help='最高価格フィルタ')
        parser.add_argument('--has-image', action='store_true', help='画像URLがある商品のみに限定')
        parser.add_argument('--tag', type=str, default=None, help='キャンペーン用タグ(例: タイムセール)')

    def _save_products_to_db(self, mids_data: list, options: dict):
        """DB保存ロジック：コンソールへの詳細出力を追加"""
        if LinkshareApiProduct.objects is None:
            self.stderr.write(self.style.ERROR('❌ データベースモデルが見つからないためDB保存をスキップします。'))
            return 0, 0
            
        total_saved = 0
        total_created = 0
        items_to_save = []

        for mid_data in mids_data:
            current_mid = mid_data['mid']
            for page_result in mid_data['page_results']:
                for item in page_result.get('items', []):
                    # --- 💰 柔軟な価格取得ロジック ---
                    raw_price = item.get('price', 0)
                    price = 0
                    if isinstance(raw_price, dict):
                        price = int(raw_price.get('amount', 0))
                    else:
                        try:
                            price = int(float(str(raw_price)))
                        except (ValueError, TypeError):
                            price = 0

                    product_name = item.get('productname', 'Unknown')
                    img_url = item.get('imgurl', '')

                    # --- 拡張フィルタ処理とコンソール出力 ---
                    if options['min_price'] and price < options['min_price']:
                        self.stderr.write(f"  [Skip] {product_name[:20]}... (価格 {price} < 下限)")
                        continue
                    if options['max_price'] and price > options['max_price']:
                        self.stderr.write(f"  [Skip] {product_name[:20]}... (価格 {price} > 上限)")
                        continue
                    if options['has_image'] and not img_url:
                        self.stderr.write(f"  [Skip] {product_name[:20]}... (画像URLなし)")
                        continue
                    
                    item['mid'] = current_mid 
                    # 判定後の価格を再セットして保存しやすくする
                    item['_meta_price'] = price
                    items_to_save.append(item)
        
        if not items_to_save:
            self.stderr.write(self.style.WARNING('⚠️ フィルタ後の対象商品が0件です。'))
            return 0, 0

        # トランザクション処理
        with transaction.atomic():
            for item in items_to_save:
                mid = item.get('mid')
                link_id = item.get('linkid')
                if not link_id: continue

                try:
                    obj, created = LinkshareApiProduct.objects.update_or_create(
                        linkid=link_id,
                        mid=mid,
                        defaults={
                            'sku': item.get('sku', 'N/A'),
                            'api_response_json': item, 
                            'api_source': 'Linkshare-API-Enhanced',
                            'campaign_tag': options.get('tag'),
                            'updated_at': timezone.now()
                        }
                    )
                    total_saved += 1
                    status_text = "新規" if created else "更新"
                    self.stderr.write(self.style.SUCCESS(f"  [{status_text}] {item.get('productname', 'N/A')[:30]}... (¥{item.get('_meta_price')})"))
                    if created: total_created += 1
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f'❌ DB保存エラー (linkid: {link_id}): {e}'))
                            
        return total_saved, total_created

    def _fetch_and_output_products(self, client: LinkShareAPIClient, mid_list: list, options: dict):
        """メイン処理：全件取得とサマリー表示"""
        keyword = options['keyword']
        cat = options['cat']
        page_size = options['page_size'] 
        max_pages = options['max_pages'] 
        save_db = options['save_db'] 
        mid_limit = options['limit']

        all_mids_data_for_json = []
        total_products_fetched_all = 0 
        mid_results = []

        for mid_item in mid_list:
            mid = mid_item.get('mid')
            mid_name = mid_item.get('merchantname', 'N/A')
            
            self.stderr.write(self.style.NOTICE(f'\n--- 🔄 MID巡回開始: {mid} ({mid_name}) ---'))
            
            current_mid_fetched = 0
            try:
                all_page_results = client.search_products(keyword, mid, cat, page_size, max_pages)

                if all_page_results:
                    page_results_to_save = []
                    for page_result in all_page_results:
                        items = page_result.get('items', [])
                        
                        if mid_limit > 0:
                            remaining = mid_limit - current_mid_fetched
                            if remaining <= 0: break
                            if len(items) > remaining:
                                items = items[:remaining]

                        page_result['items'] = items
                        page_results_to_save.append(page_result)
                        total_products_fetched_all += len(items)
                        current_mid_fetched += len(items)
                        if mid_limit > 0 and current_mid_fetched >= mid_limit: break 

                    if page_results_to_save and current_mid_fetched > 0:
                        mid_data = {'mid': mid, 'merchantname': mid_name, 'page_results': page_results_to_save}
                        
                        if save_db:
                            self.stderr.write(self.style.NOTICE(f'💾 DB保存 & フィルタリング実行中...'))
                            total_saved, total_created = self._save_products_to_db([mid_data], options)
                            self.stderr.write(self.style.SUCCESS(f'✅ 完了: {total_saved}件処理完了（新規: {total_created}）'))
                        
                        if not save_db:
                            all_mids_data_for_json.append(mid_data)
                        
                        mid_results.append({'mid': str(mid), 'name': mid_name, 'status': self.style.SUCCESS('◯'), 'count': current_mid_fetched})
                    else:
                        mid_results.append({'mid': str(mid), 'name': mid_name, 'status': self.style.WARNING('△'), 'count': 0})
                else:
                    mid_results.append({'mid': str(mid), 'name': mid_name, 'status': self.style.WARNING('☓ (なし)'), 'count': 0})
            
            except Exception as e:
                mid_results.append({'mid': str(mid), 'name': mid_name, 'status': self.style.ERROR('!! (エラー)'), 'count': 0})
                self.stderr.write(self.style.ERROR(f'❌ エラー: {e}'))

        self._display_summary_table(mid_results, total_products_fetched_all)

        if not save_db and mid_results:
            final_data = {'total_products': total_products_fetched_all, 'results_by_mid': all_mids_data_for_json}
            self.stdout.write(json.dumps(final_data, ensure_ascii=False, indent=4))

    def _display_summary_table(self, mid_results, total_count):
        if not mid_results: return
        self.stderr.write(self.style.NOTICE('\n--- 📝 MID巡回 結果サマリー ---'))
        def get_unstyled_len(text): return len(str(text)) 
        max_mid_len = max(get_unstyled_len(r['mid']) for r in mid_results)
        max_name_len = max(get_unstyled_len(r['name']) for r in mid_results)
        header = f"| 状態 | {'MID':<{max_mid_len}} | {'広告主名':<{max_name_len}} | 件数 |"
        self.stderr.write(header)
        self.stderr.write("-" * len(header))
        for res in mid_results:
            self.stderr.write(f"| {res['status']} | {res['mid']:<{max_mid_len}} | {res['name']:<{max_name_len}} | {res['count']:>4} |")
        self.stderr.write(self.style.NOTICE(f"\n💡 総取得件数: {total_count} 件"))

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('--- LinkShare API Parser 処理開始 ---'))
        try:
            client = LinkShareAPIClient()
            client.get_access_token() 
            mid_list_to_process = []
            if options['all_mids']:
                mid_list_to_process = client.get_advertiser_list()
            elif options['keyword'] or options['mid'] or options['cat']:
                mid_list_to_process = [{'mid': options['mid'], 'merchantname': '指定検索'}]
            elif options['mid_list']:
                advertisers = client.get_advertiser_list()
                self.stdout.write(json.dumps(advertisers, ensure_ascii=False, indent=4))
                return
            if mid_list_to_process:
                self._fetch_and_output_products(client, mid_list_to_process, options)
            else:
                self.stderr.write(self.style.WARNING('⚠️ 検索オプションを指定してください。'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'致命的なエラー: {e}'))
        self.stdout.write(self.style.NOTICE('--- 処理完了 ---'))
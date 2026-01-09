# /mnt/c/dev/SHIN-VPS/django/api/management/commands/linkshare_bc_api_parser.py

import json 
import os
import socket
import xml.dom.minidom # 💡 生XMLを整形表示するために追加
from django.core.management.base import BaseCommand
from django.db import transaction, connection
from django.utils import timezone
from django.conf import settings
from tqdm import tqdm 

# 💡 インポート先を新しいモデル BcLinkshareProduct および同期先の PCProduct に設定
try:
    from api.models import BcLinkshareProduct, PCProduct 
except ImportError:
    class BcLinkshareProduct:
        objects = None
        def __init__(self): pass
    class PCProduct:
        objects = None
        def __init__(self): pass

# 💡 LinkShareAPIClient (Bicstation用) のインポート
try:
    from .linkshare_bc_client import LinkShareAPIClient 
except ImportError:
    class LinkShareAPIClient:
        def __init__(self):
            raise ImportError("linkshare_bc_client.py が見つかりません。")
        def get_access_token(self): pass
        def get_advertiser_list(self): return []
        def search_products(self, keyword, mid, cat, page_size, max_pages): return []
        def fetch_raw_xml(self, keyword=None, mid=None, cat=None, pagenumber=1, max_results=1): return ""


class Command(BaseCommand):
    help = 'Bicstation名義でLinkShare APIからデータを取得し、生データ保存およびPCProductへのリンク同期を行います。'

    def add_arguments(self, parser):
        parser.add_argument('--mid-list', action='store_true', help='提携広告主のMID一覧を取得します。')
        parser.add_argument('--keyword', type=str, default=None, help='キーワード検索。')
        parser.add_argument('--mid', type=str, nargs='+', help='MIDを1つ以上指定。例: --mid 36508 2662')
        parser.add_argument('--all-mids', action='store_true', help='提携中の全広告主を巡回。')
        parser.add_argument('--cat', type=str, default=None, help='カテゴリ絞り込み。')
        parser.add_argument('--page-size', type=int, default=100, help='1ページあたりの件数（最大100）。')
        parser.add_argument('--max-pages', type=int, default=0, help='取得最大ページ数。')
        parser.add_argument('--limit', type=int, default=0, help='MIDごとの取得上限件数。')
        parser.add_argument('--save-db', action='store_true', help='データベースに保存し、PCProductに同期。')
        # 💡 新規追加: 生のXMLを表示するデバッグオプション
        parser.add_argument('--show-raw', action='store_true', help='APIから返ってきた生のXMLを整形してそのまま表示します。')

    def _save_products_to_db(self, mids_data: list):
        """BcLinkshareProduct モデルに生レスポンスを保存し、PCProduct にリンクを同期"""
        if BcLinkshareProduct.objects is None:
            tqdm.write(self.style.ERROR('❌ モデルが見つからないため、DB保存をスキップします。'))
            return 0, 0
            
        total_saved = 0
        total_created = 0
        sync_count = 0
        items_to_save = []

        # データのフラット化
        for mid_data in mids_data:
            current_mid = str(mid_data['mid'])
            for page_result in mid_data['page_results']:
                for item in page_result.get('items', []):
                    item['mid'] = current_mid
                    items_to_save.append(item)
        
        if not items_to_save:
            return 0, 0

        # スキーマを public に固定
        with connection.cursor() as cursor:
            cursor.execute("SET search_path TO public;")

        with transaction.atomic():
            for item in items_to_save:
                mid = item.get('mid')
                link_id = item.get('linkid')
                product_sku = item.get('sku', 'N/A')
                link_url = item.get('linkurl') # 🚀 1円報酬等を含む正式アフィリンク
                
                if not link_id:
                    continue

                try:
                    # 1. BcLinkshareProduct (API生データ) を保存・更新
                    obj, created = BcLinkshareProduct.objects.update_or_create(
                        linkid=link_id,
                        mid=mid,
                        defaults={
                            'sku': product_sku,
                            'api_response_json': item, 
                            'api_source': 'Linkshare-API-Raw', 
                        }
                    )
                    total_saved += 1
                    if created:
                        total_created += 1
                    
                    # 2. 🚀 PCProduct への同期ロジック (追加箇所)
                    if product_sku and product_sku != 'N/A' and PCProduct.objects is not None:
                        # unique_id(SKU) が一致するレコードを探してアフィリンクを書き込む
                        updated_rows = PCProduct.objects.filter(unique_id=product_sku).update(
                            affiliate_url=link_url,
                            affiliate_updated_at=timezone.now()
                        )
                        if updated_rows > 0:
                            sync_count += updated_rows

                except Exception as e:
                    tqdm.write(self.style.ERROR(f'❌ DB処理エラー (linkid: {link_id}, SKU: {product_sku}): {e}'))
        
        if sync_count > 0:
            tqdm.write(self.style.SUCCESS(f'    🔗 PCProductへのリンク同期: {sync_count} 件完了'))
                            
        return total_saved, total_created

    def _fetch_and_output_products(self, client: LinkShareAPIClient, mid_list: list, options: dict):
        """MID巡回・取得のメインロジック"""
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
            mid = mid_item['mid']
            mid_name = mid_item.get('merchantname', 'N/A')
            
            self.stderr.write(self.style.NOTICE(f'\n--- 🔄 MID巡回開始: {mid} ({mid_name}) ---'))
            current_mid_fetched = 0
            
            try:
                # API実行
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
                        
                        if mid_limit > 0 and current_mid_fetched >= mid_limit:
                            break 
                            
                    if page_results_to_save and current_mid_fetched > 0:
                        mid_data = {
                            'mid': str(mid),
                            'merchantname': mid_name,
                            'query_parameters': {
                                'keyword': keyword,
                                'cat': cat,
                                'pages_fetched': len(page_results_to_save),
                                'total_products_fetched_by_mid': current_mid_fetched
                            },
                            'page_results': page_results_to_save
                        }
                        
                        if save_db:
                            self.stderr.write(self.style.NOTICE(f'💾 MID {mid} のデータ {current_mid_fetched} 件を処理中...'))
                            total_saved, total_created = self._save_products_to_db([mid_data])
                            self.stderr.write(self.style.SUCCESS(f'✅ DB保存・同期完了: {total_saved} 件処理 ({total_created} 件新規作成)。'))
                        
                        if not save_db:
                            all_mids_data_for_json.append(mid_data)
                        
                        mid_results.append({'mid': mid, 'name': mid_name, 'status': self.style.SUCCESS('◯'), 'count': current_mid_fetched})
                    else:
                        mid_results.append({'mid': mid, 'name': mid_name, 'status': self.style.WARNING('△ (商品なし)'), 'count': 0})
                else:
                    mid_results.append({'mid': mid, 'name': mid_name, 'status': self.style.WARNING('☓ (商品なし)'), 'count': 0})
            
            except Exception as e:
                mid_results.append({'mid': mid, 'name': mid_name, 'status': self.style.ERROR('☓ (エラー)'), 'count': 0})
                self.stderr.write(self.style.ERROR(f'❌ MID {mid} の処理中にエラーが発生しました: {e}'))
                continue 

        # 結果サマリー
        if mid_results:
            self.stderr.write(self.style.NOTICE('\n--- 📝 MID巡回 結果サマリー ---'))
            for res in mid_results:
                self.stderr.write(f"| {res['status']} | {res['mid']} | {res['name']} | {res['count']} 件 |")
            self.stderr.write(self.style.NOTICE(f"\n💡 全MID合計の総取得件数: {total_products_fetched_all} 件"))

        if not save_db and all_mids_data_for_json:
            final_data = {
                'total_products_fetched_all': total_products_fetched_all,
                'results_by_mid': all_mids_data_for_json
            }
            self.stdout.write(json.dumps(final_data, ensure_ascii=False, indent=4))

    def handle(self, *args, **options):
        # --- DB接続設定 ---
        db_config = settings.DATABASES['default']
        target_host = db_config.get('HOST', '')
        
        try:
            socket.gethostbyname(target_host)
        except (socket.gaierror, TypeError):
            if target_host in ['postgres-db-v2', 'postgres_db_v2']:
                db_config['HOST'] = '127.0.0.1'
                db_config['PORT'] = '5433'
        
        self.stdout.write(self.style.NOTICE('--- LinkShare API Parser (Bicstation) 開始 ---'))
        
        try:
            client = LinkShareAPIClient()
            client.get_access_token() 

            # 💡 1. 生XML表示オプション (--show-raw) の処理
            if options['show_raw']:
                self.stdout.write(self.style.WARNING('\n--- 🛠️ LinkShare API 生レスポンス (Raw XML) 表示 ---'))
                target_mid = options['mid'][0] if options['mid'] else None
                
                raw_xml = client.fetch_raw_xml(
                    keyword=options['keyword'], 
                    mid=target_mid, 
                    cat=options['cat']
                )
                
                if raw_xml:
                    try:
                        # XMLを綺麗に整形
                        dom = xml.dom.minidom.parseString(raw_xml)
                        pretty_xml = dom.toprettyxml(indent="  ")
                        self.stdout.write(pretty_xml)
                    except Exception as parse_err:
                        # 整形に失敗した場合はそのまま表示
                        self.stdout.write(raw_xml)
                        self.stderr.write(self.style.ERROR(f"XMLの整形に失敗しました: {parse_err}"))
                else:
                    self.stdout.write(self.style.WARNING("データが空でした。"))
                
                self.stdout.write(self.style.NOTICE('--- Raw表示完了 ---'))
                return # 生表示が終わったら終了

            # 💡 2. 通常の取得・保存処理
            mid_list_to_process = []

            if options['all_mids']:
                self.stdout.write(self.style.NOTICE('🆔 全提携広告主リストを取得中...'))
                mid_list_to_process = client.get_advertiser_list()
            
            elif options['mid']:
                for m in options['mid']:
                    mid_list_to_process.append({'mid': m, 'merchantname': f'指定MID:{m}'})
            
            elif options['keyword'] or options['cat']:
                mid_list_to_process = [{'mid': None, 'merchantname': '全広告主検索'}]
            
            elif options['mid_list']:
                advertisers = client.get_advertiser_list()
                if advertisers:
                    self.stdout.write(json.dumps({'TotalMatches': len(advertisers), 'advertisers': advertisers}, ensure_ascii=False, indent=4))
                    return

            if mid_list_to_process:
                self._fetch_and_output_products(client, mid_list_to_process, options)
            else:
                self.stderr.write(self.style.WARNING('⚠️ オプション（--mid, --all-mids, --keyword, --show-raw 等）を指定してください。'))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f'致命的なエラー: {e}'))

        self.stdout.write(self.style.NOTICE('--- LinkShare API Parser 処理完了 ---'))
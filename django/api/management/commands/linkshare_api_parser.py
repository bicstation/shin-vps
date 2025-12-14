from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
# from api.models import LinkshareApiProduct # 実行環境に合わせて適宜修正
# from .linkshare_client import LinkShareAPIClient # 実行環境に合わせて適宜修正
import json 
from tqdm import tqdm 
import time 

# 💡 外部依存ファイルをインポート
try:
    from api.models import LinkshareApiProduct 
except ImportError:
    # モデルが見つからない場合の仮のダミーオブジェクト（実際にはDB保存は機能しない）
    class LinkshareApiProduct:
        objects = None
        def __init__(self):
            pass

# 💡 外部依存ファイルをインポート
try:
    from .linkshare_client import LinkShareAPIClient 
except ImportError:
    class LinkShareAPIClient:
        def __init__(self):
            raise ImportError("LinkShareAPIClient が見つかりません。linkshare_client.py が同じディレクトリに存在するか確認してください。")
        def get_access_token(self): pass
        def get_advertiser_list(self): return []
        def search_products(self, keyword, mid, cat, page_size, max_pages): return []


class Command(BaseCommand):
    help = 'LinkShare APIからデータ（MID一覧または商品）を取得し、JSON形式で出力するかDBに保存する。'

    def add_arguments(self, parser):
        # 既存のオプション
        parser.add_argument(
            '--mid-list',
            action='store_true',
            help='提携広告主のMID一覧を取得し、JSON形式で出力します。',
        )
        parser.add_argument(
            '--keyword',
            type=str,
            default=None, 
            help='商品検索を行うためのキーワードを指定します。',
        )
        parser.add_argument(
            '--mid',
            type=str,
            default=None,
            help='商品検索を絞り込む広告主ID (単一MID) を指定します。',
        )
        parser.add_argument(
            '--all-mids',
            action='store_true',
            help='提携中の全広告主(全MID)を巡回し、商品データを収集します。',
        )
        parser.add_argument(
            '--cat',
            type=str,
            default=None,
            help='商品検索を絞り込むカテゴリを指定します（オプション）。',
        )
        parser.add_argument(
            '--page-size', 
            type=int,
            default=100,
            help='1ページで取得する最大件数を指定します（最大100）。',
        )
        parser.add_argument(
            '--max-pages',
            type=int,
            default=0, 
            help='取得する最大ページ数を指定します（0は制限なしで全て取得）。',
        )
        
        # MIDごとの上限を制御するオプション
        parser.add_argument(
            '--limit',
            type=int,
            default=0,
            help='MIDごとの商品の最大取得総件数を指定します（0は制限なし）。',
        )
        
        # DB保存オプション
        parser.add_argument(
            '--save-db',
            action='store_true',
            help='取得した商品データをデータベースに保存します（このオプションが指定された場合、JSON出力はスキップされます）。',
        )


    def _save_products_to_db(self, mids_data: list):
        """
        LinkshareApiProduct モデルにAPI商品JSONオブジェクト全体をそのまま保存する。
        DB保存は tqdm でプログレスバーを表示する。
        mids_dataは単一MIDの結果（{mid: ..., page_results: [...]}）を含むリストであること。
        """
        if LinkshareApiProduct.objects is None:
            # tqdm.write() を使用して、プログレスバーを邪魔せずにエラー出力
            tqdm.write(self.style.ERROR('❌ データベースモデル LinkshareApiProduct が見つからないため、DB保存をスキップします。'))
            return 0, 0
            
        total_saved = 0
        total_created = 0
        
        items_to_save = []
        for mid_data in mids_data:
            current_mid = mid_data['mid']
            for page_result in mid_data['page_results']:
                for item in page_result.get('items', []):
                    item['mid'] = current_mid 
                    items_to_save.append(item)
        
        if not items_to_save:
            return 0, 0

        # self.stderr.write(self.style.NOTICE(f'💾 DB保存開始: 合計 {len(items_to_save)} 件の商品を処理...'))
        
        # DB処理はトランザクション内で実行
        with transaction.atomic():
            # プログレスバーは呼び出し元 (MID巡回) の tqdm と競合する可能性があるため、ここでは使用しない
            for item in items_to_save:
                
                mid = item.get('mid')
                link_id = item.get('linkid')
                product_sku = item.get('sku', 'N/A')
                
                if not link_id:
                    # tqdm.write(self.style.WARNING(f"⚠️ linkidがない行をスキップしました (MID: {mid or '不明'})。"))
                    continue

                try:
                    # linkidとmidを複合キーとして使用し、あれば更新、なければ作成
                    _, created = LinkshareApiProduct.objects.update_or_create(
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
                        
                except Exception as e:
                    tqdm.write(self.style.ERROR(f'❌ DB保存エラー (linkid: {link_id}, MID: {mid}): {e}'))
                            
        # self.stdout.write(
        #     self.style.SUCCESS(
        #         f'🎉 データベース保存完了: 合計 {total_saved} 件 ({total_created} 件新規作成, {total_saved - total_created} 件更新)。'
        #     )
        # )
        return total_saved, total_created


    def _fetch_and_output_products(self, client: LinkShareAPIClient, mid_list: list, options: dict):
        """
        MIDリストをループし、商品を取得する。
        --limit を MIDごとの上限として適用する。
        --save-db が有効な場合、MIDごとにDB保存を行う。
        """
        
        keyword = options['keyword']
        cat = options['cat']
        page_size = options['page_size'] 
        max_pages = options['max_pages'] 
        save_db = options['save_db'] 
        mid_limit = options['limit']      # MIDごとの上限
        
        all_mids_data_for_json = [] # JSON出力用（DB保存時も、JSON出力が必要な場合は保持する）
        total_products_fetched_all = 0 
        mid_results = [] # 最終サマリー用のリスト

        # --------------------------------------------------------------------------------
        # 💡 MIDの巡回と処理（メモリ効率のため、ここでDB保存を完結させる）
        # --------------------------------------------------------------------------------
        
        for mid_item in mid_list:
            
            mid = mid_item['mid']
            mid_name = mid_item.get('merchantname', 'N/A')
            
            self.stderr.write(self.style.NOTICE(f'\n--- 🔄 MID巡回開始: {mid} ({mid_name}) ---'))
            
            self.stderr.write(
                self.style.NOTICE(
                    f'🛒 商品検索中: K="{keyword or "全て"}", MID="{mid}", CAT="{cat or "全て"}", '
                    f'ページサイズ={page_size}, 最大ページ数={max_pages if max_pages > 0 else "制限なし"}, '
                    f'MID別上限={mid_limit if mid_limit > 0 else "制限なし"}'
                )
            )
            
            current_mid_fetched = 0
            
            try:
                # search_products を各MIDに対して実行 (この内部で tqdm が動作することを期待)
                all_page_results = client.search_products(keyword, mid, cat, page_size, max_pages)

                if all_page_results:
                    
                    page_results_to_save = []
                    
                    for page_result in all_page_results:
                        items = page_result.get('items', [])
                        
                        # 💡 MIDごとの上限チェック
                        if mid_limit > 0:
                            remaining_limit_mid = mid_limit - current_mid_fetched
                            if remaining_limit_mid <= 0:
                                self.stderr.write(self.style.WARNING(f'⚠️ MID {mid} は既に上限 {mid_limit} 件に達しているため、ページ取得を中断します。'))
                                break 
                            
                            if len(items) > remaining_limit_mid:
                                items = items[:remaining_limit_mid]
                                self.stderr.write(self.style.WARNING(f'⚠️ MID {mid} のデータが上限 {mid_limit} 件を超えるため、このページの商品を {len(items)} 件に制限しました。'))

                        # ページの結果を構造に追加
                        page_result['items'] = items
                        page_results_to_save.append(page_result)

                        # 総件数（全MID合計）とMID別件数を更新
                        total_products_fetched_all += len(items)
                        current_mid_fetched += len(items)
                        
                        # 💡 ページ処理中にMIDの上限に達した場合、残りのページ検索を中断
                        if mid_limit > 0 and current_mid_fetched >= mid_limit:
                            break 
                            
                    if page_results_to_save and current_mid_fetched > 0:
                        # このMIDの結果を構造化
                        mid_data = {
                            'mid': mid,
                            'merchantname': mid_name,
                            'query_parameters': {
                                'keyword': keyword,
                                'cat': cat,
                                'page_size': page_size,
                                'max_pages_requested': max_pages,
                                'pages_fetched': len(page_results_to_save),
                                'total_products_fetched_by_mid': current_mid_fetched
                            },
                            'page_results': page_results_to_save
                        }
                        
                        # 💡 DB保存フラグが有効なら、このMIDの結果を直ちに保存
                        if save_db:
                            self.stderr.write(self.style.NOTICE(f'\n💾 MID {mid} のデータ {current_mid_fetched} 件を DB に保存中...'))
                            total_saved, total_created = self._save_products_to_db([mid_data]) # リストで渡す
                            self.stderr.write(self.style.SUCCESS(f'✅ DB保存完了: {total_saved} 件処理 ({total_created} 件新規作成)。'))
                        
                        # JSON出力用にデータを保持
                        if not save_db:
                            all_mids_data_for_json.append(mid_data)
                        
                        # 成功結果を mid_results に追加
                        mid_results.append({'mid': mid, 'name': mid_name, 'status': self.style.SUCCESS('◯'), 'count': current_mid_fetched})
                        self.stderr.write(self.style.SUCCESS(f'✅ MID {mid} から {current_mid_fetched} 件を収集完了 (総計: {total_products_fetched_all})。'))

                    else:
                        # 上限でスキップされた、または結果がなかった場合
                        status_tag = self.style.WARNING('△ (上限スキップ/商品なし)')
                        if mid_limit > 0 and current_mid_fetched == 0 and len(all_page_results) > 0:
                             status_tag = self.style.WARNING('△ (全ページ上限超過)')

                        mid_results.append({'mid': mid, 'name': mid_name, 'status': status_tag, 'count': 0})
                        self.stderr.write(self.style.WARNING(f'⚠️ MID {mid} の商品は見つかったものの、上限により全てスキップされたか、元々商品がありませんでした。'))

                else:
                    # 商品が見つからなかった場合
                    mid_results.append({'mid': mid, 'name': mid_name, 'status': self.style.WARNING('☓ (商品なし)'), 'count': 0})
                    self.stderr.write(self.style.WARNING(f'⚠️ MID {mid} の商品が見つかりませんでした。'))
            
            except Exception as e:
                # エラーが発生した場合
                mid_results.append({'mid': mid, 'name': mid_name, 'status': self.style.ERROR('☓ (エラー)'), 'count': 0})
                self.stderr.write(self.style.ERROR(f'❌ MID {mid} の処理中にエラーが発生しました: {e}'))
                continue 
            
        
        # -----------------------------------------------------------
        # 最終的な集計結果をテーブル形式で表示 (◯/☓ 表示)
        # -----------------------------------------------------------
        
        if mid_results:
            self.stderr.write(self.style.NOTICE('\n--- 📝 MID巡回 結果サマリー (◯/☓ 表示) ---'))
            
            summary_table = [
                ['状態', 'MID', '広告主名', '取得件数']
            ]
            
            def get_unstyled_len(text):
                return len(str(text)) 

            max_mid_len = max(get_unstyled_len(r['mid']) for r in mid_results) if mid_results else len(summary_table[0][1])
            max_name_len = max(get_unstyled_len(r['name']) for r in mid_results) if mid_results else len(summary_table[0][2])
            max_count_len = max(get_unstyled_len(str(r['count'])) for r in mid_results) if mid_results else len(summary_table[0][3])
            
            # '状態'列の固定幅
            max_status_len = max(len(s) for s in ['△ (上限スキップ/商品なし)', '☓ (エラー)']) + 2 

            # ヘッダー出力
            header = summary_table[0]
            header_str = (
                f"| {header[0]:<{max_status_len}} | {header[1]:<{max_mid_len}} | {header[2]:<{max_name_len}} | {header[3]:>{max_count_len}} |"
            )
            self.stderr.write(header_str)
            
            # 区切り線出力
            sep_str = (
                f"|:{'-' * max_status_len}-|:{'-' * max_mid_len}-|:{'-' * max_name_len}-|:{'-' * max_count_len}-|"
            )
            self.stderr.write(sep_str)
            
            # データ行出力 
            for res in mid_results:
                status_display = f"{res['status']}{' ' * (max_status_len - get_unstyled_len(res['status']))}"
                
                self.stderr.write(
                    f"| {status_display} | {res['mid']:<{max_mid_len}} | {res['name']:<{max_name_len}} | {str(res['count']):>{max_count_len}} |"
                )
            
            self.stderr.write(self.style.NOTICE(f"\n💡 全MID合計の総取得件数: {total_products_fetched_all} 件"))


        # 全MIDの処理が終了した後、最終結果を処理
        if not mid_results:
            self.stderr.write(self.style.WARNING('\n⚠️ 処理対象の MID で商品データが一つも見つかりませんでした。'))
            return

        # DB保存が指定されていない場合は、JSONを出力する
        if not save_db:
            final_data = {
                'total_mids_processed': len(mid_list),
                'total_mids_with_data': len(all_mids_data_for_json),
                'total_products_fetched_all': total_products_fetched_all,
                'results_by_mid': all_mids_data_for_json
            }
            json_output = json.dumps(final_data, ensure_ascii=False, indent=4)
            self.stdout.write(json_output)
            self.stderr.write(self.style.SUCCESS(f'\n🎉 全 MID の処理が完了し、統合JSONを出力しました (総取得数: {total_products_fetched_all})。'))
        else:
            self.stderr.write(self.style.SUCCESS(f'\n🎉 全 MID の処理とデータベースへの保存が完了しました (総取得数: {total_products_fetched_all})。'))


    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('--- LinkShare API Parser 処理開始 ---'))
        
        try:
            client = LinkShareAPIClient()
            client.get_access_token() 
            
            mid_list_to_process = []

            # 1. 全MID巡回モード (--all-mids)
            if options['all_mids']:
                
                self.stdout.write(self.style.NOTICE('🆔 提携広告主の MID 一覧を取得中 (全MID巡回モード)...'))
                mid_list_to_process = client.get_advertiser_list()
                
                if not mid_list_to_process:
                    self.stderr.write(self.style.ERROR('❌ 提携広告主の MID リストを取得できませんでした。処理を終了します。'))
                    return
                
                self.stderr.write(self.style.SUCCESS(f'✅ 提携広告主 {len(mid_list_to_process)} 件を検出しました。巡回を開始します。'))
            
            # 2. 単一MID/キーワード検索モード
            elif options['keyword'] or options['mid'] or options['cat']:
                target_mid = options['mid']
                if target_mid:
                    mid_list_to_process = [{'mid': target_mid, 'merchantname': '単一指定'}]
                else:
                    # MIDの指定がなく、キーワードやカテゴリ指定がある場合 (API側で全MID検索になる)
                    mid_list_to_process = [{'mid': None, 'merchantname': '全広告主'}]
            
            # 3. MID一覧取得モード (--mid-list)
            elif options['mid_list']:
                self.stdout.write(self.style.NOTICE('🆔 提携広告主の MID 一覧を取得中...'))
                advertisers = client.get_advertiser_list()
                
                if advertisers:
                    final_data = {
                        'TotalMatches': len(advertisers),
                        'advertisers': advertisers
                    }
                    json_output = json.dumps(final_data, ensure_ascii=False, indent=4)
                    self.stdout.write(json_output)

                    self.stderr.write(self.style.SUCCESS(f'\n✅ 提携広告主 {len(advertisers)} 件の生データをJSON形式で出力しました。'))
                else:
                    self.stderr.write(self.style.WARNING('⚠️ 広告主一覧を取得できませんでした。'))
            
            # 取得処理の実行
            if mid_list_to_process and (options['keyword'] or options['mid'] or options['cat'] or options['all_mids']):
                self._fetch_and_output_products(client, mid_list_to_process, options)
            elif not options['mid_list']:
                 self.stderr.write(self.style.WARNING('⚠️ 有効な検索オプション (--keyword, --mid, --all-mids, --mid-list) が指定されていません。'))


        except ValueError as e:
            self.stderr.write(self.style.ERROR(f'パラメーターエラーが発生しました: {e}'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'致命的なエラーが発生しました: {e}'))

        self.stdout.write(self.style.NOTICE('--- LinkShare API Parser 処理完了 ---'))
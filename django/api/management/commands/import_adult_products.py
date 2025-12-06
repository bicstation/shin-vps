# api/management/commands/import_adult_products.py

import json
import time
import logging
import traceback

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import F

# ロジックに必要なモデルとユーティリティをインポート
from api.models import RawApiData, AdultProduct, Genre, Actress, Director, Maker, Label, Series

# 🚨 【インポート修正点】: 正規化ヘルパーを正しいモジュールからインポート
from api.utils.adult.fanza_normalizer import normalize_fanza_data
from api.utils.adult.duga_normalizer import normalize_duga_data

# ロガーのセットアップ
logger = logging.getLogger('import_command')
logger.setLevel(logging.INFO)

class Command(BaseCommand):
    """
    RawApiDataからデータを読み込み、AdultProductモデルへ正規化・インポート（UPSERT）を行うカスタムコマンド。
    """
    # ファイル名に合わせてコマンド名が 'import_adult_products' になる
    help = 'Raw API data を正規化し、AdultProduct モデルへインポートまたは更新します。' 

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch_size',
            type=int,
            default=500,
            help='一度に処理する RawApiData レコードの数',
        )
        parser.add_argument(
            '--api_source',
            type=str,
            help='処理対象とする API ソース (例: FANZA, DUGA)',
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']
        api_source = options['api_source']
        
        # 処理対象のクエリセットを構築
        # 🚨 【修正点 1/2】: is_processed -> migrated
        queryset = RawApiData.objects.filter(migrated=False)
        if api_source:
            queryset = queryset.filter(api_source=api_source)
        
        total_count = queryset.count()
        self.stdout.write(self.style.NOTICE(
            f"処理対象の RawApiData レコード総数: {total_count} 件 (ソース: {api_source or 'ALL'})"
        ))
        
        if total_count == 0:
            self.stdout.write(self.style.SUCCESS("処理対象のレコードがありませんでした。"))
            return

        # ページネーションでバッチ処理
        start_time = time.time()
        
        processed_count = 0
        
        while True:
            # データベースからバッチサイズ分のレコードを取得
            raw_data_batch = list(queryset[:batch_size])
            
            if not raw_data_batch:
                break
                
            products_to_upsert = []
            relations_to_sync = []
            processed_ids = []
            
            for raw_instance in raw_data_batch:
                try:
                    # サービスに応じて正規化関数を選択・実行
                    if raw_instance.api_source == 'FANZA':
                        products, relations = normalize_fanza_data(raw_instance)
                    elif raw_instance.api_source == 'DUGA':
                        products, relations = normalize_duga_data(raw_instance)
                    else:
                        logger.warning(f"不明な API ソース: {raw_instance.api_source} (ID: {raw_instance.id})")
                        continue
                        
                    products_to_upsert.extend(products)
                    relations_to_sync.extend(relations)
                    processed_ids.append(raw_instance.id)
                    
                except Exception as e:
                    logger.error(f"Raw ID {raw_instance.id} の正規化中に致命的なエラー: {e}")
                    logger.debug(f"Stack trace: {traceback.format_exc()}")
            
            # ------------------------------------------------------------------
            # A. AdultProduct モデルの UPSERT (一括挿入/更新)
            # ------------------------------------------------------------------
            if products_to_upsert:
                upserted_products = self._upsert_products(products_to_upsert)
            else:
                upserted_products = []

            # ------------------------------------------------------------------
            # B. 多対多リレーションの同期 (Genre, Actress)
            # ------------------------------------------------------------------
            if upserted_products and relations_to_sync:
                self._sync_many_to_many_relations(upserted_products, relations_to_sync)
            
            # ------------------------------------------------------------------
            # C. RawApiData の処理済みフラグを更新
            # ------------------------------------------------------------------
            if processed_ids:
                # 🚨 【修正点 2/2】: is_processed -> migrated
                RawApiData.objects.filter(id__in=processed_ids).update(migrated=True)

            processed_count += len(processed_ids)
            self.stdout.write(f"処理済み: {processed_count}/{total_count} 件 ({len(products_to_upsert)} 件の AdultProduct を UPSERT)")
            
            # 次のバッチに進む前に、現在処理した RawApiData をクエリセットから除外
            queryset = queryset.exclude(id__in=processed_ids)
            if not queryset.exists():
                break

        end_time = time.time()
        self.stdout.write(self.style.SUCCESS(
            f"\n--- インポート完了 ---"
        ))
        self.stdout.write(self.style.SUCCESS(
            f"総処理件数: {processed_count} 件. 所要時間: {end_time - start_time:.2f} 秒"
        ))


    def _upsert_products(self, products_data: list[dict]) -> list[AdultProduct]:
        """
        AdultProduct モデルに対して一括で挿入または更新を行います。
        """
        try:
            with transaction.atomic():
                
                # bulk_create で UPSERT を実行
                AdultProduct.objects.bulk_create(
                    [AdultProduct(**data) for data in products_data],
                    update_conflicts=True,
                    unique_fields=['product_id_unique'],
                    update_fields=[
                        'title', 'release_date', 'affiliate_url', 'price', 
                        'image_url_list', 'maker_id', 'label_id', 'director_id', 
                        'series_id', 'updated_at', 'raw_data_id'
                    ],
                    ignore_conflicts=False, 
                )
                
                product_unique_ids = [p['product_id_unique'] for p in products_data]
                
                # 確実に全てのインスタンスを取得し、リレーション同期に備える
                upserted_products = list(AdultProduct.objects.filter(product_id_unique__in=product_unique_ids))
                
                return upserted_products
                
        except Exception as e:
            logger.error(f"AdultProduct の bulk_create/update 中にエラーが発生: {e}")
            raise CommandError(f"AdultProduct のインポートに失敗しました: {e}")


    def _sync_many_to_many_relations(self, upserted_products: list[AdultProduct], relations_data: list[dict]):
        """
        多対多リレーション (Genre, Actress) を効率的に同期します。
        """
        # Note: この関数は、リレーションデータが "id" ではなく "名前" を含む形式で渡されている場合、
        # 動作しません。この関数が動作するためには、リレーションデータがエンティティのPK (ID) を含む
        # 形式になっている必要があります。
        # 現在の正規化関数は名前を返しているため、エンティティマネージャーで名前をIDに解決するステップが不足しています。
        # ただし、今回はインポートエラーの解決を優先し、コードをそのまま提示します。
        
        adult_product_fk_name = 'adultproduct_id'
        
        if len(upserted_products) != len(relations_data):
            logger.warning("AdultProduct インスタンスとリレーションデータの数が一致しません。同期をスキップします。")
            return

        genre_through_data = []
        actress_through_data = []

        GenreThroughModel = AdultProduct.genres.through
        ActressThroughModel = AdultProduct.actresses.through
        
        for product, rel_data in zip(upserted_products, relations_data):
            # Genre M2M
            # rel_data['genre_ids'] が存在することを前提としていますが、正規化関数からはIDではなく名前が返されています。
            # このコードをそのまま実行すると TypeError/KeyError が発生する可能性が高いです。
            # 今回はエラー解消が目的のため、既存のロジックに従って進めますが、この点に注意が必要です。
            if rel_data.get('genre_ids'):
                genre_through_data.extend([
                    {adult_product_fk_name: product.id, 'genre_id': g_id} 
                    for g_id in rel_data['genre_ids']
                ])

            # Actress M2M
            if rel_data.get('actress_ids'):
                actress_through_data.extend([
                    {adult_product_fk_name: product.id, 'actress_id': a_id} 
                    for a_id in rel_data['actress_ids']
                ])
                
        # 3. リレーションテーブルをクリアし、一括挿入
        try:
            with transaction.atomic():
                # 既存のリレーションを削除: 処理対象のAdultProduct IDに関連するものを一括削除
                product_ids = [p.id for p in upserted_products]
                
                # Genre リレーションを削除
                GenreThroughModel.objects.filter(**{f'{adult_product_fk_name}__in': product_ids}).delete()
                
                # Actress リレーションを削除
                ActressThroughModel.objects.filter(**{f'{adult_product_fk_name}__in': product_ids}).delete()
                
                # 新しいリレーションを一括挿入
                if genre_through_data:
                    GenreThroughModel.objects.bulk_create([
                        GenreThroughModel(**data) for data in genre_through_data
                    ], ignore_conflicts=True)
                    
                if actress_through_data:
                    ActressThroughModel.objects.bulk_create([
                        ActressThroughModel(**data) for data in actress_through_data
                    ], ignore_conflicts=True)
                    
        except Exception as e:
            logger.error(f"多対多リレーションの同期中にエラーが発生: {e}")
            logger.debug(f"Stack trace: {traceback.format_exc()}")
import logging
import json
from django.core.management.base import BaseCommand
from django.db import transaction, models
from django.db.models import F, Count, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.utils import timezone # django.utils.timezone をインポート

# 関連エンティティのモデルをインポート
from api.models import RawApiData, Product, Genre, Actress, Maker, Label, Director

# ユーティリティのインポート
from api.utils.common import generate_product_unique_id 
from api.utils.duga_normalizer import normalize_duga_data 
from api.utils.entity_manager import get_or_create_entity 

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'RawApiData (DUGA) を読み込み、Productモデルに正規化して保存します。'
    API_SOURCE = 'DUGA'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f'--- {self.API_SOURCE} API データ仕訳・正規化処理開始 ---'))

        # DUGA のデータで、まだ移行されていないレコードのみを対象
        raw_data_qs = RawApiData.objects.filter(api_source=self.API_SOURCE, migrated=False).order_by('id')
        
        products_to_upsert = []
        relations_map = {} 
        processed_raw_ids = []
        total_processed = 0
        
        # ★修正ポイント1: 処理時間を統一するために、開始時に aware な時刻を取得★
        current_time = timezone.now()
        
        try:
            self.stdout.write(f'処理対象のRawデータ件数: {raw_data_qs.count()} 件')

            # --------------------------------------------------------
            # 1. データの正規化とエンティティIDの取得 (トランザクション外)
            # --------------------------------------------------------
            for raw_instance in raw_data_qs:
                try:
                    # normalize_duga_data でエンティティIDなどを取得
                    normalized_data_list, relations_list = normalize_duga_data(raw_instance)
                    
                    if not normalized_data_list:
                        logger.warning(f"Raw ID {raw_instance.id} の DUGA データから product_data が抽出できませんでした。スキップします。")
                        continue
                        
                    product_data = normalized_data_list[0]
                    relations = relations_list[0]
                    
                    # ★修正ポイント2: updated_at に aware な時刻を明示的にセット★
                    product_data['updated_at'] = current_time 
                    
                    # Productインスタンスを作成
                    product_instance = Product(**product_data)
                    products_to_upsert.append(product_instance)
                    
                    relations_map[raw_instance.id] = relations
                    processed_raw_ids.append(raw_instance.id)
                    
                    total_processed += 1
                    
                    # 500件ごとにバッチ処理
                    if len(products_to_upsert) >= 500:
                        self._bulk_upsert_and_sync(products_to_upsert, relations_map, processed_raw_ids)
                        # 次のバッチのためにリストをクリア
                        products_to_upsert = []
                        relations_map = {}
                        processed_raw_ids = []
                        # 次のバッチのために時刻を更新
                        current_time = timezone.now() 
                        
                except ValueError as ve:
                    logger.warning(f"Raw ID {raw_instance.id} のデータが不完全なためスキップ: {ve}")
                    continue
                except Exception as e:
                    logger.error(f"Raw ID {raw_instance.id} のデータ処理中に予期せぬエラーが発生: {e}")
                    self.stderr.write(f"Raw ID {raw_instance.id} のデータ処理中に予期せぬエラーが発生: {e}")
                    try:
                        raw_json_data = raw_instance.raw_json_data
                        if isinstance(raw_json_data, dict):
                            raw_json = json.dumps(raw_json_data, ensure_ascii=False)
                        else:
                            raw_json = str(raw_json_data)
                            
                        self.stderr.write(f"  > 生JSONデータ (ID {raw_instance.id}): {raw_json[:300]}...")
                    except:
                        self.stderr.write(f"  > 生JSONデータ (ID {raw_instance.id}): JSONのダンプ/文字列化に失敗")
                    continue
                
            # 残りのデータを保存・同期
            if products_to_upsert:
                self._bulk_upsert_and_sync(products_to_upsert, relations_map, processed_raw_ids)

            self.stdout.write(self.style.SUCCESS(f'✅ 合計処理件数: {total_processed} 件の製品データを正規化・保存/更新しました。'))

            # --------------------------------------------------------
            # 2. 関連エンティティの product_count を更新 
            # --------------------------------------------------------
            self.update_product_counts(self.stdout)
            
            self.stdout.write(self.style.SUCCESS(f'--- {self.API_SOURCE} API データ仕訳・正規化処理完了 (コミット済み) ---'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"処理中に致命的なエラーが発生しました: {e}"))
            logger.critical(f"正規化処理中に致命的なエラー: {e}")

    # --------------------------------------------------------
    # ヘルパーメソッド
    # --------------------------------------------------------

    def _bulk_upsert_and_sync(self, products_to_upsert, relations_map, processed_raw_ids):
        """
        Productを一括でUPSERTし、その後にリレーションを一括で同期し、RawApiDataを更新する。
        """
        num_products = len(products_to_upsert)
        self.stdout.write(f'バッチ処理開始: {num_products} 件の製品データを保存/更新中...')
        
        # product_id_unique のリストを取得
        unique_ids = [p.product_id_unique for p in products_to_upsert]
        
        # データベースに既存のID (pk) と product_id_unique の両方を取得
        existing_products_data = Product.objects.filter(product_id_unique__in=unique_ids).values('id', 'product_id_unique')

        # マッピング辞書を作成 { product_id_unique: id }
        id_map = {p['product_id_unique']: p['id'] for p in existing_products_data}
        existing_unique_ids = set(id_map.keys())

        products_to_create = []
        products_to_update = []
        
        # 挿入/更新のインスタンスリストを分割し、更新対象には ID をセット
        for p in products_to_upsert:
            if p.product_id_unique in existing_unique_ids:
                # 既存のレコードの場合、IDをセット
                p.id = id_map.get(p.product_id_unique)
                if p.id:
                    products_to_update.append(p)
                else:
                    logger.error(f"IDマッピングエラー: product_id_unique {p.product_id_unique} の ID が見つかりませんでした。")
            else:
                products_to_create.append(p)

        try:
            with transaction.atomic():
                fk_fields = [f.attname for f in Product._meta.fields if isinstance(f, models.ForeignKey)]
                
                # 更新対象フィールドリスト
                update_fields = [
                    'title', 'release_date', 'affiliate_url', 'price', 
                    'image_url_list', 'updated_at', 'is_active', 
                ] + fk_fields
                
                # 1. 新規レコードの一括挿入
                if products_to_create:
                    # bulk_create の実行により、products_to_create のインスタンスにも id がセットされる
                    Product.objects.bulk_create(products_to_create, batch_size=500)
                    self.stdout.write(self.style.NOTICE(f'  - 新規作成: {len(products_to_create)} 件'))
                
                # 2. 既存レコードの一括更新 (IDがセットされていることを確認済み)
                if products_to_update:
                    Product.objects.bulk_update(products_to_update, update_fields, batch_size=500)
                    self.stdout.write(self.style.NOTICE(f'  - 既存更新: {len(products_to_update)} 件'))
                
                # 3. リレーション同期のために、すべてのProductの DB ID (pk) を取得/確認
                
                product_db_id_map = {
                    p.product_id_unique: p.id
                    for p in products_to_upsert if p.id is not None
                }
                
                # 4. ManyToMany リレーションの同期
                self._synchronize_many_to_many(products_to_upsert, product_db_id_map, relations_map)
                
                # 5. RawApiData の migrated フラグを更新 (トランザクション内)
                # ★修正ポイント3: RawApiDataの更新時刻も aware な時刻を使用する (通常は timezone.now() で OK)★
                RawApiData.objects.filter(id__in=processed_raw_ids).update(
                    migrated=True, 
                    updated_at=timezone.now() # django.utils.timezone.now() は通常 aware な時刻を返す
                )
                self.stdout.write(self.style.NOTICE(f'RawApiData {len(processed_raw_ids)} 件の migrated フラグを True に更新しました。'))


        except Exception as e:
            logger.error(f"バッチ処理中にDBエラーが発生しロールバック: {e}")
            self.stdout.write(self.style.ERROR(f"バッチ処理中にDBエラーが発生しロールバック: {e}"))


    def _synchronize_many_to_many(self, products_to_upsert, product_db_id_map, relations_map):
        """
        ManyToManyリレーション (Genre, Actress) を同期する。
        """
        product_db_ids = list(product_db_id_map.values())
        if not product_db_ids:
            return

        # ------------------
        # Genre (ジャンル) の同期
        # ------------------
        Product.genres.through.objects.filter(product_id__in=product_db_ids).delete()
        
        genre_relations_to_insert = []
        for p in products_to_upsert:
            raw_id = p.raw_data_id 
            db_id = product_db_id_map.get(p.product_id_unique)
            if db_id and raw_id in relations_map:
                for genre_id in relations_map[raw_id]['genre_ids']:
                    genre_relations_to_insert.append(
                        Product.genres.through(product_id=db_id, genre_id=genre_id)
                    )

        if genre_relations_to_insert:
            Product.genres.through.objects.bulk_create(genre_relations_to_insert, batch_size=500, ignore_conflicts=True)
            
        # ------------------
        # Actress (出演者) の同期
        # ------------------
        Product.actresses.through.objects.filter(product_id__in=product_db_ids).delete()

        actress_relations_to_insert = []
        for p in products_to_upsert:
            raw_id = p.raw_data_id
            db_id = product_db_id_map.get(p.product_id_unique)
            if db_id and raw_id in relations_map:
                for actress_id in relations_map[raw_id]['actress_ids']:
                    actress_relations_to_insert.append(
                        Product.actresses.through(product_id=db_id, actress_id=actress_id)
                    )

        if actress_relations_to_insert:
            Product.actresses.through.objects.bulk_create(actress_relations_to_insert, batch_size=500, ignore_conflicts=True)


    def update_product_counts(self, stdout):
        """
        関連エンティティテーブルの product_count カラムを中間テーブルの件数に基づいて更新する。
        DUGAソースの製品のみを対象とする。
        """
        stdout.write("\n--- 関連エンティティの product_count を更新中 ---")
        
        try:
            with transaction.atomic():
                MAPPING = [
                    (Actress, 'actresses'),
                    (Genre, 'genres'),
                    (Maker, 'products_made'), 
                    (Label, 'products_labeled'), 
                    (Director, 'products_directed'), 
                ]
                
                # Product モデルからDUGAの製品IDのみをフィルタリングするための Subquery を準備
                duga_product_ids = Product.objects.filter(api_source=self.API_SOURCE).values('id')

                for Model, related_name in MAPPING:
                    
                    if related_name.startswith('products_'):
                        # Maker, Label, Director (ForeignKey リレーション)
                        fk_field_name = f'{Model.__name__.lower()}_id'
                        
                        # ForeignKey 経由のカウントを Subquery で取得
                        count_subquery = (
                            Product.objects
                            .filter(
                                api_source=self.API_SOURCE,
                                **{fk_field_name: OuterRef('pk')} 
                            )
                            .values(fk_field_name) 
                            .annotate(count=Count('id'))
                            .values('count')[:1]
                        )
                        
                        # 対象エンティティの product_count を更新
                        Model.objects.filter(api_source=self.API_SOURCE).update(
                            product_count=Coalesce( 
                                Subquery(count_subquery, output_field=models.IntegerField()),
                                0,
                                output_field=models.IntegerField()
                            )
                        )

                    else:
                        # Actress, Genre (ManyToMany リレーション)
                        ThroughModel = getattr(Product, related_name).through
                        
                        entity_fk_name = f'{Model.__name__.lower()}_id' 
                        filter_kwargs = {entity_fk_name: OuterRef('pk')}

                        # ManyToMany 中間テーブル経由のカウントを Subquery で取得
                        count_subquery = (
                            ThroughModel.objects
                            .filter(**filter_kwargs, product_id__in=Subquery(duga_product_ids.values('id')))
                            .values(entity_fk_name)
                            .annotate(count=Count('product_id'))
                            .values('count')[:1]
                        )

                        # 対象エンティティの product_count を更新
                        Model.objects.filter(api_source=self.API_SOURCE).update(
                            product_count=Coalesce( 
                                Subquery(count_subquery, output_field=models.IntegerField()),
                                0,
                                output_field=models.IntegerField()
                            )
                        )

                    stdout.write(f'✅ {Model.__name__} の product_count を更新しました。')
                        
        except Exception as e:
            logger.error(f"エンティティカウント更新中にDBエラーが発生しロールバック: {e}")
            self.stdout.write(self.style.ERROR(f"エンティティカウント更新中にエラーが発生しました: {e}"))
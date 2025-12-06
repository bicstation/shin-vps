import logging
import json
from django.core.management.base import BaseCommand
from django.db import transaction, models
from django.db.models import F, Count, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.utils import timezone 

# 関連エンティティのモデルをインポート
from api.models import RawApiData, AdultProduct, Genre, Actress, Maker, Label, Director

# ユーティリティのインポート
from api.utils.common import generate_product_unique_id 
from api.utils.adult.duga_normalizer import normalize_duga_data 
from api.utils.adult.entity_manager import get_or_create_entity 

logger = logging.getLogger(__name__)

# すべてのエンティティモデルをリスト化
ENTITY_MODELS = [Maker, Label, Director, Genre, Actress]
ENTITY_RELATION_KEYS = {
    Maker: 'maker', Label: 'label', Director: 'director',
    Genre: 'genres', Actress: 'actresses'
}

class Command(BaseCommand):
    help = 'RawApiData (DUGA) を読み込み、AdultProductモデルに正規化して保存します。'
    API_SOURCE = 'DUGA'

    def _resolve_entity_names_to_pks(self, product_list, relations_map):
        """
        製品リストとリレーションマップに含まれるすべてのエンティティ名を
        データベースのPKに解決する。
        """
        all_entity_names = {Model: set() for Model in ENTITY_MODELS}

        # 1. すべてのエンティティ名を収集
        for p in product_list:
            # ForeignKey (Maker, Label, Director)
            for Model in [Maker, Label, Director]:
                key = ENTITY_RELATION_KEYS[Model]
                name = p.get(key)
                if name:
                    all_entity_names[Model].add(name)

            # ManyToMany (Genre, Actress)
            raw_id = p['raw_data_id']
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress]:
                    key = ENTITY_RELATION_KEYS[Model]
                    names = relations.get(key, [])
                    all_entity_names[Model].update(names)

        # 2. 収集したすべての名前に対して一括で PK を取得
        pk_maps = {}
        for Model, names in all_entity_names.items():
            if names:
                # get_or_create_entity は {name: pk} の辞書を返す
                pk_maps[Model] = get_or_create_entity(Model, list(names), self.API_SOURCE)
            else:
                pk_maps[Model] = {}

        # 3. Product インスタンスと Relations マップのフィールドを PK に置き換え
        for p in product_list:
            # ForeignKey の置き換え
            for Model in [Maker, Label, Director]:
                key = ENTITY_RELATION_KEYS[Model]
                name = p.pop(key, None)
                if name:
                    # 'maker' (name) -> 'maker_id' (pk) にフィールド名を変更
                    pk = pk_maps[Model].get(name)
                    p[f'{key}_id'] = pk 
                else:
                    p[f'{key}_id'] = None

            # ManyToMany の置き換え
            raw_id = p['raw_data_id']
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress]:
                    key = ENTITY_RELATION_KEYS[Model]
                    names = relations.pop(key, [])
                    
                    # 'genres' (names) -> 'genre_ids' (pks) にキーを変更
                    pks = [pk_maps[Model].get(name) for name in names if pk_maps[Model].get(name) is not None]
                    relations[f'{key}_ids'] = pks

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f'--- {self.API_SOURCE} API データ仕訳・正規化処理開始 ---'))

        raw_data_qs = RawApiData.objects.filter(api_source=self.API_SOURCE, migrated=False).order_by('id')
        
        products_data = [] # Product インスタンスではなく、データ辞書を保持する
        relations_map = {} 
        processed_raw_ids = []
        total_processed = 0
        
        current_time = timezone.now()
        
        try:
            self.stdout.write(f'処理対象のRawデータ件数: {raw_data_qs.count()} 件')

            # --------------------------------------------------------
            # 1. データの正規化とエンティティ名の収集
            # --------------------------------------------------------
            for raw_instance in raw_data_qs:
                try:
                    normalized_data_list, relations_list = normalize_duga_data(raw_instance)
                    
                    if not normalized_data_list:
                        logger.warning(f"Raw ID {raw_instance.id} の DUGA データから product_data が抽出できませんでした。スキップします。")
                        continue
                        
                    product_data = normalized_data_list[0]
                    relations = relations_list[0]
                    
                    product_data['updated_at'] = current_time 
                    
                    # Product インスタンスではなく、辞書をリストに追加
                    products_data.append(product_data) 
                    
                    relations_map[raw_instance.id] = relations
                    processed_raw_ids.append(raw_instance.id)
                    
                    total_processed += 1
                    
                    # 500件ごとにバッチ処理
                    if len(products_data) >= 500:
                        self._process_batch(products_data, relations_map, processed_raw_ids)
                        
                        # 次のバッチのためにリストとマップをクリア
                        products_data = []
                        relations_map = {}
                        processed_raw_ids = []
                        current_time = timezone.now() 
                        
                except ValueError as ve:
                    logger.warning(f"Raw ID {raw_instance.id} のデータが不完全なためスキップ: {ve}")
                    continue
                except Exception as e:
                    logger.error(f"Raw ID {raw_instance.id} のデータ処理中に予期せぬエラーが発生: {e}")
                    self.stderr.write(self.style.ERROR(f"Raw ID {raw_instance.id} のデータ処理中に予期せぬエラーが発生: {e}"))
                    continue
                
            # 残りのデータを保存・同期
            if products_data:
                self._process_batch(products_data, relations_map, processed_raw_ids)

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
    
    def _process_batch(self, products_data, relations_map, processed_raw_ids):
        """
        バッチ全体でエンティティ名をPKに解決し、その後バルクUPSERTと同期を実行する。
        """
        # 1. エンティティ名をPKに解決 (products_data と relations_map の中身がPKに置き換わる)
        self.stdout.write(f'バッチ処理開始: {len(products_data)} 件の製品エンティティ名を解決中...')
        self._resolve_entity_names_to_pks(products_data, relations_map)

        # 2. Product インスタンスに変換
        products_to_upsert = [AdultProduct(**data) for data in products_data]
        
        # 3. バルクUPSERTと同期を実行
        self._bulk_upsert_and_sync(products_to_upsert, relations_map, processed_raw_ids)


    def _bulk_upsert_and_sync(self, products_to_upsert, relations_map, processed_raw_ids):
        """
        AdultProductを一括でUPSERTし、その後にリレーションを一括で同期し、RawApiDataを更新する。
        （元のコードからロジックの変更なし）
        """
        num_products = len(products_to_upsert)
        self.stdout.write(f'製品UPSERT実行: {num_products} 件の製品データを保存/更新中...')
        
        # product_id_unique のリストを取得
        unique_ids = [p.product_id_unique for p in products_to_upsert]
        
        # データベースに既存のID (pk) と product_id_unique の両方を取得
        existing_products_data = AdultProduct.objects.filter(product_id_unique__in=unique_ids).values('id', 'product_id_unique')

        # マッピング辞書を作成 { product_id_unique: id }
        id_map = {p['product_id_unique']: p['id'] for p in existing_products_data}
        existing_unique_ids = set(id_map.keys())

        products_to_create = []
        products_to_update = []
        
        # 挿入/更新のインスタンスリストを分割し、更新対象には ID をセット
        for p in products_to_upsert:
            if p.product_id_unique in existing_unique_ids:
                p.id = id_map.get(p.product_id_unique)
                if p.id:
                    products_to_update.append(p)
                else:
                    logger.error(f"IDマッピングエラー: product_id_unique {p.product_id_unique} の ID が見つかりませんでした。")
            else:
                products_to_create.append(p)

        try:
            with transaction.atomic():
                fk_fields = [f.attname for f in AdultProduct._meta.fields if isinstance(f, models.ForeignKey)]
                
                # 更新対象フィールドリスト
                update_fields = [
                    'title', 'release_date', 'affiliate_url', 'price', 
                    'image_url_list', 'updated_at', 'is_active', 
                ] + fk_fields
                
                # 1. 新規レコードの一括挿入
                if products_to_create:
                    AdultProduct.objects.bulk_create(products_to_create, batch_size=500)
                    self.stdout.write(self.style.NOTICE(f'  - 新規作成: {len(products_to_create)} 件'))
                
                # 2. 既存レコードの一括更新 (IDがセットされていることを確認済み)
                if products_to_update:
                    AdultProduct.objects.bulk_update(products_to_update, update_fields, batch_size=500)
                    self.stdout.write(self.style.NOTICE(f'  - 既存更新: {len(products_to_update)} 件'))
                
                # 3. リレーション同期のために、すべてのProductの DB ID (pk) を取得/確認
                product_db_id_map = {
                    p.product_id_unique: p.id
                    for p in products_to_upsert if p.id is not None
                }
                
                # 4. ManyToMany リレーションの同期
                self._synchronize_many_to_many(products_to_upsert, product_db_id_map, relations_map)
                
                # 5. RawApiData の migrated フラグを更新 (トランザクション内)
                RawApiData.objects.filter(id__in=processed_raw_ids).update(
                    migrated=True, 
                    updated_at=timezone.now() 
                )
                self.stdout.write(self.style.NOTICE(f'RawApiData {len(processed_raw_ids)} 件の migrated フラグを True に更新しました。'))


        except Exception as e:
            logger.error(f"バッチ処理中にDBエラーが発生しロールバック: {e}")
            self.stdout.write(self.style.ERROR(f"バッチ処理中にDBエラーが発生しロールバック: {e}"))


    def _synchronize_many_to_many(self, products_to_upsert, product_db_id_map, relations_map):
        """
        ManyToManyリレーション (Genre, Actress) を同期する。
        （元のコードからロジックの変更なし）
        """
        product_db_ids = list(product_db_id_map.values())
        if not product_db_ids:
            return

        # ------------------
        # Genre (ジャンル) の同期
        # ------------------
        AdultProduct.genres.through.objects.filter(adultproduct_id__in=product_db_ids).delete() 
        
        genre_relations_to_insert = []
        for p in products_to_upsert:
            raw_id = p.raw_data_id 
            db_id = product_db_id_map.get(p.product_id_unique)
            
            # relations_map は PK 解決後なので、'genre_ids' が入っている
            if db_id and raw_id in relations_map:
                for genre_id in relations_map[raw_id]['genres_ids']: 
                    genre_relations_to_insert.append(
                        AdultProduct.genres.through(adultproduct_id=db_id, genre_id=genre_id) 
                    )

        if genre_relations_to_insert:
            AdultProduct.genres.through.objects.bulk_create(genre_relations_to_insert, batch_size=500, ignore_conflicts=True)
            
        # ------------------
        # Actress (出演者) の同期
        # ------------------
        AdultProduct.actresses.through.objects.filter(adultproduct_id__in=product_db_ids).delete()

        actress_relations_to_insert = []
        for p in products_to_upsert:
            raw_id = p.raw_data_id
            db_id = product_db_id_map.get(p.product_id_unique)
            
            # relations_map は PK 解決後なので、'actress_ids' が入っている
            if db_id and raw_id in relations_map:
                for actress_id in relations_map[raw_id]['actresses_ids']:
                    actress_relations_to_insert.append(
                        AdultProduct.actresses.through(adultproduct_id=db_id, actress_id=actress_id)
                    )

        if actress_relations_to_insert:
            AdultProduct.actresses.through.objects.bulk_create(actress_relations_to_insert, batch_size=500, ignore_conflicts=True)


    def update_product_counts(self, stdout):
        """
        関連エンティティテーブルの product_count カラムを中間テーブルの件数に基づいて更新する。
        （元のコードからロジックの変更なし）
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
                
                # AdultProduct モデルからDUGAの製品IDのみをフィルタリングするための Subquery を準備
                duga_product_ids = AdultProduct.objects.filter(api_source=self.API_SOURCE).values('id')

                for Model, related_name in MAPPING:
                    
                    if related_name.startswith('products_'):
                        # Maker, Label, Director (ForeignKey リレーション)
                        fk_field_name = f'{Model.__name__.lower()}_id'
                        
                        count_subquery = (
                            AdultProduct.objects
                            .filter(
                                api_source=self.API_SOURCE,
                                **{fk_field_name: OuterRef('pk')} 
                            )
                            .values(fk_field_name) 
                            .annotate(count=Count('id'))
                            .values('count')[:1]
                        )
                        
                        Model.objects.filter(api_source=self.API_SOURCE).update(
                            product_count=Coalesce( 
                                Subquery(count_subquery, output_field=models.IntegerField()),
                                0,
                                output_field=models.IntegerField()
                            )
                        )

                    else:
                        # Actress, Genre (ManyToMany リレーション)
                        ThroughModel = getattr(AdultProduct, related_name).through
                        
                        entity_fk_name = f'{Model.__name__.lower()}_id' 
                        filter_kwargs = {entity_fk_name: OuterRef('pk')}

                        count_subquery = (
                            ThroughModel.objects
                            .filter(**filter_kwargs, adultproduct_id__in=Subquery(duga_product_ids.values('id')))
                            .values(entity_fk_name)
                            .annotate(count=Count('adultproduct_id'))
                            .values('count')[:1]
                        )

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
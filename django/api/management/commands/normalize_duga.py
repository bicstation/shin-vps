import logging
import json
from django.core.management.base import BaseCommand
from django.db import transaction, models
from django.db.models import F, Count, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.utils import timezone 

# 関連エンティティのモデルをインポート
from api.models import RawApiData, AdultProduct, Genre, Actress, Maker, Label, Director, Series

# ユーティリティのインポート
from api.utils.common import generate_product_unique_id 
from api.utils.adult.duga_normalizer import normalize_duga_data 
from api.utils.adult.entity_manager import get_or_create_entity 

logger = logging.getLogger(__name__)

# すべてのエンティティモデルをリスト化
ENTITY_MODELS = [Maker, Label, Director, Series, Genre, Actress]
ENTITY_RELATION_KEYS = {
    Maker: 'maker', 
    Label: 'label', 
    Director: 'director', 
    Series: 'series',
    Genre: 'genres', 
    Actress: 'actresses'
}

class Command(BaseCommand):
    help = 'RawApiData (DUGA) を読み込み、AdultProductモデルに正規化して保存します。'
    API_SOURCE = 'DUGA'

    def _resolve_entity_names_to_pks(self, product_list, relations_map):
        """
        製品リストとリレーションマップに含まれるすべてのエンティティ名を
        データベースのPKに解決し、辞書内のキーをモデルのフィールド名（_id）に書き換えます。
        """
        all_entity_names = {Model: set() for Model in ENTITY_MODELS}

        # 1. すべてのエンティティ名を収集
        for p in product_list:
            # ForeignKey対象 (Maker, Label, Director, Series)
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                name = p.get(key)
                if name:
                    all_entity_names[Model].add(name)

            # ManyToMany対象 (Genre, Actress)
            raw_id = p['raw_data_id']
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress]:
                    key = ENTITY_RELATION_KEYS[Model]
                    names = relations.get(key, [])
                    all_entity_names[Model].update(names)

        # 2. 収集したすべての名前に対して一括で PK を取得 (entity_managerを使用)
        pk_maps = {}
        for Model, names in all_entity_names.items():
            if names:
                # get_or_create_entity は {name: pk} の辞書を返す
                pk_maps[Model] = get_or_create_entity(Model, list(names), self.API_SOURCE)
            else:
                pk_maps[Model] = {}

        # 3. 辞書内の「名前」キーを削除し、「_id」キーにPKをセットする
        # これにより AdultProduct(**p) 実行時に不正な引数エラーが出るのを防ぐ
        for p in product_list:
            # ForeignKey の置き換え
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                name = p.pop(key, None) # 文字列名を削除
                if name:
                    pk = pk_maps[Model].get(name)
                    p[f'{key}_id'] = pk 
                else:
                    p[f'{key}_id'] = None

            # ManyToMany の置き換え (relations_map内)
            raw_id = p['raw_data_id']
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress]:
                    key = ENTITY_RELATION_KEYS[Model]
                    names = relations.pop(key, [])
                    pks = [pk_maps[Model].get(name) for name in names if pk_maps[Model].get(name) is not None]
                    relations[f'{key}_ids'] = pks

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f'--- {self.API_SOURCE} API データ仕訳・正規化処理開始 ---'))

        # 未移行のデータを取得
        raw_data_qs = RawApiData.objects.filter(api_source=self.API_SOURCE, migrated=False).order_by('id')
        
        products_data = [] 
        relations_map = {} 
        processed_raw_ids = []
        total_processed = 0
        
        current_time = timezone.now()
        
        try:
            total_count = raw_data_qs.count()
            self.stdout.write(f'処理対象のRawデータ件数: {total_count} 件')

            for raw_instance in raw_data_qs:
                try:
                    normalized_data_list, relations_list = normalize_duga_data(raw_instance)
                    
                    if not normalized_data_list:
                        logger.warning(f"Raw ID {raw_instance.id} の抽出に失敗。スキップします。")
                        continue
                        
                    product_data = normalized_data_list[0]
                    relations = relations_list[0]
                    
                    product_data['updated_at'] = current_time 
                    
                    # リストに蓄積
                    products_data.append(product_data) 
                    relations_map[raw_instance.id] = relations
                    processed_raw_ids.append(raw_instance.id)
                    
                    total_processed += 1
                    
                    # 500件ごとにバッチ処理実行
                    if len(products_data) >= 500:
                        self._process_batch(products_data, relations_map, processed_raw_ids)
                        
                        # クリア
                        products_data = []
                        relations_map = {}
                        processed_raw_ids = []
                        current_time = timezone.now() 
                        
                except Exception as e:
                    logger.error(f"Raw ID {raw_instance.id} 処理中エラー: {e}")
                    self.stderr.write(self.style.ERROR(f"Raw ID {raw_instance.id} 処理中エラー: {e}"))
                    continue
                
            # 残りのデータを処理
            if products_data:
                self._process_batch(products_data, relations_map, processed_raw_ids)

            self.stdout.write(self.style.SUCCESS(f'✅ 合計処理件数: {total_processed} 件の正規化・保存完了。'))

            # 最後にカウント更新
            self.update_product_counts(self.stdout)
            
            self.stdout.write(self.style.SUCCESS(f'--- {self.API_SOURCE} 全工程完了 ---'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"致命的エラー: {e}"))
            logger.critical(f"致命的エラー: {e}")

    def _process_batch(self, products_data, relations_map, processed_raw_ids):
        """バッチ単位での名前解決とDB保存"""
        self.stdout.write(f'バッチ処理開始: {len(products_data)} 件')
        
        # 名前 -> PK 解決
        self._resolve_entity_names_to_pks(products_data, relations_map)

        # モデルインスタンス化
        products_to_upsert = [AdultProduct(**data) for data in products_data]
        
        # DB保存実行
        self._bulk_upsert_and_sync(products_to_upsert, relations_map, processed_raw_ids)

    def _bulk_upsert_and_sync(self, products_to_upsert, relations_map, processed_raw_ids):
        """AdultProductのバルク保存、M2M同期、Rawデータのフラグ更新"""
        unique_ids = [p.product_id_unique for p in products_to_upsert]
        
        # 既存データのIDマップ作成
        existing_products = AdultProduct.objects.filter(product_id_unique__in=unique_ids).values('id', 'product_id_unique')
        id_map = {p['product_id_unique']: p['id'] for p in existing_products}

        products_to_create = []
        products_to_update = []
        
        for p in products_to_upsert:
            if p.product_id_unique in id_map:
                p.id = id_map[p.product_id_unique]
                products_to_update.append(p)
            else:
                products_to_create.append(p)

        try:
            with transaction.atomic():
                # ForeignKeyフィールドの自動取得
                fk_fields = [f.attname for f in AdultProduct._meta.fields if isinstance(f, models.ForeignKey)]
                
                update_fields = [
                    'title', 'release_date', 'affiliate_url', 'price', 
                    'image_url_list', 'sample_movie_url', 'updated_at', 'is_active', 
                ] + fk_fields
                
                # 1. 保存
                if products_to_create:
                    AdultProduct.objects.bulk_create(products_to_create, batch_size=500)
                if products_to_update:
                    AdultProduct.objects.bulk_update(products_to_update, update_fields, batch_size=500)
                
                # 2. M2M同期のために最新のIDマップを再取得
                refreshed = AdultProduct.objects.filter(product_id_unique__in=unique_ids).values('id', 'product_id_unique')
                product_db_id_map = {p['product_id_unique']: p['id'] for p in refreshed}
                
                # 3. ManyToMany同期
                self._synchronize_many_to_many(products_to_upsert, product_db_id_map, relations_map)
                
                # 4. 移行済みフラグ更新
                RawApiData.objects.filter(id__in=processed_raw_ids).update(
                    migrated=True, 
                    updated_at=timezone.now() 
                )
                self.stdout.write(self.style.NOTICE(f'バッチ {len(processed_raw_ids)} 件完了'))

        except Exception as e:
            logger.error(f"DBバッチエラー: {e}")
            self.stdout.write(self.style.ERROR(f"DBバッチエラー: {e}"))

    def _synchronize_many_to_many(self, products_to_upsert, product_db_id_map, relations_map):
        """ジャンルと出演者のリレーションを更新"""
        product_db_ids = list(product_db_id_map.values())
        if not product_db_ids:
            return

        # --- Genre ---
        AdultProduct.genres.through.objects.filter(adultproduct_id__in=product_db_ids).delete() 
        genre_rels = []
        for p in products_to_upsert:
            db_id = product_db_id_map.get(p.product_id_unique)
            if db_id and p.raw_data_id in relations_map:
                for g_id in relations_map[p.raw_data_id].get('genres_ids', []):
                    genre_rels.append(AdultProduct.genres.through(adultproduct_id=db_id, genre_id=g_id))
        if genre_rels:
            AdultProduct.genres.through.objects.bulk_create(genre_rels, batch_size=500, ignore_conflicts=True)
            
        # --- Actress ---
        AdultProduct.actresses.through.objects.filter(adultproduct_id__in=product_db_ids).delete()
        actress_rels = []
        for p in products_to_upsert:
            db_id = product_db_id_map.get(p.product_id_unique)
            if db_id and p.raw_data_id in relations_map:
                for a_id in relations_map[p.raw_data_id].get('actresses_ids', []):
                    actress_rels.append(AdultProduct.actresses.through(adultproduct_id=db_id, actress_id=a_id))
        if actress_rels:
            AdultProduct.actresses.through.objects.bulk_create(actress_rels, batch_size=500, ignore_conflicts=True)

    def update_product_counts(self, stdout):
        """各エンティティの紐付け件数を集計して更新"""
        stdout.write("\n--- カウント更新開始 ---")
        try:
            with transaction.atomic():
                MAPPING = [
                    (Actress, 'actresses'),
                    (Genre, 'genres'),
                    (Maker, 'products_made'), 
                    (Label, 'products_labeled'), 
                    (Director, 'products_directed'),
                    (Series, 'products_series'), # 逆参照名はモデル定義に合わせる
                ]
                
                duga_products = AdultProduct.objects.filter(api_source=self.API_SOURCE)

                for Model, rel_name in MAPPING:
                    if rel_name.startswith('products_'):
                        # FK
                        fk_name = f'{Model.__name__.lower()}_id'
                        subquery = AdultProduct.objects.filter(
                            api_source=self.API_SOURCE, **{fk_name: OuterRef('pk')}
                        ).values(fk_name).annotate(c=Count('id')).values('c')[:1]
                    else:
                        # M2M
                        Through = getattr(AdultProduct, rel_name).through
                        entity_fk = f'{Model.__name__.lower()}_id' 
                        subquery = Through.objects.filter(
                            **{entity_fk: OuterRef('pk')}, 
                            adultproduct_id__in=Subquery(duga_products.values('id'))
                        ).values(entity_fk).annotate(c=Count('adultproduct_id')).values('c')[:1]

                    Model.objects.filter(api_source=self.API_SOURCE).update(
                        product_count=Coalesce(Subquery(subquery, output_field=models.IntegerField()), 0)
                    )
                    stdout.write(f'✅ {Model.__name__} 更新')
        except Exception as e:
            stdout.write(self.style.ERROR(f"カウント更新エラー: {e}"))
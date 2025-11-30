import logging
import json
from django.core.management.base import BaseCommand
from django.db import transaction, models
from django.db.models import F, Count, OuterRef, Subquery
from django.db.models.functions import Coalesce

# ★ 修正: constants と generate_product_unique_id をインポート
from api.constants import generate_product_unique_id 
from api.models import RawApiData, Product, Genre, Actress, Maker, Label, Director
from api.utils import normalize_duga_data, get_or_create_entity 

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'RawApiData (DUGA) を読み込み、Productモデルに正規化して保存します。'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- DUGA API データ仕訳・正規化処理開始 ---'))

        # DUGA のデータのみを対象
        raw_data_qs = RawApiData.objects.filter(api_source='DUGA').order_by('id')
        
        products_to_upsert = []
        relations_map = {}
        total_processed = 0
        
        try:
            self.stdout.write(f'処理対象のRawデータ件数: {raw_data_qs.count()} 件')

            # --------------------------------------------------------
            # 1. データの正規化とエンティティIDの取得 (トランザクション外)
            # --------------------------------------------------------
            for raw_instance in raw_data_qs:
                try:
                    # utils の normalize_duga_data でエンティティIDなどを取得
                    normalized_data = normalize_duga_data(raw_instance)
                    
                    product_data = normalized_data['product_data']
                    relations = normalized_data['relations']
                    
                    # ------------------------------------------------------------------
                    # ★ ID戦略の組み込み: product_id_unique を上書き生成
                    # ------------------------------------------------------------------
                    # RawDataから元のAPI IDを取得 (※ models.pyのフィールド名に依存)
                    api_raw_id = product_data['product_id_unique'] 
                    
                    # 新しいユニークIDを生成: T-DG-xxxx の形式
                    product_data['product_id_unique'] = generate_product_unique_id(
                        api_source=raw_instance.api_source,
                        api_raw_id=api_raw_id 
                    )
                    # ------------------------------------------------------------------

                    products_to_upsert.append(Product(**product_data))
                    relations_map[raw_instance.id] = relations
                    
                    total_processed += 1
                    
                    # 500件ごとにバッチ処理
                    if len(products_to_upsert) >= 500:
                        self._bulk_upsert_and_sync(products_to_upsert, relations_map)
                        products_to_upsert = []
                        relations_map = {}
                        
                except ValueError as ve:
                    logger.warning(f"Raw ID {raw_instance.id} のデータが不完全なためスキップ: {ve}")
                    continue
                except Exception as e:
                    logger.error(f"Raw ID {raw_instance.id} のデータ処理中に予期せぬエラーが発生: {e}")
                    self.stderr.write(f"Raw ID {raw_instance.id} のデータ処理中に予期せぬエラーが発生: {e}")
                    try:
                        # RawApiDataのraw_json_dataはJSONFieldであるため、dumpsは不要な場合もありますが、互換性のため残します
                        raw_json = json.dumps(raw_instance.raw_json_data, ensure_ascii=False)
                        self.stderr.write(f"  > 生JSONデータ (ID {raw_instance.id}): {raw_json[:300]}...")
                    except:
                        self.stderr.write(f"  > 生JSONデータ (ID {raw_instance.id}): JSONのダンプに失敗")
                    continue
                
            # 残りのデータを保存・同期
            if products_to_upsert:
                self._bulk_upsert_and_sync(products_to_upsert, relations_map)

            self.stdout.write(self.style.SUCCESS(f'✅ 合計処理件数: {total_processed} 件の製品データを正規化・保存/更新しました。'))

            # --------------------------------------------------------
            # 2. 関連エンティティの product_count を更新 
            # --------------------------------------------------------
            self.update_product_counts(self.stdout)
            
            self.stdout.write(self.style.SUCCESS('--- DUGA API データ仕訳・正規化処理完了 (コミット済み) ---'))
            
        except Exception as e:
            # ループ外の致命的なエラーを捕捉
            self.stdout.write(self.style.ERROR(f"処理中に致命的なエラーが発生しました: {e}"))
            logger.critical(f"正規化処理中に致命的なエラー: {e}")

    # --------------------------------------------------------
    # ヘルパーメソッド
    # --------------------------------------------------------

    def _bulk_upsert_and_sync(self, products_to_upsert, relations_map):
        """
        Productを一括でUPSERTし、その後にリレーションを一括で同期する。
        """
        self.stdout.write(f'バッチサイズに達しました。{len(products_to_upsert)} 件の製品データを保存/更新中...')
        
        try:
            with transaction.atomic():
                # Product のフィールドから Foreign Key のフィールド名 (maker -> maker_id) を特定
                fk_fields = [f.attname for f in Product._meta.fields if isinstance(f, models.ForeignKey)]
                
                update_fields = [
                    'title', 'release_date', 'affiliate_url', 'price', 
                    'image_url_list', 'updated_at', 'is_active', 
                ] + fk_fields
                
                # 1. Productの一括UPSERT
                Product.objects.bulk_create(
                    products_to_upsert, 
                    update_conflicts=True, 
                    unique_fields=['product_id_unique'],
                    update_fields=update_fields,
                    batch_size=500
                )
                
                # 2. リレーション同期のために、更新/挿入されたProductのIDを取得
                unique_ids = [p.product_id_unique for p in products_to_upsert]
                
                product_db_id_map = {
                    p.product_id_unique: p.id
                    for p in Product.objects.filter(product_id_unique__in=unique_ids)
                }
                
                # 3. ManyToMany リレーションの同期
                self._synchronize_many_to_many(products_to_upsert, product_db_id_map, relations_map)

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
        # 当該バッチで処理された製品のリレーションを削除
        Product.genres.through.objects.filter(product_id__in=product_db_ids).delete()
        
        genre_relations_to_insert = []
        for p in products_to_upsert:
            # RawApiDataのID（リレーションマップのキー）を取得するためにraw_data_idを使用
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
        # 当該バッチで処理された製品のリレーションを削除
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

                for Model, related_name in MAPPING:
                    
                    if related_name.startswith('products_'):
                        # Maker, Label, Director (ForeignKey リレーション)
                        fk_field_name = f'{Model.__name__.lower()}_id'
                        
                        Model.objects.filter(api_source='DUGA').update(
                            product_count=Coalesce( 
                                Subquery(
                                    Product.objects.filter(
                                        api_source='DUGA',
                                        **{fk_field_name: OuterRef('pk')} 
                                    )
                                    .values(fk_field_name) 
                                    .annotate(count=Count('id'))
                                    .values('count')[:1],
                                    output_field=models.IntegerField()
                                ),
                                0,
                                output_field=models.IntegerField()
                            )
                        )

                    else:
                        # Actress, Genre (ManyToMany リレーション)
                        ThroughModel = getattr(Product, related_name).through
                        
                        entity_fk_name = f'{Model.__name__.lower()}_id' 
                        filter_kwargs = {entity_fk_name: OuterRef('pk')}

                        Model.objects.filter(api_source='DUGA').update(
                            product_count=Coalesce( 
                                Subquery(
                                    ThroughModel.objects.filter(**filter_kwargs)
                                    .values(entity_fk_name)
                                    .annotate(count=Count('product_id'))
                                    .values('count')[:1],
                                    output_field=models.IntegerField()
                                ),
                                0,
                                output_field=models.IntegerField()
                            )
                        )

                    stdout.write(f'✅ {Model.__name__} の product_count を更新しました。')
                    
        except Exception as e:
            logger.error(f"エンティティカウント更新中にDBエラーが発生しロールバック: {e}")
            self.stdout.write(self.style.ERROR(f"エンティティカウント更新中にエラーが発生しました: {e}"))
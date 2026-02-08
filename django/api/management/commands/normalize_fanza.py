# -*- coding: utf-8 -*-
import json
import logging
from datetime import datetime

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import F, Count, OuterRef, Subquery, Value, IntegerField
from django.db.models.functions import Coalesce 
from django.utils import timezone
import traceback

# 修正したノーマライザーをインポート
from api.utils.adult.fanza_normalizer import normalize_fanza_data
# エンティティの作成・更新に使用するユーティリティをインポート
from api.utils.adult.entity_manager import get_or_create_entity 

# モデルのインポート
from api.models import RawApiData, AdultProduct, Genre, Actress, Director, Maker, Label, Series
from django.db import connection 

# ロガーのセットアップ
logger = logging.getLogger('normalize_fanza')

# エンティティモデルをマッピング
ENTITY_MAP = {
    'maker': Maker, 
    'label': Label,
    'series': Series,
    'director': Director,
    'genre': Genre, 
    'actress': Actress,
}

class Command(BaseCommand):
    help = 'FANZA APIから取得したRawデータをAdultProductテーブルに正規化し、リレーションを同期します。'
    API_SOURCE = 'FANZA'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            help='処理するRawApiDataのレコード数を制限します。',
        )

    def handle(self, *args, **options):
        """メインの処理ロジック"""
        
        logging.getLogger('api_utils').setLevel(logging.DEBUG) 
        self.stdout.write(self.style.NOTICE(f'--- {self.API_SOURCE} 正規化コマンドを開始します ---'))

        limit = options.get('limit')
        
        # 移行が完了していない RawApiData を取得
        # 最新の取得データ(IDが大きいもの)から順に処理することで鮮度を保つ
        raw_data_qs = RawApiData.objects.filter(
            api_source=self.API_SOURCE, 
            migrated=False 
        ).order_by('-id')

        if limit:
            raw_data_qs = raw_data_qs[:limit]

        total_batches = raw_data_qs.count()
        if total_batches == 0:
            self.stdout.write(self.style.SUCCESS('処理すべきRawレコードがありません。'))
            # 念のためカウント更新だけ走らせる
            self._update_all_product_counts()
            return

        self.stdout.write(self.style.NOTICE(f'処理対象のRawバッチデータ件数: {total_batches} 件'))

        # --------------------------------------------------------
        # RawApiDataのバッチごとの処理ループ
        # --------------------------------------------------------
        for i, raw_instance in enumerate(raw_data_qs):
            try:
                with transaction.atomic():
                    # 1. Rawバッチデータの処理と製品データの抽出
                    # normalize_fanza_data 内で詳細なパースが行われる
                    products_data_list, relations_data_list = normalize_fanza_data(raw_instance) 
                    
                    if not products_data_list:
                        raw_instance.migrated = True
                        raw_instance.updated_at = timezone.now()
                        raw_instance.save(update_fields=['migrated', 'updated_at'])
                        self.stdout.write(self.style.WARNING(f'⚠️ Rawバッチ ID {raw_instance.id} は有効な製品データがないためスキップしました。'))
                        continue

                    self.stdout.write(f'--- バッチ {i+1}/{total_batches} 処理開始 (RawID:{raw_instance.id} / {len(products_data_list)} 製品) ---')

                    # 2. エンティティの作成/更新
                    all_entities = {'Maker': set(), 'Label': set(), 'Director': set(), 'Series': set(), 'Genre': set(), 'Actress': set()}
                    
                    for product_data in products_data_list:
                        for key_name in ['maker', 'label', 'director', 'series']:
                            entity_name = product_data.get(key_name)
                            if entity_name:
                                all_entities[key_name.capitalize()].add(entity_name)

                    for relation in relations_data_list:
                        for genre_name in relation.get('genres', []):
                            all_entities['Genre'].add(genre_name)
                        for actress_name in relation.get('actresses', []):
                            all_entities['Actress'].add(actress_name)
                    
                    entity_pk_maps = {} 

                    for entity_type, names in all_entities.items():
                        if not names:
                            continue
                            
                        model = ENTITY_MAP[entity_type.lower()]
                        pk_map = get_or_create_entity(
                            model=model, 
                            names=list(names), 
                            api_source=self.API_SOURCE
                        )
                        entity_pk_maps[entity_type] = pk_map
                    
                    self.stdout.write(f'   -> {sum(len(v) for v in entity_pk_maps.values())} 件のエンティティ(マスタ)を同期しました。')

                    # 3. AdultProduct モデルインスタンスの準備
                    products_to_upsert = []
                    
                    for product_data in products_data_list:
                        for key_name in ['maker', 'label', 'director', 'series']:
                            entity_name = product_data.pop(key_name, None)
                            if entity_name:
                                fk_key = f'{key_name}_id'
                                pk = entity_pk_maps.get(key_name.capitalize(), {}).get(entity_name)
                                product_data[fk_key] = pk
                                
                        products_to_upsert.append(AdultProduct(**product_data))

                    # 4. AdultProductテーブルへの一括UPSERT
                    unique_fields = ['product_id_unique']
                    
                    # 更新対象フィールド（既存データがある場合、これらが上書きされる）
                    update_fields = [
                        'raw_data_id', 'title', 'affiliate_url', 'image_url_list',
                        'sample_movie_url', 'release_date', 'price', 
                        'maker_id', 'label_id', 'series_id', 'director_id', 
                        'updated_at'
                    ]
                    
                    AdultProduct.objects.bulk_create(
                        products_to_upsert,
                        update_conflicts=True,
                        unique_fields=unique_fields,
                        update_fields=update_fields,
                    )
                    
                    self.stdout.write(self.style.NOTICE(f'   -> AdultProductsテーブルに {len(products_to_upsert)} 件を保存/更新しました。'))

                    # 5. リレーションの同期 (Genre, Actress)
                    final_relations_list = []
                    for relation in relations_data_list:
                        new_rel = {'api_product_id': relation['api_product_id']}
                        
                        new_rel['genre_ids'] = [
                            entity_pk_maps['Genre'].get(name) 
                            for name in relation.get('genres', []) 
                            if entity_pk_maps.get('Genre', {}).get(name) is not None
                        ]
                        new_rel['actress_ids'] = [
                            entity_pk_maps['Actress'].get(name) 
                            for name in relation.get('actresses', [])
                            if entity_pk_maps.get('Actress', {}).get(name) is not None
                        ]
                        final_relations_list.append(new_rel)

                    # product_id_unique を使ってDB上のPKを逆引き
                    api_ids = [r['api_product_id'] for r in final_relations_list] 
                    db_products = AdultProduct.objects.filter(
                        api_source=self.API_SOURCE, 
                        product_id_unique__in=[f'{self.API_SOURCE}_{api_id}' for api_id in api_ids]
                    ).only('pk', 'product_id_unique')
                    
                    product_pk_map = {
                        p.product_id_unique.split('_')[-1]: p.pk 
                        for p in db_products
                    }
                    
                    self._synchronize_relations(final_relations_list, product_pk_map)
                    
                    # 6. 移行済みとしてマーク
                    raw_instance.migrated = True
                    raw_instance.updated_at = timezone.now()
                    raw_instance.save(update_fields=['migrated', 'updated_at'])
                    self.stdout.write(self.style.SUCCESS(f'✅ バッチ処理完了 (RawID:{raw_instance.id})'))

            except Exception as e:
                logger.error(f"Rawバッチ ID {raw_instance.id} で致命的なエラー: {e}")
                logger.debug(f"Stack trace: {traceback.format_exc()}")
                continue 

        # 7. 各マスタの出演作数などのカウントを更新
        self._update_all_product_counts()
        self.stdout.write(self.style.SUCCESS(f'--- {self.API_SOURCE} 正規化処理をすべて完了しました ---'))


    def _synchronize_relations(self, relations_list: list[dict], product_pk_map: dict):
        """ジャンルと女優の多対多リレーションを最新状態に同期"""
        product_pks = list(product_pk_map.values())
        if not product_pks:
            return

        genre_through_table = AdultProduct.genres.through._meta.db_table
        actress_through_table = AdultProduct.actresses.through._meta.db_table
        adult_product_fk_name = 'adultproduct_id' 

        with connection.cursor() as cursor:
            # 一度既存の紐付けを削除してから一括挿入（もっとも確実な同期方法）
            placeholders = ','.join(['%s'] * len(product_pks))
            cursor.execute(f"DELETE FROM {genre_through_table} WHERE {adult_product_fk_name} IN ({placeholders})", product_pks)
            cursor.execute(f"DELETE FROM {actress_through_table} WHERE {adult_product_fk_name} IN ({placeholders})", product_pks)
        
        genre_relations = []
        actress_relations = []
        GenreThroughModel = AdultProduct.genres.through
        ActressThroughModel = AdultProduct.actresses.through
        
        for rel in relations_list:
            product_pk = product_pk_map.get(rel['api_product_id'])
            if not product_pk:
                continue

            for genre_id in rel['genre_ids']:
                genre_relations.append(GenreThroughModel(**{adult_product_fk_name: product_pk, 'genre_id': genre_id}))

            for actress_id in rel['actress_ids']:
                actress_relations.append(ActressThroughModel(**{adult_product_fk_name: product_pk, 'actress_id': actress_id}))

        GenreThroughModel.objects.bulk_create(genre_relations, ignore_conflicts=True)
        ActressThroughModel.objects.bulk_create(actress_relations, ignore_conflicts=True)


    def _update_all_product_counts(self):
        """統計情報の更新処理"""
        try:
            with transaction.atomic():
                self.update_product_counts(self.stdout)
        except Exception as e:
            logger.error(f"統計カウント更新エラー: {e}")


    def update_product_counts(self, stdout):
        """各マスタ（女優、ジャンル等）に紐付く有効な商品数を集計して反映"""
        stdout.write(self.style.NOTICE('\n--- product_count (統計情報) を更新中 ---'))
        adult_product_fk_name = 'adultproduct_id'
        
        # 女優ごとの作品数集計
        actress_count_sq = Subquery(
            AdultProduct.actresses.through.objects
            .filter(actress_id=OuterRef('pk'))
            .values('actress_id')
            .annotate(count=Count(adult_product_fk_name))
            .values('count'),
            output_field=IntegerField()
        )
        Actress.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(actress_count_sq, Value(0), output_field=IntegerField())
        )

        # ジャンルごとの作品数集計
        genre_count_sq = Subquery(
            AdultProduct.genres.through.objects
            .filter(genre_id=OuterRef('pk'))
            .values('genre_id')
            .annotate(count=Count(adult_product_fk_name))
            .values('count'),
            output_field=IntegerField()
        )
        Genre.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(genre_count_sq, Value(0), output_field=IntegerField())
        )

        # メーカー、レーベル、シリーズ、監督 (ForeignKey)
        for model_name, model in [('maker', Maker), ('label', Label), ('series', Series), ('director', Director)]:
            count_sq = Subquery(
                AdultProduct.objects
                .filter(**{f'{model_name}_id': OuterRef('pk'), 'api_source': self.API_SOURCE})
                .values(f'{model_name}_id')
                .annotate(count=Count('id'))
                .values('count'),
                output_field=IntegerField()
            )
            model.objects.filter(api_source=self.API_SOURCE).update(
                product_count=Coalesce(count_sq, Value(0), output_field=IntegerField())
            )
        stdout.write(self.style.SUCCESS(' ✅ 統計情報の更新が完了しました。'))
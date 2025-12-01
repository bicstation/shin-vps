import json
import logging
from datetime import datetime

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import F, Count, OuterRef, Subquery, Value, IntegerField
from django.db.models.functions import Coalesce 
from django.utils import timezone
from api.utils.fanza_normalizer import normalize_fanza_data
# get_or_create_entity を使用してエンティティの作成・更新を行う
from api.utils.entity_manager import get_or_create_entity 

from api.models import RawApiData, Product, Genre, Actress, Director, Maker, Label, Series
from django.db import connection # _synchronize_relations で使用


# ロガーのセットアップ
logger = logging.getLogger('normalize_fanza')

# エンティティモデルをマッピング
ENTITY_MAP = {
    'maker_id': Maker,
    'label_id': Label,
    'series_id': Series,
    'director_id': Director,
    'genres': Genre,
    'actresses': Actress,
}


class Command(BaseCommand):
    help = 'FANZA APIから取得したRawデータをProductsテーブルに正規化し、リレーションを同期します。'
    API_SOURCE = 'FANZA'
    BATCH_SIZE = 100 

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            help='処理するRawApiDataのレコード数を制限します。',
        )

    def handle(self, *args, **options):
        """メインの処理ロジック"""
        
        # api_utilsロガーのレベルを強制的にDEBUGに設定
        import logging
        logging.getLogger('api_utils').setLevel(logging.DEBUG) 

        self.stdout.write(self.style.NOTICE(f'--- {self.API_SOURCE} 正規化コマンドを開始します ---'))

        limit = options.get('limit')
        
        # 移行が完了していない RawApiData を取得
        raw_data_qs = RawApiData.objects.filter(
            api_source=self.API_SOURCE, 
            migrated=False # ★ このフィルタリングで前回取得したデータを見つけます
        ).order_by('id')

        if limit:
            raw_data_qs = raw_data_qs[:limit]

        total_batches = raw_data_qs.count()
        if total_batches == 0:
            self.stdout.write(self.style.SUCCESS('処理すべきRawレコードがありません。'))
            return

        self.stdout.write(self.style.NOTICE(f'処理対象のRawバッチデータ件数: {total_batches} 件'))

        # --------------------------------------------------------
        # RawApiDataのバッチごとの処理ループ
        # --------------------------------------------------------
        for i, raw_instance in enumerate(raw_data_qs):
            try:
                # 個々のRawバッチ処理を独立した atomic ブロックで囲む
                with transaction.atomic():
                    
                    # --------------------------------------------------------
                    # 1. Rawバッチデータの処理と製品データの抽出
                    # --------------------------------------------------------
                    # normalize_fanza_data は、エンティティの *名前* と *Product* のデータ（FKはまだNULL）を返す想定
                    products_data_list, relations_data_list = normalize_fanza_data(raw_instance)
                    
                    if not products_data_list:
                        # RawApiDataを移行済みとしてマーク
                        raw_instance.migrated = True
                        raw_instance.updated_at = timezone.now()
                        raw_instance.save(update_fields=['migrated', 'updated_at'])
                        self.stdout.write(self.style.WARNING(f'⚠️ Rawバッチ ID {raw_instance.id} はデータ不備のためスキップ・マークしました。'))
                        continue

                    self.stdout.write(f'--- バッチ {i+1}/{total_batches} 処理開始 ({len(products_data_list)} 製品) ---')

                    # --------------------------------------------------------
                    # 2. エンティティの作成/更新と Product データへの PK 割り当て (Maker, Label, etc.)
                    # --------------------------------------------------------
                    
                    # すべてのエンティティ名を集約して一括処理するための辞書
                    all_entities = {'Maker': set(), 'Label': set(), 'Director': set(), 'Series': set(), 'Genre': set(), 'Actress': set()}
                    
                    for product_data in products_data_list:
                        # 単一リレーション (Maker, Label, Director, Series) の名前を収集
                        for key_name in ['maker', 'label', 'director', 'series']:
                            entity_name = product_data.get(key_name)
                            if entity_name:
                                all_entities[key_name.capitalize()].add(entity_name)

                    for relation in relations_data_list:
                        # 複数リレーション (Genre, Actress) の名前を収集
                        for genre_name in relation.get('genres', []):
                            all_entities['Genre'].add(genre_name)
                        for actress_name in relation.get('actresses', []):
                            all_entities['Actress'].add(actress_name)
                    
                    # エンティティの一括 get_or_create
                    entity_pk_maps = {} # {'Maker': {'メーカーA': 1, ...}, 'Genre': {...}}

                    for entity_type, names in all_entities.items():
                        if names:
                            model = ENTITY_MAP[f'{entity_type.lower()}s'] if entity_type in ['Genre', 'Actress'] else ENTITY_MAP[f'{entity_type.lower()}_id']
                            # api_utils.entity_manager.get_or_create_entity を使用してエンティティを作成/更新
                            pk_map = get_or_create_entity(
                                model=model, 
                                names=list(names), 
                                api_source=self.API_SOURCE
                            )
                            entity_pk_maps[entity_type] = pk_map
                    
                    self.stdout.write(f'  -> {sum(len(v) for v in entity_pk_maps.values())} 件のエンティティを作成/更新しました。')

                    # --------------------------------------------------------
                    # 3. Product モデルインスタンスの準備とリレーションIDの割り当て
                    # --------------------------------------------------------
                    products_to_upsert = []
                    
                    for product_data in products_data_list:
                        # 外部キーIDを Product データに設定
                        for key_name in ['maker', 'label', 'director', 'series']:
                            entity_name = product_data.pop(key_name, None)
                            if entity_name:
                                fk_key = f'{key_name}_id'
                                # エンティティが作成/取得されていればPKを割り当てる
                                pk = entity_pk_maps.get(key_name.capitalize(), {}).get(entity_name)
                                product_data[fk_key] = pk
                        
                        # Product インスタンスを生成
                        products_to_upsert.append(Product(**product_data))

                    # --------------------------------------------------------
                    # 4. Productテーブルへの一括UPSERT
                    # --------------------------------------------------------
                    
                    # Product.objects.bulk_create を使用して一括 UPSERT を実行
                    unique_fields = ['product_id_unique']
                    update_fields = [
                        'raw_data', 'title', 'affiliate_url', 'image_url_list',
                        'release_date', 'price', 
                        'maker', 'label', 'series', 'director', 
                        'updated_at'
                    ]
                    
                    # raw_data_id, maker_id などのフィールド名に修正 (raw_data, makerなどではエラーになる)
                    update_fields = [f'{f}_id' if f in ['raw_data', 'maker', 'label', 'series', 'director'] else f for f in update_fields]
                    
                    Product.objects.bulk_create(
                        products_to_upsert,
                        update_conflicts=True,
                        unique_fields=unique_fields,
                        update_fields=update_fields,
                    )
                    
                    self.stdout.write(self.style.NOTICE(f'  -> Productsテーブルに {len(products_to_upsert)} 件をUPSERTしました。'))

                    # --------------------------------------------------------
                    # 5. リレーションの同期 (Genre, Actress)
                    # --------------------------------------------------------
                    
                    # リレーションリストを中間テーブルIDに変換
                    final_relations_list = []
                    for relation in relations_data_list:
                        new_rel = {'api_product_id': relation['api_product_id']}
                        
                        # Genre IDの割り当て
                        new_rel['genre_ids'] = [
                            entity_pk_maps['Genre'].get(name) 
                            for name in relation.get('genres', []) 
                            if entity_pk_maps['Genre'].get(name) is not None
                        ]
                        # Actress IDの割り当て
                        new_rel['actress_ids'] = [
                            entity_pk_maps['Actress'].get(name) 
                            for name in relation.get('actresses', [])
                            if entity_pk_maps['Actress'].get(name) is not None
                        ]
                        final_relations_list.append(new_rel)

                    api_ids = [r['api_product_id'] for r in final_relations_list] 
                    db_products = Product.objects.filter(api_source=self.API_SOURCE, product_id_unique__in=[
                        f'{self.API_SOURCE}_{api_id}' for api_id in api_ids
                    ])
                    
                    # {api_product_id: db_pk} のマップを作成
                    product_pk_map = {
                        p.product_id_unique.split('_')[-1]: p.pk 
                        for p in db_products
                    }
                    
                    self._synchronize_relations(final_relations_list, product_pk_map)
                    
                    # --------------------------------------------------------
                    # 6. 移行済みとしてマーク (RawApiDataテーブルの更新)
                    # --------------------------------------------------------
                    raw_instance.migrated = True
                    raw_instance.updated_at = timezone.now()
                    raw_instance.save(update_fields=['migrated', 'updated_at'])
                    self.stdout.write(self.style.SUCCESS(f'✅ Rawバッチ ID {raw_instance.id} を移行済みとしてマークしました。'))

            except Exception as e:
                # この atomic ブロック内でエラーが発生した場合、このバッチはロールバックされる。
                logger.error(f"Rawバッチ ID {raw_instance.id} の処理中に致命的なエラーが発生しました: {e}")
                import traceback
                logger.debug(f"Stack trace: {traceback.format_exc()}")
                continue # 次の Raw バッチへ

        # --------------------------------------------------------
        # 7. 関連エンティティの product_count を更新 (独立したトランザクション内)
        # --------------------------------------------------------
        try:
            with transaction.atomic():
                self.update_product_counts(self.stdout)
        except Exception as e:
            logger.error(f"product_count の更新中に致命的なエラーが発生しました: {e}")
        
        self.stdout.write(self.style.SUCCESS(f'--- {self.API_SOURCE} 正規化コマンドが完了しました ---'))


    def _synchronize_relations(self, relations_list: list[dict], product_pk_map: dict):
        """
        GenreとActressのリレーションを同期します。
        """
        product_pks = list(product_pk_map.values())
        
        if not product_pks:
            return

        # --------------------------------------------------------
        # 1. 既存リレーションの削除 (高速化のためRaw SQL風に実行)
        # --------------------------------------------------------
        
        from django.db import connection
        with connection.cursor() as cursor:
            # PostgreSQLでIN句のプレースホルダにリストを渡す一般的な方法
            placeholders = ','.join(['%s'] * len(product_pks))
            
            # product_genre
            cursor.execute(f"DELETE FROM product_genre WHERE product_id IN ({placeholders})", product_pks)
            # product_actress
            cursor.execute(f"DELETE FROM product_actress WHERE product_id IN ({placeholders})", product_pks)
        
        self.stdout.write(f'  -> 既存リレーション（ジャンル, 女優）を {len(product_pks)} 製品分削除しました。')

        # --------------------------------------------------------
        # 2. 新規リレーションの一括挿入
        # --------------------------------------------------------
        genre_relations = []
        actress_relations = []
        
        for rel in relations_list:
            # product_pk_map のキーは api_product_id (例: 'yss124')
            product_pk = product_pk_map.get(rel['api_product_id'])
            if not product_pk:
                continue

            # ジャンル
            for genre_id in rel['genre_ids']: # ここはID（PK）である必要がある
                genre_relations.append(
                    Product.genres.through(product_id=product_pk, genre_id=genre_id)
                )

            # 女優
            for actress_id in rel['actress_ids']: # ここはID（PK）である必要がある
                actress_relations.append(
                    Product.actresses.through(product_id=product_pk, actress_id=actress_id)
                )

        # 衝突は無視して挿入
        Product.genres.through.objects.bulk_create(genre_relations, ignore_conflicts=True)
        Product.actresses.through.objects.bulk_create(actress_relations, ignore_conflicts=True)
        
        self.stdout.write(f'  -> リレーション（ジャンル: {len(genre_relations)} 件, 女優: {len(actress_relations)} 件）を挿入しました。')


    def update_product_counts(self, stdout):
        """
        関連エンティティテーブルの product_count カラムを中間テーブルの件数に基づいて更新する。
        """
        stdout.write(self.style.NOTICE('\n--- 関連エンティティの product_count を更新中 ---'))
        
        # 1. 女優 (Actress) のカウント更新
        actress_count_sq = Subquery(
            Product.actresses.through.objects
            .filter(actress_id=OuterRef('pk'))
            .values('actress_id')
            .annotate(count=Count('product_id'))
            .values('count'),
            output_field=IntegerField()
        )
        Actress.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(actress_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> 女優のカウントを更新しました。'))

        # 2. ジャンル (Genre) のカウント更新
        genre_count_sq = Subquery(
            Product.genres.through.objects
            .filter(genre_id=OuterRef('pk'))
            .values('genre_id')
            .annotate(count=Count('product_id'))
            .values('count'),
            output_field=IntegerField()
        )
        Genre.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(genre_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> ジャンルのカウントを更新しました。'))

        # 3. メーカー (Maker) のカウント更新
        maker_count_sq = Subquery(
            Product.objects
            .filter(maker_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('maker_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        Maker.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(maker_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> メーカーのカウントを更新しました。'))
        
        # 4. レーベル (Label) のカウント更新
        label_count_sq = Subquery(
            Product.objects
            .filter(label_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('label_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        Label.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(label_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> レーベルのカウントを更新しました。'))

        # 5. シリーズ (Series) のカウント更新
        series_count_sq = Subquery(
            Product.objects
            .filter(series_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('series_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        Series.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(series_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> シリーズのカウントを更新しました。'))

        # 6. 監督 (Director) のカウント更新
        director_count_sq = Subquery(
            Product.objects
            .filter(director_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('director_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        Director.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(director_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> 監督のカウントを更新しました。'))
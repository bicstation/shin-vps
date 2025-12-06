import json
import logging
from datetime import datetime

from django.core.management.base import BaseCommand
from django.db import transaction
# F, Count, OuterRef, Subquery, Coalesce など、集計に必要なモジュールをインポート
from django.db.models import F, Count, OuterRef, Subquery, Value, IntegerField
from django.db.models.functions import Coalesce 
from django.utils import timezone
# normalize_fanza_data は、RawApiDataインスタンスをそのまま受け取るシンプルなシグネチャを想定する
from api.utils.fanza_normalizer import normalize_fanza_data
# エンティティの作成・更新に使用するユーティリティをインポート
from api.utils.entity_manager import get_or_create_entity 

# ★修正: Product を AdultProduct に変更★
from api.models import RawApiData, AdultProduct, Genre, Actress, Director, Maker, Label, Series
from django.db import connection # _synchronize_relations で Raw SQL を使用
import traceback # デバッグのためにインポート

# ロガーのセットアップ
logger = logging.getLogger('normalize_fanza')

# エンティティモデルをマッピング (管理コマンド内で使用)
ENTITY_MAP = {
    # 単一リレーション (FK)
    'maker': Maker, # 'maker_id' ではなくキー名をそのまま使用
    'label': Label,
    'series': Series,
    'director': Director,
    # 複数リレーション (M2M)
    'genre': Genre, # M2Mでも単数形を使用
    'actress': Actress,
}


class Command(BaseCommand):
    help = 'FANZA APIから取得したRawデータをAdultProductテーブルに正規化し、リレーションを同期します。' # ヘルプメッセージも変更
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
        logging.getLogger('api_utils').setLevel(logging.DEBUG) 

        self.stdout.write(self.style.NOTICE(f'--- {self.API_SOURCE} 正規化コマンドを開始します ---'))

        limit = options.get('limit')
        
        # 移行が完了していない RawApiData を取得
        raw_data_qs = RawApiData.objects.filter(
            api_source=self.API_SOURCE, 
            migrated=False # 未移行のレコードのみをフィルタリング
        ).order_by('id')

        if limit:
            raw_data_qs = raw_data_qs[:limit]

        total_batches = raw_data_qs.count()
        if total_batches == 0:
            self.stdout.write(self.style.SUCCESS('処理すべきRawレコードがありません。'))
            # 念のため、product_countは更新
            self._update_all_product_counts()
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
                    
                    # RawApiDataインスタンスをそのまま渡し、デコードは normalize_fanza_data 側で行う
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
                    
                    # 製品データから単一リレーションの名前を収集
                    for product_data in products_data_list:
                        for key_name in ['maker', 'label', 'director', 'series']:
                            entity_name = product_data.get(key_name)
                            if entity_name:
                                # Maker, Label, Director, Series
                                all_entities[key_name.capitalize()].add(entity_name)

                    # リレーションデータから複数リレーションの名前を収集
                    for relation in relations_data_list:
                        # Genre
                        for genre_name in relation.get('genres', []):
                            all_entities['Genre'].add(genre_name)
                        # Actress
                        for actress_name in relation.get('actresses', []):
                            all_entities['Actress'].add(actress_name)
                    
                    # エンティティの一括 get_or_create
                    entity_pk_maps = {} # {'Maker': {'メーカーA': 1, ...}, 'Genre': {...}}

                    for entity_type, names in all_entities.items():
                        if not names:
                            continue
                            
                        # ENTITY_MAP から適切なモデルを取得
                        model = ENTITY_MAP[entity_type.lower()]
                        
                        # api_utils.entity_manager.get_or_create_entity を使用してエンティティを作成/更新
                        pk_map = get_or_create_entity(
                            model=model, 
                            names=list(names), 
                            api_source=self.API_SOURCE
                        )
                        entity_pk_maps[entity_type] = pk_map
                    
                    self.stdout.write(f'  -> {sum(len(v) for v in entity_pk_maps.values())} 件のエンティティを作成/更新しました。')

                    # --------------------------------------------------------
                    # 3. AdultProduct モデルインスタンスの準備とリレーションIDの割り当て
                    # --------------------------------------------------------
                    products_to_upsert = []
                    
                    for product_data in products_data_list:
                        # 外部キーIDを Product データに設定
                        for key_name in ['maker', 'label', 'director', 'series']:
                            # 一時的なフィールドをポップし、FK IDを割り当て
                            entity_name = product_data.pop(key_name, None)
                            if entity_name:
                                fk_key = f'{key_name}_id'
                                # エンティティが作成/取得されていればPKを割り当てる
                                pk = entity_pk_maps.get(key_name.capitalize(), {}).get(entity_name)
                                product_data[fk_key] = pk
                                
                        # Product インスタンスを生成
                        # ★修正: AdultProduct に変更★
                        products_to_upsert.append(AdultProduct(**product_data))

                    # --------------------------------------------------------
                    # 4. AdultProductテーブルへの一括UPSERT
                    # --------------------------------------------------------
                    
                    unique_fields = ['product_id_unique']
                    
                    update_fields = [
                        'raw_data_id', 'title', 'affiliate_url', 'image_url_list',
                        'release_date', 'price', 
                        'maker_id', 'label_id', 'series_id', 'director_id', 
                        'updated_at'
                    ]
                    
                    # ★修正: AdultProduct に変更★
                    AdultProduct.objects.bulk_create(
                        products_to_upsert,
                        update_conflicts=True,
                        unique_fields=unique_fields,
                        update_fields=update_fields,
                    )
                    
                    self.stdout.write(self.style.NOTICE(f'  -> AdultProductsテーブルに {len(products_to_upsert)} 件をUPSERTしました。'))

                    # --------------------------------------------------------
                    # 5. リレーションの同期 (Genre, Actress)
                    # --------------------------------------------------------
                    
                    # リレーションリストを中間テーブルIDに変換
                    final_relations_list = []
                    for relation in relations_data_list:
                        new_rel = {'api_product_id': relation['api_product_id']}
                        
                        # Genre IDの割り当て (名前をPKに変換)
                        new_rel['genre_ids'] = [
                            entity_pk_maps['Genre'].get(name) 
                            for name in relation.get('genres', []) 
                            if entity_pk_maps.get('Genre', {}).get(name) is not None
                        ]
                        # Actress IDの割り当て (名前をPKに変換)
                        new_rel['actress_ids'] = [
                            entity_pk_maps['Actress'].get(name) 
                            for name in relation.get('actresses', [])
                            if entity_pk_maps.get('Actress', {}).get(name) is not None
                        ]
                        final_relations_list.append(new_rel)

                    # UPSERTされたAdultProductのDB PKを取得
                    api_ids = [r['api_product_id'] for r in final_relations_list] 
                    # ★修正: AdultProduct を参照★
                    db_products = AdultProduct.objects.filter(
                        api_source=self.API_SOURCE, 
                        product_id_unique__in=[f'{self.API_SOURCE}_{api_id}' for api_id in api_ids]
                    ).only('pk', 'product_id_unique') # 必要なフィールドのみ取得
                    
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
                logger.debug(f"Stack trace: {traceback.format_exc()}")
                
                # ロールバック後に次の Raw バッチへ
                continue 

        # --------------------------------------------------------
        # 7. 関連エンティティの product_count を更新 (独立したトランザクション内)
        # --------------------------------------------------------
        self._update_all_product_counts()
        
        self.stdout.write(self.style.SUCCESS(f'--- {self.API_SOURCE} 正規化コマンドが完了しました ---'))


    def _synchronize_relations(self, relations_list: list[dict], product_pk_map: dict):
        """
        GenreとActressのリレーションを同期します。
        Raw SQL を使用して、既存リレーションを削除し、新規リレーションを一括挿入することで高速化を図ります。
        """
        product_pks = list(product_pk_map.values())
        
        if not product_pks:
            return

        # --------------------------------------------------------
        # 1. 既存リレーションの削除 (Raw SQL を使用して高速化)
        # --------------------------------------------------------
        
        # 中間テーブルの名前を取得
        # ★修正: AdultProduct の中間テーブルを参照★
        genre_through_table = AdultProduct.genres.through._meta.db_table
        actress_through_table = AdultProduct.actresses.through._meta.db_table

        # ★注意: AdultProduct の FK フィールド名は adultproduct_id に変わっている可能性があります★
        adult_product_fk_name = 'adultproduct_id' # AdultProduct の中間テーブルでの FK 名

        with connection.cursor() as cursor:
            # PostgreSQLの Unnest ではなく、通常の IN 句を使用
            placeholders = ','.join(['%s'] * len(product_pks))
            
            # product_genre -> adultproduct_genre
            # ★修正: product_id -> adultproduct_id に変更して Raw SQL を実行★
            cursor.execute(f"DELETE FROM {genre_through_table} WHERE {adult_product_fk_name} IN ({placeholders})", product_pks)
            # product_actress -> adultproduct_actress
            # ★修正: product_id -> adultproduct_id に変更して Raw SQL を実行★
            cursor.execute(f"DELETE FROM {actress_through_table} WHERE {adult_product_fk_name} IN ({placeholders})", product_pks)
        
        self.stdout.write(f'  -> 既存リレーション（ジャンル, 女優）を {len(product_pks)} 製品分削除しました。')

        # --------------------------------------------------------
        # 2. 新規リレーションの一括挿入
        # --------------------------------------------------------
        genre_relations = []
        actress_relations = []
        
        # ★修正: AdultProduct の中間テーブルを参照★
        GenreThroughModel = AdultProduct.genres.through
        ActressThroughModel = AdultProduct.actresses.through
        
        for rel in relations_list:
            # product_pk_map のキーは api_product_id (例: 'yss124')
            product_pk = product_pk_map.get(rel['api_product_id'])
            if not product_pk:
                continue

            # ジャンル
            for genre_id in rel['genre_ids']: # ここはID（PK）である必要がある
                genre_relations.append(
                    # ★修正: AdultProduct の中間テーブルを参照し、フィールド名を adultproduct_id に変更★
                    GenreThroughModel(**{adult_product_fk_name: product_pk, 'genre_id': genre_id})
                )

            # 女優
            for actress_id in rel['actress_ids']: # ここはID（PK）である必要がある
                actress_relations.append(
                    # ★修正: AdultProduct の中間テーブルを参照し、フィールド名を adultproduct_id に変更★
                    ActressThroughModel(**{adult_product_fk_name: product_pk, 'actress_id': actress_id})
                )

        # 衝突は無視して挿入
        # ★修正: AdultProduct の中間テーブルを参照★
        GenreThroughModel.objects.bulk_create(genre_relations, ignore_conflicts=True)
        ActressThroughModel.objects.bulk_create(actress_relations, ignore_conflicts=True)
        
        self.stdout.write(f'  -> リレーション（ジャンル: {len(genre_relations)} 件, 女優: {len(actress_relations)} 件）を挿入しました。')


    def _update_all_product_counts(self):
        """
        関連エンティティテーブルの product_count カラムを中間テーブルの件数に基づいて更新するラッパー
        """
        try:
            with transaction.atomic():
                self.update_product_counts(self.stdout)
        except Exception as e:
            logger.error(f"product_count の更新中に致命的なエラーが発生しました: {e}")


    def update_product_counts(self, stdout):
        """
        関連エンティティテーブルの product_count カラムを中間テーブルの件数に基づいて更新する。
        """
        stdout.write(self.style.NOTICE('\n--- 関連エンティティの product_count を更新中 ---'))
        
        # --------------------------------------------------------
        # 中間テーブルの AdultProduct 側の FK 名を取得
        # --------------------------------------------------------
        adult_product_fk_name = 'adultproduct_id'
        
        # 1. 女優 (Actress) のカウント更新
        # ★修正: AdultProduct の中間テーブルを参照し、フィルタリングフィールドも変更★
        actress_count_sq = Subquery(
            AdultProduct.actresses.through.objects
            .filter(actress_id=OuterRef('pk'))
            .values('actress_id')
            .annotate(count=Count(adult_product_fk_name)) # カウント対象も adultproduct_id に変更
            .values('count'),
            output_field=IntegerField()
        )
        Actress.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(actress_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> 女優のカウントを更新しました。'))

        # 2. ジャンル (Genre) のカウント更新
        # ★修正: AdultProduct の中間テーブルを参照し、フィルタリングフィールドも変更★
        genre_count_sq = Subquery(
            AdultProduct.genres.through.objects
            .filter(genre_id=OuterRef('pk'))
            .values('genre_id')
            .annotate(count=Count(adult_product_fk_name)) # カウント対象も adultproduct_id に変更
            .values('count'),
            output_field=IntegerField()
        )
        Genre.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(genre_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> ジャンルのカウントを更新しました。'))

        # 3. メーカー (Maker) のカウント更新
        # ★修正: AdultProduct を参照★
        maker_count_sq = Subquery(
            AdultProduct.objects
            .filter(maker_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('maker_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        Maker.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(maker_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> メーカーのカウントを更新しました。'))
        
        # 4. レーベル (Label) のカウント更新
        # ★修正: AdultProduct を参照★
        label_count_sq = Subquery(
            AdultProduct.objects
            .filter(label_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('label_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        Label.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(label_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> レーベルのカウントを更新しました。'))

        # 5. シリーズ (Series) のカウント更新
        # ★修正: AdultProduct を参照★
        series_count_sq = Subquery(
            AdultProduct.objects
            .filter(series_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('series_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        Series.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(series_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> シリーズのカウントを更新しました。'))

        # 6. 監督 (Director) のカウント更新
        # ★修正: AdultProduct を参照★
        director_count_sq = Subquery(
            AdultProduct.objects
            .filter(director_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('director_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        Director.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(director_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> 監督のカウントを更新しました。'))
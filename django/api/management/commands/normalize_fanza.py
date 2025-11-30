import json
import logging
from datetime import datetime

from django.core.management.base import BaseCommand
from django.db import transaction
# Coalesce を追加
from django.db.models import F, Count, OuterRef, Subquery, Value, IntegerField
from django.db.models.functions import Coalesce 
from django.utils import timezone

from api.models import RawApiData, Product, Genre, Actress, Director, Maker, Label, Series
# api.utilsは修正済みと仮定
from api.utils import get_or_create_entity, normalize_fanza_data 

# ロガーのセットアップ
logger = logging.getLogger('normalize_fanza')

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

    # ★★★ 修正: @transaction.atomic を削除し、ループ内で個別にトランザクションを管理 ★★★
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
            migrated=False
        ).order_by('id')

        if limit:
            raw_data_qs = raw_data_qs[:limit]

        total_batches = raw_data_qs.count()
        if total_batches == 0:
            self.stdout.write(self.style.SUCCESS('処理すべきRawレコードがありません。'))
            return

        self.stdout.write(self.style.NOTICE(f'処理対象のRawバッチデータ件数: {total_batches} 件'))

        raw_ids_to_mark = []
        
        for i, raw_instance in enumerate(raw_data_qs):
            try:
                # ★★★ 修正: 個々のRawバッチ処理を独立した atomic ブロックで囲む ★★★
                with transaction.atomic():
                    
                    # --------------------------------------------------------
                    # 1. Rawバッチデータの処理と製品データの抽出
                    # --------------------------------------------------------
                    
                    products_data_list, relations_list = normalize_fanza_data(raw_instance)
                    
                    if not products_data_list:
                        logger.warning(f"Raw ID {raw_instance.id} から製品データを抽出できませんでした。スキップします。")
                        raw_ids_to_mark.append(raw_instance.id)
                        # このトランザクションをコミットして終了
                        continue

                    self.stdout.write(f'--- バッチ {i+1}/{total_batches} 処理開始 ({len(products_data_list)} 製品) ---')

                    # --------------------------------------------------------
                    # 2. Product モデルインスタンスの準備
                    # --------------------------------------------------------
                    
                    products_to_upsert = []
                    for product_data in products_data_list:
                        products_to_upsert.append(Product(**product_data))

                    # --------------------------------------------------------
                    # 3. Productテーブルへの一括UPSERT
                    # --------------------------------------------------------
                    
                    # 一意性のフィールド: product_id_unique
                    unique_fields = ['product_id_unique']
                    
                    # Productモデルに存在するコアフィールドのみに絞り込み
                    update_fields = [
                        'raw_data_id', 'title', 'affiliate_url', 'image_url_list',
                        'release_date', 'price', 
                        'maker_id', 'label_id', 'series_id', 'director_id', 
                        'updated_at'
                    ]
                    
                    # bulk_createで一括UPSERT
                    Product.objects.bulk_create(
                        products_to_upsert,
                        update_conflicts=True,
                        unique_fields=unique_fields,
                        update_fields=update_fields,
                    )

                    self.stdout.write(self.style.NOTICE(f'  -> Productsテーブルに {len(products_to_upsert)} 件をUPSERTしました。'))

                    # --------------------------------------------------------
                    # 4. リレーションの同期 (Genre, Actress)
                    # --------------------------------------------------------
                    
                    api_ids = [r['api_product_id'] for r in relations_list] 
                    db_products = Product.objects.filter(api_source=self.API_SOURCE, product_id_unique__in=[
                        # product_id_uniqueは 'FANZA_yss124' の形式
                        f'{self.API_SOURCE}_{api_id}' for api_id in api_ids
                    ])
                    
                    # {api_product_id: db_pk} のマップを作成
                    product_pk_map = {
                        p.product_id_unique.split('_')[-1]: p.pk 
                        for p in db_products
                    }
                    
                    self._synchronize_relations(relations_list, product_pk_map)
                    
                    # --------------------------------------------------------
                    # 5. 移行済みとしてマーク (RawApiDataテーブルの更新)
                    # --------------------------------------------------------
                    # ループ内で個別にマークする
                    raw_instance.migrated = True
                    raw_instance.updated_at = timezone.now()
                    raw_instance.save(update_fields=['migrated', 'updated_at'])
                    self.stdout.write(self.style.SUCCESS(f'✅ Rawバッチ ID {raw_instance.id} を移行済みとしてマークしました。'))

            except Exception as e:
                # この atomic ブロック内でエラーが発生した場合、このバッチはロールバックされる。
                # 外側の処理には影響しないため、次のループへ進める。
                logger.error(f"Rawバッチ ID {raw_instance.id} の処理中に致命的なエラーが発生しました: {e}")
                import traceback
                logger.debug(f"Stack trace: {traceback.format_exc()}")
                continue # 次の Raw バッチへ

        # --------------------------------------------------------
        # 6. 関連エンティティの product_count を更新 (独立したトランザクション内)
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
        product_pks = product_pk_map.values()
        
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
            cursor.execute(f"DELETE FROM product_genre WHERE product_id IN ({placeholders})", list(product_pks))
            # product_actress
            cursor.execute(f"DELETE FROM product_actress WHERE product_id IN ({placeholders})", list(product_pks))
        
        self.stdout.write(f'  -> 既存リレーション（ジャンル, 女優）を {len(product_pks)} 製品分削除しました。')

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
            for genre_id in rel['genre_ids']:
                genre_relations.append(
                    Product.genres.through(product_id=product_pk, genre_id=genre_id)
                )

            # 女優
            for actress_id in rel['actress_ids']:
                actress_relations.append(
                    Product.actresses.through(product_id=product_pk, actress_id=actress_id)
                )

        Product.genres.through.objects.bulk_create(genre_relations, ignore_conflicts=True)
        Product.actresses.through.objects.bulk_create(actress_relations, ignore_conflicts=True)
        
        self.stdout.write(f'  -> リレーション（ジャンル: {len(genre_relations)} 件, 女優: {len(actress_relations)} 件）を挿入しました。')


    def update_product_counts(self, stdout):
        """
        関連エンティティテーブルの product_count カラムを中間テーブルの件数に基づいて更新する。
        Coalesce関数を使用して、サブクエリ結果がNULLの場合は0を設定する。
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
        # Coalesceを使ってNULL値を0に変換
        Actress.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(actress_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> 女優のカウントを更新しました。'))

        # 2. ジャンル (Genre) のカウント更新
        genre_count_sq = Subquery(
            Product.genres.through.objects
            .filter(genre_id=OuterRef('pk'))
            .values('genre_id')
            .annotate(count=Count('product_id'))
            .values('count'),
            output_field=IntegerField()
        )
        # Coalesceを使ってNULL値を0に変換
        Genre.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(genre_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> ジャンルのカウントを更新しました。'))

        # 3. メーカー (Maker) のカウント更新
        maker_count_sq = Subquery(
            Product.objects
            .filter(maker_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('maker_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        # Coalesceを使ってNULL値を0に変換
        Maker.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(maker_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> メーカーのカウントを更新しました。'))
        
        # 4. レーベル (Label) のカウント更新
        label_count_sq = Subquery(
            Product.objects
            .filter(label_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('label_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        # Coalesceを使ってNULL値を0に変換
        Label.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(label_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> レーベルのカウントを更新しました。'))

        # 5. シリーズ (Series) のカウント更新
        series_count_sq = Subquery(
            Product.objects
            .filter(series_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('series_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        # Coalesceを使ってNULL値を0に変換
        Series.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(series_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> シリーズのカウントを更新しました。'))

        # 6. 監督 (Director) のカウント更新
        director_count_sq = Subquery(
            Product.objects
            .filter(director_id=OuterRef('pk'), api_source=self.API_SOURCE)
            .values('director_id')
            .annotate(count=Count('id'))
            .values('count'),
            output_field=IntegerField()
        )
        # Coalesceを使ってNULL値を0に変換
        Director.objects.filter(api_source=self.API_SOURCE).update(
            product_count=Coalesce(director_count_sq, Value(0), output_field=IntegerField())
        )
        stdout.write(self.style.SUCCESS('  -> 監督のカウントを更新しました。'))
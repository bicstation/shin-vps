# -*- coding: utf-8 -*-
import logging
import json
import re
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
    help = 'RawApiData (DUGA) を読み込み、画像を最高画質化してAdultProductモデルに正規化保存します。'
    API_SOURCE = 'DUGA'

    def _optimize_url(self, url):
        """画像URLを高画質版に置換する共通内部関数"""
        if not url:
            return ""
        if url.startswith('//'):
            url = 'https:' + url
            
        if 'pics.dmm.com' in url or 'pics.dmm.co.jp' in url:
            # p[s|t].jpg -> pl.jpg
            url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
            # _[m|s].jpg -> _l.jpg
            url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
        return url

    def _resolve_entity_names_to_pks(self, product_list, relations_map):
        """エンティティ名をPKに解決し、辞書のキーを _id に書き換える"""
        all_entity_names = {Model: set() for Model in ENTITY_MODELS}

        # 1. すべてのエンティティ名を収集
        for p in product_list:
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                name = p.get(key)
                if name:
                    all_entity_names[Model].add(name)

            raw_id = p.get('raw_data_id')
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress]:
                    key = ENTITY_RELATION_KEYS[Model]
                    names = relations.get(key, [])
                    all_entity_names[Model].update(names)

        # 2. PK を一括取得
        pk_maps = {Model: get_or_create_entity(Model, list(names), self.API_SOURCE) 
                   for Model, names in all_entity_names.items() if names}

        # 3. 辞書内のキーを書き換え
        for p in product_list:
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                name = p.pop(key, None)
                p[f'{key}_id'] = pk_maps.get(Model, {}).get(name) if name else None

            raw_id = p.get('raw_data_id')
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress]:
                    key = ENTITY_RELATION_KEYS[Model]
                    names = relations.pop(key, [])
                    # 解決できたPKのみ保持
                    pks = [pk_maps.get(Model, {}).get(n) for n in names if pk_maps.get(Model, {}).get(n)]
                    relations[f'{key}_ids'] = pks

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE(f'--- {self.API_SOURCE} 正規化・高画質化処理開始 ---'))

        raw_data_qs = RawApiData.objects.filter(api_source=self.API_SOURCE, migrated=False).order_by('id')
        total_count = raw_data_qs.count()
        
        if total_count == 0:
            self.stdout.write(self.style.SUCCESS("未処理のRawデータはありません。"))
            return

        products_data = [] 
        relations_map = {} 
        processed_raw_ids = []
        batch_size = 500
        
        for raw_instance in raw_data_qs:
            try:
                normalized_data_list, relations_list = normalize_duga_data(raw_instance)
                if not normalized_data_list:
                    continue
                    
                product_data = normalized_data_list[0]
                relations = relations_list[0]
                
                # 🚀 画像URLリストを高画質化・重複排除
                if 'image_url_list' in product_data:
                    optimized_images = [self._optimize_url(u) for u in product_data['image_url_list']]
                    product_data['image_url_list'] = list(dict.fromkeys(filter(None, optimized_images)))

                # 🎥 動画データのプレビュー画像も高画質化
                if isinstance(product_data.get('sample_movie_url'), dict):
                    preview = product_data['sample_movie_url'].get('preview_image')
                    if preview:
                        product_data['sample_movie_url']['preview_image'] = self._optimize_url(preview)

                # ⚠️ モデルに存在しないフィールドを確実に削除
                product_data.pop('image_url', None)

                product_data['updated_at'] = timezone.now()
                products_data.append(product_data) 
                relations_map[raw_instance.id] = relations
                processed_raw_ids.append(raw_instance.id)
                
                if len(products_data) >= batch_size:
                    self._process_batch(products_data, relations_map, processed_raw_ids)
                    products_data, relations_map, processed_raw_ids = [], {}, []
                    
            except Exception as e:
                logger.error(f"Raw ID {raw_instance.id} 処理エラー: {e}")

        if products_data:
            self._process_batch(products_data, relations_map, processed_raw_ids)

        self.update_product_counts(self.stdout)
        self.stdout.write(self.style.SUCCESS(f'--- {self.API_SOURCE} 全工程完了 ---'))

    def _process_batch(self, products_data, relations_map, processed_raw_ids):
        """名前解決からUPSERTまでをバッチ実行"""
        self._resolve_entity_names_to_pks(products_data, relations_map)
        
        # raw_data_id は AdultProduct のフィールドではないためインスタンス化前に pop
        for p in products_data:
            p.pop('raw_data_id', None)

        products_to_upsert = [AdultProduct(**data) for data in products_data]
        
        with transaction.atomic():
            # bulk_create の update_conflicts を使用して一括 UPSERT
            fk_fields = [f.attname for f in AdultProduct._meta.fields if isinstance(f, models.ForeignKey)]
            update_fields = [
                'title', 'release_date', 'affiliate_url', 'price', 
                'image_url_list', 'sample_movie_url', 'updated_at', 'is_active'
            ] + fk_fields

            AdultProduct.objects.bulk_create(
                products_to_upsert,
                update_conflicts=True,
                unique_fields=['product_id_unique'],
                update_fields=update_fields
            )
            
            # M2M同期用のIDマップ取得
            unique_ids = [p.product_id_unique for p in products_to_upsert]
            product_db_id_map = {obj.product_id_unique: obj.id for obj in 
                                AdultProduct.objects.filter(product_id_unique__in=unique_ids)}
            
            self._synchronize_many_to_many(products_to_upsert, product_db_id_map, relations_map)
            
            # Rawデータの処理完了フラグ更新
            RawApiData.objects.filter(id__in=processed_raw_ids).update(
                migrated=True, updated_at=timezone.now()
            )
        self.stdout.write(f'バッチ {len(processed_raw_ids)} 件を保存完了')

    def _synchronize_many_to_many(self, products_to_upsert, product_db_id_map, relations_map):
        """ManyToManyリレーション（女優・ジャンル）の同期"""
        product_db_ids = list(product_db_id_map.values())
        if not product_db_ids: return

        for Model, key in [(Genre, 'genres_ids'), (Actress, 'actresses_ids')]:
            rel_name = ENTITY_RELATION_KEYS[Model]
            through_model = getattr(AdultProduct, rel_name).through
            through_model.objects.filter(adultproduct_id__in=product_db_ids).delete()
            
            new_rels = []
            # relations_map に戻すために products_to_upsert の product_id_unique から解決
            # (ただし _resolve_entity_names_to_pks 内で raw_id ベースで管理しているため注意)
            # ここではシンプルにするため normalize_duga_data 時の product_id_unique を使う設計も可
            # ここは現在の relations_map 構造（raw_id キー）を維持します
            
            # 実際には products_to_upsert に raw_data_id はもうないので、
            # raw_id を一時的に保持するか relations_map のキー構成を合わせる必要があります。
            # 今回は products_to_upsert ループではなく products_data (dict) との関係性で復元します。
            pass # (下記 _process_batch で raw_id を pop する前に処理するのが安全)

    def _process_batch(self, products_data, relations_map, processed_raw_ids):
        """(修正) raw_data_id を使って M2M を解決してから pop する"""
        self._resolve_entity_names_to_pks(products_data, relations_map)
        
        # インスタンス化
        products_to_upsert = []
        raw_id_to_unique = {}
        for d in products_data:
            rid = d.pop('raw_data_id', None)
            p_obj = AdultProduct(**d)
            products_to_upsert.append(p_obj)
            if rid: raw_id_to_unique[rid] = p_obj.product_id_unique

        with transaction.atomic():
            update_fields = [
                'title', 'release_date', 'affiliate_url', 'price', 
                'image_url_list', 'sample_movie_url', 'updated_at', 'is_active'
            ] + [f.attname for f in AdultProduct._meta.fields if isinstance(f, models.ForeignKey)]

            AdultProduct.objects.bulk_create(
                products_to_upsert,
                update_conflicts=True,
                unique_fields=['product_id_unique'],
                update_fields=update_fields
            )
            
            db_id_map = {obj.product_id_unique: obj.id for obj in AdultProduct.objects.filter(
                product_id_unique__in=[p.product_id_unique for p in products_to_upsert]
            )}
            
            # M2M 同期処理
            for Model, rel_key in [(Genre, 'genres_ids'), (Actress, 'actresses_ids')]:
                field_name = ENTITY_RELATION_KEYS[Model]
                through = getattr(AdultProduct, field_name).through
                through.objects.filter(adultproduct_id__in=db_id_map.values()).delete()
                
                rels = []
                for rid, rel_data in relations_map.items():
                    uid = raw_id_to_unique.get(rid)
                    pid = db_id_map.get(uid)
                    if pid:
                        for eid in rel_data.get(rel_key, []):
                            rels.append(through(**{'adultproduct_id': pid, f'{Model.__name__.lower()}_id': eid}))
                if rels:
                    through.objects.bulk_create(rels, ignore_conflicts=True)

            RawApiData.objects.filter(id__in=processed_raw_ids).update(migrated=True, updated_at=timezone.now())

    def update_product_counts(self, stdout):
        """全エンティティの作品数カウントをサブクエリで更新"""
        stdout.write("\n--- 作品数集計更新 ---")
        with transaction.atomic():
            MAPPING = [
                (Actress, 'actresses'), (Genre, 'genres'),
                (Maker, 'maker_id'), (Label, 'label_id'),
                (Director, 'director_id'), (Series, 'series_id'),
            ]
            for Model, field in MAPPING:
                if field.endswith('_id'):
                    subq = AdultProduct.objects.filter(**{field: OuterRef('pk')}).values(field).annotate(c=Count('id')).values('c')[:1]
                else:
                    through = getattr(AdultProduct, field).through
                    fk = f"{Model.__name__.lower()}_id"
                    subq = through.objects.filter(**{fk: OuterRef('pk')}).values(fk).annotate(c=Count('adultproduct_id')).values('c')[:1]
                
                Model.objects.filter(api_source=self.API_SOURCE).update(
                    product_count=Coalesce(Subquery(subq, output_field=models.IntegerField()), 0)
                )
                stdout.write(f'✅ {Model.__name__} カウント完了')
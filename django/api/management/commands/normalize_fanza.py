# -*- coding: utf-8 -*-
import logging
import re
from django.core.management.base import BaseCommand
from django.db import transaction, models
from django.db.models import Count, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.utils import timezone 

# 関連モデル
from api.models import (
    RawApiData, AdultProduct, Genre, Actress, 
    Director, Maker, Label, Series
)

# ユーティリティ
from api.utils.adult.fanza_normalizer import normalize_fanza_data 
from api.utils.adult.entity_manager import get_or_create_entity 

logger = logging.getLogger('normalize_adult')

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
    help = 'RawApiDataをAdultProductへ正規化し、バッチ内重複を排除してUPSERTします。'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='処理件数制限')
        parser.add_argument('--source', type=str, default=None, help='FANZA or DMM')
        parser.add_argument('--re-run', action='store_true', help='migrated=Trueのデータも再処理する')

    def _optimize_url(self, url):
        """DMM/FANZAのURLを最高画質へ置換"""
        if not url:
            return ""
        if url.startswith('//'):
            url = 'https:' + url
            
        if 'pics.dmm.com' in url or 'pics.dmm.co.jp' in url:
            url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
            url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
        return url

    def handle(self, *args, **options):
        sources = [options['source'].upper()] if options['source'] else ['FANZA', 'DMM']
        re_run = options.get('re_run', False)
        
        for source in sources:
            self.stdout.write(self.style.NOTICE(f'\n--- {source} 正規化・高画質化フェーズ開始 ---'))
            
            filters = {'api_source': source}
            if not re_run:
                filters['migrated'] = False
                
            raw_qs = RawApiData.objects.filter(**filters).order_by('id')
            if options['limit']:
                raw_qs = raw_qs[:options['limit']]

            total = raw_qs.count()
            if total == 0:
                self.stdout.write(self.style.WARNING(f"{source} の処理対象データはありません。"))
                continue

            batch_size = 500
            # 🚀 修正: リストではなく辞書を使い、product_id_uniqueをキーにして重複を上書き排除する
            batch_dict = {} 
            batch_relations = {}
            processed_raw_ids = []

            for raw_instance in raw_qs:
                try:
                    p_list, r_list = normalize_fanza_data(raw_instance)
                    if not p_list:
                        raw_instance.migrated = True
                        raw_instance.save(update_fields=['migrated'])
                        continue

                    p_data = p_list[0]
                    r_data = r_list[0]
                    unique_id = p_data['product_id_unique']

                    # 🚀 画像URLリストの高画質化
                    if 'image_url_list' in p_data:
                        optimized_urls = [self._optimize_url(u) for u in p_data['image_url_list']]
                        p_data['image_url_list'] = list(dict.fromkeys(filter(None, optimized_urls)))

                    # 🎥 動画データのプレビュー画像も高画質化
                    if isinstance(p_data.get('sample_movie_url'), dict):
                        preview = p_data['sample_movie_url'].get('preview_image')
                        if preview:
                            p_data['sample_movie_url']['preview_image'] = self._optimize_url(preview)

                    p_data['api_source'] = source
                    p_data['updated_at'] = timezone.now()

                    # 🚀 重複排除: すでに同じIDがあれば上書きされ、SQLエラーを防ぐ
                    batch_dict[unique_id] = p_data
                    batch_relations[unique_id] = r_data
                    processed_raw_ids.append(raw_instance.id)

                    if len(batch_dict) >= batch_size:
                        self._process_batch(list(batch_dict.values()), batch_relations, processed_raw_ids, source)
                        batch_dict, batch_relations, processed_raw_ids = {}, {}, []

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Raw ID {raw_instance.id} 処理エラー: {e}"))

            if batch_dict:
                self._process_batch(list(batch_dict.values()), batch_relations, processed_raw_ids, source)

        self._update_all_product_counts()
        self.stdout.write(self.style.SUCCESS('\n✅ FANZA/DMM 全工程が完了しました'))

    def _process_batch(self, products_data, relations_map, raw_ids, source):
        """名前解決・UPSERT・M2M更新を一括実行"""
        
        # 1. エンティティ解決
        all_names = {M: set() for M in ENTITY_MODELS}
        for p in products_data:
            for M in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[M]
                if p.get(key): all_names[M].add(p[key])
        
        for r in relations_map.values():
            for M in [Genre, Actress]:
                key = ENTITY_RELATION_KEYS[M]
                for name in r.get(key, []): all_names[M].add(name)

        pk_maps = {M: get_or_create_entity(M, list(names), source) for M, names in all_names.items() if names}

        # 2. FKの書き換えとインスタンス化
        upsert_list = []
        for p in products_data:
            p.pop('image_url', None) 
            p.pop('raw_data_id', None)
            
            for M in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[M]
                name = p.pop(key, None)
                p[f'{key}_id'] = pk_maps.get(M, {}).get(name) if name else None
            
            upsert_list.append(AdultProduct(**p))

        # 3. データベースへ UPSERT
        with transaction.atomic():
            AdultProduct.objects.bulk_create(
                upsert_list,
                update_conflicts=True,
                unique_fields=['product_id_unique'],
                update_fields=[
                    'title', 'affiliate_url', 'image_url_list', 
                    'sample_movie_url', 'price', 'release_date', 
                    'maker_id', 'label_id', 'director_id', 'series_id', 'updated_at'
                ]
            )

            # M2M同期
            db_map = {obj.product_id_unique: obj.id for obj in AdultProduct.objects.filter(
                product_id_unique__in=[p.product_id_unique for p in upsert_list]
            )}

            for M in [Genre, Actress]:
                key = ENTITY_RELATION_KEYS[M]
                through_model = getattr(AdultProduct, key).through
                through_model.objects.filter(adultproduct_id__in=db_map.values()).delete()
                
                rels = []
                for unique_id, r in relations_map.items():
                    pid = db_map.get(unique_id)
                    m_map = pk_maps.get(M, {})
                    for name in r.get(key, []):
                        eid = m_map.get(name)
                        if pid and eid:
                            kwargs = {'adultproduct_id': pid, f'{M.__name__.lower()}_id': eid}
                            rels.append(through_model(**kwargs))
                
                if rels:
                    through_model.objects.bulk_create(rels, ignore_conflicts=True)

            RawApiData.objects.filter(id__in=raw_ids).update(migrated=True, updated_at=timezone.now())

    def _update_all_product_counts(self):
        """マスターデータのカウント一括更新"""
        self.stdout.write("作品数カウントを更新中...")
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
                
                Model.objects.update(product_count=Coalesce(Subquery(subq, output_field=models.IntegerField()), 0))
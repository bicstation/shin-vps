# -*- coding: utf-8 -*-
import logging
import re
from django.core.management.base import BaseCommand
from django.db import transaction, models
from django.db.models import Count, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.utils import timezone 
from django.core.exceptions import FieldDoesNotExist

# 関連モデル
from api.models import (
    RawApiData, AdultProduct, Genre, Actress, 
    Director, Maker, Label, Series, Author,
    FanzaFloorMaster
)

# ユーティリティ
from api.utils.adult.fanza_normalizer import normalize_fanza_data 
from api.utils.adult.entity_manager import get_or_create_entity 

logger = logging.getLogger('normalize_adult')

ENTITY_MODELS = [Maker, Label, Director, Series, Genre, Actress, Author]
ENTITY_RELATION_KEYS = {
    Maker: 'maker', 
    Label: 'label', 
    Director: 'director', 
    Series: 'series',
    Genre: 'genres', 
    Actress: 'actresses',
    Author: 'authors'
}

class Command(BaseCommand):
    help = 'RawApiDataをAdultProductへ統合正規化し、マスター各項目の整合性を保ちます。'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='処理件数制限')
        parser.add_argument('--source', type=str, default=None, help='fanza, dmm, duga など')
        parser.add_argument('--re-run', action='store_true', help='migrated=Trueのデータも再処理する')

    def _optimize_url(self, url):
        if not url: return ""
        if url.startswith('//'): url = 'https:' + url
        if any(domain in url for domain in ['pics.dmm', 'ebook-assets']):
            url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
            url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
        return url

    def handle(self, *args, **options):
        source_input = options['source'].lower() if options['source'] else None
        sources = [source_input] if source_input else ['fanza', 'dmm', 'duga']
        re_run = options.get('re_run', False)

        # 💡 階層マッピングのロード（正規化して読み込み）
        self.floor_map = {
            (f.site_code.lower().strip(), f.floor_code.lower().strip()): f.id 
            for f in FanzaFloorMaster.objects.all()
        }
        
        for source in sources:
            source_label = source.lower()
            self.stdout.write(self.style.NOTICE(f'\n--- {source_label.upper()} 正規化処理 ---'))
            
            filters = {'api_source__iexact': source_label}
            if not re_run:
                filters['migrated'] = False
                
            raw_qs = RawApiData.objects.filter(**filters).order_by('id')
            if options['limit']: raw_qs = raw_qs[:options['limit']]

            if not raw_qs.exists():
                self.stdout.write(self.style.WARNING(f"{source_label.upper()} の未処理データはありません。"))
                continue

            batch_dict, batch_relations, processed_raw_ids = {}, {}, []
            for raw_instance in raw_qs:
                try:
                    p_list, r_list = normalize_fanza_data(raw_instance)
                    if not p_list:
                        raw_instance.migrated = True
                        raw_instance.save(update_fields=['migrated'])
                        continue

                    for idx in range(len(p_list)):
                        p_data, r_data = p_list[idx], r_list[idx]
                        unique_id = p_data['product_id_unique']
                        
                        if p_data.get('image_url_list'):
                            p_data['image_url_list'] = list(dict.fromkeys(
                                filter(None, [self._optimize_url(u) for u in p_data['image_url_list']])
                            ))
                        
                        p_data['api_source'] = source_label
                        p_data['updated_at'] = timezone.now()
                        batch_dict[unique_id] = p_data
                        batch_relations[unique_id] = r_data

                        if len(batch_dict) >= 500:
                            self._process_batch(list(batch_dict.values()), batch_relations, processed_raw_ids, source_label)
                            batch_dict, batch_relations, processed_raw_ids = {}, {}, []
                    processed_raw_ids.append(raw_instance.id)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"解析エラー: {e}"))

            if batch_dict:
                self._process_batch(list(batch_dict.values()), batch_relations, processed_raw_ids, source_label)

        self._update_all_counts()
        self.stdout.write(self.style.SUCCESS('\n✅ 全ての処理が完了しました'))

    def _process_batch(self, products_data, relations_map, raw_ids, source_label):
        all_names = {M: set() for M in ENTITY_MODELS}
        for p in products_data:
            for M in [Maker, Label, Director, Series]:
                if val := p.get(ENTITY_RELATION_KEYS[M]): all_names[M].add(val)
        for r in relations_map.values():
            for M in [Genre, Actress, Author]:
                for name in r.get(ENTITY_RELATION_KEYS[M], []): 
                    if name: all_names[M].add(name)

        pk_maps = {M: get_or_create_entity(M, list(names), source_label) for M, names in all_names.items() if names}

        upsert_list = []
        for p in products_data:
            p.pop('image_url', None) 
            p.pop('raw_data_id', None)
            
            # 💡 FloorMasterとの紐付けロジックの強化
            s_code = p.get('api_source', source_label).lower().strip()
            f_code = p.get('api_floor', '').lower().strip()
            
            # 1. 直接マッチ 2. dmm.comとしてのフォールバック 3. fanzaとしてのフォールバック
            f_id = (self.floor_map.get((s_code, f_code)) or 
                    self.floor_map.get(('dmm.com', f_code)) or 
                    self.floor_map.get(('fanza', f_code)))
            
            p['floor_master_id'] = f_id
            
            for M in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[M]
                name = p.pop(key, None)
                p[f'{key}_id'] = pk_maps.get(M, {}).get(name) if name else None
            
            upsert_list.append(AdultProduct(**p))

        with transaction.atomic():
            AdultProduct.objects.bulk_create(
                upsert_list, update_conflicts=True, unique_fields=['product_id_unique'],
                update_fields=[
                    'title', 'affiliate_url', 'image_url_list', 'sample_movie_url', 'price', 
                    'release_date', 'maker_id', 'label_id', 'director_id', 'series_id', 
                    'floor_master_id', 'updated_at', 'rich_description', 'product_description',
                    'is_unlimited', 'unlimited_channels', 'volume', 'maker_product_id',
                    'tachiyomi_url', 'jancode', 'stock_status', 'delivery_type'
                ]
            )
            
            db_map = {obj.product_id_unique: obj.id for obj in AdultProduct.objects.filter(
                product_id_unique__in=[p.product_id_unique for p in upsert_list]
            )}
            
            for M in [Genre, Actress, Author]:
                key = ENTITY_RELATION_KEYS[M]
                through = getattr(AdultProduct, key).through
                through.objects.filter(adultproduct_id__in=db_map.values()).delete()
                rels = []
                for uid, r in relations_map.items():
                    pid = db_map.get(uid)
                    for name in r.get(key, []):
                        if eid := pk_maps.get(M, {}).get(name):
                            rels.append(through(**{'adultproduct_id': pid, f'{M.__name__.lower()}_id': eid}))
                if rels: through.objects.bulk_create(rels, ignore_conflicts=True)
            
            if raw_ids:
                RawApiData.objects.filter(id__in=raw_ids).update(migrated=True, updated_at=timezone.now())

    def _update_all_counts(self):
        """各種マスターモデルの作品数カウントを同期"""
        self.stdout.write("作品数カウントを集計中...")
        with transaction.atomic():
            M_LIST = [
                (Actress, 'actresses'), (Genre, 'genres'), (Author, 'authors'), 
                (Maker, 'maker_id'), (Label, 'label_id'), (Director, 'director_id'), (Series, 'series_id')
            ]
            for Model, field in M_LIST:
                try:
                    Model._meta.get_field('product_count')
                    if field.endswith('_id'):
                        subq = AdultProduct.objects.filter(**{field: OuterRef('pk')}).values(field).annotate(c=Count('id')).values('c')[:1]
                    else:
                        fk = f"{Model.__name__.lower()}_id"
                        subq = getattr(AdultProduct, field).through.objects.filter(**{fk: OuterRef('pk')}).values(fk).annotate(c=Count('adultproduct_id')).values('c')[:1]
                    Model.objects.update(product_count=Coalesce(Subquery(subq, output_field=models.IntegerField()), 0))
                except FieldDoesNotExist:
                    continue

            # 💡 FanzaFloorMasterの同期（物理フィールドがある場合のみ）
            try:
                FanzaFloorMaster._meta.get_field('product_count')
                subq = AdultProduct.objects.filter(floor_master_id=OuterRef('pk')).values('floor_master_id').annotate(c=Count('id')).values('c')[:1]
                FanzaFloorMaster.objects.update(product_count=Coalesce(Subquery(subq, output_field=models.IntegerField()), 0))
            except FieldDoesNotExist:
                pass
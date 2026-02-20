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
    help = 'RawApiData(FANZA/DMM)をAdultProductへ統合正規化し、マスター各項目の整合性を保ちます。'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='処理件数制限')
        parser.add_argument('--source', type=str, default=None, help='fanza または dmm')
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
        sources = [source_input] if source_input else ['fanza', 'dmm']
        re_run = options.get('re_run', False)

        self.stdout.write("フロアマスタを読み込み中...")
        self.floor_map = {
            (f.site_code.lower().strip(), f.floor_code.lower().strip()): f.id 
            for f in FanzaFloorMaster.objects.all()
        }
        
        total_processed = 0

        for source in sources:
            source_label = source.lower()
            self.stdout.write(self.style.NOTICE(f'\n--- {source_label.upper()} 正規化処理開始 ---'))
            
            filters = {'api_source__iexact': source_label}
            if not re_run:
                filters['migrated'] = False
                
            raw_qs = RawApiData.objects.filter(**filters).order_by('id')
            if options['limit']: raw_qs = raw_qs[:options['limit']]

            count = raw_qs.count()
            if count == 0:
                self.stdout.write(self.style.WARNING(f"{source_label.upper()} の未処理データはありません。"))
                continue

            self.stdout.write(f"対象件数: {count} 件")

            batch_dict, batch_relations, processed_raw_ids = {}, {}, []
            source_processed_count = 0

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
                            source_processed_count += len(batch_dict)
                            self.stdout.write(f"  > {source_label.upper()}: {source_processed_count} 件 完了...")
                            batch_dict, batch_relations, processed_raw_ids = {}, {}, []
                    
                    processed_raw_ids.append(raw_instance.id)

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"解析エラー (RawID: {raw_instance.id}): {e}"))

            if batch_dict:
                source_processed_count += len(batch_dict)
                self._process_batch(list(batch_dict.values()), batch_relations, processed_raw_ids, source_label)
                self.stdout.write(f"  > {source_label.upper()}: {source_processed_count} 件 完了 (最終)")

            total_processed += source_processed_count

        self.stdout.write(self.style.SUCCESS(f"\n合計 {total_processed} 件の作品情報を更新しました。"))

        # 💡 ここで統計とカウント更新を実行
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
            p.pop('api_floor', None)
            
            s_code = p.get('api_source', source_label).lower().strip()
            flr_raw = (p.get('floor_code') or "").lower().strip()
            
            f_id = self.floor_map.get((s_code, flr_raw))
            if not f_id:
                if s_code in ['dmm', 'fanza', 'dmm.com']:
                    f_id = (self.floor_map.get(('dmm.com', flr_raw)) or 
                            self.floor_map.get(('fanza', flr_raw)) or
                            self.floor_map.get(('dmm', flr_raw)))
            
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
                    'title', 'api_service', 'floor_code', 'floor_master_id',
                    'affiliate_url', 'image_url_list', 'sample_movie_url', 'price', 
                    'release_date', 'maker_id', 'label_id', 'director_id', 'series_id', 
                    'updated_at', 'rich_description', 'product_description',
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
        """各種マスターモデルの作品数カウント同期、およびサービス・フロア別の統計表示"""
        
        # 1. サービス・フロア別の実数統計を表示 (AdultProductから直接集計)
        self.stdout.write(self.style.NOTICE("\n--- 現在の AdultProduct 保存統計 ---"))
        
        svc_stats = AdultProduct.objects.values('api_service').annotate(count=Count('id')).order_by('-count')
        self.stdout.write(self.style.HTTP_SUCCESS("  [サービス別]"))
        for stat in svc_stats:
            self.stdout.write(f"    {stat['api_service'] or 'Unknown':<15}: {stat['count']:>6} 件")

        flr_stats = AdultProduct.objects.values('floor_code').annotate(count=Count('id')).order_by('-count')
        self.stdout.write(self.style.HTTP_SUCCESS("  [フロア別]"))
        for stat in flr_stats:
            self.stdout.write(f"    {stat['floor_code'] or 'Unknown':<15}: {stat['count']:>6} 件")

        # 2. 各マスターモデルの product_count 更新
        self.stdout.write(self.style.NOTICE("\n--- 各マスターの作品数カウントを集計中 ---"))
        
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
                    self.stdout.write(f"  {Model.__name__:<12}: {Model.objects.count():>6} 件のマスターをスキャン完了")

                except FieldDoesNotExist:
                    continue

            # 3. FanzaFloorMasterの同期
            try:
                FanzaFloorMaster._meta.get_field('product_count')
                subq = AdultProduct.objects.filter(floor_master_id=OuterRef('pk')).values('floor_master_id').annotate(c=Count('id')).values('c')[:1]
                FanzaFloorMaster.objects.update(product_count=Coalesce(Subquery(subq, output_field=models.IntegerField()), 0))
                self.stdout.write(f"  {'FloorMaster':<12}: {FanzaFloorMaster.objects.count():>6} 件の階層をスキャン完了")
            except FieldDoesNotExist:
                pass
# -*- coding: utf-8 -*-
import logging
import re
from django.core.management.base import BaseCommand
from django.db import transaction, models
from django.db.models import Count, OuterRef, Subquery, Q
from django.db.models.functions import Coalesce, Lower
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

# 正規化対象のエンティティモデル
ENTITY_MODELS = [Maker, Label, Director, Series, Genre, Actress, Author]

# モデルと正規化データ内のキーの対応マップ
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
    help = 'RawApiDataをAdultProductへ正規化統合し、サイト別に詳細な統計を表示します。'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='処理件数制限')
        parser.add_argument('--source', type=str, default=None, help='fanza または dmm')
        parser.add_argument('--re-run', action='store_true', help='migrated=Trueのデータも再処理する')

    def _optimize_url(self, url):
        """画像URLを最高画質に置換"""
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

        # 1. フロアマスタをキャッシュ
        self.stdout.write("フロアマスタを読み込み中...")
        self.floor_map = {
            (f.site_code.lower().strip(), f.floor_code.lower().strip()): f.id 
            for f in FanzaFloorMaster.objects.all()
        }
        
        total_processed = 0

        for source in sources:
            source_label = source.lower().strip()
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

        # 統計・カウント更新を実行
        self._update_all_counts()
        self.stdout.write(self.style.SUCCESS('\n✅ 全ての処理が完了しました'))

    def _process_batch(self, products_data, relations_map, raw_ids, source_label):
        AUTHOR_FLOORS = ['digital_book', 'comic', 'pcgame', 'digital_pcgame', 'pcsoft']
        all_names = {M: set() for M in ENTITY_MODELS}
        
        for p in products_data:
            for M in [Maker, Label, Director, Series]:
                r = relations_map.get(p['product_id_unique'], {})
                if val := r.get(ENTITY_RELATION_KEYS[M]): 
                    all_names[M].add(val.strip())
        
        for r in relations_map.values():
            for g in r.get('genres', []): 
                if g: all_names[Genre].add(g.strip())
            
            p_ref = next((item for item in products_data if item['product_id_unique'] == r.get('product_id_unique', '')), None)
            is_author_centric = False
            if p_ref and p_ref.get('floor_code') in AUTHOR_FLOORS:
                is_author_centric = True
            
            for name in r.get('people_all', []):
                if not name: continue
                if is_author_centric:
                    all_names[Author].add(name.strip())
                else:
                    all_names[Actress].add(name.strip())

        pk_maps = {M: get_or_create_entity(M, list(names), source_label) for M, names in all_names.items() if names}

        upsert_list = []
        for p in products_data:
            uid = p['product_id_unique']
            r = relations_map.get(uid, {})
            p.pop('image_url', None) 
            p.pop('raw_data_id', None)
            p.pop('api_floor', None)
            
            s_code = p.get('api_source', source_label).lower().strip()
            flr_raw = (p.get('floor_code') or "").lower().strip()
            f_id = self.floor_map.get((s_code, flr_raw))
            if not f_id and s_code in ['dmm', 'fanza', 'dmm.com']:
                f_id = (self.floor_map.get(('dmm.com', flr_raw)) or 
                        self.floor_map.get(('fanza', flr_raw)) or
                        self.floor_map.get(('dmm', flr_raw)))
            p['floor_master_id'] = f_id
            
            for M in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[M]
                name = r.get(key)
                p[f'{key}_id'] = pk_maps.get(M, {}).get(name.strip()) if name else None
            
            upsert_list.append(AdultProduct(**p))

        with transaction.atomic():
            AdultProduct.objects.bulk_create(
                upsert_list, 
                update_conflicts=True, 
                unique_fields=['product_id_unique'],
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
                    if not pid: continue
                    p_ref = next((item for item in products_data if item['product_id_unique'] == uid), None)
                    current_floor = (p_ref.get('floor_code') or "") if p_ref else ""
                    
                    target_names = []
                    if M == Genre: target_names = r.get('genres', [])
                    elif M == Author and current_floor in AUTHOR_FLOORS: target_names = r.get('people_all', [])
                    elif M == Actress and current_floor not in AUTHOR_FLOORS: target_names = r.get('people_all', [])

                    for name in target_names:
                        if eid := pk_maps.get(M, {}).get(name.strip()):
                            rels.append(through(**{'adultproduct_id': pid, f'{M.__name__.lower()}_id': eid}))
                
                if rels:
                    through.objects.bulk_create(rels, ignore_conflicts=True)
            
            if raw_ids:
                RawApiData.objects.filter(id__in=raw_ids).update(migrated=True, updated_at=timezone.now())

    def _update_all_counts(self):
        """サイト・ブランド別の内訳を含む統計同期"""
        
        # 1. AdultProduct 詳細統計レポート
        self.stdout.write(self.style.NOTICE("\n=== [1/3] AdultProduct 詳細統計レポート ==="))
        detailed_stats = AdultProduct.objects.annotate(
            source_lower=Lower('api_source')
        ).values(
            'source_lower', 'api_service', 'floor_code'
        ).annotate(
            count=Count('id')
        ).order_by('source_lower', 'api_service', 'floor_code')

        current_source = None
        for stat in detailed_stats:
            src = (stat['source_lower'] or 'UNKNOWN').upper()
            if src != current_source:
                self.stdout.write(self.style.MIGRATE_LABEL(f"\n【 {src} 】"))
                current_source = src
            self.stdout.write(f"  - {stat['api_service'] or '---':<12} / {stat['floor_code'] or '---':<15} : {stat['count']:>6} 件")

        # サイト別総計の取得とリスト化
        summary_stats = AdultProduct.objects.annotate(
            source_lower=Lower('api_source')
        ).values('source_lower').annotate(
            total=Count('id')
        ).order_by('-total')
        
        active_sources = [s['source_lower'] for s in summary_stats if s['source_lower']]

        self.stdout.write(self.style.NOTICE("\n--- サイト別総計 ---"))
        for s in summary_stats:
            src = (s['source_lower'] or 'UNKNOWN').upper()
            self.stdout.write(self.style.HTTP_SUCCESS(f"  {src:<10} : {s['total']:>7} 件"))

        # 2. マスターデータの作品数同期 (サイト別内訳表示)
        self.stdout.write(self.style.NOTICE("\n=== [2/3] マスターデータの作品数同期 (ブランド・サイト内訳) ==="))
        
        with transaction.atomic():
            M_LIST = [
                (Actress, 'actresses'), (Genre, 'genres'), (Author, 'authors'), 
                (Maker, 'maker_id'), (Label, 'label_id'), (Director, 'director_id'), (Series, 'series_id')
            ]
            
            for Model, field in M_LIST:
                try:
                    # 全体のproduct_countを更新
                    if field.endswith('_id'):
                        subq_all = AdultProduct.objects.filter(**{field: OuterRef('pk')}) \
                                   .values(field).annotate(c=Count('id')).values('c')[:1]
                    else:
                        fk = f"{Model.__name__.lower()}_id"
                        subq_all = getattr(AdultProduct, field).through.objects.filter(**{fk: OuterRef('pk')}) \
                                   .values(fk).annotate(c=Count('adultproduct_id')).values('c')[:1]
                    
                    Model.objects.update(product_count=Coalesce(Subquery(subq_all, output_field=models.IntegerField()), 0))
                    
                    # サイト別の内訳を集計して表示
                    m_count = Model.objects.count()
                    self.stdout.write(self.style.MIGRATE_LABEL(f"\n  {Model.__name__} (全 {m_count} 件):"))
                    
                    for src in active_sources:
                        if field.endswith('_id'):
                            # 外部キー項目の場合
                            count = Model.objects.filter(
                                pk__in=AdultProduct.objects.filter(
                                    api_source__iexact=src, 
                                    **{f"{field}__isnull": False}
                                ).values(field)
                            ).distinct().count()
                        else:
                            # 多対多項目の場合
                            fk = f"{Model.__name__.lower()}_id"
                            count = Model.objects.filter(
                                pk__in=getattr(AdultProduct, field).through.objects.filter(
                                    adultproduct__api_source__iexact=src
                                ).values(fk)
                            ).distinct().count()
                        
                        if count > 0:
                            self.stdout.write(f"    └ {src.upper():<8}: {count:>6} 件が商品紐付けあり")

                except FieldDoesNotExist:
                    continue

        # 3. 階層マスタ同期
        self.stdout.write(self.style.NOTICE("\n=== [3/3] サイト階層マスタの同期 ==="))
        try:
            subq = AdultProduct.objects.filter(floor_master_id=OuterRef('pk')) \
                   .values('floor_master_id').annotate(c=Count('id')).values('c')[:1]
            FanzaFloorMaster.objects.update(product_count=Coalesce(Subquery(subq, output_field=models.IntegerField()), 0))
            self.stdout.write(self.style.SUCCESS(f"  FloorMaster   : 同期完了"))
        except FieldDoesNotExist:
            pass
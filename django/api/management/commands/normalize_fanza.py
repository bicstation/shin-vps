# -*- coding: utf-8 -*-
import logging
import re
from typing import List, Dict
from django.core.management.base import BaseCommand
from django.db import transaction, models
from django.db.models import Count, OuterRef, Subquery, Q
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

# 正規化対象のエンティティ
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
    help = 'RawApiDataをAdultProductへ正規化統合し、サイト別の詳細統計を出力します。'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='処理件数制限')
        parser.add_argument('--source', type=str, default=None, help='fanza, dmm, duga 等')
        parser.add_argument('--re-run', action='store_true', help='migrated=Trueのデータも再処理する')

    def _optimize_url(self, url: str) -> str:
        """画像のURLを最高画質に置換"""
        if not url: return ""
        if url.startswith('//'): url = 'https:' + url
        if any(domain in url for domain in ['pics.dmm', 'ebook-assets', 'pics.dmm.co.jp']):
            url = re.sub(r'p[s|t|m]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
            url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
        return url

    def handle(self, *args, **options):
        source_input = options['source'].lower() if options['source'] else None
        sources = [source_input] if source_input else ['fanza', 'dmm', 'duga']
        re_run = options.get('re_run', False)

        # 1. フロアマスタをキャッシュ
        self.stdout.write(self.style.MIGRATE_HEADING("--- 準備: フロアマスタを読み込み中 ---"))
        self.floor_map = {
            (f.site_code.lower().strip(), f.floor_code.lower().strip()): f.id 
            for f in FanzaFloorMaster.objects.all()
        }
        
        total_processed = 0

        for source in sources:
            source_label = source.lower().strip()
            self.stdout.write(self.style.NOTICE(f'\n▶ {source_label.upper()} 正規化処理開始'))
            
            filters = {'api_source__iexact': source_label}
            if not re_run:
                filters['migrated'] = False
                
            raw_qs = RawApiData.objects.filter(**filters).order_by('id')
            if options['limit']: raw_qs = raw_qs[:options['limit']]

            count = raw_qs.count()
            if count == 0:
                self.stdout.write(self.style.WARNING(f"  └ {source_label.upper()} の未処理データはありません。"))
                continue

            self.stdout.write(f"  └ 対象件数: {count} 件")

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
                        if not isinstance(p_data, dict): continue
                        unique_id = p_data.get('product_id_unique')
                        if not unique_id: continue

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
                            self.stdout.write(f"    > {source_label.upper()} 中間保存: {source_processed_count} 件...")
                            batch_dict, batch_relations, processed_raw_ids = {}, {}, []
                    
                    processed_raw_ids.append(raw_instance.id)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"    [!] 解析エラー (RawID: {raw_instance.id}): {e}"))

            if batch_dict:
                source_processed_count += len(batch_dict)
                self._process_batch(list(batch_dict.values()), batch_relations, processed_raw_ids, source_label)
                self.stdout.write(f"    > {source_label.upper()} 最終保存: {source_processed_count} 件完了")
            total_processed += source_processed_count

        # レポート出力とカウント同期
        self._update_all_counts()
        self.stdout.write(self.style.SUCCESS('\n✅ 全てのプロセスが終了しました'))

    def _process_batch(self, products_data: List[Dict], relations_map: Dict, raw_ids: List[int], source_label: str):
        AUTHOR_FLOORS = ['digital_book', 'comic', 'pcgame', 'digital_pcgame', 'pcsoft']
        all_names = {M: set() for M in ENTITY_MODELS}
        
        for p in products_data:
            uid = p['product_id_unique']
            r = relations_map.get(uid, {})
            if not isinstance(r, dict): continue
            for M in [Maker, Label, Director, Series]:
                if val := r.get(ENTITY_RELATION_KEYS[M]): all_names[M].add(val.strip())
            for g in r.get('genres', []): 
                if g: all_names[Genre].add(g.strip())
            
            is_author_centric = p.get('floor_code') in AUTHOR_FLOORS
            for name in r.get('people_all', []):
                if not name: continue
                target_model = Author if is_author_centric else Actress
                all_names[target_model].add(name.strip())

        pk_maps = {M: get_or_create_entity(M, list(names), source_label) for M, names in all_names.items() if names}

        upsert_list = []
        for p in products_data:
            p_clean = p.copy()
            uid = p_clean['product_id_unique']
            r = relations_map.get(uid, {})
            for key in ['image_url', 'raw_data_id', 'api_floor']: p_clean.pop(key, None)

            flr_raw = (p_clean.get('floor_code') or "").lower().strip()
            f_id = self.floor_map.get((source_label, flr_raw))
            if not f_id:
                for alt in ['fanza', 'dmm', 'dmm.com']:
                    if alt_id := self.floor_map.get((alt, flr_raw)): f_id = alt_id; break
            p_clean['floor_master_id'] = f_id
            
            for M in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[M]
                name = r.get(key)
                p_clean[f'{key}_id'] = pk_maps.get(M, {}).get(name.strip()) if name else None
            upsert_list.append(AdultProduct(**p_clean))

        with transaction.atomic():
            AdultProduct.objects.bulk_create(
                upsert_list, update_conflicts=True, unique_fields=['product_id_unique'],
                update_fields=['title', 'api_service', 'floor_code', 'floor_master_id', 'affiliate_url', 'image_url_list', 'sample_movie_url', 'price', 'release_date', 'maker_id', 'label_id', 'director_id', 'series_id', 'updated_at', 'rich_description', 'product_description', 'is_unlimited', 'volume', 'maker_product_id', 'sample_image_list', 'tachiyomi_url', 'is_active']
            )
            
            db_map = {obj.product_id_unique: obj.id for obj in AdultProduct.objects.filter(product_id_unique__in=[p.product_id_unique for p in upsert_list])}
            
            for M in [Genre, Actress, Author]:
                rel_name = ENTITY_RELATION_KEYS[M]
                try:
                    through = getattr(AdultProduct, rel_name).through
                    through.objects.filter(adultproduct_id__in=db_map.values()).delete()
                    rels = []
                    for uid, r in relations_map.items():
                        pid = db_map.get(uid)
                        if not pid: continue
                        p_ref = next(item for item in products_data if item['product_id_unique'] == uid)
                        is_author_centric = p_ref.get('floor_code') in AUTHOR_FLOORS
                        if (M == Author and not is_author_centric) or (M == Actress and is_author_centric): continue
                        target_names = r.get('genres' if M == Genre else 'people_all', [])
                        for name in target_names:
                            if eid := pk_maps.get(M, {}).get(name.strip()):
                                rel_name_fk = f"{M.__name__.lower()}_id"
                                rels.append(through(**{'adultproduct_id': pid, rel_name_fk: eid}))
                    if rels: through.objects.bulk_create(rels, ignore_conflicts=True)
                except (AttributeError, FieldDoesNotExist): continue
            
            if raw_ids:
                RawApiData.objects.filter(id__in=raw_ids).update(migrated=True, updated_at=timezone.now())

    def _update_all_counts(self):
        """統計テーブル出力とマスタカウント同期"""
        self.stdout.write(self.style.MIGRATE_HEADING("\n🔍 === 最終処理統計レポート ==="))

        raw_sources = AdultProduct.objects.values_list('api_source', flat=True).distinct()
        sources = sorted(list(set(s.lower() for s in raw_sources if s)))
        
        # --- 1. フロア別統計 ---
        table_fmt = "| {source:<8} | {service:<15} | {floor:<15} | {count:>8} |"
        hr = "-" * 57
        self.stdout.write(self.style.HTTP_INFO("\n[ フロア別集計 ]"))
        self.stdout.write(hr)
        self.stdout.write(table_fmt.format(source="Source", service="Service", floor="Floor", count="Count"))
        self.stdout.write(hr)
        for src in sources:
            stats = AdultProduct.objects.filter(api_source__iexact=src).values('api_service', 'floor_code').annotate(c=Count('id')).order_by('-c')
            for f in stats:
                self.stdout.write(table_fmt.format(source=src.upper(), service=str(f['api_service'])[:15], floor=str(f['floor_code'])[:15], count=f['c']))
        self.stdout.write(hr)

        # --- 2. ジャンル別統計 (修正箇所: adultproduct -> products) ---
        self.stdout.write(self.style.HTTP_INFO("\n[ サイト別主要ジャンル集計 (Top 5) ]"))
        genre_fmt = "| {source:<8} | {genre:<25} | {count:>8} |"
        hr_g = "-" * 51
        self.stdout.write(hr_g)
        self.stdout.write(genre_fmt.format(source="Source", genre="Genre Name", count="Count"))
        self.stdout.write(hr_g)

        for src in sources:
            # 逆参照名を products に変更
            top_genres = Genre.objects.filter(
                products__api_source__iexact=src
            ).annotate(
                c=Count('products', filter=Q(products__api_source__iexact=src))
            ).order_by('-c')[:5]

            for g in top_genres:
                self.stdout.write(genre_fmt.format(source=src.upper(), genre=g.name[:25], count=g.c))
            if top_genres.exists(): self.stdout.write(hr_g)

        # --- 3. マスタ同期 ---
        self.stdout.write(self.style.NOTICE("\n🔄 各マスタの product_count を同期中..."))
        with transaction.atomic():
            M_LIST = [(Actress, 'actresses'), (Genre, 'genres'), (Author, 'authors'), (Maker, 'maker_id'), (Label, 'label_id'), (Director, 'director_id'), (Series, 'series_id')]
            for Model, field in M_LIST:
                try:
                    if field.endswith('_id'):
                        subq = AdultProduct.objects.filter(**{field: OuterRef('pk')}).values(field).annotate(c=Count('id')).values('c')[:1]
                    else:
                        through = getattr(AdultProduct, field).through
                        fk = f"{Model.__name__.lower()}_id"
                        subq = through.objects.filter(**{fk: OuterRef('pk')}).values(fk).annotate(c=Count('adultproduct_id')).values('c')[:1]
                    Model.objects.update(product_count=Coalesce(Subquery(subq, output_field=models.IntegerField()), 0))
                    self.stdout.write(f"  ✅ {Model.__name__} 同期完了")
                except: continue

        # FanzaFloorMaster 同期
        try:
            subq_f = AdultProduct.objects.filter(floor_master_id=OuterRef('pk')).values('floor_master_id').annotate(c=Count('id')).values('c')[:1]
            FanzaFloorMaster.objects.update(product_count=Coalesce(Subquery(subq_f, output_field=models.IntegerField()), 0))
            self.stdout.write(f"  ✅ FanzaFloorMaster 同期完了")
        except: pass
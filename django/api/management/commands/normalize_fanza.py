# -*- coding: utf-8 -*-
import logging
import re
import json
from django.core.management.base import BaseCommand
from django.db import transaction, models
from django.db.models import Count, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.utils import timezone 

# 関連モデル
from api.models import (
    RawApiData, AdultProduct, Genre, Actress, 
    Director, Maker, Label, Series, Author
)

# ユーティリティ
from api.utils.adult.fanza_normalizer import normalize_fanza_data 
from api.utils.adult.entity_manager import get_or_create_entity 

logger = logging.getLogger('normalize_adult')

# エンティティ管理リスト
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
    help = 'RawApiDataをAdultProductへ統合正規化し、表記を小文字に統一してUPSERTします。'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='処理件数制限')
        parser.add_argument('--source', type=str, default=None, help='fanza, dmm, duga など')
        parser.add_argument('--re-run', action='store_true', help='migrated=Trueのデータも再処理する')

    def _optimize_url(self, url):
        """DMM/FANZAの画像URLを最高画質(Large)へ変換"""
        if not url: return ""
        if url.startswith('//'): url = 'https:' + url
        if any(domain in url for domain in ['pics.dmm', 'ebook-assets']):
            url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
            url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
        return url

    def handle(self, *args, **options):
        # 🚀 根本解決1: 入力ソースを完全に小文字化し、DUGAも含める
        source_input = options['source'].lower() if options['source'] else None
        sources = [source_input] if source_input else ['fanza', 'dmm', 'duga']
        re_run = options.get('re_run', False)
        
        for source in sources:
            source_label = source.lower()
            self.stdout.write(self.style.NOTICE(f'\n--- {source_label.upper()} 統合正規化・統一開始 ---'))
            
            # 🚀 根本解決2: 大文字小文字を無視してRawデータを抽出 (iexact)
            # これによりDBに 'DUGA' と 'duga' が混在していても全て拾い上げます
            filters = {'api_source__iexact': source_label}
            if not re_run:
                filters['migrated'] = False
                
            raw_qs = RawApiData.objects.filter(**filters).order_by('id')
            if options['limit']:
                raw_qs = raw_qs[:options['limit']]

            total = raw_qs.count()
            if total == 0:
                self.stdout.write(self.style.WARNING(f"{source_label.upper()} の未処理データはありません。"))
                continue

            self.stdout.write(self.style.SUCCESS(f"{total} 件のデータを処理開始します..."))

            batch_size = 500
            batch_dict = {} 
            batch_relations = {}
            processed_raw_ids = []

            for raw_instance in raw_qs:
                try:
                    # パース実行
                    p_list, r_list = normalize_fanza_data(raw_instance)
                    if not p_list:
                        raw_instance.migrated = True
                        raw_instance.save(update_fields=['migrated'])
                        continue

                    p_data = p_list[0]
                    r_data = r_list[0]
                    unique_id = p_data['product_id_unique']

                    # 画像・動画の高画質化
                    if 'image_url_list' in p_data and p_data['image_url_list']:
                        p_data['image_url_list'] = list(dict.fromkeys(
                            filter(None, [self._optimize_url(u) for u in p_data['image_url_list']])
                        ))
                    if isinstance(p_data.get('sample_movie_url'), dict):
                        preview = p_data['sample_movie_url'].get('preview_image')
                        if preview:
                            p_data['sample_movie_url']['preview_image'] = self._optimize_url(preview)

                    # 🚀 根本解決3: 保存データ自体を強制小文字化
                    p_data['api_source'] = source_label
                    if 'api_service' in p_data and p_data['api_service']:
                        p_data['api_service'] = p_data['api_service'].lower()
                    if 'api_floor' in p_data and p_data['api_floor']:
                        p_data['api_floor'] = p_data['api_floor'].lower()

                    p_data['updated_at'] = timezone.now()

                    batch_dict[unique_id] = p_data
                    batch_relations[unique_id] = r_data
                    processed_raw_ids.append(raw_instance.id)

                    if len(batch_dict) >= batch_size:
                        self._process_batch(list(batch_dict.values()), batch_relations, processed_raw_ids, source_label)
                        batch_dict, batch_relations, processed_raw_ids = {}, {}, []

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Raw ID {raw_instance.id} 解析エラー: {e}"))
                    logger.exception(f"Error processing RawApiData {raw_instance.id}")

            # 残りバッチの処理
            if batch_dict:
                self._process_batch(list(batch_dict.values()), batch_relations, processed_raw_ids, source_label)

        # 作品数カウント更新
        self._update_all_product_counts()
        self.stdout.write(self.style.SUCCESS('\n✅ 全ての正規化・UPSERT工程が完了しました'))

    def _process_batch(self, products_data, relations_map, raw_ids, source_label):
        """マスター解決、統合UPSERT、M2M同期を一挙に実行"""
        
        # 1. 名前解決
        all_names = {M: set() for M in ENTITY_MODELS}
        for p in products_data:
            for M in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[M]
                if val := p.get(key): all_names[M].add(val)
        
        for r in relations_map.values():
            for M in [Genre, Actress, Author]:
                key = ENTITY_RELATION_KEYS[M]
                for name in r.get(key, []): 
                    if name: all_names[M].add(name)

        # source_labelは既に小文字
        pk_maps = {M: get_or_create_entity(M, list(names), source_label) for M, names in all_names.items() if names}

        # 2. FK置換とインスタンス化
        upsert_list = []
        for p in products_data:
            p.pop('image_url', None) 
            p.pop('raw_data_id', None)
            
            for M in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[M]
                name = p.pop(key, None)
                p[f'{key}_id'] = pk_maps.get(M, {}).get(name) if name else None
            
            upsert_list.append(AdultProduct(**p))

        if not upsert_list: return

        # 3. 🛡️ 統合UPSERT 実行
        # 🚀 修正ポイント: AI解析結果や各種スコアフィールドが消えないよう全網羅
        with transaction.atomic():
            AdultProduct.objects.bulk_create(
                upsert_list,
                update_conflicts=True,
                unique_fields=['product_id_unique'],
                update_fields=[
                    'title', 'affiliate_url', 'image_url_list', 'sample_movie_url', 
                    'price', 'release_date', 'maker_id', 'label_id', 'director_id', 
                    'series_id', 'updated_at', 'rich_description', 'product_description',
                    'is_unlimited', 'unlimited_channels', 'volume', 'maker_product_id',
                    'tachiyomi_url', 'jancode', 'stock_status', 'delivery_type',
                    'score_visual', 'score_story', 'score_erotic', 'score_rarity', 
                    'score_cost_performance', 'score_fetish', 'spec_score', 'ai_summary'
                ]
            )

            # 4. M2M関係（Genre, Actress, Author）の同期
            db_map = {obj.product_id_unique: obj.id for obj in AdultProduct.objects.filter(
                product_id_unique__in=[p.product_id_unique for p in upsert_list]
            )}

            for M in [Genre, Actress, Author]:
                key = ENTITY_RELATION_KEYS[M]
                through_model = getattr(AdultProduct, key).through
                through_model.objects.filter(adultproduct_id__in=db_map.values()).delete()
                
                rels = []
                for unique_id, r in relations_map.items():
                    pid = db_map.get(unique_id)
                    m_map = pk_maps.get(M, {})
                    for name in r.get(key, []):
                        if eid := m_map.get(name):
                            rels.append(through_model(**{'adultproduct_id': pid, f'{M.__name__.lower()}_id': eid}))
                
                if rels:
                    through_model.objects.bulk_create(rels, ignore_conflicts=True)

            # 元データの完了フラグ更新
            RawApiData.objects.filter(id__in=raw_ids).update(migrated=True, updated_at=timezone.now())

    def _update_all_product_counts(self):
        """Authorを含む全マスターの作品数カウントを高速一括更新"""
        self.stdout.write("各エンティティの作品数カウントを更新中...")
        with transaction.atomic():
            MAPPING = [
                (Actress, 'actresses'), (Genre, 'genres'), (Author, 'authors'),
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
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
    Maker, Label, Director, Series, Author
)

# ユーティリティ
from api.utils.common import generate_product_unique_id 
from api.utils.adult.duga_normalizer import normalize_duga_data 
from api.utils.adult.entity_manager import get_or_create_entity 

logger = logging.getLogger(__name__)

# エンティティ管理
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
    help = 'RawApiData (DUGA) を正規化し、小文字統一・AIデータ保護を行いAdultProductに保存します。'
    # 🚀 基準値を小文字に固定
    API_SOURCE_LOWER = 'duga'

    def _optimize_url(self, url):
        """画像URLを高画質版に置換"""
        if not url: return ""
        if url.startswith('//'): url = 'https:' + url
        # DMMドメインだけでなく、一般的な置換ルールを適用
        if any(domain in url for domain in ['pics.dmm', 'duga.jp', 'dg-t.jp']):
            url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
            url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
        return url

    def _resolve_entity_names_to_pks(self, product_list, relations_map):
        """エンティティ名をPKに解決"""
        all_entity_names = {Model: set() for Model in ENTITY_MODELS}

        for p in product_list:
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                if name := p.get(key): all_entity_names[Model].add(name)

            raw_id = p.get('raw_data_id')
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress, Author]:
                    key = ENTITY_RELATION_KEYS[Model]
                    if names := relations.get(key, []):
                        all_entity_names[Model].update(names)

        # 🚀 解決時もソース名を小文字で渡す
        pk_maps = {Model: get_or_create_entity(Model, list(names), self.API_SOURCE_LOWER) 
                   for Model, names in all_entity_names.items() if names}

        for p in product_list:
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                name = p.pop(key, None)
                p[f'{key}_id'] = pk_maps.get(Model, {}).get(name) if name else None

            raw_id = p.get('raw_data_id')
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress, Author]:
                    key = ENTITY_RELATION_KEYS[Model]
                    names = relations.pop(key, [])
                    pks = [pk_maps.get(Model, {}).get(n) for n in names if pk_maps.get(Model, {}).get(n)]
                    relations[f'{key}_ids'] = pks

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE(f'--- {self.API_SOURCE_LOWER.upper()} 統合正規化・統一開始 ---'))

        # 🚀 根本解決: iexact で抽出することで 'DUGA' も 'duga' も全て拾い上げる
        raw_data_qs = RawApiData.objects.filter(
            api_source__iexact=self.API_SOURCE_LOWER, 
            migrated=False
        ).order_by('id')
        
        total_to_process = raw_data_qs.count()
        if total_to_process == 0:
            self.stdout.write(self.style.WARNING(f"✅ 未処理の {self.API_SOURCE_LOWER} データはありません。"))
            return

        self.stdout.write(self.style.NOTICE(f"📝 解析対象: {total_to_process} 件"))

        products_data, relations_map, processed_raw_ids = [], {}, []
        batch_size = 100
        saved_count = 0
        
        for raw_instance in raw_data_qs:
            try:
                raw_payload = getattr(raw_instance, 'raw_json_data', None)
                if not raw_payload: continue

                normalized_data_list, relations_list = normalize_duga_data(raw_instance)
                if not normalized_data_list:
                    RawApiData.objects.filter(id=raw_instance.id).update(migrated=True)
                    continue
                    
                product_data, relations = normalized_data_list[0], relations_list[0]

                # ID生成
                if not product_data.get('product_id_unique'):
                    cid = product_data.get('content_id') or str(raw_instance.id)
                    product_data['product_id_unique'] = generate_product_unique_id(self.API_SOURCE_LOWER, cid)

                # 画像高画質化
                if 'image_url_list' in product_data:
                    optimized = [self._optimize_url(u) for u in product_data['image_url_list']]
                    product_data['image_url_list'] = list(dict.fromkeys(filter(None, optimized)))

                # 🚀 根本解決: 強制的に小文字ソースをセット
                product_data.pop('image_url', None)
                product_data['api_source'] = self.API_SOURCE_LOWER
                product_data['updated_at'] = timezone.now()

                products_data.append(product_data) 
                relations_map[raw_instance.id] = relations
                processed_raw_ids.append(raw_instance.id)

                if len(products_data) >= batch_size:
                    saved_count += self._process_batch(products_data, relations_map, processed_raw_ids)
                    products_data, relations_map, processed_raw_ids = [], {}, []
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f" ❌ RawID {raw_instance.id} 処理エラー: {str(e)}"))

        if products_data:
            saved_count += self._process_batch(products_data, relations_map, processed_raw_ids)

        self.update_product_counts(self.stdout)

        final_total = AdultProduct.objects.filter(api_source=self.API_SOURCE_LOWER).count()
        self.stdout.write(self.style.SUCCESS(f'\n🚀 完了報告:'))
        self.stdout.write(f' ・今回正常に処理された件数: {saved_count} 件')
        self.stdout.write(f' ・DB内の {self.API_SOURCE_LOWER} 総件数: {final_total} 件')

    def _process_batch(self, products_data, relations_map, processed_raw_ids):
        self._resolve_entity_names_to_pks(products_data, relations_map)
        
        products_to_upsert, raw_id_to_unique = [], {}
        for d in products_data:
            rid = d.pop('raw_data_id', None)
            p_obj = AdultProduct(**d)
            products_to_upsert.append(p_obj)
            if rid: raw_id_to_unique[rid] = p_obj.product_id_unique

        try:
            with transaction.atomic():
                fk_fields = [f.attname for f in AdultProduct._meta.fields if isinstance(f, models.ForeignKey)]
                
                # 🚀 修正: AI解析結果（スコア・要約）を update_fields に含めて保護
                # これにより正規化を再実行してもAIが書き込んだデータが消えません
                update_fields = [
                    'title', 'release_date', 'affiliate_url', 'price', 
                    'image_url_list', 'sample_movie_url', 'updated_at', 'is_active', 'api_source',
                    'score_visual', 'score_story', 'score_erotic', 'score_rarity', 
                    'score_cost_performance', 'score_fetish', 'spec_score', 'ai_summary'
                ] + fk_fields

                AdultProduct.objects.bulk_create(
                    products_to_upsert,
                    update_conflicts=True,
                    unique_fields=['product_id_unique'],
                    update_fields=update_fields
                )
                
                db_id_map = {obj.product_id_unique: obj.id for obj in AdultProduct.objects.filter(
                    product_id_unique__in=[p.product_id_unique for p in products_to_upsert]
                )}
                
                for Model, rel_key in [(Genre, 'genres_ids'), (Actress, 'actresses_ids'), (Author, 'authors_ids')]:
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

                RawApiData.objects.filter(id__in=processed_raw_ids).update(
                    migrated=True, updated_at=timezone.now()
                )
            
            return len(products_to_upsert)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ❌ バッチ保存失敗: {str(e)}'))
            return 0

    def update_product_counts(self, stdout):
        """全エンティティの作品数カウントを更新"""
        stdout.write("\n--- 各エンティティの作品数カウントを更新中 ---")
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
                
                Model.objects.update(
                    product_count=Coalesce(Subquery(subq, output_field=models.IntegerField()), 0)
                )
                stdout.write(f' ✅ {Model.__name__} カウント完了')
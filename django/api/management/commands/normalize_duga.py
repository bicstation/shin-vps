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
    Maker, Label, Director, Series, Author
)

# ユーティリティ
from api.utils.common import generate_product_unique_id 
from api.utils.adult.duga_normalizer import normalize_duga_data 
from api.utils.adult.entity_manager import get_or_create_entity 

logger = logging.getLogger(__name__)

# エンティティ管理設定
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
    help = 'RawApiData を正規化し、名寄せを行いつつ AdultProduct に一括保存します。'
    
    DEFAULT_SOURCE = 'duga'

    def add_arguments(self, parser):
        parser.add_argument('--source', type=str, default=self.DEFAULT_SOURCE, help='対象のソース (duga, fanza等)')

    def _optimize_url(self, url):
        """画像URLを高画質版に置換"""
        if not url: return ""
        if url.startswith('//'): url = 'https:' + url
        if any(domain in url for domain in ['pics.dmm', 'duga.jp', 'dg-t.jp']):
            url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
            url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
        return url

    def _resolve_entity_names_to_pks(self, product_list, relations_map, source_lower):
        """
        💡 エンティティ名をPKに解決 (名寄せ処理)
        """
        all_entity_names = {Model: set() for Model in ENTITY_MODELS}

        for p in product_list:
            unique_id = p.get('product_id_unique')
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                if name := p.get(key): 
                    all_entity_names[Model].add(name.strip())

            if unique_id in relations_map:
                rel_data = relations_map[unique_id]
                for Model in [Genre, Actress, Author]:
                    key = ENTITY_RELATION_KEYS[Model]
                    if names := rel_data.get(key, []):
                        all_entity_names[Model].update([n.strip() for n in names if n])

        pk_maps = {Model: get_or_create_entity(Model, list(names), source_lower) 
                   for Model, names in all_entity_names.items() if names}

        for p in product_list:
            unique_id = p.get('product_id_unique')
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                name = p.pop(key, None)
                p[f'{key}_id'] = pk_maps.get(Model, {}).get(name.strip()) if name else None

            if unique_id in relations_map:
                rel_data = relations_map[unique_id]
                for Model in [Genre, Actress, Author]:
                    key = ENTITY_RELATION_KEYS[Model]
                    names = rel_data.pop(key, [])
                    pks = [pk_maps.get(Model, {}).get(n.strip()) for n in names if n and pk_maps.get(Model, {}).get(n.strip())]
                    rel_data[f'{key}_ids'] = list(filter(None, pks))

    def handle(self, *args, **options):
        source_lower = options['source'].lower()
        self.stdout.write(self.style.NOTICE(f'--- {source_lower.upper()} 正規化開始 ---'))

        raw_data_qs = RawApiData.objects.filter(
            api_source__iexact=source_lower, 
            migrated=False
        ).order_by('id')
        
        total_raw = raw_data_qs.count()
        if total_raw == 0:
            self.stdout.write(self.style.WARNING(f"✅ 未処理の {source_lower} データはありません。"))
            return

        self.stdout.write(self.style.NOTICE(f"📝 解析対象のRawデータ: {total_raw} 件"))

        products_data, relations_map, processed_raw_ids = [], {}, []
        batch_size = 500
        saved_count = 0
        
        for raw_instance in raw_data_qs:
            try:
                # 🚀 デバッグ：解析開始
                self.stdout.write(f"  [ID:{raw_instance.id}] 解析中...")
                
                normalized_list, rel_list = normalize_duga_data(raw_instance)
                
                if not normalized_list:
                    self.stdout.write(self.style.WARNING(f"  ⚠️ [ID:{raw_instance.id}] Normalizerが空を返しました。構造不一致の疑いがあります。"))
                    RawApiData.objects.filter(id=raw_instance.id).update(migrated=True)
                    continue
                
                self.stdout.write(self.style.SUCCESS(f"  ✅ [ID:{raw_instance.id}] {len(normalized_list)} 件の商品を抽出しました。"))

                for i, product_data in enumerate(normalized_list):
                    relations = rel_list[i] if i < len(rel_list) else {}
                    cid = product_data.get('content_id')
                    
                    if not cid:
                        self.stdout.write(self.style.ERROR(f"  ❌ 商品データに content_id がありません。"))
                        continue

                    unique_id = generate_product_unique_id(source_lower, cid)
                    product_data['product_id_unique'] = unique_id

                    if 'image_url_list' in product_data:
                        optimized = [self._optimize_url(u) for u in product_data['image_url_list']]
                        product_data['image_url_list'] = list(dict.fromkeys(filter(None, optimized)))

                    product_data['api_source'] = source_lower.upper()
                    product_data['updated_at'] = timezone.now()
                    
                    products_data.append(product_data)
                    relations_map[unique_id] = relations

                processed_raw_ids.append(raw_instance.id)

                if len(products_data) >= batch_size:
                    saved_count += self._process_batch(products_data, relations_map, processed_raw_ids, source_lower)
                    products_data, relations_map, processed_raw_ids = [], {}, []
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f" ❌ RawID {raw_instance.id} 致命的エラー: {str(e)}"))
                logger.error(f"Error processing RawID {raw_instance.id}: {e}", exc_info=True)

        if products_data:
            saved_count += self._process_batch(products_data, relations_map, processed_raw_ids, source_lower)

        self.update_product_counts(self.stdout)
        final_total = AdultProduct.objects.filter(api_source=source_lower.upper()).count()
        
        self.stdout.write(self.style.SUCCESS(f'\n🚀 完了報告:'))
        self.stdout.write(f' ・正常に登録・更新された商品数: {saved_count} 件')
        self.stdout.write(f' ・{source_lower.upper()} 総在庫数: {final_total} 件')

    def _process_batch(self, products_data, relations_map, processed_raw_ids, source_lower):
        """DB保存のコア処理"""
        self.stdout.write(f"  --- バッチ保存実行中 ({len(products_data)} 件) ---")
        self._resolve_entity_names_to_pks(products_data, relations_map, source_lower)
        
        products_to_upsert = []
        valid_fields = {f.name for f in AdultProduct._meta.get_fields()}

        for d in products_data:
            filtered_data = {k: v for k, v in d.items() if k in valid_fields or k.endswith('_id')}
            products_to_upsert.append(AdultProduct(**filtered_data))

        if not products_to_upsert:
            return 0

        try:
            with transaction.atomic():
                fk_fields = [f.attname for f in AdultProduct._meta.fields if isinstance(f, models.ForeignKey)]
                update_fields = [
                    'title', 'release_date', 'affiliate_url', 'price', 
                    'image_url_list', 'sample_movie_url', 'updated_at', 'is_active', 'api_source'
                ] + fk_fields

                AdultProduct.objects.bulk_create(
                    products_to_upsert,
                    update_conflicts=True,
                    unique_fields=['product_id_unique'],
                    update_fields=update_fields
                )
                
                unique_ids = [p.product_id_unique for p in products_to_upsert]
                db_id_map = {obj.product_id_unique: obj.id for obj in AdultProduct.objects.filter(product_id_unique__in=unique_ids)}
                
                for Model, rel_key in [(Genre, 'genres_ids'), (Actress, 'actresses_ids'), (Author, 'authors_ids')]:
                    field_name = ENTITY_RELATION_KEYS[Model]
                    through = getattr(AdultProduct, field_name).through
                    through.objects.filter(adultproduct_id__in=db_id_map.values()).delete()
                    
                    new_rels = []
                    for unique_id, rel_data in relations_map.items():
                        pid = db_id_map.get(unique_id)
                        if pid:
                            for eid in rel_data.get(rel_key, []):
                                new_rels.append(through(**{'adultproduct_id': pid, f'{Model.__name__.lower()}_id': eid}))
                    
                    if new_rels:
                        through.objects.bulk_create(new_rels, ignore_conflicts=True)

                if processed_raw_ids:
                    RawApiData.objects.filter(id__in=processed_raw_ids).update(migrated=True, updated_at=timezone.now())
            
            return len(products_to_upsert)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ❌ バッチ保存失敗: {str(e)}'))
            return 0

    def update_product_counts(self, stdout):
        stdout.write("\n--- 作品数カウントを更新中 ---")
        with transaction.atomic():
            MAPPING = [(Actress, 'actresses'), (Genre, 'genres'), (Author, 'authors'), (Maker, 'maker_id'), (Label, 'label_id'), (Director, 'director_id'), (Series, 'series_id')]
            for Model, field in MAPPING:
                if field.endswith('_id'):
                    subq = AdultProduct.objects.filter(**{field: OuterRef('pk')}).values(field).annotate(c=Count('id')).values('c')[:1]
                else:
                    through = getattr(AdultProduct, field).through
                    fk = f"{Model.__name__.lower()}_id"
                    subq = through.objects.filter(**{fk: OuterRef('pk')}).values(fk).annotate(c=Count('adultproduct_id')).values('c')[:1]
                Model.objects.update(product_count=Coalesce(Subquery(subq, output_field=models.IntegerField()), 0))
                stdout.write(f' ✅ {Model.__name__} 完了')
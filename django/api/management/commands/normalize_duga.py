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

# ユーティリティ (既存の資産をフル活用)
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
    help = 'RawApiData を正規化し、名寄せ・AIデータ保護を行いAdultProductに保存します。'
    
    # デフォルトは DUGA ですが、引数で切り替え可能
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
        💡 エンティティ名をPKに解決 (名寄せの核心)
        get_or_create_entity を使用して、DB上の重複を阻止します。
        """
        all_entity_names = {Model: set() for Model in ENTITY_MODELS}

        for p in product_list:
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                if name := p.get(key): 
                    all_entity_names[Model].add(name.strip())

            raw_id = p.get('raw_data_id')
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress, Author]:
                    key = ENTITY_RELATION_KEYS[Model]
                    if names := relations.get(key, []):
                        all_entity_names[Model].update([n.strip() for n in names if n])

        # 🚀 既存の entity_manager を使用して一括取得/作成
        pk_maps = {Model: get_or_create_entity(Model, list(names), source_lower) 
                   for Model, names in all_entity_names.items() if names}

        for p in product_list:
            for Model in [Maker, Label, Director, Series]:
                key = ENTITY_RELATION_KEYS[Model]
                name = p.pop(key, None)
                p[f'{key}_id'] = pk_maps.get(Model, {}).get(name.strip()) if name else None

            raw_id = p.get('raw_data_id')
            relations = relations_map.get(raw_id)
            if relations:
                for Model in [Genre, Actress, Author]:
                    key = ENTITY_RELATION_KEYS[Model]
                    names = relations.pop(key, [])
                    pks = [pk_maps.get(Model, {}).get(n.strip()) for n in names if n and pk_maps.get(Model, {}).get(n.strip())]
                    relations[f'{key}_ids'] = pks

    def handle(self, *args, **options):
        source_lower = options['source'].lower()
        self.stdout.write(self.style.NOTICE(f'--- {source_lower.upper()} 統合正規化・統一開始 ---'))

        # 🚀 根本解決: iexact で抽出することで表記揺れを許容し migrated=False のみを対象に
        raw_data_qs = RawApiData.objects.filter(
            api_source__iexact=source_lower, 
            migrated=False
        ).order_by('id')
        
        total_to_process = raw_data_qs.count()
        if total_to_process == 0:
            self.stdout.write(self.style.WARNING(f"✅ 未処理の {source_lower} データはありません。"))
            return

        self.stdout.write(self.style.NOTICE(f"📝 解析対象: {total_to_process} 件"))

        products_data, relations_map, processed_raw_ids = [], {}, []
        batch_size = 100
        saved_count = 0
        
        for raw_instance in raw_data_qs:
            try:
                # 💡 RawApiData の構造に合わせてフィールドを選択 (raw_json_data または data)
                raw_payload = getattr(raw_instance, 'raw_json_data', None) or getattr(raw_instance, 'data', None)
                if not raw_payload: 
                    logger.warning(f"RawID {raw_instance.id}: No JSON payload found.")
                    continue

                # 🚀 既存の正規化ロジック (duga_normalizer) を実行
                # 他のソースの場合はここで条件分岐可能
                normalized_data_list, relations_list = normalize_duga_data(raw_instance)
                
                if not normalized_data_list:
                    RawApiData.objects.filter(id=raw_instance.id).update(migrated=True)
                    continue
                    
                product_data, relations = normalized_data_list[0], relations_list[0]

                # ID生成
                if not product_data.get('product_id_unique'):
                    cid = product_data.get('content_id') or str(raw_instance.id)
                    product_data['product_id_unique'] = generate_product_unique_id(source_lower, cid)

                # 画像高画質化
                if 'image_url_list' in product_data:
                    optimized = [self._optimize_url(u) for u in product_data['image_url_list']]
                    product_data['image_url_list'] = list(dict.fromkeys(filter(None, optimized)))

                # ソース固定とタイムスタンプ
                product_data.pop('image_url', None)
                product_data['api_source'] = source_lower.upper()
                product_data['updated_at'] = timezone.now()
                product_data['raw_data_id'] = raw_instance.id # 追跡用

                products_data.append(product_data) 
                relations_map[raw_instance.id] = relations
                processed_raw_ids.append(raw_instance.id)

                if len(products_data) >= batch_size:
                    saved_count += self._process_batch(products_data, relations_map, processed_raw_ids, source_lower)
                    products_data, relations_map, processed_raw_ids = [], {}, []
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f" ❌ RawID {raw_instance.id} 処理エラー: {str(e)}"))

        # 残りのバッチを処理
        if products_data:
            saved_count += self._process_batch(products_data, relations_map, processed_raw_ids, source_lower)

        # カウント更新
        self.update_product_counts(self.stdout)

        final_total = AdultProduct.objects.filter(api_source=source_lower.upper()).count()
        self.stdout.write(self.style.SUCCESS(f'\n🚀 完了報告:'))
        self.stdout.write(f' ・今回正常に処理された件数: {saved_count} 件')
        self.stdout.write(f' ・DB内の {source_lower.upper()} 総件数: {final_total} 件')

    def _process_batch(self, products_data, relations_map, processed_raw_ids, source_lower):
        """バッチ保存処理 (トランザクション管理)"""
        # 名寄せ実行
        self._resolve_entity_names_to_pks(products_data, relations_map, source_lower)
        
        products_to_upsert, raw_id_to_unique = [], {}
        for d in products_data:
            rid = d.pop('raw_data_id', None)
            # モデルに存在しないフィールドを削除する安全策
            valid_fields = {f.name for f in AdultProduct._meta.get_fields()}
            filtered_data = {k: v for k, v in d.items() if k in valid_fields or k.endswith('_id')}
            
            p_obj = AdultProduct(**filtered_data)
            products_to_upsert.append(p_obj)
            if rid: raw_id_to_unique[rid] = p_obj.product_id_unique

        try:
            with transaction.atomic():
                # 🚀 AI解析結果を保護するための update_fields 定義
                fk_fields = [f.attname for f in AdultProduct._meta.fields if isinstance(f, models.ForeignKey)]
                update_fields = [
                    'title', 'release_date', 'affiliate_url', 'price', 
                    'image_url_list', 'sample_movie_url', 'updated_at', 'is_active', 'api_source',
                    'score_visual', 'score_story', 'score_erotic', 'score_rarity', 
                    'score_cost_performance', 'score_fetish', 'spec_score', 'ai_summary'
                ] + fk_fields

                # バルク作成/更新
                AdultProduct.objects.bulk_create(
                    products_to_upsert,
                    update_conflicts=True,
                    unique_fields=['product_id_unique'],
                    update_fields=update_fields
                )
                
                # PKマップ作成
                db_id_map = {obj.product_id_unique: obj.id for obj in AdultProduct.objects.filter(
                    product_id_unique__in=[p.product_id_unique for p in products_to_upsert]
                )}
                
                # 多対多の関係更新 (一度消して入れ直す)
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

                # 完了マーク
                RawApiData.objects.filter(id__in=processed_raw_ids).update(
                    migrated=True, updated_at=timezone.now()
                )
            
            return len(products_to_upsert)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ❌ バッチ保存失敗: {str(e)}'))
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
# -*- coding: utf-8 -*-
import json
import logging
from datetime import datetime

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count
from django.utils import timezone
import traceback

# 共通ユーティリティ
from api.utils.adult.fanza_normalizer import normalize_fanza_data
from api.utils.adult.entity_manager import get_or_create_entity 

from api.models import (
    RawApiData, AdultProduct, Genre, Actress, 
    Director, Maker, Label, Series
)

logger = logging.getLogger('normalize_adult')

ENTITY_MAP = {
    'maker': Maker, 
    'label': Label,
    'series': Series,
    'director': Director,
    'genre': Genre, 
    'actress': Actress,
}

class Command(BaseCommand):
    help = 'RawApiDataからAdultProductへデータを正規化します（FANZA/DMM両対応）。'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            help='処理するRawレコード数を制限します。',
        )
        parser.add_argument(
            '--source',
            type=str,
            default=None,  # 指定がない場合は全ソースを対象にする
            help='正規化対象のソースを指定 (FANZA or DMM)',
        )

    def handle(self, *args, **options):
        # 1. 処理対象のソースを決定
        source_opt = options.get('source')
        if source_opt:
            sources_to_process = [source_opt.upper()]
        else:
            # 💡 指定がない場合は自動的に両方を処理対象に含める
            sources_to_process = ['FANZA', 'DMM']
        
        limit = options.get('limit')
        logging.getLogger('api_utils').setLevel(logging.DEBUG) 

        for current_source in sources_to_process:
            self.API_SOURCE = current_source
            self.stdout.write(self.style.NOTICE(f'\n--- {self.API_SOURCE} 正規化フェーズを開始します ---'))

            # 💡 未移行のデータを取得
            raw_data_qs = RawApiData.objects.filter(
                api_source=self.API_SOURCE, 
                migrated=False 
            ).order_by('-id')

            if limit:
                raw_data_qs = raw_data_qs[:limit]

            total_batches = raw_data_qs.count()
            if total_batches == 0:
                self.stdout.write(self.style.SUCCESS(f'{self.API_SOURCE} の未処理レコードはありません。'))
                continue

            self.stdout.write(self.style.NOTICE(f'処理対象: {total_batches} 件'))

            processed_count = 0
            for raw_instance in raw_data_qs:
                try:
                    with transaction.atomic():
                        # --- 工程1: データの正規化（共通フォーマットへの変換） ---
                        products_data_list, relations_data_list = normalize_fanza_data(raw_instance) 
                        
                        if not products_data_list:
                            raw_instance.migrated = True
                            raw_instance.save(update_fields=['migrated'])
                            continue

                        # --- 工程2: エンティティ（メーカー・女優等）の同期 ---
                        entity_pk_maps = {}
                        all_entities = {
                            'Maker': set(), 'Label': set(), 'Director': set(), 
                            'Series': set(), 'Genre': set(), 'Actress': set()
                        }
                        
                        for p in products_data_list:
                            for k in ['maker', 'label', 'director', 'series']:
                                if p.get(k): all_entities[k.capitalize()].add(p[k])

                        for r in relations_data_list:
                            for g in r.get('genres', []): all_entities['Genre'].add(g)
                            for a in r.get('actresses', []): all_entities['Actress'].add(a)

                        for e_type, names in all_entities.items():
                            if names:
                                entity_pk_maps[e_type] = get_or_create_entity(
                                    model=ENTITY_MAP[e_type.lower()], 
                                    names=list(names), 
                                    api_source=self.API_SOURCE
                                )

                        # --- 工程3: AdultProduct オブジェクトの準備 ---
                        products_to_upsert = []
                        for p_data in products_data_list:
                            # ソース情報を上書き（DMMの生データならDMMとして保存）
                            p_data['api_source'] = self.API_SOURCE
                            
                            # ユニークIDの生成（DMM_xxx または FANZA_xxx）
                            p_data['product_id_unique'] = f"{self.API_SOURCE}_{p_data['api_product_id']}"

                            # 外部キー（ID）の差し替え
                            for k in ['maker', 'label', 'director', 'series']:
                                val = p_data.pop(k, None)
                                if val:
                                    p_data[f'{k}_id'] = entity_pk_maps.get(k.capitalize(), {}).get(val)
                            
                            products_to_upsert.append(AdultProduct(**p_data))

                        # --- 工程4: データベースへの一括保存 (UPSERT) ---
                        AdultProduct.objects.bulk_create(
                            products_to_upsert,
                            update_conflicts=True,
                            unique_fields=['product_id_unique'],
                            update_fields=[
                                'raw_data_id', 'title', 'affiliate_url', 'image_url_list',
                                'release_date', 'price', 'maker_id', 'label_id', 'updated_at'
                            ],
                        )

                        # --- 工程5: 多対多リレーション（女優・ジャンル）の紐付け ---
                        self._process_relations(relations_data_list, entity_pk_maps)

                        # --- 工程6: 生データ側の完了フラグ更新 ---
                        raw_instance.migrated = True
                        raw_instance.updated_at = timezone.now()
                        raw_instance.save(update_fields=['migrated', 'updated_at'])
                        processed_count += 1

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"ID {raw_instance.id} でエラー: {str(e)}"))
                    logger.error(traceback.format_exc())
                    continue 

            self.stdout.write(self.style.SUCCESS(f'{self.API_SOURCE} 正規化完了: {processed_count} 件'))
        
        # 💡 全てのソースが完了した後に統計（カウント）を一括更新
        self._update_all_product_counts()
        self.stdout.write(self.style.SUCCESS(f'\n✅ すべてのソースの工程が完了しました'))

    def _process_relations(self, relations_data_list, entity_pk_maps):
        """中間テーブル（女優・ジャンル）の同期ロジック"""
        for rel_data in relations_data_list:
            # 💡 現在の処理ソースに基づいた一意のIDで製品を特定
            unique_id = f"{self.API_SOURCE}_{rel_data.get('api_product_id')}"
            try:
                product = AdultProduct.objects.get(product_id_unique=unique_id)
                
                # 女優の紐付け
                if 'actresses' in rel_data:
                    act_map = entity_pk_maps.get('Actress', {})
                    actress_ids = [act_map.get(name) for name in rel_data['actresses'] if act_map.get(name)]
                    product.actresses.set(actress_ids)
                
                # ジャンルの紐付け
                if 'genres' in rel_data:
                    gen_map = entity_pk_maps.get('Genre', {})
                    genre_ids = [gen_map.get(name) for name in rel_data['genres'] if gen_map.get(name)]
                    product.genres.set(genre_ids)
                    
            except AdultProduct.DoesNotExist:
                continue

    def _update_all_product_counts(self):
        """マスターデータの product_count を一括集計して更新"""
        self.stdout.write("マスターデータの作品数を集計中...")

        targets = [
            (Maker, 'maker_id'),
            (Label, 'label_id'),
            (Director, 'director_id'),
            (Series, 'series_id'),
            (Genre, 'genres'),
            (Actress, 'actresses')
        ]

        for model, field_name in targets:
            self.stdout.write(f"集計中: {model.__name__}...")

            counts_query = AdultProduct.objects.values(field_name).annotate(total=Count('id'))
            count_map = {item[field_name]: item['total'] for item in counts_query if item[field_name]}

            all_objs = model.objects.all()
            updates = []

            for obj in all_objs:
                new_count = count_map.get(obj.id, 0)
                if obj.product_count != new_count:
                    obj.product_count = new_count
                    updates.append(obj)
            
            if updates:
                model.objects.bulk_update(updates, ['product_count'], batch_size=500)

        self.stdout.write(self.style.SUCCESS("作品数の更新が完了しました。"))
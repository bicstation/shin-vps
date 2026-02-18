# -*- coding: utf-8 -*-
import logging
from django.utils.text import slugify
from django.db import transaction
from api.models import AdultProduct, Genre, Maker, Actress, Label, Series, Director, Author, RawApiData
from api.views.master_views import get_or_create_normalized_entity

logger = logging.getLogger(__name__)

class AdultImportService:
    """
    💡 統合インポート・サービス
    生データを解析し、正規化されたAdultProductへと昇格させる
    """

    @classmethod
    @transaction.atomic
    def process_raw_data(cls, api_source=None):
        """
        RawApiData から未処理のデータを抽出し、正規化して保存する
        """
        # 未処理または再処理が必要な生データを取得
        raw_queryset = RawApiData.objects.filter(is_processed=False)
        if api_source:
            raw_queryset = raw_queryset.filter(api_source=api_source.lower())

        success_count = 0
        error_count = 0

        for raw in raw_queryset:
            try:
                data = raw.data  # JSONフィールド
                unique_id = data.get('product_id') or data.get('content_id')

                if not unique_id:
                    logger.warning(f"Skip: Unique ID not found in raw data ID {raw.id}")
                    continue

                # 1. マスターデータの名寄せ (Entityの正規化)
                # get_or_create_normalized_entity を使って重複を阻止
                genre_names = data.get('genres', [])
                genres = [get_or_create_normalized_entity(Genre, g, api_source) for g in genre_names if g]
                
                maker_name = data.get('maker')
                maker = get_or_create_normalized_entity(Maker, maker_name, api_source) if maker_name else None

                actress_names = data.get('actresses', [])
                actresses = [get_or_create_normalized_entity(Actress, a, api_source) for a in actress_names if a]

                # 2. AdultProduct の作成または更新
                # product_id_unique をキーにして、二重登録を物理的に防ぐ
                product, created = AdultProduct.objects.update_or_create(
                    product_id_unique=unique_id,
                    defaults={
                        'title': data.get('title'),
                        'api_source': raw.api_source.upper(),
                        'url': data.get('url'),
                        'image_url': data.get('image_url'),
                        'release_date': data.get('release_date'),
                        'maker': maker,
                        'description': data.get('description'),
                        # AI解析スコアなどはここでデフォルト値やAI連携ロジックを入れる
                        'spec_score': data.get('spec_score', 0.0), 
                    }
                )

                # 3. 多対多の関係を更新
                if genres: product.genres.set(genres)
                if actresses: product.actresses.set(actresses)

                # 4. 処理完了フラグを立てる
                raw.is_processed = True
                raw.save()
                
                success_count += 1

            except Exception as e:
                logger.error(f"Normalization Error [ID:{raw.id}]: {str(e)}")
                error_count += 1

        return success_count, error_count
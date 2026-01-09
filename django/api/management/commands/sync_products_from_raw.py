import re
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from api.models import BcLinkshareProduct, PCProduct

class Command(BaseCommand):
    help = 'BcLinkshareProductのJSONデータを解析し、名称からジャンルを自動判定してPCProductカタログへ同期します。'

    def add_arguments(self, parser):
        parser.add_argument('--maker', type=str, help='同期対象のメーカー名 (HP, Dell等)')
        parser.add_argument('--dry-run', action='store_true', help='DB更新を行わず結果表示のみ')

    def _determine_genre(self, name):
        """
        商品名からジャンルをキーワードで自動判定
        """
        if not name:
            return 'その他'
        
        n = name.upper()

        # 1. ゲーミングPC (HPブランド最優先)
        if any(kw in n for kw in ['OMEN', 'VICTUS', 'GAMING']):
            return 'ゲーミングPC'
        
        # 2. ワークステーション
        if any(kw in n for kw in ['ZBOOK', 'WORKSTATION', 'MOBILE WORKSTATION']):
            return 'ワークステーション'

        # 3. デスクトップ系 (筐体名称・デスクトップブランド)
        if any(kw in n for kw in [
            'OMNIDESK', 'OMNISTUDIO', 'PRODESK', 'ELITE SFF', 'ELITE MINI',
            'DESKTOP', 'TOWER', 'MINI', 'SFF', 'ALL-IN-ONE', 'AIO', '一体型',
            'スリム筐体'
        ]):
            return 'デスクトップ'

        # 4. ノートパソコン系 (モバイルブランド・型番シリーズ)
        if any(kw in n for kw in [
            'DRAGONFLY', 'ELITEBOOK', 'PROBOOK', 'ENVY', 'PAVILION', 'AERO', 
            'OMNIBOOK', 'CHROMEBOOK', 'NOTEBOOK', 'LAPTOP', 'X360', 'CONVERTIBLE', 
            '2-IN-1', '14-EP', '14-EM', '15-FC', '15-FD', '245 G', '250R G', '255R G'
        ]):
            return 'ノートパソコン'
        
        # 5. モニター
        if any(kw in n for kw in ['MONITOR', 'DISPLAY', 'モニター', 'ディスプレイ']):
            return 'モニター'

        return 'その他'

    def _extract_price(self, item):
        """
        JSON内の辞書構造 {'value': '318780'} 等から数値を抽出
        """
        p_data = item.get('saleprice') or item.get('price')
        
        if not p_data:
            return 0
        
        val_str = '0'
        if isinstance(p_data, dict):
            # 'value' キーを最優先、次いで '#text' 等をチェック
            val_str = p_data.get('value') or p_data.get('#text') or p_data.get('text') or '0'
        else:
            val_str = str(p_data)

        try:
            # カンマや小数点以下を排除して整数化
            clean_price = re.sub(r'[^\d]', '', str(val_str).split('.')[0])
            return int(clean_price) if clean_price else 0
        except:
            return 0

    def handle(self, *args, **options):
        target_maker = options['maker']
        dry_run = options['dry_run']

        self.stdout.write(self.style.NOTICE("--- 同期・ジャンル判定処理 開始 ---"))

        # 1. データの取得 (BcLinkshareProductモデルから)
        queryset = BcLinkshareProduct.objects.all()
        if target_maker:
            # JSON内の merchantname を対象にフィルタリング
            queryset = queryset.filter(api_response_json__merchantname__icontains=target_maker)

        total_count = queryset.count()
        self.stdout.write(f"処理対象レコード数: {total_count} 件")

        success_count = 0
        updated_count = 0

        # 2. 同期ループ
        for raw_entry in queryset:
            # 生データJSONを取得
            item = raw_entry.api_response_json or {}
            
            # 商品名の取得
            name = item.get('productname')
            if not name:
                continue

            # ジャンルを名称から判定
            genre = self._determine_genre(name)

            # SKUからユニークIDを抽出 (例: 1000071-md -> 1000071)
            raw_sku = str(item.get('sku') or '').strip()
            unique_id = raw_sku.replace('-md', '').split('-')[0].strip()
            if not unique_id:
                continue
            
            # 価格抽出
            price = self._extract_price(item)

            # メーカー判定
            m_name = str(item.get('merchantname') or "").upper()
            normalized_maker = "HP" if "HP" in m_name or "HP" in name.upper() else "DELL"

            # 同期先 PCProduct モデル用のデータセット
            defaults = {
                'name': name,
                'price': price,
                'genre': genre,  # 管理画面の「統合ジャンル」に反映
                'maker': normalized_maker,
                'affiliate_url': item.get('linkurl'),
                'image_url': item.get('imageurl'),
                'affiliate_updated_at': timezone.now(),
                'is_active': True,
                'stock_status': '在庫あり'
            }

            if dry_run:
                self.stdout.write(f"[Dry-Run] ID: {unique_id} | Genre: {genre} | Name: {name[:30]}")
                success_count += 1
                continue

            # 3. 保存実行
            try:
                with transaction.atomic():
                    obj, created = PCProduct.objects.update_or_create(
                        unique_id=unique_id,
                        defaults=defaults
                    )
                    success_count += 1
                    if not created:
                        updated_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"エラー (ID {unique_id}): {str(e)}"))

        self.stdout.write(self.style.SUCCESS(
            f"--- 処理完了 ---\n成功: {success_count} 件 (更新: {updated_count} 件)"
        ))
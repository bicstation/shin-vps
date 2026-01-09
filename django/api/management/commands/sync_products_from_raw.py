import re
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from api.models import BcLinkshareProduct, PCProduct

class Command(BaseCommand):
    help = 'BcLinkshareProductのJSONデータを解析し、AI記事を保持したままPCProductカタログへ同期します。'

    def add_arguments(self, parser):
        parser.add_argument('--maker', type=str, help='同期対象のメーカー名 (HP, Dell等)')
        parser.add_argument('--dry-run', action='store_true', help='DB更新を行わず結果表示のみ')

    def _determine_genre(self, name):
        if not name: return 'その他'
        n = name.upper()
        if any(kw in n for kw in ['OMEN', 'VICTUS', 'GAMING']): return 'ゲーミングPC'
        if any(kw in n for kw in ['ZBOOK', 'WORKSTATION', 'MOBILE WORKSTATION']): return 'ワークステーション'
        if any(kw in n for kw in ['OMNIDESK', 'OMNISTUDIO', 'PRODESK', 'ELITE SFF', 'ELITE MINI', 'DESKTOP', 'TOWER', 'MINI', 'SFF', 'ALL-IN-ONE', 'AIO', '一体型']): return 'デスクトップ'
        if any(kw in n for kw in ['DRAGONFLY', 'ELITEBOOK', 'PROBOOK', 'ENVY', 'PAVILION', 'AERO', 'OMNIBOOK', 'CHROMEBOOK', 'NOTEBOOK', 'LAPTOP', 'X360', 'CONVERTIBLE', '2-IN-1', '14-EP', '14-EM', '15-FC', '15-FD', '245 G', '250R G', '255R G']): return 'ノートパソコン'
        if any(kw in n for kw in ['MONITOR', 'DISPLAY', 'モニター', 'ディスプレイ']): return 'モニター'
        return 'その他'

    def _extract_price(self, item):
        p_data = item.get('saleprice') or item.get('price')
        if not p_data: return 0
        val_str = p_data.get('value') or p_data.get('#text') or p_data.get('text') or '0' if isinstance(p_data, dict) else str(p_data)
        try:
            clean_price = re.sub(r'[^\d]', '', str(val_str).split('.')[0])
            return int(clean_price) if clean_price else 0
        except: return 0

    def handle(self, *args, **options):
        target_maker = options['maker']
        dry_run = options['dry_run']
        self.stdout.write(self.style.NOTICE("--- 同期処理開始 ---"))

        queryset = BcLinkshareProduct.objects.all()
        if target_maker:
            queryset = queryset.filter(api_response_json__merchantname__icontains=target_maker)

        success_count = 0
        updated_count = 0

        for raw_entry in queryset:
            item = raw_entry.api_response_json or {}
            name = item.get('productname')
            if not name: continue

            genre = self._determine_genre(name)
            raw_sku = str(item.get('sku') or '').strip()
            unique_id = raw_sku.replace('-md', '').split('-')[0].strip()
            if not unique_id: continue
            
            price = self._extract_price(item)
            m_name = str(item.get('merchantname') or "").upper()
            normalized_maker = "HP" if "HP" in m_name or "HP" in name.upper() else "DELL"

            # 💡 defaults に ai_content を含めないことで、既存の記事を上書きから守ります
            defaults = {
                'name': name,
                'price': price,
                'unified_genre': genre,
                'maker': normalized_maker,
                'affiliate_url': item.get('linkurl'),
                'image_url': item.get('imageurl'),
                'affiliate_updated_at': timezone.now(),
                'is_active': True,
                'stock_status': '在庫あり',
                'site_prefix': normalized_maker.lower()
            }

            if dry_run:
                self.stdout.write(f"[Dry-Run] ID: {unique_id} | Genre: {genre}")
                success_count += 1
                continue

            try:
                with transaction.atomic():
                    obj, created = PCProduct.objects.update_or_create(
                        unique_id=unique_id,
                        defaults=defaults
                    )
                    success_count += 1
                    if not created: updated_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"エラー (ID {unique_id}): {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f"完了: 成功{success_count}件 / 更新{updated_count}件"))
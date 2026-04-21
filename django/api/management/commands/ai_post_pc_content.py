# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/ai_post_pc_content.py
"""
SHIN-VPS v6.11.0: Ultimate Architect TXT Edition
- プロンプト外部化: /commands/prompt/content_{mode}.txt から読み込み
- 動的判定: シリーズIDに 'bto' が含まれる場合は content_bto.txt、それ以外は content_diy.txt を適用
- 固定エンジン: AIProcessor (gemini-2.5-flash-preview-09-2025)
"""

import os
import json
import time
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import ContentHub
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = '外部テキストプロンプトを使用して、論理的なPC解説記事を生成します'

    def add_arguments(self, parser):
        parser.add_argument('--series', type=str, required=True, help='シリーズID')
        parser.add_argument('--ep', type=int, default=None, help='開始エピソード番号')
        parser.add_argument('--count', type=int, default=1, help='生成数')

    def handle(self, *args, **options):
        series_id = options['series']
        start_ep = options['ep']
        count = options['count']

        self.log("====================================================", self.style.HTTP_INFO)
        self.log(f"🚀 ULTIMATE ARCHITECT ENGINE v6.11.0 (TXT)", self.style.SUCCESS)
        self.log(f"シリーズ: {series_id} | 外部ファイルプロンプト・モード", self.style.HTTP_INFO)
        self.log("====================================================", self.style.HTTP_INFO)

        # 1. パス設定
        base_cmd_dir = os.path.join(settings.BASE_DIR, 'api', 'management', 'commands')
        config_path = os.path.join(base_cmd_dir, 'content_data', 'series_config.json')
        prompt_dir = os.path.join(base_cmd_dir, 'prompt')

        # シリーズ設定の読み込み
        series_config = self.load_config_recursive(config_path, series_id)
        if not series_config:
            self.log(f"❌ 設定が見つかりません: {series_id}", self.style.ERROR)
            return

        # 2. APIキー取得
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}") for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not api_keys:
            self.log("❌ APIキーが未設定です", self.style.ERROR)
            return

        # 3. 生成対象の選定
        target_episodes = self.get_target_episodes(series_config, series_id, start_ep, count)

        for ep_data in target_episodes:
            ep_num = ep_data.get('ep')
            context = {
                'series_title': series_config.get('title', 'PC構築ガイド'),
                'priority_device': series_config.get('priorityDevice', '自作デスクトップPC'),
                'target_title': ep_data.get('title', f"第{ep_num}回"),
                'focus': ep_data.get('focus', '電源と冷却の最適化'),
                'budget': ep_data.get('budget', '30万円'),
                'key_insight': ep_data.get('key_insight', 'VRMフェーズと熱密度の関係'),
            }

            # 4. TXTプロンプトの動的読み込み
            # series_id に 'bto' が含まれるかチェック
            mode = "bto" if "bto" in series_id.lower() else "diy"
            prompt_filename = f"content_{mode}.txt"
            prompt_file_path = os.path.join(prompt_dir, prompt_filename)

            if not os.path.exists(prompt_file_path):
                self.log(f"❌ プロンプトファイルが不在です: {prompt_file_path}", self.style.ERROR)
                continue

            try:
                with open(prompt_file_path, 'r', encoding='utf-8') as f:
                    prompt_template = f.read()
            except Exception as e:
                self.log(f"❌ ファイル読み込みエラー: {str(e)}", self.style.ERROR)
                continue

            self.log(f"🎬 生成中 [{prompt_filename}]: [第{ep_num}回] {context['target_title']}")
            
            processor = AIProcessor(api_keys, prompt_template)
            start_time = time.time()
            ai_response = processor.generate_blog_content(context, f"series_{series_id}_v6_11")
            
            if not ai_response: 
                self.log(f"⚠️ 応答が空のためスキップしました", self.style.WARNING)
                continue

            # 5. DB保存
            try:
                ContentHub.objects.update_or_create(
                    site='bicstation',
                    series_slug=series_id,
                    episode_no=ep_num,
                    defaults={
                        'title': ai_response.get('title_g', context['target_title']),
                        'content_type': 'course',
                        'is_pub': True,
                        'body_md': ai_response.get('cont_g', ''),
                        'category': series_config.get('category', 'Technology'),
                        'slug': f"series-{series_id}-ep{ep_num}",
                        'extra_data': {
                            'engine': 'ULTIMATE_ARCHITECT_V6_11_0',
                            'prompt_used': prompt_filename,
                            'gen_time': round(time.time() - start_time, 2)
                        }
                    }
                )
                self.log(f"✅ 成功: ep{ep_num} ({ai_response.get('title_g')})", self.style.SUCCESS)
            except Exception as e:
                self.log(f"❌ DB保存失敗: {str(e)}", self.style.ERROR)

            time.sleep(2)

    def load_config_recursive(self, path, series_id):
        if not os.path.exists(path): return None
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for key in [None, "SERIES_DEFINITION", "GUIDE_STRUCTURE"]:
            d = data.get(key) if key else data
            if d and series_id in d: return d[series_id]
        return None

    def get_target_episodes(self, config, series_id, start_ep, count):
        all_eps = []
        for phase in config.get('phases', []):
            for ep in phase.get('episodes', []):
                ep_full = ep.copy()
                ep_full.update({
                    'phase_label': phase.get('label'), 
                    'budget': phase.get('budget', config.get('budget', 'ASK'))
                })
                all_eps.append(ep_full)
        all_eps.sort(key=lambda x: x.get('ep', 0))
        return [e for e in all_eps if (start_ep is None or e.get('ep') >= start_ep)][:count]

    def log(self, msg, style_func=None):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        formatted_msg = f"[{timestamp}] {msg}"
        if style_func: self.stdout.write(style_func(formatted_msg))
        else: self.stdout.write(formatted_msg)
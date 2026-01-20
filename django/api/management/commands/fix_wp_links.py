import requests
import re
from django.core.management.base import BaseCommand
from requests.auth import HTTPBasicAuth

class Command(BaseCommand):
    help = '編集モード(context=edit)でWordPressの生データを直接修正します'

    def handle(self, *args, **options):
        # 設定
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        W_DOM = "blog.tiper.live"
        WP_API_BASE = f"https://{W_DOM}/wp-json/wp/v2"
        # 💡 重要：編集用コンテキストを指定
        WP_POST_URL = f"{WP_API_BASE}/bicstation?context=edit&per_page=100"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        self.stdout.write(self.style.SUCCESS("🚀 修正開始：生データ(Raw)を直接スキャンします..."))

        def fix_logic(text):
            # どんな囲み文字があっても product/maker_model を探す
            # 例: product/dell_bto107_pc16250_jp
            pattern = r'product/([a-zA-Z0-9]+)_([a-zA-Z0-9_\-]+)'
            
            def replace_parts(m):
                maker = m.group(1)
                slug = m.group(2)
                # 最初のアンダースコア（makerとslugの間）は維持し、slug内の_を-に変換
                fixed_slug = slug.replace('_', '-')
                return f"product/{maker}_{fixed_slug}"
            
            return re.sub(pattern, replace_parts, text)

        # 1ページ目から順に処理
        res = requests.get(WP_POST_URL, auth=AUTH)
        if res.status_code != 200:
            self.stdout.write(self.style.ERROR(f"API接続失敗: {res.status_code}"))
            return

        posts = res.json()
        for post in posts:
            post_id = post['id']
            # 💡 context=edit を使うと 'raw' データが取得できる
            original_content = post['content']['raw']
            
            new_content = fix_logic(original_content)

            if original_content != new_content:
                # 変更がある場合のみ、RAWデータとして送信
                update_res = requests.post(
                    f"{WP_API_BASE}/bicstation/{post_id}",
                    auth=AUTH,
                    json={"content": new_content}
                )
                if update_res.status_code == 200:
                    self.stdout.write(self.style.SUCCESS(f"✅ 修正完了: ID {post_id}"))
                else:
                    self.stdout.write(self.style.ERROR(f"❌ 失敗: ID {post_id}"))
            else:
                # デバッグ用にマッチしなかった理由を探るため、少し情報を出す
                self.stdout.write(f"  - スキップ: ID {post_id} (変更箇所なし)")

        self.stdout.write(self.style.SUCCESS("✨ 処理終了"))
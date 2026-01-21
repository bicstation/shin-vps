import requests
import re
import time
from django.core.management.base import BaseCommand
from requests.auth import HTTPBasicAuth

class Command(BaseCommand):
    help = '全ページの生データをスキャンしてリンクを修正します'

    def handle(self, *args, **options):
        WP_USER = "bicstation"
        WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"
        W_DOM = "blog.tiper.live"
        WP_API_BASE = f"https://{W_DOM}/wp-json/wp/v2"
        AUTH = HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)

        def fix_logic(text):
            pattern = r'product/([a-zA-Z0-9]+)_([a-zA-Z0-9_\-]+)'
            def replace_parts(m):
                maker = m.group(1)
                slug = m.group(2)
                fixed_slug = slug.replace('_', '-')
                return f"product/{maker}_{fixed_slug}"
            return re.sub(pattern, replace_parts, text)

        page = 1
        while True:
            self.stdout.write(f"📖 ページ {page} を取得中...")
            # context=edit で生データを取得
            url = f"{WP_API_BASE}/bicstation?context=edit&per_page=100&page={page}"
            res = requests.get(url, auth=AUTH)
            
            if res.status_code != 200:
                break # ページがなくなったら終了

            posts = res.json()
            if not posts:
                break

            for post in posts:
                post_id = post['id']
                original_content = post['content']['raw']
                new_content = fix_logic(original_content)

                if original_content != new_content:
                    update_res = requests.post(
                        f"{WP_API_BASE}/bicstation/{post_id}",
                        auth=AUTH,
                        json={"content": new_content}
                    )
                    if update_res.status_code == 200:
                        self.stdout.write(self.style.SUCCESS(f"  ✅ 修正完了: ID {post_id}"))
                    else:
                        self.stdout.write(self.style.ERROR(f"  ❌ 失敗: ID {post_id}"))
                else:
                    # スキップの表示は静かに（ログが埋まらないように）
                    pass

            page += 1
            time.sleep(1) # サーバー負荷軽減

        self.stdout.write(self.style.SUCCESS("✨ すべてのページの処理が完了しました！"))
from django.core.management.base import BaseCommand
from django.urls import get_resolver

class Command(BaseCommand):
    help = '有効なすべてのURLパターンを一覧表示します'

    def handle(self, *args, **options):
        resolver = get_resolver()
        patterns = resolver.url_patterns
        self.show_urls(patterns)

    def show_urls(self, patterns, prefix=''):
        for pattern in patterns:
            if hasattr(pattern, 'url_patterns'):
                # 階層がある場合（includeなど）は再帰的に処理
                self.show_urls(pattern.url_patterns, prefix + pattern.pattern._route)
            else:
                # 最終的なエンドポイントを表示
                path = prefix + pattern.pattern._route
                # 見やすく整形して出力
                self.stdout.write(f"/{path.replace('//', '/')}")
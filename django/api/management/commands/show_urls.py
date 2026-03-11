import re
from django.core.management.base import BaseCommand
from django.urls import get_resolver
from collections import defaultdict

class Command(BaseCommand):
    help = '有効なURLパターンを分野別に整理して表示します（admin除外）'

    def handle(self, *args, **options):
        resolver = get_resolver()
        mapping = defaultdict(list)
        self.collect_urls(resolver.url_patterns, mapping)

        self.stdout.write(self.style.SUCCESS(f"\n🚀 --- DISCOVERED ENDPOINTS (Excluding Admin) ---"))

        for category in sorted(mapping.keys()):
            if category.lower() in ['admin', 'autocomplete', 'jsi18n', 'password_change']:
                continue
            
            self.stdout.write(self.style.MIGRATE_LABEL(f"\n📂 [{category.upper()}]"))
            for url in sorted(list(set(mapping[category]))):
                self.stdout.write(f"  {url}")
        self.stdout.write("\n")

    def collect_urls(self, patterns, mapping, prefix=''):
        for pattern in patterns:
            if hasattr(pattern, 'url_patterns'):
                new_prefix = prefix + str(pattern.pattern)
                self.collect_urls(pattern.url_patterns, mapping, new_prefix)
            else:
                full_path = f"/{prefix}{str(pattern.pattern)}"
                full_path = full_path.replace('//', '/').replace('^', '').replace('$', '').replace('\\.', '.')
                
                if '/admin/' in full_path or full_path.startswith('/admin') or '<var>' in full_path:
                    continue
                
                parts = [p for p in full_path.split('/') if p]
                if not parts:
                    category = "ROOT"
                elif parts == 'api' and len(parts) > 1:
                    category = parts
                else:
                    category = parts
                
                mapping[category].append(full_path)

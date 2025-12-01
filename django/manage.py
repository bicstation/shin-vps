#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
# ★★★ 修正箇所1: python-dotenv をインポート ★★★
from dotenv import load_dotenv


def main():
    """Run administrative tasks."""
    # ★★★ 修正箇所2: .env ファイルをロードする ★★★
    # manage.pyと同じディレクトリにある.envファイルを読み込み、
    # OS環境変数にセットします。
    load_dotenv() 

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
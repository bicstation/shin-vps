#!/bin/bash
# entrypoint.sh

# データベースが利用可能になるまで待機 (簡易版)
echo "Waiting for PostgreSQL..."
while ! nc -z postgres_db 5432; do
  sleep 0.1
done
echo "PostgreSQL started."

# 2. マイグレーション実行
python manage.py migrate --noinput

# 3. 静的ファイル収集
python manage.py collectstatic --noinput

# 4. gunicornの起動
exec "$@"
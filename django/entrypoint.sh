#!/bin/bash
# entrypoint.sh

# -------------------------------------------------------------
# 🎯 引数がある場合はそれを実行（デバッグ用 /bin/sh 等のため）
if [ $# -gt 0 ] && [ "$1" != "gunicorn" ]; then
    exec "$@"
fi
# -------------------------------------------------------------

# 環境変数からホスト名とポートを取得
DB_HOST=${DB_HOST:-postgres_db_v2}
DB_PORT=${DB_PORT:-5432}

# データベースが利用可能になるまで待機
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT ..."

while ! nc -z -w 1 "$DB_HOST" "$DB_PORT"; do 
    sleep 0.1
done

echo "PostgreSQL started."

# --- 🎯 マイグレーション実行 (新テーブル作成のために復活させます)
echo "Running migrations..."
python manage.py migrate --noinput

# --- 🎯 静的ファイル収集
echo "Collecting static files..."
python manage.py collectstatic --noinput

# 4. Gunicornの起動
echo "Starting Gunicorn server..."
exec gunicorn tiper_api.wsgi:application --bind 0.0.0.0:8000
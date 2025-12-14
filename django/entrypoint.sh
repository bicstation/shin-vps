#!/bin/bash
# entrypoint.sh

# -------------------------------------------------------------
# 🎯 引数チェック
if [ "$1" = "gunicorn" ]; then
    echo "Running default startup process..."
else
    exec "$@"
    exit $?
fi
# -------------------------------------------------------------

# 環境変数からホスト名とポートを取得
DB_HOST=${DB_HOST:-postgres_db_v2}
DB_PORT=${DB_PORT:-5432}

# データベースが利用可能になるまで待機
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT ..."

# ncを使用してデータベースへの接続を待つ
while ! nc -z -w 1 "$DB_HOST" "$DB_PORT"; do 
    sleep 0.1
done

echo "PostgreSQL started."

# --- 🎯 デバッグ用: 一時停止
sleep 5
# -------------------------------------------------------------

# 2. マイグレーション実行 (コメントアウトする！)
# echo "Running migrations..."
# python manage.py migrate --noinput
# if [ $? -ne 0 ]; then
#     echo "ERROR: Migrations failed!"
#     exit 1
# fi
# sleep 5
# -------------------------------------------------------------

# 3. 静的ファイル収集 (コメントアウトする！)
# echo "Collecting static files..."
# python manage.py collectstatic --noinput
# if [ $? -ne 0 ]; then
#     echo "ERROR: Collectstatic failed!"
#     exit 1
# fi
# sleep 5
# -------------------------------------------------------------

# 4. Gunicornの起動
echo "Starting Gunicorn server..."
exec gunicorn tiper_api.wsgi:application --bind 0.0.0.0:8000
#!/bin/bash
# entrypoint.sh

# 環境変数からホスト名とポートを取得
DB_HOST=${DB_HOST} 
DB_PORT=5432

# データベースが利用可能になるまで待機
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT ..."

# ncを使用してデータベースへの接続を待つ
while ! nc -z $DB_HOST $DB_PORT; do 
  sleep 0.1
done

echo "PostgreSQL started."

# 2. マイグレーション実行
python manage.py migrate --noinput

# 3. 静的ファイル収集
python manage.py collectstatic --noinput

# 4. gunicornの起動 (🚨 ここを修正)
# exec "$@" は削除し、Webサーバー(Gunicorn)を直接起動する
echo "Starting Gunicorn server..."
exec gunicorn tiper_api.wsgi:application --bind 0.0.0.0:8000
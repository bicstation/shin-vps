#!/bin/bash
# entrypoint.sh

# 環境変数からホスト名とポートを取得
# 🚨 修正: デフォルト値の定義を削除し、docker-compose.yml から渡される環境変数に完全に依存
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

# 4. gunicornの起動
# docker-compose.yml の command または Dockerfile の CMD を実行する
exec "$@"
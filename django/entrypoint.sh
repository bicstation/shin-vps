#!/bin/bash
# entrypoint.sh

# 環境変数からホスト名とポートを取得
DB_HOST=${DB_HOST:-postgres_db_v2}  # DB_HOST が設定されていなければ postgres_db_v2 をデフォルトとする
DB_PORT=5432

# データベースが利用可能になるまで待機
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT ..."

# ✅ 修正: ハードコードされたホスト名ではなく、環境変数 $DB_HOST を使用
while ! nc -z $DB_HOST $DB_PORT; do 
  sleep 0.1
done

echo "PostgreSQL started."

# 2. マイグレーション実行
python manage.py migrate --noinput

# 3. 静的ファイル収集
python manage.py collectstatic --noinput

# 4. gunicornの起動
exec "$@"
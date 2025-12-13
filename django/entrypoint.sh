#!/bin/bash
# entrypoint.sh

# -------------------------------------------------------------
# 🎯 修正点 1: 引数がある場合は、そのコマンドを先に実行する
# これにより、docker compose run api_django_v2 bash などのコマンド実行に対応できます。
if [ "$1" = "gunicorn" ]; then
    # 引数が gunicorn の場合は、そのまま通常処理へ
    echo "Running default startup process..."
else
    # それ以外のコマンド（bash, testなど）が渡された場合、それを実行して終了
    exec "$@"
    exit $?
fi
# -------------------------------------------------------------

# 環境変数からホスト名とポートを取得
DB_HOST=${DB_HOST:-postgres_db_v2} # デフォルト値を設定
DB_PORT=${DB_PORT:-5432} # デフォルト値を設定

# データベースが利用可能になるまで待機
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT ..."

# ncを使用してデータベースへの接続を待つ
# -z はI/Oなしでスキャン、-w 1 は接続タイムアウトを1秒に設定
while ! nc -z -w 1 "$DB_HOST" "$DB_PORT"; do 
    sleep 0.1
done

echo "PostgreSQL started."

# 2. マイグレーション実行
echo "Running migrations..."
python manage.py migrate --noinput

# 3. 静的ファイル収集
echo "Collecting static files..."
python manage.py collectstatic --noinput

# 4. Gunicornの起動 (コンテナを維持するため、exec でフォアグラウンド実行)
echo "Starting Gunicorn server..."
# -------------------------------------------------------------
# 🎯 修正点 2: ハードコードされていた Gunicorn コマンドを exec "$@" に置き換え
# これにより、Dockerfile の CMD ["gunicorn", "tiper_api.wsgi:application", ...] が実行されます。
exec "$@"
# -------------------------------------------------------------
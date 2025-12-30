#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS データインポート専用マネージャー
# ==============================================================================

# 設定
CONTAINER_NAME="django-v2"
IMPORT_DIR="/usr/src/app/data"

echo "---------------------------------------"
echo "🚀 SHIN-VPS Data Import Tool"
echo "---------------------------------------"
echo "カレントディレクトリ: $(pwd)"
echo "---------------------------------------"

# メニュー表示
echo "1) [DB]     マイグレーション実行 (テーブル作成)"
echo "2) [Import] Tiper データのインポート"
echo "3) [Import] Bic-saving データのインポート"
echo "4) [Import] Bicstation データのインポート"
echo "5) [Import] AV-Flash データのインポート"
echo "6) [Admin]  スーパーユーザー(管理者)の作成"
echo "7) 終了"
echo "---------------------------------------"
read -p "実行する操作を選択してください: " CHOICE

case $CHOICE in
    1)
        echo "⚙️  マイグレーションを実行中..."
        docker compose exec $CONTAINER_NAME python manage.py migrate
        ;;
    2)
        echo "⚙️  Tiperデータのインポートを実行中..." 
        docker compose exec $CONTAINER_NAME python manage.py import_t_duga
        docker compose exec $CONTAINER_NAME python manage.py import_t_fanza
        docker compose exec $CONTAINER_NAME python manage.py normalize_duga
        docker compose exec $CONTAINER_NAME python manage.py normalize_fanza
        ;;
    3)
        echo "⚙️  Bic-savingデータのインポートを実行中..."
        docker compose exec $CONTAINER_NAME env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py
        ;;
    4)
        echo "⚙️  Bicstationデータのインポートを実行中..."
        docker compose exec $CONTAINER_NAME env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py
        ;;
    5)
        echo "⚙️  AV-Flashデータのインポートを実行中..."
        docker compose exec $CONTAINER_NAME python manage.py import_av $IMPORT_DIR/$FILE
        ;;
    6)
        echo "👤 管理者アカウントを作成します..."
        docker compose exec $CONTAINER_NAME python manage.py createsuperuser
        ;;
    q)
        echo "終了します。"
        exit 0
        ;;
    *)
        echo "❌ 無効な選択です。"
        ;;
esac

echo "---------------------------------------"
echo "✅ 完了しました！"
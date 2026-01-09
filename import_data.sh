#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 環境自動判別インポートツール (ホスト名判定版)
# ==============================================================================

# 1. 実行ディレクトリ・ホスト情報の取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 💡 VPSかどうかの判定ロジック (提示いただいた条件を採用)
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true
    ENV_TYPE="PRODUCTION (VPS)"
    COMPOSE_FILE="docker-compose.prod.yml"
    CONTAINER_NAME="django-v2"
    COLOR="\e[32m" # 緑（本番）
else
    IS_VPS=false
    ENV_TYPE="LOCAL (Development)"
    COMPOSE_FILE="docker-compose.yml"
    CONTAINER_NAME="django-v2"
    COLOR="\e[36m" # 水色（ローカル）
fi

RESET="\e[0m"

echo -e "---------------------------------------"
echo -e "🚀 SHIN-VPS Data Import Tool"
echo -e "環境: ${COLOR}${ENV_TYPE}${RESET}"
echo -e "ホスト: ${CURRENT_HOSTNAME} / ユーザー: ${CURRENT_USER}"
echo -e "ファイル: ${COMPOSE_FILE}"
echo -e "対象: ${CONTAINER_NAME}"
echo -e "---------------------------------------"

# 2. 実行用関数の定義
run_cmd() {
    # 念のためファイルが存在するかチェック
    if [ ! -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
        echo -e "\e[31m[ERROR] $COMPOSE_FILE が見つかりません。\e[0m"
        exit 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$CONTAINER_NAME" $@
}

# 3. メニュー表示
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
        run_cmd python manage.py migrate
        ;;
    2)
        echo "⚙️  Tiperデータのインポート..." 
        run_cmd python manage.py import_t_duga
        run_cmd python manage.py import_t_fanza
        run_cmd python manage.py normalize_duga
        run_cmd python manage.py normalize_fanza
        ;;
    3)
        echo "⚙️  Bic-savingスクレイピング実行..."
        run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py
        ;;
    4)
        echo -e "${COLOR}⚙️  Bicstationデータのインポートを開始します...${RESET}"
        # run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py
        # A. Dell専用インポーター (FTP方式) を実行
        echo "   >> [1/2] Dell製品のスペック解析(FTP)を実行中..."
        run_cmd python manage.py import_dell_ftp # 最初はテスト用にlimitを付けてもOK
        
        # B. 既存のAPIパーサーを実行
        echo "   >> [2/2] その他のBicstation加盟店(API)を取得中..."
        # CONTAINER_NAMEがdjango-v2なので、run_cmd経由で実行するのが安全です
        # run_cmd python manage.py linkshare_bc_api_parser --mid-list
        ;;
        
    5)
        echo "⚙️  AV-Flashインポート..."
        read -p "ファイル名を入力: " FILE_NAME
        run_cmd python manage.py import_av "/usr/src/app/data/$FILE_NAME"
        ;;
    6)
        echo "👤 管理者作成..."
        run_cmd python manage.py createsuperuser
        ;;
    7)
        echo "終了します。"
        exit 0
        ;;
    *)
        echo "❌ 無効な選択です。"
        ;;
esac

echo "---------------------------------------"
echo "✅ 完了しました！"
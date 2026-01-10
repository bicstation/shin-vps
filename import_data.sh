#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 環境自動判別インポートツール (VSPEC対応版)
# ==============================================================================

# 1. 実行ディレクトリ・ホスト情報の取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 💡 VPSかどうかの判定ロジック
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
echo -e "🚀 SHIN-VPS Data Import & WP Automation Tool"
echo -e "環境: ${COLOR}${ENV_TYPE}${RESET}"
echo -e "ホスト: ${CURRENT_HOSTNAME} / ユーザー: ${CURRENT_USER}"
echo -e "ファイル: ${COMPOSE_FILE}"
echo -e "対象: ${CONTAINER_NAME}"
echo -e "---------------------------------------"

# 2. 実行用関数の定義
run_cmd() {
    if [ ! -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
        echo -e "\e[31m[ERROR] $COMPOSE_FILE が見つかりません。\e[0m"
        exit 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$CONTAINER_NAME" $@
}

# 3. メニュー表示
echo "1) [DB]     マイグレーション実行 (テーブル作成)"
echo "2) [Import] Tiper データのインポート"
echo "3) [Import] Bic-saving (Lenovo) スクレイピング"
echo "4) [Import] Bicstation (HP) 同期 (API + マッピング)"
echo "5) [Import] Bicstation (Minisforum) スクレイピング"
echo "6) [Import] GEEKOM (Intel/AMD/Game/Office) スクレイピング"
echo -e "7) ${COLOR}[Import] VSPEC (BTO PC/Custom) スクレイピング ✨UPDATE${RESET}"
echo "8) [Import] AV-Flash データのインポート"
echo "9) [Admin]  スーパーユーザー(管理者)の作成"
echo -e "10) ${COLOR}[WP]     AI記事生成 & WordPress自動投稿${RESET}"
echo "11) 終了"
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
        echo "⚙️  Bic-saving (Lenovo) スクレイピング実行..."
        run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py
        ;;
    4)
        echo -e "${COLOR}⚙️  Bicstation (HP) 同期プロセスを開始します...${RESET}"
        run_cmd python manage.py linkshare_bc_api_parser --mid 35909 --save-db
        run_cmd python manage.py sync_products_from_raw --maker HP
        ;;
    5)
        echo -e "${COLOR}⚙️  Bicstation (Minisforum) スクレイピングを開始します...${RESET}"
        run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_mini.py
        ;;
    6)
        echo -e "${COLOR}⚙️  GEEKOM (日本公式) スクレイピングを開始します...${RESET}"
        run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_geekom.py
        ;;
    7)
        echo -e "${COLOR}⚙️  VSPEC (BTO/Custom PC) スクレイピングを開始します...${RESET}"
        # 💡 ここを VSPEC のファイルパスに変更しました
        run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_vspec.py
        ;;
    8)
        echo "⚙️  AV-Flashインポート..."
        read -p "ファイル名を入力: " FILE_NAME
        run_cmd python manage.py import_av "/usr/src/app/data/$FILE_NAME"
        ;;
    9)
        echo "👤 管理者作成..."
        run_cmd python manage.py createsuperuser
        ;;
    10)
        echo -e "${COLOR}🤖 AI Blog Generation & WP Posting${RESET}"
        echo "1: 1件のみ実行 (ランダム抽出)"
        echo "2: 5件連続実行"
        read -p "実行モードを選択してください: " WP_CHOICE
        
        if [ "$WP_CHOICE" == "1" ]; then
            run_cmd python manage.py ai_blog_from_db
        elif [ "$WP_CHOICE" == "2" ]; then
            for i in {1..5}; do
                echo "--- [$i / 5 件目] ---"
                run_cmd python manage.py ai_blog_from_db
                sleep 10
            done
        else
            echo "キャンセルしました。"
        fi
        ;;
    11)
        echo "終了します。"
        exit 0
        ;;
    *)
        echo "❌ 無効な選択です。"
        ;;
esac

echo "---------------------------------------"
echo "✅ 完了しました！"
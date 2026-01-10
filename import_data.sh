#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 環境自動判別インポートツール (Sycom & FRONTIER 対応版)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 環境判別
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
echo -e "---------------------------------------"

# 共通コマンド実行関数
run_cmd() {
    if [ ! -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
        echo -e "\e[31m[ERROR] $COMPOSE_FILE が見つかりません。\e[0m"
        exit 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$CONTAINER_NAME" $@
}

echo "1) [DB]     マイグレーション実行"
echo "2) [Import] Tiper データのインポート"
echo "3) [Import] Bic-saving (Lenovo) スクレイピング"
echo "4) [Import] Bicstation (HP) 同期"
echo "5) [Import] Bicstation (Minisforum) スクレイピング"
echo "6) [Import] GEEKOM (Intel/AMD) スクレイピング"
echo "7) [Import] VSPEC (BTO PC) スクレイピング"
echo "8) [Import] STORM (Gaming PC) スクレイピング"
echo "9) [Import] FRONTIER (Sale PC) スクレイピング"
echo -e "10) ${COLOR}[Import] Sycom (Craftsmanship PC) スクレイピング ✨NEW${RESET}"
echo "11) [Import] AV-Flash データのインポート"
echo "12) [Admin]  スーパーユーザーの作成"
echo -e "13) ${COLOR}[WP]     AI記事生成 & WordPress自動投稿${RESET}"
echo "14) 終了"
echo "---------------------------------------"
read -p "選択してください: " CHOICE

case $CHOICE in
    1) run_cmd python manage.py migrate ;;
    2)
        run_cmd python manage.py import_t_duga
        run_cmd python manage.py import_t_fanza
        run_cmd python manage.py normalize_duga
        run_cmd python manage.py normalize_fanza
        ;;
    3)
        echo "⚙️  Lenovo実行中..."
        run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py
        ;;
    4)
        run_cmd python manage.py linkshare_bc_api_parser --mid 35909 --save-db
        run_cmd python manage.py sync_products_from_raw --maker HP
        ;;
    5) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_mini.py ;;
    6) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_geekom.py ;;
    7) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_vspec.py ;;
    8)
        echo -e "${COLOR}⚙️  STORM スクレイピングを開始します...${RESET}"
        run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_storm.py
        ;;
    9)
        echo -e "${COLOR}⚙️  FRONTIER スクレイピングを開始します...${RESET}"
        run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_frontier.py
        ;;
    10)
        echo -e "${COLOR}⚙️  Sycom 職人スペック解析スクレイピングを開始します...${RESET}"
        run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_sycom.py
        ;;
    11)
        read -p "ファイル名を入力: " FILE_NAME
        run_cmd python manage.py import_av "/usr/src/app/data/$FILE_NAME"
        ;;
    12) run_cmd python manage.py createsuperuser ;;
    13)
        MODELS_PATH="$SCRIPT_DIR/django/api/management/commands/ai_models.txt"
        [ -f "$MODELS_PATH" ] && cat "$MODELS_PATH" | sed 's/^/- /'
        echo "1: 1件 / 2: 5件 / 3: モデル確認"
        read -p "モード: " WP_CHOICE
        if [ "$WP_CHOICE" == "1" ]; then run_cmd python manage.py ai_blog_from_db
        elif [ "$WP_CHOICE" == "2" ]; then
            for i in {1..5}; do run_cmd python manage.py ai_blog_from_db; sleep 10; done
        elif [ "$WP_CHOICE" == "3" ]; then run_cmd python manage.py ai_model_name
        fi
        ;;
    14) exit 0 ;;
esac

# ==============================================================================
# 🔄 VPS環境のみ：スケジューラーの自動更新
# ==============================================================================
if [ "$IS_VPS" = true ]; then
    # 9, 10 (スクレイピング) または 13 (WP投稿テスト) の場合に実行
    if [[ "$CHOICE" =~ ^(9|10|13)$ ]]; then
        echo -e "\n${COLOR}🔄 [VPS] 設定変更を反映するためスケジューラーを再起動します...${RESET}"
        docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d scheduler
        echo -e "✨ スケジュール同期が完了しました。"
    fi
fi

echo "---------------------------------------"
echo -e "✅ 完了しました！"
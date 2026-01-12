#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 環境自動判別インポートツール (Acer & News対応版)
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

run_cmd() {
    if [ ! -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
        echo -e "\e[31m[ERROR] $COMPOSE_FILE が見つかりません。\e[0m"
        exit 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$CONTAINER_NAME" $@
}

echo "1) [DB]     マイグレーション実行"
echo "2) [Import] Tiper データ (Fanza/Duga) インポート"
echo -e "3) ${COLOR}[Import] メーカー別インポート・同期 ✨${RESET}"
echo "4) [Import] AV-Flash データのインポート"
echo "5) [Admin]  スーパーユーザーの作成"
echo -e "6) ${COLOR}[WP]     商品AI記事生成 & WordPress自動投稿${RESET}"
echo -e "7) ${COLOR}[News]   PCパーツ最新ニュース自動投稿 (PC Watch) 🆕${RESET}"
echo "8) 終了"
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
        echo -e "\n--- どのメーカーを実行しますか？ ---"
        echo "1) Lenovo (Bic-saving)"
        echo "2) HP (Linkshare/Bicstation)"
        echo "3) Dell (FTP Data)"
        echo "4) Acer (JSON Import from Windows) ✨"
        echo "5) Minisforum"
        echo "6) GEEKOM"
        echo "7) VSPEC (BTO)"
        echo "8) STORM"
        echo "9) FRONTIER"
        echo "10) Sycom"
        echo "11) 戻る"
        read -p ">> " SUB_CHOICE
        case $SUB_CHOICE in
            1) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py ;;
            2)
                run_cmd python manage.py linkshare_bc_api_parser --mid 35909 --save-db
                run_cmd python manage.py sync_products_from_raw --maker HP
                ;;
            3) run_cmd python manage.py import_dell_ftp ;;
            4) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_acer.py ;;
            5) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_mini.py ;;
            6) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_geekom.py ;;
            7) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_vspec.py ;;
            8) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_storm.py ;;
            9) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_frontier.py ;;
            10) run_cmd env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_sycom.py ;;
            11) : ;;
            *) exit 0 ;;
        esac
        ;;
    4)
        read -p "ファイル名を入力: " FILE_NAME
        run_cmd python manage.py import_av "/usr/src/app/data/$FILE_NAME"
        ;;
    5) run_cmd python manage.py createsuperuser ;;
    6)
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
    7)
        echo -e "\n--- PCパーツ最新ニュース自動投稿 ---"
        echo "1) 今すぐ最新の1件を投稿する"
        echo "2) 戻る"
        read -p ">> " NEWS_CHOICE
        if [ "$NEWS_CHOICE" == "1" ]; then
            run_cmd python manage.py ai_post_pc_news
        fi
        ;;
    8) exit 0 ;;
esac

# 🔄 VPS環境のみ：スケジューラーの自動更新
if [ "$IS_VPS" = true ]; then
    # インポート(3)、ブログ(6)、ニュース(7)を実行した際にスケジューラーを同期
    if [[ "$CHOICE" =~ ^(3|6|7)$ ]]; then
        echo -e "\n${COLOR}🔄 [VPS] 設定変更を反映するためスケジューラーを再起動します...${RESET}"
        docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d scheduler
        echo -e "✨ スケジュール同期が完了しました。"
    fi
fi

echo "---------------------------------------"
echo -e "✅ 完了しました！"
#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 環境自動判別・製品データ運用ツール
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# --- 環境判別 ---
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true
    ENV_TYPE="PRODUCTION (VPS)"
    COMPOSE_FILE="docker-compose.prod.yml"
    DJANGO_CON="django-v2"
    NEXT_CON="next-bicstation-v2"
    COLOR="\e[32m" # 緑（本番）
else
    IS_VPS=false
    ENV_TYPE="LOCAL (Development)"
    COMPOSE_FILE="docker-compose.yml"
    DJANGO_CON="django-v2"
    NEXT_CON="next-bicstation-v2"
    COLOR="\e[36m" # 水色（ローカル）
fi

RESET="\e[0m"

# --- ヘルプ表示関数 ---
show_help() {
    echo -e "\n${COLOR}【運用フローのガイド】${RESET}"
    echo "1. [分析] 12番で現状の製品データを抽出し、キーワードを検討します。"
    echo "2. [定義] django/master_data/attributes.tsv にキーワードを記述します。"
    echo "3. [反映] 13番でマスターを登録し、14番で全製品にタグを自動付与します。"
    echo "4. [SEO]  15番で最新の状態を Google 用サイトマップに反映します。"
    echo "5. [維持] 新製品のインポート(3番)後は、必ず14番と15番を実行してください。"
    echo "---------------------------------------"
    echo "オプション引数:"
    echo "  -h, --help    このヘルプメッセージを表示して終了します。"
}

# --- コマンドライン引数の処理 ---
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
    exit 0
fi

# --- Djangoコンテナ用コマンド実行関数 ---
run_django() {
    if [ ! -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
        echo -e "\e[31m[ERROR] $COMPOSE_FILE が見つかりません。\e[0m"
        exit 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$DJANGO_CON" $@
}

# --- Next.jsコンテナ用コマンド実行関数 (SEO用) ---
run_next() {
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$NEXT_CON" $@
}

# --- サイトマップ更新処理 ---
update_sitemap() {
    echo -e "\n${COLOR}🌐 サイトマップを更新中...${RESET}"
    
    # ホスト側のスクリプトパス
    MJS_SRC="$SCRIPT_DIR/next-bicstation/generate-sitemap.mjs"
    
    # 1. スクリプトファイルの存在確認と転送
    if [ -f "$MJS_SRC" ]; then
        echo "🔄 スクリプトをコンテナに同期中..."
        docker cp "$MJS_SRC" "$NEXT_CON":/app/generate-sitemap.mjs
        echo "✅ 同期完了。"
    else
        echo -e "\e[31m[ERROR] $MJS_SRC が見つかりません。\e[0m"
        echo "ファイルの場所を確認してください。"
        return 1
    fi

    # 2. ディレクトリ権限修正
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec -u root "$NEXT_CON" chmod -R 777 /app/public/sitemap_gen
    
    # 3. 実行
    run_next node /app/generate-sitemap.mjs
}

# --- メインメニュー ---
echo -e "---------------------------------------"
echo -e "🚀 SHIN-VPS Data Import & Automation Tool"
echo -e "環境: ${COLOR}${ENV_TYPE}${RESET}"
echo -e "---------------------------------------"

echo "1) [DB]     マイグレーション実行"
echo "2) [Import] Tiper データ (Fanza/Duga) インポート"
echo -e "3) ${COLOR}[Import] メーカー別インポート・同期 ✨${RESET}"
echo "4) [Import] AV-Flash データのインポート"
echo "5) [Admin]  スーパーユーザーの作成"
echo -e "6) ${COLOR}[WP]     商品AI記事生成 & WordPress自動投稿${RESET}"
echo -e "7) ${COLOR}[News]   PCパーツ最新ニュース投稿 (URL指定対応) 🆕${RESET}"
echo "---------------------------------------"
echo -e "12) [Analysis] 製品データをTSV出力 (分析用)"
echo -e "13) [Master]   属性マスター(TSV)をインポート"
echo -e "14) ${COLOR}[Auto]     属性自動マッピング実行 ⚡${RESET}"
echo -e "15) ${COLOR}[SEO]      サイトマップ手動更新 (Sitemap.xml) 🌐${RESET}"
echo "h) [Help]     使い方の説明"
echo "8) 終了"
echo "---------------------------------------"

read -p "選択してください: " CHOICE

case $CHOICE in
    1) run_django python manage.py migrate ;;
    2)
        run_django python manage.py import_t_duga
        run_django python manage.py import_t_fanza
        run_django python manage.py normalize_duga
        run_django python manage.py normalize_fanza
        ;;
    3)
        echo -e "\n--- どのメーカーを実行しますか？ ---"
        echo "1) Lenovo (Bic-saving)"
        echo "2) HP (Linkshare/Bicstation)"
        echo "3) Dell (FTP Data)"
        echo "4) Acer (JSON Import from Windows)"
        echo "5) Minisforum"
        echo "6) GEEKOM"
        echo "7) VSPEC (BTO)"
        echo "8) STORM"
        echo "9) FRONTIER"
        echo "10) Sycom"
        echo "11) MSI (Import from Ark/VC)"
        echo -e "12) ${COLOR}Mouse Computer (High-Precision) 🐭${RESET}"
        echo "13) 戻る"
        read -p ">> " SUB_CHOICE
        case $SUB_CHOICE in
            1) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py ;;
            2) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_hp.py ;;
            3) run_django python manage.py import_dell_ftp ;;
            4) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_acer.py ;;
            5) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_mini.py ;;
            6) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_geekom.py ;;
            7) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_vspec.py ;;
            8) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_storm.py ;;
            9) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_frontier.py ;;
            10) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_sycom.py ;;
            11) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_ark_msi.py ;;
            12) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_mouse.py ;;
            13) : ;;
            *) exit 0 ;;
        esac
        echo -e "\n${COLOR}💡 ヒント: データの更新後は 14番 で属性紐付け、15番 でサイトマップ更新を推奨します。${RESET}"
        ;;
    4)
        read -p "ファイル名を入力: " FILE_NAME
        run_django python manage.py import_av "/usr/src/app/data/$FILE_NAME"
        ;;
    5) run_django python manage.py createsuperuser ;;
    6)
        echo "1: 1件 / 2: 5件 / 3: モデル確認"
        read -p "モード: " WP_CHOICE
        if [ "$WP_CHOICE" == "1" ]; then run_django python manage.py ai_blog_from_db
        elif [ "$WP_CHOICE" == "2" ]; then
            for i in {1..5}; do run_django python manage.py ai_blog_from_db; sleep 10; done
        elif [ "$WP_CHOICE" == "3" ]; then run_django python manage.py ai_model_name
        fi
        ;;
    7)
        echo "1) RSSから自動投稿 / 2) URL指定手動投稿"
        read -p ">> " NEWS_CHOICE
        if [ "$NEWS_CHOICE" == "1" ]; then
            run_django python manage.py ai_post_pc_news
        elif [ "$NEWS_CHOICE" == "2" ]; then
            read -p "対象URL: " TARGET_URL
            run_django python manage.py ai_post_pc_news --url "$TARGET_URL"
        fi
        ;;
    12)
        run_django python manage.py export_products
        echo -e "\n${COLOR}成功: pc_products_analysis.tsv を作成しました。${RESET}"
        echo "ローカルに取り出すコマンド:"
        echo "docker cp ${DJANGO_CON}:/usr/src/app/pc_products_analysis.tsv ./"
        ;;
    13)
        echo -e "\n--- [Master] 属性マスターのインポート ---"
        read -p "ファイル名 (例: master_data/attributes.tsv): " TSV_FILE
        run_django python manage.py import_specs "/usr/src/app/$TSV_FILE"
        ;;
    14)
        echo -e "\n--- [Auto] 属性自動マッピング実行 ---"
        run_django python manage.py auto_map_attributes
        ;;
    15)
        update_sitemap
        ;;
    h) show_help ;;
    8) exit 0 ;;
esac

# 🔄 VPS環境のみ：変更があった場合にスケジューラーを再起動、またはサイトマップ更新の提案
if [ "$IS_VPS" = true ] && [[ "$CHOICE" =~ ^(3|13|14)$ ]]; then
    echo -e "\n${COLOR}🔄 設定反映のためスケジューラーを再起動しています...${RESET}"
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d scheduler
    
    read -p "続けてサイトマップ(Sitemap.xml)も更新しますか？ (y/n): " CONFIRM
    if [ "$CONFIRM" == "y" ]; then
        update_sitemap
    fi
    echo -e "✨ すべての同期作業が完了しました。"
fi

echo "---------------------------------------"
echo -e "✅ 完了しました！"
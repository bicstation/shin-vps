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

# --- メーカー配列の定義 ---
# 17: NEC特選街, 18: I-O DATA, 19: ソースネクスト を追加
MAKERS=("" "lenovo" "hp" "dell" "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom" "msi" "mouse" "asus" "fmv" "dynabook" "eizo" "nec-biz" "iodata" "sourcenext")
MAKER_NAMES=("" "Lenovo" "HP" "Dell" "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom" "MSI" "Mouse Computer 🐭" "ASUS (API) 🚀" "FMV (Fujitsu) 💻" "Dynabook 💻" "EIZO 🖥️" "NEC特選街 (法人/SOHO) 🏢" "I-O DATA 💾" "ソースネクスト 💿")

# --- ヘルプ表示関数 ---
show_help() {
    echo -e "\n${COLOR}【運用フローのガイド】${RESET}"
    echo "1. [分析] 12番で現状の製品データを抽出し、キーワードを検討します。"
    echo "2. [定義] django/master_data/attributes.tsv にキーワードを記述します。"
    echo "3. [反映] 13番でマスターを登録し、14番で全製品にタグを自動付与します。"
    echo "4. [SEO]  15番で最新の状態を Google 用サイトマップに反映します。"
    echo "5. [維持] 新製品のインポート(3番)後は、必ず14番と15番を実行してください。"
    echo -e "6. ${COLOR}[AI]   17番で製品スペックをAIに詳細解析させることができます。${RESET}"
    echo "---------------------------------------"
    echo -e "${COLOR}【追加メーカーの使い方】${RESET}"
    echo "・18: I-O DATA    - LinkShare FTP (MID: 24172) から周辺機器データを取得します。"
    echo "・19: ソースネクスト - LinkShare FTP (MID: 2633) からソフトウェアデータを取得します。"
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
    MJS_SRC="$SCRIPT_DIR/next-bicstation/generate-sitemap.mjs"
    if [ -f "$MJS_SRC" ]; then
        echo "🔄 スクリプトをコンテナに同期中..."
        docker cp "$MJS_SRC" "$NEXT_CON":/app/generate-sitemap.mjs
        echo "✅ 同期完了。"
    else
        echo -e "\e[31m[ERROR] $MJS_SRC が見つかりません。\e[0m"
        return 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec -u root "$NEXT_CON" chmod -R 777 /app/public/sitemap_gen
    run_next node /app/generate-sitemap.mjs
}

# --- 関数: メーカー一覧を表示 ---
show_maker_menu() {
    echo -e "\n--- 対象メーカーを選択してください ---"
    for i in {1..19}; do
        if [ $i -ge 12 ]; then
            echo -e "${i}) ${COLOR}${MAKER_NAMES[$i]}${RESET}"
        else
            echo "${i}) ${MAKER_NAMES[$i]}"
        fi
    done
    echo "20) 戻る / 指定なし"
}

# --- メインメニュー ---
echo -e "---------------------------------------"
echo -e "🚀 SHIN-VPS Data Import & Automation Tool"
echo -e "環境: ${COLOR}${ENV_TYPE}${RESET}"
echo -e "---------------------------------------"

echo "1) [DB]      マイグレーション実行"
echo "2) [Import] Tiper データ (Fanza/Duga) インポート"
echo -e "3) ${COLOR}[Import] メーカー別インポート・同期 ✨${RESET}"
echo "4) [Import] AV-Flash データのインポート"
echo "5) [Admin]   スーパーユーザーの作成"
echo -e "6) ${COLOR}[WP]     商品AI記事生成 & WordPress自動投稿${RESET}"
echo -e "7) ${COLOR}[News]   PCパーツ最新ニュース投稿 (URL指定対応) 🆕${RESET}"
echo "---------------------------------------"
echo -e "12) [Analysis] 製品データをTSV出力 (分析用)"
echo -e "13) [Master]   属性マスター(TSV)をインポート"
echo -e "14) ${COLOR}[Auto]     属性自動マッピング実行 ⚡${RESET}"
echo -e "15) ${COLOR}[SEO]       サイトマップ手動更新 (Sitemap.xml) 🌐${RESET}"
echo -e "16) ${COLOR}[AI-M]     AIモデル一覧の確認 (Gemini/Gemma) 🤖${RESET}"
echo -e "17) ${COLOR}[AI-Spec]  AI詳細スペック解析 (analyze_pc_spec) 🔥${RESET}"
echo "---------------------------------------"
echo "h) [Help]     使い方の説明"
echo "8) 終了"
echo "---------------------------------------"

read -p "選択してください: " CHOICE

case $CHOICE in
    1) 
        run_django python manage.py makemigrations api
        run_django python manage.py migrate
        ;;
    2)
        run_django python manage.py import_t_duga
        run_django python manage.py import_t_fanza
        run_django python manage.py normalize_duga
        run_django python manage.py normalize_fanza
        ;;
    3)
        show_maker_menu
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
            12) 
                run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_mouse.py 
                echo -e "\n${COLOR}🐭 マウスのインポート完了。${RESET}"
                read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker mouse --limit 999999
                ;;
            13)
                echo -e "\n${COLOR}📡 LinkShare APIから最新データを取得中... (ASUS)${RESET}"
                run_django python manage.py linkshare_bc_api_parser --mid 43708 --save-db --max-pages 5
                run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid 43708 --maker asus
                echo -e "\n${COLOR}✅ ASUSのインポート・同期完了。${RESET}"
                read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker asus --limit 999999
                ;;
            14)
                echo -e "\n${COLOR}📡 LinkShare FTPから取得中... (FMV/富士通)${RESET}"
                run_django python manage.py import_bc_mid_ftp --mid 2543
                echo -e "\n${COLOR}✅ FMVのインポート・同期完了。${RESET}"
                read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker fmv --limit 999999
                ;;
            15)
                echo -e "\n${COLOR}📡 LinkShare FTPから取得中... (Dynabook)${RESET}"
                run_django python manage.py import_bc_mid_ftp --mid 36508
                echo -e "\n${COLOR}✅ Dynabookのインポート・同期完了。${RESET}"
                read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker dynabook --limit 999999
                ;;
            16)
                echo -e "\n${COLOR}📡 LinkShare FTPから取得中... (EIZO)${RESET}"
                run_django python manage.py import_bc_mid_ftp --mid 3256
                echo -e "\n${COLOR}✅ EIZOのインポート・同期完了。${RESET}"
                read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker eizo --limit 999999
                ;;
            17)
                echo -e "\n${COLOR}📡 LinkShare FTPから取得中... (NEC特選街)${RESET}"
                run_django python manage.py import_bc_mid_ftp --mid 2470
                echo -e "\n${COLOR}✅ NEC特選街のインポート・同期完了。${RESET}"
                read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker nec-biz --limit 999999
                ;;
            18)
                echo -e "\n${COLOR}📡 LinkShare FTPから取得中... (I-O DATA)${RESET}"
                run_django python manage.py import_bc_mid_ftp --mid 24172
                echo -e "\n${COLOR}✅ I-O DATAのインポート・同期完了。${RESET}"
                read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker iodata --limit 999999
                ;;
            19)
                echo -e "\n${COLOR}📡 LinkShare FTPから取得中... (ソースネクスト)${RESET}"
                run_django python manage.py import_bc_mid_ftp --mid 2633
                echo -e "\n${COLOR}✅ ソースネクストのインポート・同期完了。${RESET}"
                read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker sourcenext --limit 999999
                ;;
            20) : ;;
            *) exit 0 ;;
        esac
        echo -e "\n${COLOR}💡 ヒント: データの更新後は 14番 で属性紐付け、15番 でサイトマップ更新を推奨します。${RESET}"
        ;;
    4)
        read -p "AV Flash のファイル名を入力: (例：対象はレモン、地下10階、おかし、もしかするとMSGでもよいかも) " FILE_NAME
        run_django python manage.py import_av "/usr/src/app/data/$FILE_NAME"
        ;;
    5) run_django python manage.py createsuperuser ;;
    6)
        echo "1: 1件 / 2: 5件 / 3: モデル確認"
        read -p "モード: " WP_CHOICE
        show_maker_menu
        read -p "メーカー指定 (空欄で全対象): " WP_MK_NUM
        MK_ARG=""
        [[ -n "$WP_MK_NUM" && "$WP_MK_NUM" -le 19 ]] && MK_ARG="--maker ${MAKERS[$WP_MK_NUM]}"
        if [ "$WP_CHOICE" == "1" ]; then run_django python manage.py ai_blog_from_db $MK_ARG
        elif [ "$WP_CHOICE" == "2" ]; then
            for i in {1..5}; do run_django python manage.py ai_blog_from_db $MK_ARG; sleep 10; done
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
    16)
        echo -e "\n${COLOR}🤖 利用可能な AI モデル一覧を取得します...${RESET}"
        run_django python manage.py ai_model_name
        ;;
    17)
        show_maker_menu
        read -p "メーカー番号を選択: " SPEC_MK_NUM
        MK_NAME=""
        [[ -n "$SPEC_MK_NUM" && "$SPEC_MK_NUM" -ge 1 && "$SPEC_MK_NUM" -le 19 ]] && MK_NAME="${MAKERS[$SPEC_MK_NUM]}"
        read -p "解析件数 (all/数値): " LM_ARG
        [[ -z "$LM_ARG" || "$LM_ARG" == "all" ]] && LM_ARG=999999
        CMD="python manage.py analyze_pc_spec --limit $LM_ARG"
        [[ -n "$MK_NAME" ]] && CMD="$CMD --maker $MK_NAME"
        run_django $CMD
        ;;
    h) show_help ;;
    8) exit 0 ;;
esac

# 🔄 VPS環境のみ：変更があった場合にスケジューラーを再起動
if [ "$IS_VPS" = true ] && [[ "$CHOICE" =~ ^(3|13|14|17)$ ]]; then
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
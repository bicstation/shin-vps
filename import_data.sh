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
# MAKERSのスラッグとMAKER_NAMESの表示名を同期
MAKERS=("" "lenovo" "hp" "dell" "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom" "msi" "mouse" "asus" "fujitsu")
MAKER_NAMES=("" "Lenovo" "HP" "Dell" "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom" "MSI" "Mouse Computer 🐭" "ASUS (API) 🚀" "Fujitsu (LinkShare) 💻")

# --- 関数: メーカー一覧を表示 ---
show_maker_menu() {
    echo -e "\n--- 対象メーカーを選択してください ---"
    for i in {1..14}; do
        if [ $i -ge 12 ]; then
            echo -e "${i}) ${COLOR}${MAKER_NAMES[$i]}${RESET}"
        else
            echo "${i}) ${MAKER_NAMES[$i]}"
        fi
    done
    echo "15) 戻る / 指定なし"
}

# --- Djangoコンテナ用コマンド実行関数 ---
run_django() {
    if [ ! -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
        echo -e "\e[31m[ERROR] $COMPOSE_FILE が見つかりません。\e[0m"
        exit 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$DJANGO_CON" $@
}

run_next() {
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$NEXT_CON" $@
}

update_sitemap() {
    echo -e "\n${COLOR}🌐 サイトマップを更新中...${RESET}"
    MJS_SRC="$SCRIPT_DIR/next-bicstation/generate-sitemap.mjs"
    if [ -f "$MJS_SRC" ]; then
        docker cp "$MJS_SRC" "$NEXT_CON":/app/generate-sitemap.mjs
    else
        echo -e "\e[31m[ERROR] $MJS_SRC が見つかりません。\e[0m"
        return 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec -u root "$NEXT_CON" chmod -R 777 /app/public/sitemap_gen
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
echo "12) [Analysis] 製品データをTSV出力 (分析用)"
echo "13) [Master]   属性マスター(TSV)をインポート"
echo "14) ${COLOR}[Auto]     属性自動マッピング実行 ⚡${RESET}"
echo "15) ${COLOR}[SEO]      サイトマップ手動更新 (Sitemap.xml) 🌐${RESET}"
echo "16) ${COLOR}[AI-M]     AIモデル一覧の確認 (Gemini/Gemma) 🤖${RESET}"
echo "17) ${COLOR}[AI-Spec]  AI詳細スペック解析 (analyze_pc_spec) 🔥${RESET}"
echo "---------------------------------------"
echo "8) 終了"
echo "---------------------------------------"

read -p "選択してください: " CHOICE

case $CHOICE in
    1) run_django python manage.py makemigrations api && run_django python manage.py migrate ;;
    2) run_django python manage.py import_t_duga && run_django python manage.py import_t_fanza ;;
    3)
        show_maker_menu
        read -p ">> " SUB_CHOICE
        if [ "$SUB_CHOICE" -ge 1 ] && [ "$SUB_CHOICE" -le 14 ]; then
            case $SUB_CHOICE in
                1) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py ;;
                2) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_hp.py ;;
                3) run_django python manage.py import_dell_ftp ;;
                12) 
                    run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_mouse.py 
                    echo -e "\n${COLOR}🐭 マウスのインポート完了。${RESET}"
                    read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                    [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker mouse --limit 999999
                    ;;
                13)
                    echo -e "\n${COLOR}📡 LinkShare APIから最新データを取得中... (ASUS)${RESET}"
                    run_django python manage.py linkshare_bc_api_parser --mid 43708 --save-db --max-pages 5
                    echo -e "\n${COLOR}📥 取得データを製品マスタへ同期中...${RESET}"
                    run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid 43708 --maker asus
                    echo -e "\n${COLOR}✅ ASUSのインポート・同期が完了しました。${RESET}"
                    read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                    [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker asus --limit 999999
                    ;;
                14)
                    echo -e "\n${COLOR}📡 LinkShare FTPから最新データを取得中... (Fujitsu)${RESET}"
                    # 正しいコマンド名に変更
                    run_django python manage.py import_bc_linkshare_data --mid 2543
                    echo -e "\n${COLOR}✅ 富士通のインポート・同期が完了しました。${RESET}"
                    read -p "そのままAI詳細解析を実行しますか？(y/n): " AI_CONFIRM
                    # インポート側のmaker="富士通"に対し、analyze_pc_specが認識できるスラッグ(fujitsu)を渡す
                    [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker fujitsu --limit 999999
                    ;;
                *) echo "スクリプトを実行します..." ;;
            esac
        fi
        ;;
    6)
        echo -e "\n--- [WP] ブログ投稿設定 ---"
        echo "1: 1件投稿 / 2: 5件連続投稿 / 3: モデル確認"
        read -p "モードを選択: " WP_MODE
        
        show_maker_menu
        read -p "メーカー番号を指定 (空欄で全メーカー対象): " WP_MK_NUM
        
        MK_ARG=""
        if [[ -n "$WP_MK_NUM" && "$WP_MK_NUM" -ge 1 && "$WP_MK_NUM" -le 14 ]]; then
            MK_ARG="--maker ${MAKERS[$WP_MK_NUM]}"
            echo -e "Target: ${COLOR}${MAKER_NAMES[$WP_MK_NUM]}${RESET}"
        fi

        if [ "$WP_MODE" == "1" ]; then
            run_django python manage.py ai_blog_from_db $MK_ARG
        elif [ "$WP_MODE" == "2" ]; then
            for i in {1..5}; do run_django python manage.py ai_blog_from_db $MK_ARG; sleep 10; done
        elif [ "$WP_MODE" == "3" ]; then
            run_django python manage.py ai_model_name
        fi
        ;;
    12) run_django python manage.py export_products ;;
    13) read -p "ファイル名: " TSV_FILE && run_django python manage.py import_specs "/usr/src/app/$TSV_FILE" ;;
    14) run_django python manage.py auto_map_attributes ;;
    15) update_sitemap ;;
    17)
        show_maker_menu
        read -p "メーカー番号を選択: " SPEC_MK_NUM
        MK_NAME=""
        [[ -n "$SPEC_MK_NUM" && "$SPEC_MK_NUM" -ge 1 && "$SPEC_MK_NUM" -le 14 ]] && MK_NAME="${MAKERS[$SPEC_MK_NUM]}"
        read -p "解析件数 (all/数値): " LM_ARG
        [[ -z "$LM_ARG" || "$LM_ARG" == "all" ]] && LM_ARG=999999
        CMD="python manage.py analyze_pc_spec --limit $LM_ARG"
        [[ -n "$MK_NAME" ]] && CMD="$CMD --maker $MK_NAME"
        run_django $CMD
        ;;
    8) exit 0 ;;
esac

# 🔄 VPS連携・スケジューラー再起動処理
if [ "$IS_VPS" = true ] && [[ "$CHOICE" =~ ^(3|13|14|17)$ ]]; then
    echo -e "\n${COLOR}🔄 スケジューラー再起動中...${RESET}"
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d scheduler
    read -p "サイトマップも更新しますか？ (y/n): " CONFIRM
    [[ "$CONFIRM" == "y" ]] && update_sitemap
fi
echo -e "\n✅ 完了！"